type PdfSection = {
  title: string
  lines: string[]
}

const pageWidth = 612
const pageHeight = 792
const margin = 44
const contentWidth = pageWidth - margin * 2

function escapePdf(value: string) {
  return value.replace(/[()\\]/g, '\\$&')
}

function wrapText(value: string, width = 86) {
  if (!value) return ['']
  const words = value.split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > width && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current) lines.push(current)
  return lines
}

function textLine(text: string, x: number, y: number, size = 10, font = 'F1', color = '0.85 0.88 0.82') {
  return `BT /${font} ${size} Tf ${color} rg ${x} ${y} Td (${escapePdf(text)}) Tj ET`
}

function rect(x: number, y: number, w: number, h: number, color: string) {
  return `${color} rg ${x} ${y} ${w} ${h} re f`
}

function strokeRect(x: number, y: number, w: number, h: number, color: string) {
  return `${color} RG ${x} ${y} ${w} ${h} re S`
}

function renderPage(pageNumber: number, title: string, subtitle: string, body: string[]) {
  const commands = [
    rect(0, 0, pageWidth, pageHeight, '0.02 0.03 0.03'),
    rect(0, 704, pageWidth, 88, '0.04 0.06 0.06'),
    rect(0, 704, 7, 88, '0.78 0.96 0'),
    rect(44, 678, 524, 1, '0.18 0.22 0.20'),
    textLine('CATALYX LABS', 44, 752, 11, 'F2', '0.78 0.96 0'),
    textLine(title, 44, 728, 24, 'F2', '1 1 1'),
    textLine(subtitle, 44, 710, 10, 'F1', '0.58 0.62 0.58'),
    ...body,
    rect(44, 34, 524, 1, '0.18 0.22 0.20'),
    textLine('Precision cultivation made simple.', 44, 18, 8, 'F2', '0.78 0.96 0'),
    textLine(`Page ${pageNumber}`, 530, 18, 8, 'F1', '0.58 0.62 0.58'),
  ]
  return commands.join('\n')
}

function sectionHeight(section: PdfSection) {
  const lineCount = section.lines.flatMap((line) => wrapText(line)).length
  return 34 + lineCount * 14 + 18
}

export function createBrandedPdfReport({
  title,
  subtitle,
  sections,
}: {
  title: string
  subtitle: string
  sections: PdfSection[]
}) {
  const pages: string[][] = [[]]
  let y = 648

  function newPage() {
    pages.push([])
    y = 648
  }

  sections.forEach((section) => {
    const needed = sectionHeight(section)
    if (y - needed < 56) newPage()

    const page = pages[pages.length - 1]
    const cardTop = y
    page.push(rect(margin, y - needed + 10, contentWidth, needed, '0.04 0.05 0.05'))
    page.push(strokeRect(margin, y - needed + 10, contentWidth, needed, '0.14 0.17 0.16'))
    page.push(rect(margin, y - 18, 4, 20, '0.78 0.96 0'))
    page.push(textLine(section.title.toUpperCase(), margin + 14, y - 12, 10, 'F2', '0.78 0.96 0'))
    y -= 34

    section.lines.forEach((line) => {
      wrapText(line).forEach((wrapped) => {
        page.push(textLine(wrapped, margin + 16, y, 9.5, 'F1', '0.78 0.82 0.78'))
        y -= 14
      })
    })

    y = cardTop - needed - 10
  })

  const pageStreams = pages.map((page, index) => renderPage(index + 1, title, subtitle, page))
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    `2 0 obj << /Type /Pages /Kids [${pageStreams.map((_, index) => `${3 + index} 0 R`).join(' ')}] /Count ${pageStreams.length} >> endobj`,
    ...pageStreams.map((_, index) => {
      const pageObject = 3 + index
      const contentObject = 3 + pageStreams.length + index
      return `${pageObject} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${3 + pageStreams.length * 2} 0 R /F2 ${4 + pageStreams.length * 2} 0 R >> >> /Contents ${contentObject} 0 R >> endobj`
    }),
    ...pageStreams.map((stream, index) => `${3 + pageStreams.length + index} 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`),
    `${3 + pageStreams.length * 2} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`,
    `${4 + pageStreams.length * 2} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj`,
  ]

  let offset = '%PDF-1.4\n'.length
  const xref = objects.map((object) => {
    const current = offset
    offset += object.length + 1
    return current
  })
  const body = objects.join('\n')
  const xrefStart = '%PDF-1.4\n'.length + body.length + 1
  const table = ['xref', `0 ${objects.length + 1}`, '0000000000 65535 f ', ...xref.map((item) => `${String(item).padStart(10, '0')} 00000 n `)].join('\n')
  return `%PDF-1.4\n${body}\n${table}\ntrailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
}

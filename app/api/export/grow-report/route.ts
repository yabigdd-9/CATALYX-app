import { NextResponse } from 'next/server'
import { activeGrow, feedLogs, recommendationEngine, scoreBreakdown } from '@/lib/catalyx'

export async function GET() {
  const lines = [
    'Catalyx Labs Grow Report',
    `Grow: ${activeGrow.name}`,
    `Strain: ${activeGrow.strain}`,
    `Stage: ${activeGrow.stage}`,
    `Medium: ${activeGrow.medium}`,
    '',
    'Scores',
    ...scoreBreakdown.map((score) => `${score.label}: ${score.value}/100 - ${score.note}`),
    '',
    'Feed History',
    ...feedLogs.map((log) => `${log.date}: ${log.litres} L, EC ${log.ec}, pH ${log.ph}, runoff EC ${log.runoffEc}, response ${log.response}`),
    '',
    'Recommendations',
    ...recommendationEngine().map((item) => `${item.title}: ${item.action} Why: ${item.why}`),
    '',
    'Disclaimer: The app provides general cultivation and plant nutrition guidance only. Users are responsible for following all local laws and product label directions.',
  ]

  const pdf = createSimplePdf(lines)

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="catalyx-grow-report.pdf"',
    },
  })
}

function createSimplePdf(lines: string[]) {
  const escaped = lines.flatMap((line) => wrap(line, 92)).map((line) => line.replace(/[()\\]/g, '\\$&'))
  const content = escaped.map((line, index) => `BT /F1 10 Tf 50 ${760 - index * 14} Td (${line}) Tj ET`).join('\n')
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`,
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

function wrap(line: string, width: number) {
  if (line.length <= width) return [line]
  const chunks: string[] = []
  let rest = line
  while (rest.length > width) {
    chunks.push(rest.slice(0, width))
    rest = rest.slice(width)
  }
  chunks.push(rest)
  return chunks
}


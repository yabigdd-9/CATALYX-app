import { NextResponse } from 'next/server'
import { activeGrow, checkIns, feedLogs, recommendationEngine } from '@/lib/catalyx'
import { outcomeForecast, weeklyReview } from '@/lib/pro-insights'
import { createBrandedPdfReport } from '@/lib/pdf-report'

export async function GET() {
  const generatedAt = new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  const timeline = [
    ...feedLogs.map((log) => `${log.date}: Feed ${log.litres} L, EC ${log.ec}, pH ${log.ph}, runoff EC ${log.runoffEc}. ${log.response}.`),
    ...checkIns.map((check) => `${check.date}: Check-in ${check.leaf}, growth ${check.growth}, stress ${check.stress}/5, environment ${check.environment}/100.`),
    'May 16: Environment log temperature 25 C, humidity 58%, VPD 1.18, water temperature 20 C, PPFD 720, DLI 31.',
  ]

  const pdf = createBrandedPdfReport({
    title: 'Grow Timeline Report',
    subtitle: `${activeGrow.name} / ${activeGrow.strain} / generated ${generatedAt}`,
    sections: [
      {
        title: 'Grow Profile',
        lines: [
          `Grow: ${activeGrow.name}`,
          `Strain: ${activeGrow.strain}`,
          `Stage: ${activeGrow.stage}`,
          `Medium: ${activeGrow.medium}`,
        ],
      },
      {
        title: 'Weekly Review',
        lines: [
          `Score: ${weeklyReview.growScore}/100. Direction: ${weeklyReview.direction}.`,
          weeklyReview.headline,
        ],
      },
      {
        title: 'Timeline',
        lines: timeline,
      },
      {
        title: 'Recommendations',
        lines: recommendationEngine().map((item) => `${item.title}: ${item.action} Confidence: ${item.confidence}. Why: ${item.why}`),
      },
      {
        title: 'Forecast',
        lines: outcomeForecast.map(([label, status, body]) => `${label}: ${status}. ${body}`),
      },
      {
        title: 'Safety Disclaimer',
        lines: [
          'This app provides general cultivation and plant nutrition guidance only. Users are responsible for following all local laws and product label directions.',
        ],
      },
    ],
  })

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="catalyx-timeline-report.pdf"',
    },
  })
}

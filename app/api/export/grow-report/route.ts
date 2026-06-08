import { NextResponse } from 'next/server'
import { activeGrow, feedLogs, recommendationEngine, scoreBreakdown } from '@/lib/catalyx'
import { compareGrowRows, outcomeForecast, recoveryPlan, weeklyReview } from '@/lib/pro-insights'
import { createBrandedPdfReport } from '@/lib/pdf-report'

export async function GET() {
  const generatedAt = new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  const pdf = createBrandedPdfReport({
    title: 'Professional Grow Report',
    subtitle: `${activeGrow.name} / ${activeGrow.strain} / generated ${generatedAt}`,
    sections: [
      {
        title: 'Grow Profile',
        lines: [
          `Grow: ${activeGrow.name}`,
          `Strain: ${activeGrow.strain}`,
          `Stage: ${activeGrow.stage}`,
          `Medium: ${activeGrow.medium}`,
          `Goal: ${activeGrow.goal}`,
          `Health status: ${activeGrow.healthStatus}`,
        ],
      },
      {
        title: 'Executive Summary',
        lines: [
          weeklyReview.headline,
          `Grow score: ${weeklyReview.growScore}/100. Direction: ${weeklyReview.direction}.`,
          'Catalyx interpretation: focus on the next correct action, avoid overreacting to single readings, and keep feed changes tied to logged evidence.',
        ],
      },
      {
        title: 'Scores',
        lines: scoreBreakdown.map((score) => `${score.label}: ${score.value}/100 - ${score.note}`),
      },
      {
        title: 'Feed History',
        lines: feedLogs.map((log) => `${log.date}: ${log.litres} L, EC ${log.ec}, pH ${log.ph}, runoff EC ${log.runoffEc}, runoff pH ${log.runoffPh}. Response: ${log.response}. Products: ${log.products.join(', ')}.`),
      },
      {
        title: 'Recommendations',
        lines: recommendationEngine().map((item) => `${item.title}: ${item.action} Why: ${item.why} Confidence: ${item.confidence}.`),
      },
      {
        title: 'Weekly Grow Review',
        lines: [
          `Strengths: ${weeklyReview.strengths.join(' / ')}`,
          `Issues: ${weeklyReview.issues.join(' / ')}`,
          `Next week: ${weeklyReview.nextWeek.join(' / ')}`,
        ],
      },
      {
        title: 'Recovery Plan',
        lines: [
          `Trigger: ${recoveryPlan.trigger}`,
          `Goal: ${recoveryPlan.goal}`,
          ...recoveryPlan.checklist.map(([title, body]) => `${title}: ${body}`),
          `Avoid: ${recoveryPlan.avoid.join(' / ')}`,
        ],
      },
      {
        title: 'Outcome Forecast',
        lines: outcomeForecast.map(([label, status, body]) => `${label}: ${status} - ${body}`),
      },
      {
        title: 'Compare My Grow',
        lines: compareGrowRows.map(([signal, current, previous, change, interpretation]) => `${signal}: current ${current}, previous ${previous}, change ${change}. ${interpretation}`),
      },
      {
        title: 'Environment Summary',
        lines: [
          'Latest baseline: temperature 25 C, humidity 58%, VPD 1.18, water temperature 20 C, PPFD 720, DLI 31.',
          'Interpretation: environment is stable enough to support the current feed recommendation.',
        ],
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
      'Content-Disposition': 'attachment; filename="catalyx-grow-report.pdf"',
    },
  })
}

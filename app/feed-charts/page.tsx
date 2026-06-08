import Image from 'next/image'
import {
  calculateAdaptiveFeed,
  experienceLabels,
  experienceOrder,
  mediumLabels,
  mediumOrder,
  stageLabels,
  stageOrder,
  type Experience,
  type GrowMode,
  type Medium,
  type Stage,
} from '@/lib/catalyx'
import ProGate from '@/components/ProGate'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import { lockedAppFeedChartAssets, lockedFeedCharts } from '@/lib/catalyx-assets'

const modeByExperience: Record<Experience, GrowMode> = {
  beginner: 'Beginner Mode',
  standard: 'Quality Mode',
  professional: 'Professional Cultivation Mode',
}

const adaptiveRules = [
  ['Medium', 'Hydro uses 90% of coco dose, coco uses baseline, soil uses 72% of coco dose.'],
  ['Runoff rising', 'Reduce calculated dose by 12% and hold increases until runoff stabilises.'],
  ['Runoff falling', 'Increase by 6% only when plants are low stress and response is positive.'],
  ['Moderate stress', 'Reduce by 7% and avoid stacking optional additives.'],
  ['High stress', 'Reduce by 18% and prioritise Recovery Mode logic.'],
  ['Professional modes', 'Allow higher targets, still clamped to product safety bands.'],
] as const

function planFor(stage: Stage, medium: Medium, experience: Experience) {
  return calculateAdaptiveFeed({
    stage,
    medium,
    experience,
    litres: 1,
    mode: modeByExperience[experience],
  })
}

function doseSummary(stage: Stage, medium: Medium, experience: Experience) {
  return planFor(stage, medium, experience).items.map((item) => `${item.product.name} ${item.adaptiveMlPerL}`).join(', ')
}

export default function FeedChartsPage() {
  return (
    <ShellSection>
      <PageHeader
        title="Adaptive feed charts"
        copy="Stage, medium, experience, grow mode, runoff trend, and stress level now resolve through one feed-plan engine."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {adaptiveRules.map(([label, rule]) => (
          <Panel key={label} className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
            <p className="mt-3 text-sm leading-6 text-zinc-300">{rule}</p>
          </Panel>
        ))}
      </div>

      <Panel className="mt-6 overflow-hidden border-[#c8f500]/30">
        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="p-5">
            <StatusPill tone="lime">Locked v17</StatusPill>
            <h2 className="mt-4 text-3xl font-black text-white">9-SKU feed chart system</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              These are the locked v17 Catalyx feed chart assets used for app display, QR references, rear labels, and colour consistency. IRON-X has been removed from the live SKU system.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <AssetButton href={lockedFeedCharts.master.pdf}>Master PDF</AssetButton>
              <AssetButton href={lockedFeedCharts.oneLitreRear.pdf}>1L rear PDF</AssetButton>
              <AssetButton href={lockedFeedCharts.fiveLitreBulkRear.pdf}>5L rear PDF</AssetButton>
              <AssetButton href={lockedFeedCharts.colourReference.pdf}>Colour reference</AssetButton>
            </div>
          </div>
          <div className="bg-black/40 p-4">
            <div className="relative h-[320px] md:h-[520px]">
              <Image
                src={lockedAppFeedChartAssets.mainWide}
                alt="Catalyx locked v17 master feed chart"
                fill
                sizes="(max-width: 1024px) 100vw, 44vw"
                className="rounded-md border border-white/10 object-contain"
              />
            </div>
          </div>
        </div>
      </Panel>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Main feed chart', lockedAppFeedChartAssets.mainCard, lockedFeedCharts.master.png],
          ['1L rear chart', lockedAppFeedChartAssets.oneLitreCard, lockedFeedCharts.oneLitreRear.png],
          ['5L bulk chart', lockedAppFeedChartAssets.fiveLitreCard, lockedFeedCharts.fiveLitreBulkRear.png],
          ['SKU colour reference', lockedAppFeedChartAssets.colourReferenceCard, lockedFeedCharts.colourReference.png],
        ].map(([title, image, href]) => (
          <a key={title} href={href} target="_blank" rel="noreferrer">
            <Panel className="overflow-hidden transition hover:border-[#c8f500]/50">
              <div className="relative aspect-[4/5] w-full">
                <Image src={image} alt={`${title} v17 app card`} fill sizes="(max-width: 1280px) 50vw, 22vw" className="object-cover" />
              </div>
              <div className="p-4">
                <p className="text-sm font-black text-white">{title}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-[#d9ff34]">Open locked asset</p>
              </div>
            </Panel>
          </a>
        ))}
      </div>

      <ProGate
        featureKey="advanced_feed_charts"
        feature="Advanced feed charts"
        reason="Catalyx Pro unlocks full adaptive charts across hydro, coco, and soil with runoff and stress modifiers — free users see a preview."
        preview
      >
      <div className="mt-6 grid gap-6">
        {mediumOrder.map((medium) => (
          <Panel key={medium} className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
              <div>
                <h2 className="text-2xl font-black">{mediumLabels[medium]} feed chart</h2>
                <p className="mt-2 text-sm text-zinc-500">Doses are ml/L. Tank totals are calculated from the same logic in the feed calculator.</p>
              </div>
              <StatusPill tone={medium === 'soil' ? 'amber' : medium === 'hydro' ? 'blue' : 'lime'}>
                {medium === 'soil' ? 'Lower salt pressure' : medium === 'hydro' ? 'Reservoir tuned' : 'Baseline medium'}
              </StatusPill>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] text-left text-sm">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.16em] text-zinc-500">
                  <tr>
                    <th className="p-4">Stage</th>
                    <th className="p-4">Products</th>
                    {experienceOrder.map((experience) => (
                      <th key={experience} className="p-4">{experienceLabels[experience]}</th>
                    ))}
                    <th className="p-4">EC</th>
                    <th className="p-4">pH</th>
                    <th className="p-4">Decision rule</th>
                  </tr>
                </thead>
                <tbody>
                  {stageOrder.map((stage) => {
                    const standardPlan = planFor(stage, medium, 'standard')
                    return (
                      <tr key={stage} className="border-t border-white/10 align-top">
                        <td className="p-4 font-bold text-white">{stageLabels[stage]}</td>
                        <td className="p-4 text-zinc-300">{standardPlan.items.map((item) => item.product.name).join(' + ')}</td>
                        {experienceOrder.map((experience) => (
                          <td key={experience} className="p-4 text-zinc-300">{doseSummary(stage, medium, experience)}</td>
                        ))}
                        <td className="p-4 text-zinc-300">{standardPlan.targetEc[0]}-{standardPlan.targetEc[1]}</td>
                        <td className="p-4 text-zinc-300">{standardPlan.targetPh[0]}-{standardPlan.targetPh[1]}</td>
                        <td className="p-4 text-zinc-400">{standardPlan.instructions[0]}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        ))}
      </div>
      </ProGate>
    </ShellSection>
  )
}

function AssetButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="rounded-md border border-white/15 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white hover:border-[#c8f500]/60 hover:text-[#d9ff34]">
      {children}
    </a>
  )
}

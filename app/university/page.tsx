import { labNotes, universityLessons } from '@/lib/catalyx'
import ProGate from '@/components/ProGate'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'

const learningTracks = [
  {
    title: 'Start clean',
    body: 'Understand A-X PRO, B-X PRO, water volume, pH range, EC targets, and the first safe feed decision.',
    meta: 'Beginner path',
  },
  {
    title: 'Read the root zone',
    body: 'Use runoff EC, runoff pH, dryback speed, and plant posture to know when to hold, steer, or recover.',
    meta: 'Decision path',
  },
  {
    title: 'Push without guessing',
    body: 'Match supplements to stage timing so bloom pressure increases only when the data says the plant can take it.',
    meta: 'Performance path',
  },
]

const featuredLessons = [
  {
    title: 'The 10-minute feed check',
    body: 'A practical loop for reading tank strength, runoff direction, leaf posture, and the next safe adjustment.',
    level: 'Core',
  },
  {
    title: 'Deficiency or lockout?',
    body: 'Learn when a symptom is missing nutrition, wrong pH availability, excess EC, or environment pressure.',
    level: 'Diagnostic',
  },
  {
    title: 'Flower steering map',
    body: 'Early flower support, mid flower PK pressure, late flower finish, and flush timing in one sequence.',
    level: 'Pro',
  },
]

export default function UniversityPage() {
  return (
    <ShellSection>
      <PageHeader
        title="Catalyx University"
        copy="A practical grower training hub for nutrient decisions: what to measure, what it means, and what to do next with the Catalyx system."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Panel className="relative overflow-hidden border-[#c8f500]/25 p-6">
          <div className="absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(circle_at_75%_20%,rgba(200,245,0,0.14),transparent_45%)]" />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d9ff34]">Current curriculum</p>
                <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-white md:text-5xl">Stop memorising feed charts. Learn the signal behind the move.</h2>
              </div>
              <StatusPill tone="lime">18 lessons</StatusPill>
            </div>
            <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-400">
              Each lesson connects a grow-room reading to a real action: hold feed, lower EC, correct pH, add root support, push flower, or flush clean.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {learningTracks.map((track) => (
                <div key={track.title} className="rounded-md border border-white/10 bg-black/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{track.meta}</p>
                  <h3 className="mt-2 text-xl font-black text-white">{track.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{track.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">AI suggested path</p>
              <h2 className="mt-2 text-2xl font-black text-white">Today&apos;s best study order</h2>
            </div>
            <StatusPill tone="blue">Adaptive</StatusPill>
          </div>
          <div className="mt-5 grid gap-3">
            {['pH fundamentals', 'EC / ppm explained', 'Runoff explained'].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-md border border-white/10 bg-black/30 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#c8f500]/40 text-sm font-black text-[#d9ff34]">{index + 1}</span>
                <div>
                  <p className="font-black text-white">{item}</p>
                  <p className="mt-1 text-xs text-zinc-500">Builds the next recommendation with less guesswork.</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <ProGate
        featureKey="deficiency_troubleshooting"
        feature="Full Catalyx University"
        reason="Catalyx Pro unlocks diagnostic lessons, deficiency vs lockout guides, flower steering, and the full lesson library."
        preview
      >
      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel className="p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Featured lessons</p>
              <h2 className="mt-2 text-3xl font-black text-white">High-impact lessons first</h2>
            </div>
            <StatusPill tone="amber">Fast wins</StatusPill>
          </div>
          <div className="mt-5 grid gap-3">
            {featuredLessons.map((lesson) => (
              <div key={lesson.title} className="rounded-md border border-white/10 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-black text-white">{lesson.title}</h3>
                  <StatusPill tone={lesson.level === 'Pro' ? 'violet' : lesson.level === 'Diagnostic' ? 'blue' : 'lime'}>{lesson.level}</StatusPill>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{lesson.body}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-5">
          <h2 className="text-2xl font-black text-white">Catalyx Lab Notes</h2>
          <div className="mt-4 grid gap-3">
            {labNotes.map((note) => (
              <div key={note} className="rounded-md border border-white/10 bg-black/30 p-4 text-sm leading-6 text-zinc-300">{note}</div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {universityLessons.map((lesson, index) => (
          <Panel key={lesson} className="group p-4 transition hover:border-[#c8f500]/35">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">Lesson {String(index + 1).padStart(2, '0')}</p>
                <h2 className="mt-2 font-black text-white">{lesson}</h2>
              </div>
              <StatusPill tone={index % 4 === 0 ? 'lime' : index % 4 === 1 ? 'blue' : index % 4 === 2 ? 'violet' : 'amber'}>{index < 6 ? 'Free' : 'Pro'}</StatusPill>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Learn the reading, the cause, the common mistake, and the Catalyx move that keeps the crop stable.
            </p>
            <div className="mt-4 h-1 rounded-full bg-white/10">
              <div
                className="h-1 rounded-full bg-[#c8f500] transition-all group-hover:w-full"
                style={{ width: `${Math.min(92, 28 + index * 4)}%` }}
              />
            </div>
          </Panel>
        ))}
      </div>
      </ProGate>
    </ShellSection>
  )
}

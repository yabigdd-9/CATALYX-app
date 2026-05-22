import Link from 'next/link'
import { products, type CatalyxProduct } from '@/lib/catalyx'

export function ShellSection({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <section className={`mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 ${className}`}>{children}</section>
}

export function Panel({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-lg border border-white/10 bg-[#0b0f10]/86 shadow-2xl shadow-black/25 backdrop-blur ${className}`}>
      {children}
    </div>
  )
}

export function MetricCard({
  label,
  value,
  note,
  accent = '#c8f500',
}: {
  label: string
  value: number | string
  note: string
  accent?: string
}) {
  return (
    <Panel className="p-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent, boxShadow: `0 0 18px ${accent}` }} />
      </div>
      <div className="mt-4 flex items-end gap-2">
        <span className="text-4xl font-black tracking-tight text-white">{value}</span>
        {typeof value === 'number' ? <span className="pb-1 text-sm text-zinc-500">/100</span> : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{note}</p>
    </Panel>
  )
}

export function PrimaryActionPanel({
  title,
  body,
  href,
  action,
  meta,
}: {
  title: string
  body: string
  href: string
  action: string
  meta?: string
}) {
  return (
    <Panel className="relative overflow-hidden border-[#c8f500]/35 p-5">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_20%,rgba(200,245,0,0.14),transparent_42%)]" />
      <div className="relative">
        {meta ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c8f500]">{meta}</p> : null}
        <h2 className="mt-2 text-3xl font-black leading-tight text-white">{title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{body}</p>
        <Link href={href} className="mt-5 inline-flex rounded-md bg-[#c8f500] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black shadow-lg shadow-[#c8f500]/15">
          {action}
        </Link>
      </div>
    </Panel>
  )
}

export function RecommendationCard({
  title,
  action,
  why,
  confidence,
  severity,
  evidence,
}: {
  title: string
  action: string
  why: string
  confidence: string
  severity: string
  evidence?: string
}) {
  const isWarning = severity === 'warning'

  return (
    <Panel className={`p-5 ${isWarning ? 'border-[#ffd23f]/25' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{isWarning ? 'Prevent mistake' : 'Recommended action'}</p>
          <h3 className="mt-2 text-xl font-black text-white">{title}</h3>
        </div>
        <StatusPill tone={isWarning ? 'amber' : 'lime'}>{confidence} confidence</StatusPill>
      </div>
      <p className="mt-4 text-sm leading-6 text-zinc-200">{action}</p>
      {evidence ? (
        <div className="mt-4 rounded-md border border-white/10 bg-black/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Evidence used</p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{evidence}</p>
        </div>
      ) : null}
      <details className="mt-3 rounded-md border border-white/10 bg-black/20 p-3">
        <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.16em] text-[#c8f500]">Why this matters</summary>
        <p className="mt-2 text-sm leading-6 text-zinc-500">{why}</p>
      </details>
    </Panel>
  )
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 bg-black/20 p-6 text-center">
      <p className="text-lg font-black text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export function SaveBanner({
  status,
  message,
}: {
  status: 'idle' | 'saving' | 'saved' | 'error'
  message?: string
}) {
  if (status === 'idle') return null

  const styles = {
    saving: 'border-[#33d9ff]/30 bg-[#33d9ff]/10 text-[#8decff]',
    saved: 'border-[#c8f500]/30 bg-[#c8f500]/10 text-[#d9ff34]',
    error: 'border-[#ff3b45]/30 bg-[#ff3b45]/10 text-[#ff9ca2]',
  }

  return (
    <div className={`rounded-md border p-3 text-sm font-semibold ${styles[status]}`}>
      {message ?? (status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved.' : 'Something went wrong.')}
    </div>
  )
}

export function SkeletonPanel() {
  return (
    <Panel className="animate-pulse p-5">
      <div className="h-3 w-32 rounded bg-white/10" />
      <div className="mt-4 h-8 w-2/3 rounded bg-white/10" />
      <div className="mt-4 grid gap-2">
        <div className="h-3 rounded bg-white/10" />
        <div className="h-3 w-5/6 rounded bg-white/10" />
      </div>
    </Panel>
  )
}

export function ProductAccent({ product, compact = false }: { product: CatalyxProduct; compact?: boolean }) {
  return (
    <div
      className={`rounded-md border bg-black/30 ${compact ? 'p-2' : 'p-4'}`}
      style={{ borderColor: `${product.accent}55`, boxShadow: `inset 0 1px 0 ${product.accent}22` }}
    >
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: product.accent, boxShadow: `0 0 16px ${product.accent}` }} />
        <div>
          <p className="text-sm font-black uppercase tracking-[0.14em] text-white">{product.name}</p>
          {!compact ? <p className="mt-1 text-xs text-zinc-500">{product.purpose}</p> : null}
        </div>
      </div>
    </div>
  )
}

export function ProductRail() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10">
      {products.map((product) => (
        <Link key={product.id} href={`/products/${product.id}`}>
          <ProductAccent product={product} compact />
        </Link>
      ))}
    </div>
  )
}

export function StatusPill({
  children,
  tone = 'lime',
}: {
  children: React.ReactNode
  tone?: 'lime' | 'blue' | 'amber' | 'red' | 'violet'
}) {
  const tones = {
    lime: 'border-[#c8f500]/40 bg-[#c8f500]/10 text-[#d9ff34]',
    blue: 'border-[#33d9ff]/40 bg-[#33d9ff]/10 text-[#8decff]',
    amber: 'border-[#ffd23f]/40 bg-[#ffd23f]/10 text-[#ffe47c]',
    red: 'border-[#ff3b45]/40 bg-[#ff3b45]/10 text-[#ff8b92]',
    violet: 'border-[#9a5cff]/40 bg-[#9a5cff]/10 text-[#c8adff]',
  }

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>
}

export function MiniGraph({ color = '#c8f500' }: { color?: string }) {
  return (
    <div className="flex h-14 items-end gap-1">
      {[34, 52, 44, 62, 58, 70, 66].map((height, index) => (
        <span
          key={index}
          className="w-full rounded-t-sm bg-white/10"
          style={{
            height: `${height}%`,
            background: `linear-gradient(180deg, ${color}, rgba(255,255,255,0.08))`,
            boxShadow: index === 5 ? `0 0 16px ${color}66` : undefined,
          }}
        />
      ))}
    </div>
  )
}

export function PageHeader({
  title,
  copy,
  action,
}: {
  title: string
  copy: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end">
      <div>
        <h1 className="max-w-4xl text-4xl font-black uppercase leading-tight tracking-[0.06em] text-white md:text-6xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400">{copy}</p>
      </div>
      {action}
    </div>
  )
}

export function Disclaimer() {
  return (
    <p className="rounded-lg border border-white/10 bg-black/30 p-4 text-xs leading-6 text-zinc-500">
      The app provides general cultivation and plant nutrition guidance only. Users are responsible for following all local laws and product label directions.
    </p>
  )
}

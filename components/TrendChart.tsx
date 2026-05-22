'use client'

export default function TrendChart({
  title,
  values,
  color = '#c8f500',
  target,
}: {
  title: string
  values: number[]
  color?: string
  target?: string
}) {
  const min = Math.min(...values) - 0.1
  const max = Math.max(...values) + 0.1
  const points = values.map((value, index) => {
    const x = values.length === 1 ? 0 : (index / (values.length - 1)) * 100
    const y = 100 - ((value - min) / (max - min || 1)) * 80 - 10
    return `${x},${y}`
  }).join(' ')

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-black uppercase tracking-[0.14em] text-white">{title}</h3>
        {target ? <span className="text-xs text-zinc-500">{target}</span> : null}
      </div>
      <svg viewBox="0 0 100 100" className="h-32 w-full overflow-visible">
        <line x1="0" x2="100" y1="28" y2="28" stroke="rgba(255,255,255,0.12)" strokeDasharray="2 3" />
        <line x1="0" x2="100" y1="70" y2="70" stroke="rgba(255,255,255,0.12)" strokeDasharray="2 3" />
        <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {values.map((value, index) => {
          const [x, y] = points.split(' ')[index].split(',').map(Number)
          return <circle key={`${value}-${index}`} cx={x} cy={y} r="2.4" fill={color} />
        })}
      </svg>
    </div>
  )
}


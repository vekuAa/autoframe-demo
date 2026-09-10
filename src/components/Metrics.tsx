import type { QualityResult } from '../types'

function pct(value: number) {
  return `${Math.round(value * 100)}%`
}

export default function Metrics({ result }: { result: QualityResult | null }) {
  const values = [
    ['Détection', result ? pct(result.confidence) : '—'],
    ['Occupation', result ? pct(result.coverage) : '—'],
    ['Centrage', result ? pct(result.alignment) : '—'],
    ['Netteté', result ? pct(result.sharpness) : '—'],
    ['Lumière', result ? pct(result.brightness) : '—'],
    ['Angle*', result ? pct(result.angleScore) : '—'],
  ]

  return (
    <div className="metrics metrics-v2">
      {values.map(([label, value]) => (
        <div className="metric" key={label}>
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

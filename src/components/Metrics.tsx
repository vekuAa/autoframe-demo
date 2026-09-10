import type { QualityResult } from '../types'

function pct(value: number) {
  return `${Math.round(value * 100)}%`
}

export default function Metrics({ result }: { result: QualityResult | null }) {
  return (
    <div className="metrics">
      <div className="metric">
        <strong>{result ? pct(result.confidence) : '—'}</strong>
        <span>Détection</span>
      </div>
      <div className="metric">
        <strong>{result ? pct(result.coverage) : '—'}</strong>
        <span>Occupation</span>
      </div>
      <div className="metric">
        <strong>{result ? pct(result.alignment) : '—'}</strong>
        <span>Centrage</span>
      </div>
    </div>
  )
}

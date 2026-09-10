import type { ViewProtocol } from '../types'

type Props = {
  steps: ViewProtocol[]
  currentIndex: number
  completed: Set<number>
  onSelect?: (index: number) => void
}

export default function ProtocolStrip({ steps, currentIndex, completed, onSelect }: Props) {
  return (
    <div className="protocol-strip protocol-scroll">
      {steps.map((step, index) => (
        <button
          className={[
            'protocol-step',
            index === currentIndex ? 'active' : '',
            completed.has(index) ? 'done' : '',
          ].join(' ')}
          key={step.id}
          onClick={() => onSelect?.(index)}
          type="button"
        >
          <div className="step-index">{completed.has(index) ? '✓' : index + 1}</div>
          <div>
            <strong>{step.shortLabel}</strong>
            <span>{step.label}</span>
          </div>
        </button>
      ))}
    </div>
  )
}

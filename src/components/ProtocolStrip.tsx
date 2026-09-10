import type { ViewProtocol } from '../types'

type Props = {
  steps: ViewProtocol[]
  currentIndex: number
  completed: Set<number>
}

export default function ProtocolStrip({ steps, currentIndex, completed }: Props) {
  return (
    <div className="protocol-strip">
      {steps.map((step, index) => (
        <div
          className={[
            'protocol-step',
            index === currentIndex ? 'active' : '',
            completed.has(index) ? 'done' : '',
          ].join(' ')}
          key={step.id}
        >
          <div className="step-index">
            {completed.has(index) ? '✓' : index + 1}
          </div>
          <div>
            <strong>{step.shortLabel}</strong>
            <span>{step.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

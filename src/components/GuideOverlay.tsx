import type { QualityLevel, VehicleDetection, ViewProtocol } from '../types'

type Props = {
  level: QualityLevel
  detection: VehicleDetection | null
  frameWidth: number
  frameHeight: number
  protocol: ViewProtocol
}

export default function GuideOverlay({
  level,
  detection,
  frameWidth,
  frameHeight,
  protocol,
}: Props) {
  const box = detection
    ? {
        left: `${(detection.bbox[0] / frameWidth) * 100}%`,
        top: `${(detection.bbox[1] / frameHeight) * 100}%`,
        width: `${(detection.bbox[2] / frameWidth) * 100}%`,
        height: `${(detection.bbox[3] / frameHeight) * 100}%`,
      }
    : null

  return (
    <div className="overlay">
      <div className={`target-guide ${protocol.id}`}>
        <span>ZONE CIBLE · {protocol.shortLabel.toUpperCase()}</span>
      </div>

      {box && <div className={`detected-box ${level}`} style={box} />}
    </div>
  )
}

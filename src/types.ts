export type QualityLevel = 'red' | 'orange' | 'green'

export type ViewProtocol = {
  id: string
  label: string
  shortLabel: string
  targetCenterX: number
  targetCenterY: number
  targetCoverageMin: number
  targetCoverageMax: number
}

export type VehicleDetection = {
  bbox: [number, number, number, number]
  className: string
  score: number
}

export type QualityResult = {
  level: QualityLevel
  title: string
  message: string
  ready: boolean
  confidence: number
  coverage: number
  alignment: number
}

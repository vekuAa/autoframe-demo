export type QualityLevel = 'red' | 'orange' | 'green'

export type ViewFamily = 'three-quarter' | 'side'

export type ViewProtocol = {
  id: string
  label: string
  shortLabel: string
  family: ViewFamily
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

export type ImageQuality = {
  brightness: number
  sharpness: number
  brightnessOk: boolean
  sharpnessOk: boolean
}

export type AngleEstimate = {
  family: ViewFamily | 'unknown'
  score: number
  compatible: boolean
  experimental: true
  message: string
}

export type QualityResult = {
  level: QualityLevel
  title: string
  message: string
  ready: boolean
  confidence: number
  coverage: number
  alignment: number
  brightness: number
  sharpness: number
  angleScore: number
}

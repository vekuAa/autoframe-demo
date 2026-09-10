import type {
  AngleEstimate,
  ImageQuality,
  QualityResult,
  VehicleDetection,
  ViewProtocol,
} from '../types'

export function evaluateFraming(
  detection: VehicleDetection,
  frameWidth: number,
  frameHeight: number,
  protocol: ViewProtocol,
  imageQuality: ImageQuality,
  angle: AngleEstimate,
): QualityResult {
  const [x, y, w, h] = detection.bbox
  const coverage = (w * h) / (frameWidth * frameHeight)

  const cx = (x + w / 2) / frameWidth
  const cy = (y + h / 2) / frameHeight
  const dx = Math.abs(cx - protocol.targetCenterX)
  const dy = Math.abs(cy - protocol.targetCenterY)

  const confidence = detection.score
  const alignment = Math.max(0, Math.min(1, 1 - (dx * 2.2 + dy * 2.4)))

  const common = {
    confidence,
    coverage,
    alignment,
    brightness: imageQuality.brightness,
    sharpness: imageQuality.sharpness,
    angleScore: angle.score,
  }

  if (confidence < 0.55) {
    return {
      ...common,
      level: 'red',
      title: 'Véhicule mal identifié',
      message: 'Stabilise le téléphone ou améliore la visibilité du véhicule.',
      ready: false,
    }
  }

  if (!imageQuality.brightnessOk) {
    return {
      ...common,
      level: 'red',
      title: 'Luminosité insuffisante',
      message:
        imageQuality.brightness < 0.18
          ? 'Image trop sombre. Cherche davantage de lumière.'
          : 'Image trop claire. Évite une source lumineuse directe.',
      ready: false,
    }
  }

  if (!imageQuality.sharpnessOk) {
    return {
      ...common,
      level: 'orange',
      title: 'Image potentiellement floue',
      message: 'Stabilise le téléphone et attends la mise au point.',
      ready: false,
    }
  }

  if (coverage < protocol.targetCoverageMin) {
    return {
      ...common,
      level: 'red',
      title: 'Véhicule trop loin',
      message: 'Avance vers le véhicule.',
      ready: false,
    }
  }

  if (coverage > protocol.targetCoverageMax) {
    return {
      ...common,
      level: 'red',
      title: 'Véhicule trop proche',
      message: 'Recule légèrement.',
      ready: false,
    }
  }

  if (dx > 0.11 || dy > 0.13) {
    const horizontal =
      cx < protocol.targetCenterX ? 'vers la droite' : 'vers la gauche'

    return {
      ...common,
      level: 'orange',
      title: 'Cadrage presque bon',
      message: `Décale légèrement le téléphone ${horizontal}.`,
      ready: false,
    }
  }

  if (!angle.compatible) {
    return {
      ...common,
      level: 'orange',
      title: 'Angle à corriger',
      message: angle.message,
      ready: false,
    }
  }

  return {
    ...common,
    level: 'green',
    title: 'Photo conforme',
    message: 'Cadrage, netteté, lumière et famille d’angle sont compatibles.',
    ready: true,
  }
}

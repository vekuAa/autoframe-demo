import type { QualityResult, VehicleDetection, ViewProtocol } from '../types'

export function evaluateFraming(
  detection: VehicleDetection,
  frameWidth: number,
  frameHeight: number,
  protocol: ViewProtocol,
): QualityResult {
  const [x, y, w, h] = detection.bbox
  const coverage = (w * h) / (frameWidth * frameHeight)

  const cx = (x + w / 2) / frameWidth
  const cy = (y + h / 2) / frameHeight
  const dx = Math.abs(cx - protocol.targetCenterX)
  const dy = Math.abs(cy - protocol.targetCenterY)

  const confidence = detection.score
  const alignment = Math.max(0, Math.min(1, 1 - (dx * 2.2 + dy * 2.4)))

  if (confidence < 0.55) {
    return {
      level: 'red',
      title: 'Véhicule mal identifié',
      message: 'Stabilise le téléphone ou améliore l’éclairage.',
      ready: false,
      confidence,
      coverage,
      alignment,
    }
  }

  if (coverage < protocol.targetCoverageMin) {
    return {
      level: 'red',
      title: 'Véhicule trop loin',
      message: 'Avance vers le véhicule.',
      ready: false,
      confidence,
      coverage,
      alignment,
    }
  }

  if (coverage > protocol.targetCoverageMax) {
    return {
      level: 'red',
      title: 'Véhicule trop proche',
      message: 'Recule légèrement.',
      ready: false,
      confidence,
      coverage,
      alignment,
    }
  }

  if (dx > 0.11 || dy > 0.13) {
    const horizontal =
      cx < protocol.targetCenterX ? 'vers la droite' : 'vers la gauche'
    const vertical =
      cy < protocol.targetCenterY ? ' et baisse légèrement' : ' et remonte légèrement'

    return {
      level: 'orange',
      title: 'Presque bon',
      message: `Décale le téléphone ${horizontal}${dy > 0.10 ? vertical : ''}.`,
      ready: false,
      confidence,
      coverage,
      alignment,
    }
  }

  return {
    level: 'green',
    title: 'Cadrage conforme',
    message: 'Garde la position stable pour valider la photo.',
    ready: true,
    confidence,
    coverage,
    alignment,
  }
}

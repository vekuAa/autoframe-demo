import type { AngleEstimate, VehicleDetection, ViewProtocol } from '../types'

/**
 * Experimental V3 heuristic.
 * Only distinguishes "side" versus "three-quarter-ish".
 * Front/rear recognition requires a trained model.
 */
export function estimateAngle(
  detection: VehicleDetection,
  protocol: ViewProtocol,
): AngleEstimate {
  const [, , w, h] = detection.bbox
  const ratio = h > 0 ? w / h : 0

  let family: AngleEstimate['family'] = 'unknown'
  let score = 0.35

  if (ratio >= 2.05) {
    family = 'side'
    score = Math.min(0.88, 0.58 + (ratio - 2.05) * 0.22)
  } else if (ratio >= 1.20 && ratio < 2.05) {
    family = 'three-quarter'
    const center = 1.62
    score = Math.max(0.52, 0.82 - Math.abs(ratio - center) * 0.28)
  }

  // Front/rear are deliberately not validated by this heuristic.
  if (protocol.family === 'front' || protocol.family === 'rear') {
    return {
      family: 'unknown',
      score: 0.35,
      compatible: true,
      experimental: true,
      message: 'Face avant/arrière : validation d’angle réservée au futur modèle entraîné',
    }
  }

  const compatible = family !== 'unknown' && family === protocol.family

  let message = 'Angle non déterminé'
  if (compatible) {
    message =
      family === 'side'
        ? 'Silhouette compatible avec une vue de profil'
        : 'Silhouette compatible avec une vue 3/4'
  } else if (family !== 'unknown') {
    message =
      protocol.family === 'side'
        ? 'La silhouette paraît trop 3/4 pour le profil attendu'
        : 'La silhouette paraît trop latérale pour la vue 3/4 attendue'
  }

  return { family, score, compatible, experimental: true, message }
}

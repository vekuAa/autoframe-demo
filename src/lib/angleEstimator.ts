import type { AngleEstimate, VehicleDetection, ViewProtocol } from '../types'

/**
 * Experimental demo-only viewpoint heuristic.
 *
 * It can roughly separate a long side-profile silhouette from a more compact
 * three-quarter silhouette using the detected vehicle bbox aspect ratio.
 *
 * It CANNOT reliably distinguish:
 * - front vs rear
 * - left vs right
 * - exact yaw angle
 *
 * Replace this module later with a trained automotive viewpoint classifier.
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
        ? 'La silhouette paraît trop 3/4 pour la vue profil attendue'
        : 'La silhouette paraît trop latérale pour la vue 3/4 attendue'
  }

  return {
    family,
    score,
    compatible,
    experimental: true,
    message,
  }
}

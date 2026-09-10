import type { ViewProtocol } from '../types'

export const PROTOCOL: ViewProtocol[] = [
  {
    id: 'front-left-3q',
    label: '3/4 avant gauche',
    shortLabel: 'Avant 3/4',
    targetCenterX: 0.50,
    targetCenterY: 0.49,
    targetCoverageMin: 0.24,
    targetCoverageMax: 0.62,
  },
  {
    id: 'side-left',
    label: 'Profil gauche',
    shortLabel: 'Profil',
    targetCenterX: 0.50,
    targetCenterY: 0.50,
    targetCoverageMin: 0.22,
    targetCoverageMax: 0.58,
  },
  {
    id: 'rear-right-3q',
    label: '3/4 arrière droit',
    shortLabel: 'Arrière 3/4',
    targetCenterX: 0.50,
    targetCenterY: 0.49,
    targetCoverageMin: 0.24,
    targetCoverageMax: 0.62,
  },
]

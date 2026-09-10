import type { ViewProtocol } from '../types'

export const PROTOCOL: ViewProtocol[] = [
  { id:'front', label:'Face avant', shortLabel:'Avant', family:'front', targetCenterX:.50, targetCenterY:.49, targetCoverageMin:.22, targetCoverageMax:.60 },
  { id:'front-left-3q', label:'3/4 avant gauche', shortLabel:'Av. 3/4 G', family:'three-quarter', targetCenterX:.50, targetCenterY:.49, targetCoverageMin:.22, targetCoverageMax:.60 },
  { id:'left-side', label:'Profil gauche', shortLabel:'Profil G', family:'side', targetCenterX:.50, targetCenterY:.50, targetCoverageMin:.20, targetCoverageMax:.56 },
  { id:'rear-left-3q', label:'3/4 arrière gauche', shortLabel:'Ar. 3/4 G', family:'three-quarter', targetCenterX:.50, targetCenterY:.49, targetCoverageMin:.22, targetCoverageMax:.60 },
  { id:'rear', label:'Face arrière', shortLabel:'Arrière', family:'rear', targetCenterX:.50, targetCenterY:.49, targetCoverageMin:.22, targetCoverageMax:.60 },
  { id:'rear-right-3q', label:'3/4 arrière droit', shortLabel:'Ar. 3/4 D', family:'three-quarter', targetCenterX:.50, targetCenterY:.49, targetCoverageMin:.22, targetCoverageMax:.60 },
  { id:'right-side', label:'Profil droit', shortLabel:'Profil D', family:'side', targetCenterX:.50, targetCenterY:.50, targetCoverageMin:.20, targetCoverageMax:.56 },
  { id:'front-right-3q', label:'3/4 avant droit', shortLabel:'Av. 3/4 D', family:'three-quarter', targetCenterX:.50, targetCenterY:.49, targetCoverageMin:.22, targetCoverageMax:.60 },
]

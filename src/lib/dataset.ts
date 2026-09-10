import type { DatasetSample } from '../types'

const KEY = 'autoframe-v3-dataset'

export function loadDataset(): DatasetSample[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as DatasetSample[]
  } catch {
    return []
  }
}

export function saveDataset(samples: DatasetSample[]) {
  localStorage.setItem(KEY, JSON.stringify(samples))
}

export function exportDataset(samples: DatasetSample[]) {
  const payload = {
    format: 'autoframe-dataset-v1',
    exportedAt: new Date().toISOString(),
    sampleCount: samples.length,
    samples,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `autoframe-dataset-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

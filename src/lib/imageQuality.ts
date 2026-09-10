import type { ImageQuality } from '../types'

const SAMPLE_W = 160
const SAMPLE_H = 100

let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null

function ensureCanvas() {
  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.width = SAMPLE_W
    canvas.height = SAMPLE_H
    ctx = canvas.getContext('2d', { willReadFrequently: true })
  }
}

export function analyzeImageQuality(video: HTMLVideoElement): ImageQuality {
  ensureCanvas()
  if (!canvas || !ctx) {
    return {
      brightness: 0,
      sharpness: 0,
      brightnessOk: false,
      sharpnessOk: false,
    }
  }

  ctx.drawImage(video, 0, 0, SAMPLE_W, SAMPLE_H)
  const { data } = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H)

  const gray = new Float32Array(SAMPLE_W * SAMPLE_H)
  let sum = 0

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const value = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    gray[p] = value
    sum += value
  }

  const brightness = sum / gray.length / 255

  // Simple Laplacian-variance focus metric.
  // This is intentionally lightweight for a phone/browser demo.
  let lapSum = 0
  let lapSqSum = 0
  let count = 0

  for (let y = 1; y < SAMPLE_H - 1; y++) {
    for (let x = 1; x < SAMPLE_W - 1; x++) {
      const i = y * SAMPLE_W + x
      const lap =
        gray[i - SAMPLE_W] +
        gray[i + SAMPLE_W] +
        gray[i - 1] +
        gray[i + 1] -
        4 * gray[i]

      lapSum += lap
      lapSqSum += lap * lap
      count++
    }
  }

  const mean = count ? lapSum / count : 0
  const variance = count ? lapSqSum / count - mean * mean : 0

  // Normalize to a 0..1 demo score. Thresholds are empirical,
  // not a calibrated automotive standard.
  const sharpness = Math.max(0, Math.min(1, variance / 700))

  return {
    brightness,
    sharpness,
    brightnessOk: brightness >= 0.18 && brightness <= 0.88,
    sharpnessOk: sharpness >= 0.22,
  }
}

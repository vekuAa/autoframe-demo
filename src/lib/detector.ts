import '@tensorflow/tfjs-backend-cpu'
import '@tensorflow/tfjs-backend-webgl'
import * as tf from '@tensorflow/tfjs-core'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import type { VehicleDetection } from '../types'

let modelPromise: Promise<cocoSsd.ObjectDetection> | null = null

export async function loadVehicleDetector() {
  if (!modelPromise) {
    modelPromise = (async () => {
      try {
        await tf.setBackend('webgl')
      } catch {
        await tf.setBackend('cpu')
      }
      await tf.ready()
      return cocoSsd.load({ base: 'lite_mobilenet_v2' })
    })()
  }
  return modelPromise
}

export async function detectVehicle(
  video: HTMLVideoElement,
): Promise<VehicleDetection | null> {
  const model = await loadVehicleDetector()
  const predictions = await model.detect(video, 12, 0.35)

  const vehicle = predictions
    .filter((p) => ['car', 'truck', 'bus'].includes(p.class))
    .sort(
      (a, b) =>
        b.bbox[2] * b.bbox[3] -
        a.bbox[2] * a.bbox[3],
    )[0]

  if (!vehicle) return null

  return {
    bbox: vehicle.bbox as [number, number, number, number],
    className: vehicle.class,
    score: vehicle.score,
  }
}

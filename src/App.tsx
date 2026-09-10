import { useEffect, useMemo, useRef, useState } from 'react'
import GuideOverlay from './components/GuideOverlay'
import Metrics from './components/Metrics'
import ProtocolStrip from './components/ProtocolStrip'
import { detectVehicle, loadVehicleDetector } from './lib/detector'
import { PROTOCOL } from './lib/protocol'
import { evaluateFraming } from './lib/qualityEngine'
import type { QualityLevel, QualityResult, VehicleDetection } from './types'

const emptyStatus: QualityResult = {
  level: 'red',
  title: 'Caméra inactive',
  message: 'Démarre la caméra pour lancer le contrôle de cadrage.',
  ready: false,
  confidence: 0,
  coverage: 0,
  alignment: 0,
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const runRef = useRef(false)
  const busyRef = useRef(false)
  const stableRef = useRef(0)
  const currentIndexRef = useRef(0)

  const [cameraActive, setCameraActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [detection, setDetection] = useState<VehicleDetection | null>(null)
  const [result, setResult] = useState<QualityResult>(emptyStatus)
  const [frameSize, setFrameSize] = useState({ width: 1280, height: 720 })
  const [snapshot, setSnapshot] = useState<string | null>(null)

  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  const current = PROTOCOL[currentIndex]
  const level: QualityLevel = result.level
  const captureReady = cameraActive && result.ready && stableRef.current >= 3

  useEffect(() => {
    return () => {
      runRef.current = false
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  async function startCamera() {
    if (cameraActive || loading) return

    setLoading(true)
    setResult({
      ...emptyStatus,
      level: 'orange',
      title: 'Chargement IA',
      message: 'Initialisation du détecteur véhicule…',
    })

    try {
      await loadVehicleDetector()

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })

      const video = videoRef.current!
      streamRef.current = stream
      video.srcObject = stream
      await video.play()

      setFrameSize({
        width: video.videoWidth || 1280,
        height: video.videoHeight || 720,
      })

      runRef.current = true
      setCameraActive(true)
      setResult({
        ...emptyStatus,
        title: 'Cherche le véhicule',
        message: 'Place une voiture entière dans la zone cible.',
      })

      void detectionLoop()
    } catch (error) {
      console.error(error)
      setResult({
        ...emptyStatus,
        title: 'Caméra indisponible',
        message:
          window.location.protocol !== 'https:' &&
          window.location.hostname !== 'localhost'
            ? 'La caméra nécessite HTTPS ou localhost.'
            : 'Vérifie l’autorisation caméra du navigateur.',
      })
    } finally {
      setLoading(false)
    }
  }

  async function detectionLoop() {
    if (!runRef.current || !videoRef.current) return

    if (busyRef.current) {
      window.setTimeout(detectionLoop, 150)
      return
    }

    busyRef.current = true

    try {
      const video = videoRef.current
      if (video.readyState < 2) return

      const vehicle = await detectVehicle(video)

      if (!vehicle) {
        stableRef.current = 0
        setDetection(null)
        setResult({
          ...emptyStatus,
          title: 'Aucun véhicule détecté',
          message: 'Cadre une voiture entière et suffisamment proche.',
        })
      } else {
        setDetection(vehicle)
        const evaluation = evaluateFraming(
          vehicle,
          video.videoWidth,
          video.videoHeight,
          PROTOCOL[currentIndexRef.current],
        )
        stableRef.current = evaluation.ready ? stableRef.current + 1 : 0
        setResult(evaluation)
      }
    } catch (error) {
      console.error(error)
    } finally {
      busyRef.current = false
      if (runRef.current) window.setTimeout(detectionLoop, 260)
    }
  }

  function capture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !result.ready || stableRef.current < 3) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    setSnapshot(dataUrl)

    const nextCompleted = new Set(completed)
    nextCompleted.add(currentIndex)
    setCompleted(nextCompleted)

    if (currentIndex < PROTOCOL.length - 1) {
      stableRef.current = 0
      setTimeout(() => {
        setSnapshot(null)
        setDetection(null)
        setCurrentIndex((i) => i + 1)
        setResult({
          ...emptyStatus,
          title: 'Vue suivante',
          message: `Positionne le véhicule pour : ${PROTOCOL[currentIndex + 1].label}.`,
        })
      }, 1100)
    } else {
      setResult({
        ...result,
        level: 'green',
        title: 'Protocole terminé',
        message: 'Les 3 vues de démonstration ont été validées.',
      })
    }
  }

  const statusIcon = useMemo(
    () => (level === 'green' ? '🟢' : level === 'orange' ? '🟠' : '🔴'),
    [level],
  )

  return (
    <main className="app-shell">
      <section className="phone-shell">
        <header className="topbar">
          <div>
            <div className="eyebrow">SMART VEHICLE CAPTURE</div>
            <h1>AutoFrame <span>V1</span></h1>
          </div>
          <div className="counter">{currentIndex + 1} / {PROTOCOL.length}</div>
        </header>

        <ProtocolStrip
          steps={PROTOCOL}
          currentIndex={currentIndex}
          completed={completed}
        />

        <section className={`camera-card ${level}`}>
          <video ref={videoRef} muted playsInline autoPlay />
          <GuideOverlay
            level={level}
            detection={detection}
            frameWidth={frameSize.width}
            frameHeight={frameSize.height}
            protocol={current}
          />

          <div className="camera-label">
            <span>{current.shortLabel}</span>
            <strong>{current.label}</strong>
          </div>

          <div className={`live-chip ${level}`}>
            {statusIcon} {result.title}
          </div>
        </section>

        <section className={`status-panel ${level}`}>
          <div className="status-dot" />
          <div>
            <h2>{result.title}</h2>
            <p>{result.message}</p>
          </div>
        </section>

        <Metrics result={cameraActive ? result : null} />

        <div className="button-row">
          <button
            className="secondary-btn"
            onClick={startCamera}
            disabled={cameraActive || loading}
          >
            {loading ? 'Chargement…' : cameraActive ? 'Caméra active' : 'Démarrer la caméra'}
          </button>

          <button
            className={`capture-btn ${captureReady ? 'enabled' : ''}`}
            onClick={capture}
            disabled={!captureReady}
          >
            <span className="shutter" />
            Capturer
          </button>
        </div>

        {snapshot && (
          <section className="snapshot-card">
            <img src={snapshot} alt="Photo du véhicule capturée" />
            <div>
              <strong>✓ Vue validée</strong>
              <span>{current.label}</span>
            </div>
          </section>
        )}

        <canvas ref={canvasRef} className="hidden-canvas" />

        <footer>
          V1 démo · la couleur valide aujourd’hui détection + taille + centrage.
          La certification de l’angle exact nécessite un modèle automobile spécialisé.
        </footer>
      </section>
    </main>
  )
}

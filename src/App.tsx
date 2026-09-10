import { useEffect, useMemo, useRef, useState } from 'react'
import GuideOverlay from './components/GuideOverlay'
import Metrics from './components/Metrics'
import ProtocolStrip from './components/ProtocolStrip'
import { estimateAngle } from './lib/angleEstimator'
import { loadDataset, saveDataset, exportDataset } from './lib/dataset'
import { detectVehicle, loadVehicleDetector } from './lib/detector'
import { analyzeImageQuality } from './lib/imageQuality'
import { PROTOCOL } from './lib/protocol'
import { evaluateFraming } from './lib/qualityEngine'
import type { DatasetSample, QualityLevel, QualityResult, VehicleDetection } from './types'

const emptyStatus: QualityResult = {
  level: 'red', title: 'Caméra inactive',
  message: 'Démarre la caméra pour lancer le contrôle de cadrage.',
  ready: false, confidence: 0, coverage: 0, alignment: 0,
  brightness: 0, sharpness: 0, angleScore: 0,
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
  const [mode, setMode] = useState<'protocol' | 'collect'>('protocol')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [detection, setDetection] = useState<VehicleDetection | null>(null)
  const [result, setResult] = useState<QualityResult>(emptyStatus)
  const [frameSize, setFrameSize] = useState({ width: 1280, height: 720 })
  const [snapshot, setSnapshot] = useState<string | null>(null)
  const [angleMessage, setAngleMessage] = useState('Angle non évalué')
  const [dataset, setDataset] = useState<DatasetSample[]>(() => loadDataset())

  useEffect(() => { currentIndexRef.current = currentIndex }, [currentIndex])
  useEffect(() => { saveDataset(dataset) }, [dataset])
  useEffect(() => () => {
    runRef.current = false
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }, [])

  const current = PROTOCOL[currentIndex]
  const level: QualityLevel = result.level
  const captureReady = cameraActive && (
    mode === 'collect'
      ? result.confidence >= .45 && result.brightness >= .12
      : result.ready && stableRef.current >= 3
  )

  async function startCamera() {
    if (cameraActive || loading) return
    setLoading(true)
    setResult({ ...emptyStatus, level:'orange', title:'Chargement IA', message:'Initialisation du détecteur véhicule…' })

    try {
      await loadVehicleDetector()
      const stream = await navigator.mediaDevices.getUserMedia({
        video:{ facingMode:{ ideal:'environment' }, width:{ ideal:1920 }, height:{ ideal:1080 } },
        audio:false,
      })
      const video = videoRef.current!
      streamRef.current = stream
      video.srcObject = stream
      await video.play()
      setFrameSize({ width:video.videoWidth || 1280, height:video.videoHeight || 720 })
      runRef.current = true
      setCameraActive(true)
      setResult({ ...emptyStatus, title:'Cherche le véhicule', message:'Place une voiture entière dans la zone cible.' })
      void detectionLoop()
    } catch (error) {
      console.error(error)
      setResult({
        ...emptyStatus,
        title:'Caméra indisponible',
        message: window.location.protocol !== 'https:' && window.location.hostname !== 'localhost'
          ? 'La caméra nécessite HTTPS ou localhost.'
          : 'Vérifie l’autorisation caméra du navigateur.',
      })
    } finally { setLoading(false) }
  }

  async function detectionLoop() {
    if (!runRef.current || !videoRef.current) return
    if (busyRef.current) { window.setTimeout(detectionLoop, 150); return }
    busyRef.current = true

    try {
      const video = videoRef.current
      if (video.readyState < 2) return
      const vehicle = await detectVehicle(video)

      if (!vehicle) {
        stableRef.current = 0
        setDetection(null)
        setAngleMessage('Aucun véhicule à analyser')
        setResult({ ...emptyStatus, title:'Aucun véhicule détecté', message:'Cadre une voiture entière et suffisamment proche.' })
      } else {
        setDetection(vehicle)
        const protocol = PROTOCOL[currentIndexRef.current]
        const imageQuality = analyzeImageQuality(video)
        const angle = estimateAngle(vehicle, protocol)
        setAngleMessage(angle.message)

        const evaluation = evaluateFraming(
          vehicle, video.videoWidth, video.videoHeight, protocol, imageQuality, angle
        )
        stableRef.current = evaluation.ready ? stableRef.current + 1 : 0
        setResult(evaluation)
      }
    } catch (error) {
      console.error(error)
    } finally {
      busyRef.current = false
      if (runRef.current) window.setTimeout(detectionLoop, 280)
    }
  }

  function captureDataUrl() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return null
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.86)
  }

  function capture() {
    const dataUrl = captureDataUrl()
    if (!dataUrl || !captureReady) return
    setSnapshot(dataUrl)

    if (mode === 'collect') {
      const sample: DatasetSample = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        viewId: current.id,
        viewLabel: current.label,
        imageDataUrl: dataUrl,
        metrics: {
          detection: result.confidence,
          coverage: result.coverage,
          alignment: result.alignment,
          brightness: result.brightness,
          sharpness: result.sharpness,
          angleScore: result.angleScore,
        },
      }
      setDataset((d) => [sample, ...d])
      return
    }

    const nextCompleted = new Set(completed)
    nextCompleted.add(currentIndex)
    setCompleted(nextCompleted)

    if (currentIndex < PROTOCOL.length - 1) {
      stableRef.current = 0
      setTimeout(() => {
        setSnapshot(null)
        setDetection(null)
        setCurrentIndex((i) => i + 1)
        setResult({ ...emptyStatus, title:'Vue suivante', message:`Positionne le véhicule pour : ${PROTOCOL[currentIndex + 1].label}.` })
      }, 900)
    } else {
      setResult({ ...result, level:'green', title:'Protocole terminé', message:'Les 8 vues ont été validées.' })
    }
  }

  function selectView(index:number) {
    stableRef.current = 0
    setCurrentIndex(index)
    setSnapshot(null)
  }

  function clearDataset() {
    if (confirm('Supprimer toutes les photos de collecte stockées sur ce téléphone ?')) {
      setDataset([])
    }
  }

  const counts = useMemo(() => {
    const result: Record<string, number> = {}
    for (const view of PROTOCOL) result[view.id] = 0
    for (const sample of dataset) result[sample.viewId] = (result[sample.viewId] || 0) + 1
    return result
  }, [dataset])

  const statusIcon = level === 'green' ? '🟢' : level === 'orange' ? '🟠' : '🔴'

  return (
    <main className="app-shell">
      <section className="phone-shell">
        <header className="topbar">
          <div>
            <div className="eyebrow">SMART VEHICLE CAPTURE</div>
            <h1>AutoFrame <span>V3</span></h1>
          </div>
          <div className="counter">{currentIndex + 1} / {PROTOCOL.length}</div>
        </header>

        <div className="mode-switch">
          <button className={mode==='protocol'?'active':''} onClick={()=>setMode('protocol')}>📸 Protocole</button>
          <button className={mode==='collect'?'active':''} onClick={()=>setMode('collect')}>🧠 Collecte IA</button>
        </div>

        {mode === 'collect' && (
          <div className="dataset-panel">
            <div>
              <span>DATASET LOCAL</span>
              <strong>{dataset.length} photos enregistrées</strong>
            </div>
            <div className="dataset-actions">
              <button onClick={()=>exportDataset(dataset)} disabled={!dataset.length}>Exporter JSON</button>
              <button onClick={clearDataset} disabled={!dataset.length}>Effacer</button>
            </div>
          </div>
        )}

        <ProtocolStrip
          steps={PROTOCOL}
          currentIndex={currentIndex}
          completed={completed}
          onSelect={selectView}
        />

        {mode === 'collect' && (
          <div className="class-chip">
            Étiquette actuelle : <strong>{current.label}</strong> · {counts[current.id] || 0} échantillon(s)
          </div>
        )}

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
            <span>{mode==='collect' ? 'CLASSE À ENREGISTRER' : 'VUE ATTENDUE'}</span>
            <strong>{current.label}</strong>
          </div>
          <div className={`live-chip ${level}`}>{statusIcon} {result.title}</div>
        </section>

        <section className={`status-panel ${level}`}>
          <div className="status-dot" />
          <div><h2>{result.title}</h2><p>{result.message}</p></div>
        </section>

        <div className="angle-panel">
          <div><span className="mini-label">Contrôle angle*</span><strong>{angleMessage}</strong></div>
          <div className="angle-score">{cameraActive ? `${Math.round(result.angleScore*100)}%` : '—'}</div>
        </div>

        <Metrics result={cameraActive ? result : null} />

        <div className="button-row">
          <button className="secondary-btn" onClick={startCamera} disabled={cameraActive || loading}>
            {loading ? 'Chargement…' : cameraActive ? 'Caméra active' : 'Démarrer la caméra'}
          </button>
          <button className={`capture-btn ${captureReady?'enabled':''}`} onClick={capture} disabled={!captureReady}>
            <span className="shutter" />
            {mode==='collect' ? 'Ajouter au dataset' : 'Capturer'}
          </button>
        </div>

        {snapshot && (
          <section className="snapshot-card">
            <img src={snapshot} alt="Photo du véhicule capturée" />
            <div>
              <strong>{mode==='collect' ? '✓ Échantillon enregistré' : '✓ Vue validée'}</strong>
              <span>{current.label}</span>
            </div>
          </section>
        )}

        <canvas ref={canvasRef} className="hidden-canvas" />

        <footer>
          *Le contrôle d’angle automatique reste expérimental. Le mode Collecte sert à créer
          les données nécessaires au futur modèle 8 vues.
        </footer>
      </section>
    </main>
  )
}

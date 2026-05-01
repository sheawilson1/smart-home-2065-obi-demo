import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { director } from '../director/DemoDirector';
import { amaraMorning, wakeAsAmara } from '../director/beats';
import { useObiStore } from '../state/store';

type Landmark = { x: number; y: number; z?: number };
type GestureName = 'open palm' | 'pinch' | 'swipe' | 'tracking' | 'none';
type FacingMode = 'user' | 'environment';
type ScreenPoint = { x: number; y: number; z: number };

type HandLandmarker = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestamp: number
  ) => { landmarks?: Landmark[][] };
};

type MediaPipeModule = {
  FilesetResolver: {
    forVisionTasks: (path: string) => Promise<unknown>;
  };
  HandLandmarker: {
    createFromOptions: (vision: unknown, options: unknown) => Promise<HandLandmarker>;
  };
};

const MEDIAPIPE_VERSION = '0.10.22';
const IMPORT_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/+esm`;
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task';
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

function distance(a: Landmark, b: Landmark) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function classify(landmarks: Landmark[]): GestureName {
  const wrist = landmarks[0];
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];

  const pinch = distance(thumb, index) < 0.055;
  if (pinch) return 'pinch';

  const fingersExtended =
    distance(wrist, index) > 0.27 &&
    distance(wrist, middle) > 0.29 &&
    distance(wrist, ring) > 0.27 &&
    distance(wrist, pinky) > 0.24;
  const spread = distance(index, pinky) > 0.18;

  if (fingersExtended && spread) return 'open palm';
  return 'tracking';
}

function toScreenPoints(landmarks: Landmark[], facingMode: FacingMode): ScreenPoint[] {
  const insetX = Math.min(120, window.innerWidth * 0.08);
  const insetY = Math.min(80, window.innerHeight * 0.08);
  const width = window.innerWidth - insetX * 2;
  const height = window.innerHeight - insetY * 2;

  return landmarks.map((point) => {
    const normalizedX = facingMode === 'user' ? 1 - point.x : point.x;
    return {
      x: insetX + normalizedX * width,
      y: insetY + point.y * height,
      z: point.z ?? 0,
    };
  });
}

function HandShadow({ points, gesture }: { points: ScreenPoint[]; gesture: GestureName }) {
  const palm = points[9] ?? points[0];
  const pinch = gesture === 'pinch';

  return (
    <motion.svg
      className="pointer-events-none fixed inset-0 z-40"
      viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: points.length ? 1 : 0 }}
      transition={{ duration: 0.18 }}
      aria-hidden="true"
    >
      <defs>
        <filter id="obi-hand-shadow-blur">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id="obi-hand-glow">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {palm && (
        <ellipse
          cx={palm.x}
          cy={palm.y + 34}
          rx={pinch ? 56 : 92}
          ry={pinch ? 28 : 42}
          fill="rgba(0,0,0,0.42)"
          filter="url(#obi-hand-shadow-blur)"
        />
      )}

      {HAND_CONNECTIONS.map(([from, to]) => {
        const a = points[from];
        const b = points[to];
        if (!a || !b) return null;
        return (
          <line
            key={`${from}-${to}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="rgba(0,0,0,0.28)"
            strokeWidth={pinch ? 18 : 14}
            strokeLinecap="round"
            filter="url(#obi-hand-shadow-blur)"
          />
        );
      })}

      {[4, 8, 12, 16, 20].map((index) => {
        const point = points[index];
        if (!point) return null;
        return (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r={index === 8 ? 17 : 12}
              fill="rgba(0,0,0,0.34)"
              filter="url(#obi-hand-shadow-blur)"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r={index === 8 ? 8 : 4}
              fill="var(--obi-glow)"
              opacity={index === 8 || pinch ? 0.48 : 0.22}
              filter="url(#obi-hand-glow)"
            />
          </g>
        );
      })}

      {pinch && points[4] && points[8] && (
        <line
          x1={points[4].x}
          y1={points[4].y}
          x2={points[8].x}
          y2={points[8].y}
          stroke="var(--obi-glow)"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.65}
        />
      )}
    </motion.svg>
  );
}

export function GestureLayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFireRef = useRef<Record<string, number>>({});
  const swipeStartRef = useRef<{ x: number; t: number } | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [gesture, setGesture] = useState<GestureName>('none');
  const [points, setPoints] = useState<ScreenPoint[]>([]);
  const [facingMode, setFacingMode] = useState<FacingMode>('user');

  const emit = useObiStore((s) => s.emit);

  const stopTracking = useCallback(() => {
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    landmarkerRef.current = null;
    swipeStartRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const toggleTracking = useCallback(() => {
    if (enabled) {
      stopTracking();
      setStatus('idle');
      setGesture('none');
      setPoints([]);
      setEnabled(false);
      return;
    }

    setEnabled(true);
  }, [enabled, stopTracking]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      if (event.key.toLowerCase() === 'h') toggleTracking();
      if (event.key.toLowerCase() === 'c') {
        setFacingMode((current) => current === 'user' ? 'environment' : 'user');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleTracking]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function startTracking() {
      setStatus('loading');
      try {
        const video = videoRef.current;
        if (!video) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        video.srcObject = stream;
        await video.play();

        const mediaPipe = (await import(
          /* @vite-ignore */ IMPORT_URL
        )) as MediaPipeModule;
        const vision = await mediaPipe.FilesetResolver.forVisionTasks(WASM_URL);
        const landmarker = await mediaPipe.HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.58,
          minHandPresenceConfidence: 0.58,
          minTrackingConfidence: 0.58,
        });

        landmarkerRef.current = landmarker;
        setStatus('ready');
        loop();
      } catch {
        setStatus('error');
        stopTracking();
      }
    }

    function fire(name: string, cooldown = 1200) {
      const now = performance.now();
      if ((lastFireRef.current[name] ?? 0) + cooldown > now) return false;
      lastFireRef.current[name] = now;
      useObiStore.getState().emit({ type: 'fx', name: 'gesture' });
      return true;
    }

    function handleGesture(nextGesture: GestureName, landmarks: Landmark[]) {
      setGesture(nextGesture);
      setPoints(toScreenPoints(landmarks, facingMode));

      const wristX = landmarks[0]?.x;
      if (typeof wristX === 'number') {
        const now = performance.now();
        const start = swipeStartRef.current;
        if (!start || now - start.t > 900) {
          swipeStartRef.current = { x: wristX, t: now };
        } else if (Math.abs(wristX - start.x) > 0.22 && fire('swipe', 1500)) {
          const store = useObiStore.getState();
          setGesture('swipe');
          store.setBackgroundVariant(store.backgroundVariant === 'clear' ? 'objects' : 'clear');
          swipeStartRef.current = { x: wristX, t: now };
        }
      }

      if (nextGesture === 'open palm' && fire('open-palm', 2400)) {
        const store = useObiStore.getState();
        if (!store.awake) {
          store.setAwake(true);
          director.play(wakeAsAmara);
        } else {
          director.play(amaraMorning);
        }
      }

      if (nextGesture === 'pinch' && useObiStore.getState().awake && fire('pinch', 1400)) {
        const store = useObiStore.getState();
        store.emit({ type: 'portal', open: !store.portalOpen });
      }
    }

    function loop() {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;

      if (video && landmarker && video.readyState >= 2) {
        const result = landmarker.detectForVideo(video, performance.now());
        const hand = result.landmarks?.[0];
        if (hand) handleGesture(classify(hand), hand);
        else {
          setGesture('none');
          setPoints([]);
        }
      }

      rafRef.current = window.requestAnimationFrame(loop);
    }

    startTracking();

    return () => {
      cancelled = true;
      stopTracking();
    };
  }, [enabled, facingMode, stopTracking]);

  return (
    <>
      {enabled && (
        <video
          ref={videoRef}
          className="pointer-events-none fixed bottom-4 right-4 z-50 h-24 w-32 object-cover opacity-35 mix-blend-screen"
          style={{
            borderRadius: 8,
            transform: facingMode === 'user' ? 'scaleX(-1)' : undefined,
          }}
          muted
          playsInline
        />
      )}

      <HandShadow points={points} gesture={gesture} />

      <motion.button
        type="button"
        className="fixed right-4 top-4 z-50 border border-white/5 bg-black/18 px-3 py-2 text-[9px] uppercase tracking-[0.28em] text-white/42 backdrop-blur-md transition hover:border-white/12 hover:bg-black/26 hover:text-white/70"
        style={{ borderRadius: 8 }}
        onClick={toggleTracking}
        onPointerEnter={() => emit({ type: 'fx', name: 'hover' })}
        onPointerDown={() => emit({ type: 'fx', name: 'press' })}
      >
        Hand {enabled ? 'on' : 'off'}
      </motion.button>

      <motion.button
        type="button"
        className="fixed right-4 top-16 z-50 border border-white/5 bg-black/18 px-3 py-2 text-[9px] uppercase tracking-[0.28em] text-white/42 backdrop-blur-md transition hover:border-white/12 hover:bg-black/26 hover:text-white/70"
        style={{ borderRadius: 8 }}
        onClick={() => setFacingMode((current) => current === 'user' ? 'environment' : 'user')}
        onPointerEnter={() => emit({ type: 'fx', name: 'hover' })}
        onPointerDown={() => emit({ type: 'fx', name: 'press' })}
      >
        Cam {facingMode === 'user' ? 'self' : 'surface'}
      </motion.button>

      <AnimatePresence>
        {enabled && (
          <motion.div
            key="gesture-status"
            className="fixed right-4 top-28 z-50 min-w-44 border border-white/5 bg-black/22 px-3 py-2 text-right text-[9px] uppercase tracking-[0.24em] text-white/36 backdrop-blur-md"
            style={{ borderRadius: 8 }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <div style={{ color: status === 'error' ? '#ffb199' : 'var(--obi-glow)' }}>
              {status}
            </div>
            <div className="mt-1 text-white/35">{gesture}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { motion } from 'framer-motion';
import { audio } from '../audio/AudioDirector';
import { useObiStore } from '../state/store';

export const GARDEN_PANORAMA = '/images/herb-garden-360-4k.png';

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalisePan(value: number) {
  return ((value % 1000) + 1000) % 1000;
}

export function Portal() {
  const dragRef = useRef<{ x: number; y: number; pan: number; tilt: number } | null>(null);
  const emit = useObiStore((s) => s.emit);
  const [pan, setPan] = useState(0);
  const [tilt, setTilt] = useState(58);
  const [zoom, setZoom] = useState(230);
  const [dragging, setDragging] = useState(false);
  const panMarker = Math.round((normalisePan(pan) / 1000) * 100);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, pan, tilt };
    setDragging(true);
    audio.playFx('press');
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    setPan(drag.pan + dx * 1.15);
    setTilt(clamp(drag.tilt + dy * 0.045, 40, 68));
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
    setDragging(false);
    audio.playFx('select');
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    setZoom((current) => clamp(current + event.deltaY * 0.045, 168, 260));
  }

  return (
    <motion.div
      key="portal"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
      className="absolute left-1/2 top-1/2 z-30 overflow-hidden"
      style={{
        width: 'min(760px, 46vw)',
        height: 'min(500px, 44vh)',
        maxWidth: 'calc(100vw - 48px)',
        maxHeight: 'calc(100vh - 176px)',
        borderRadius: 34,
        boxShadow:
          '0 56px 90px -60px rgba(0,0,0,0.9), 0 0 38px rgba(245,212,161,0.34), 0 0 120px -20px var(--obi-glow), 0 0 0 1px rgba(255,235,198,0.32), inset 0 0 1px rgba(255,255,255,0.40)',
        translate: '-50% -50%',
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-10"
        animate={{ opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          borderRadius: 34,
          boxShadow:
            'inset 0 0 0 1px rgba(255,226,178,0.42), inset 0 0 42px rgba(245,212,161,0.22), 0 0 54px rgba(245,212,161,0.52)',
        }}
      />
      <div
        className="pointer-events-none absolute -inset-10 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(245,212,161,0.34), rgba(245,212,161,0.12) 38%, transparent 72%)',
          filter: 'blur(16px)',
        }}
      />
      <motion.div
        className="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        style={{
          backgroundImage: `url(${GARDEN_PANORAMA})`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: `${zoom}% auto`,
          backgroundPosition: `${pan}px ${tilt}%`,
          filter: dragging ? 'saturate(1.12) contrast(1.02) brightness(0.94)' : 'saturate(1.03) contrast(1.0) brightness(0.9)',
          opacity: 0.88,
          transition: dragging ? 'filter 160ms ease' : 'background-position 420ms cubic-bezier(0.2, 0.8, 0.2, 1), filter 400ms ease',
        }}
      />

      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          x: [0, 18, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          backgroundImage: `url(${GARDEN_PANORAMA})`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: `${zoom + 10}% auto`,
          backgroundPosition: `${pan}px ${tilt}%`,
          opacity: 0.12,
          mixBlendMode: 'screen',
          filter: 'blur(8px) brightness(0.9)',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, rgba(255,238,203,0.10) 0%, transparent 38%, rgba(0,0,0,0.40) 100%), linear-gradient(to top, rgba(0,0,0,0.58), rgba(0,0,0,0.02) 48%, rgba(0,0,0,0.24))',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(255,255,255,0.10), transparent 14%, transparent 86%, rgba(255,255,255,0.08)), repeating-linear-gradient(0deg, rgba(255,240,205,0.035) 0 1px, transparent 1px 7px)',
          mixBlendMode: 'screen',
          opacity: 0.38,
        }}
      />

      <motion.div
        className="absolute left-8 top-7 pointer-events-none mix-blend-screen"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.8 }}
      >
        <div className="text-[9px] tracking-[0.38em] text-[#ffe8bf]/78">LAGOS · LIVE GARDEN</div>
        <div className="mt-2 text-[clamp(22px,3vw,34px)] font-light text-white/95">Amara's Herb Garden</div>
      </motion.div>

      <motion.div
        className="absolute bottom-6 left-8 right-8 flex items-end justify-between gap-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.9 }}
      >
        <div className="pointer-events-none">
          <div className="text-[9px] tracking-[0.32em] text-[#ffe8bf]/55">PAN {panMarker} · TILT {Math.round(tilt)}</div>
          <div className="mt-2 max-w-[34ch] text-sm leading-relaxed text-white/70">
            Basil is ready. Rosemary is beautiful. Mint needs a few more days.
          </div>
        </div>
        <div className="pointer-events-none flex items-center gap-2">
          {[0, 1, 2, 3, 4].map((tick) => (
            <div
              key={tick}
              className="h-1.5 w-10 bg-white/20"
              style={{
                borderRadius: 999,
                opacity: Math.abs(tick * 25 - panMarker) < 18 ? 0.8 : 0.28,
                background: Math.abs(tick * 25 - panMarker) < 18 ? 'var(--obi-glow)' : undefined,
              }}
            />
          ))}
        </div>
        <button
          className="shrink-0 border border-[#ffe8bf]/30 bg-[#2d2418]/35 px-4 py-2 text-[9px] uppercase tracking-[0.22em] text-[#ffe8bf]/85 shadow-2xl backdrop-blur-md"
          style={{ borderRadius: 999 }}
          onClick={(event) => {
            event.stopPropagation();
            audio.playFx('select');
            emit({ type: 'portal', open: false });
          }}
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}

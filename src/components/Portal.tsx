import { useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { motion } from 'framer-motion';
import { audio } from '../audio/AudioDirector';
import { useObiStore } from '../state/store';
import { GARDEN_PANORAMA, KOFI_SPATIAL_MIX_ENVIRONMENT } from '../assets/imagePaths';

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalisePan(value: number) {
  return ((value % 1000) + 1000) % 1000;
}

export function Portal() {
  const dragRef = useRef<{ x: number; y: number; pan: number; tilt: number } | null>(null);
  const emit = useObiStore((s) => s.emit);
  const activeUser = useObiStore((s) => s.activeUser);
  const isKofi = activeUser.id === 'kofi';
  const portalImage = isKofi ? KOFI_SPATIAL_MIX_ENVIRONMENT : GARDEN_PANORAMA;
  const [pan, setPan] = useState(0);
  const [tilt, setTilt] = useState(isKofi ? 50 : 58);
  const [zoom, setZoom] = useState(isKofi ? 150 : 230);
  const [dragging, setDragging] = useState(false);
  const panMarker = Math.round((normalisePan(pan) / 1000) * 100);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, pan, tilt };
    setDragging(true);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    setPan(drag.pan + dx * (isKofi ? 1.35 : 1.15));
    setTilt(clamp(drag.tilt + dy * 0.045, isKofi ? 36 : 40, isKofi ? 64 : 68));
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
    setDragging(false);
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    setZoom((current) => clamp(current + event.deltaY * 0.045, isKofi ? 118 : 168, isKofi ? 210 : 260));
  }

  function closePortal() {
    audio.playFx('select');
    emit({ type: 'portal', open: false });
  }

  return (
    <>
      <button
        aria-label="Close portal"
        className="fixed inset-0 z-20 cursor-default bg-transparent"
        type="button"
        onClick={closePortal}
      />
      <motion.div
        key="portal"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
        className="absolute z-30 overflow-hidden border border-[#f4dec0]/10 bg-[#211b14]/10 backdrop-blur-xl"
        style={{
          left: '54%',
          top: '51%',
          width: 1060,
          height: 670,
          borderRadius: 26,
          boxShadow:
            '0 24px 68px -60px rgba(0,0,0,0.84), inset 0 0 0 1px rgba(255,244,224,0.035), inset 0 1px 0 rgba(255,244,224,0.075)',
          translate: '-50% -50%',
        }}
      >
      <motion.div
        className="pointer-events-none absolute inset-0 z-10"
        animate={{ opacity: [0.02, 0.055, 0.02] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          borderRadius: 26,
          boxShadow:
            'inset 0 0 0 1px rgba(255,238,205,0.055)',
          background:
            'linear-gradient(145deg, rgba(255,244,224,0.16), transparent 58%)',
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
          backgroundImage: `url(${portalImage})`,
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
          backgroundImage: `url(${portalImage})`,
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
        <div className="text-[9px] tracking-[0.38em] text-[#ffe8bf]/78">
          {isKofi ? 'VERSION 07 · SPATIAL MIX' : 'LAGOS · LIVE GARDEN'}
        </div>
        <div className="mt-2 text-[34px] font-light text-white/95">
          {isKofi ? 'Lucid Mirage' : "Amara's Herb Garden"}
        </div>
      </motion.div>

      <button
        aria-label="Close"
        className="absolute right-6 top-6 z-20 grid h-10 w-10 place-items-center rounded-full border border-[#f4dec0]/10 bg-[#fff7e8]/[0.035] text-[#fff1d7]/70 shadow-none backdrop-blur-md transition hover:border-[#f4dec0]/18 hover:bg-[#fff7e8]/[0.06] hover:text-[#fff1d7]/86"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          closePortal();
        }}
        style={{ boxShadow: 'inset 0 0 0 1px rgba(255,238,205,0.055)' }}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
        </svg>
      </button>

      <motion.div
        className={`absolute bottom-6 left-8 right-8 flex items-end gap-5 ${isKofi ? 'justify-center' : 'justify-between'}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.9 }}
      >
        {!isKofi && (
          <div className="pointer-events-none">
            <div className="text-[9px] tracking-[0.32em] text-[#ffe8bf]/55">PAN {panMarker} · TILT {Math.round(tilt)}</div>
            <div className="mt-2 max-w-[34ch] text-sm leading-relaxed text-white/70">
              Basil is ready. Rosemary is beautiful. Mint needs a few more days.
            </div>
          </div>
        )}
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
      </motion.div>
      </motion.div>
    </>
  );
}

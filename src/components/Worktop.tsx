import { useEffect, useCallback, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useObiStore, type TimeOfDay, type BackgroundVariant } from '../state/store';
import { applyPaletteToRoot } from '../state/user';
import { director } from '../director/DemoDirector';
import { audio } from '../audio/AudioDirector';
import { avaVoiceSample, manualDemoSteps } from '../director/beats';
import { PresenceGlow } from './PresenceGlow';
import { Card } from './Card';
import { GARDEN_PANORAMA, Portal } from './Portal';
import { GestureLayer } from './GestureLayer';
import { publicPath } from '../assets/publicPath';

const BG_IMAGE: Record<BackgroundVariant, string> = {
  clear:   publicPath('/images/surface.png'),
  objects: publicPath('/images/surface-objects.png'),
};

// Cards for Amara: 3-column centred layout
function AmaraCards({ speech, onOpenGarden }: { speech: string | null; onOpenGarden: () => void }) {
  return (
    <div className="grid w-full max-w-[1320px] grid-cols-1 gap-[clamp(18px,2.2vw,34px)] md:grid-cols-[0.85fr_1.35fr_0.9fr]">
      <Card id="clock" breathSeed={0} className="min-h-[260px] p-8 max-md:min-h-[160px] max-md:p-6">
        <div className="text-[9px] tracking-[0.35em] opacity-60 text-white">LAGOS</div>
        <div className="mt-5 text-7xl font-light tracking-wide max-md:text-6xl" style={{ color: 'var(--obi-glow)' }}>
          07:42
        </div>
        <div className="mt-2 text-[10px] opacity-50 tracking-widest text-white">SUNRISE 06:45</div>
        <div className="mt-12 h-px w-full bg-white/10 max-md:mt-8" />
        <div className="mt-5 text-xs tracking-[0.22em] text-white/45">KITCHEN SURFACE</div>
      </Card>

      <Card id="obi-speech" breathSeed={1.4} className="min-h-[300px] p-9 max-md:min-h-[220px] max-md:p-6">
        <div className="text-[9px] tracking-[0.35em] opacity-50 text-white">OBI</div>
        <div className="mt-5 text-[clamp(24px,3.2vw,44px)] leading-[1.12] font-light text-white">
          {speech ?? 'Kitchen surface ready.'}
        </div>
        <div className="mt-8 max-w-[34ch] text-sm opacity-55 leading-relaxed text-white/70">
          Lagos is carrying heat today.
        </div>
      </Card>

      <Card id="herb-garden" breathSeed={2.7} onClick={onOpenGarden} className="min-h-[260px] p-8 max-md:min-h-[190px] max-md:p-6">
        <motion.div
          className="absolute -inset-8"
          aria-hidden
          animate={{ backgroundPosition: ['48% 58%', '54% 58%', '48% 58%'] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            backgroundImage: `url(${GARDEN_PANORAMA})`,
            backgroundSize: '260% auto',
            backgroundRepeat: 'repeat-x',
            filter: 'saturate(1.06) contrast(1.04) brightness(0.74)',
          }}
        />
        <div
          className="absolute -inset-8"
          aria-hidden
          style={{
            background:
              'linear-gradient(180deg, rgba(9,7,4,0.16), rgba(9,7,4,0.84)), radial-gradient(circle at 56% 34%, transparent 0%, rgba(0,0,0,0.48) 72%)',
          }}
        />
        <div className="relative">
          <div className="text-[9px] tracking-[0.35em] opacity-75 text-white">HERB GARDEN</div>
          <div className="mt-5 text-6xl font-light max-md:text-5xl" style={{ color: 'var(--obi-glow)' }}>87%</div>
          <div className="mt-2 text-[9px] opacity-70 tracking-widest text-white">HEALTH · EXCELLENT</div>
          <div className="mt-10 text-sm opacity-70 tracking-wide text-white/80 max-md:mt-6">
            Basil · Rosemary · Mint
          </div>
          <div className="mt-5 inline-flex border border-white/20 bg-black/20 px-4 py-2 text-[9px] uppercase tracking-[0.24em] text-white/75 backdrop-blur-md" style={{ borderRadius: 999 }}>
            Zoom in
          </div>
        </div>
      </Card>
    </div>
  );
}

// Cards for Kofi: 2-column left layout (leaves right side open)
function KofiCards({ speech }: { speech: string | null }) {
  return (
    <div className="grid w-full max-w-[1180px] grid-cols-1 gap-[clamp(18px,2.4vw,36px)] md:grid-cols-[1.28fr_0.72fr] md:mr-auto">
      <Card id="obi-speech" breathSeed={0.5} className="min-h-[320px] p-9 max-md:min-h-[220px] max-md:p-6">
        <div className="text-[9px] tracking-[0.35em] opacity-50 text-white">OBI</div>
        <div className="mt-5 text-[clamp(24px,3.4vw,46px)] leading-[1.12] font-light text-white">
          {speech ?? 'Studio surface ready.'}
        </div>
        <div className="mt-8 text-sm opacity-55 text-white/70">
          No one is getting through.
        </div>
      </Card>

      <Card id="studio" breathSeed={1.8} className="min-h-[320px] p-8 max-md:min-h-[220px] max-md:p-6">
        <div className="text-[9px] tracking-[0.35em] opacity-60 text-white">TRACK</div>
        <div className="mt-5 text-6xl font-light max-md:text-5xl" style={{ color: 'var(--obi-glow)' }}>12:04</div>
        <div className="mt-2 text-[9px] opacity-50 tracking-widest text-white">RENDERING</div>
        <div className="mt-12 grid gap-3 text-xs text-white/55 max-md:mt-8">
          <div className="flex justify-between border-b border-white/10 pb-3"><span>Door</span><span>Quiet</span></div>
          <div className="flex justify-between border-b border-white/10 pb-3"><span>Messages</span><span>Held</span></div>
          <div className="flex justify-between"><span>Room</span><span>Listening</span></div>
        </div>
      </Card>
    </div>
  );
}

export function Worktop() {
  const activeUser        = useObiStore((s) => s.activeUser);
  const awake             = useObiStore((s) => s.awake);
  const setAwake          = useObiStore((s) => s.setAwake);
  const setUser           = useObiStore((s) => s.setUser);
  const timeOfDay         = useObiStore((s) => s.timeOfDay);
  const setTimeOfDay      = useObiStore((s) => s.setTimeOfDay);
  const portalOpen        = useObiStore((s) => s.portalOpen);
  const currentSpeech     = useObiStore((s) => s.currentSpeech);
  const setCurrentSpeech  = useObiStore((s) => s.setCurrentSpeech);
  const backgroundVariant = useObiStore((s) => s.backgroundVariant);
  const setBackgroundVariant = useObiStore((s) => s.setBackgroundVariant);
  const emit = useObiStore((s) => s.emit);
  const [manualStepIndex, setManualStepIndex] = useState(-1);

  useEffect(() => {
    applyPaletteToRoot(activeUser);
    audio.init();
    return () => audio.teardown();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyPaletteToRoot(activeUser);
  }, [activeUser]);

  const stageUser = useCallback((id: 'amara' | 'kofi') => {
    director.stop();
    audio.stopVoice();
    setAwake(true);
    setUser(id);
    setCurrentSpeech(null);
    setManualStepIndex(-1);
    emit({ type: 'fx', name: id === 'amara' ? 'wake' : 'chime-bright' });
  }, [emit, setAwake, setCurrentSpeech, setUser]);

  const playManualStep = useCallback((direction: 1 | -1) => {
    const steps = manualDemoSteps[activeUser.id];
    const nextIndex = Math.max(0, Math.min(steps.length - 1, manualStepIndex + direction));
    const step = steps[nextIndex];
    if (!step) return;
    setManualStepIndex(nextIndex);
    step.events.forEach((event) => emit(event));
  }, [activeUser.id, emit, manualStepIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key.toLowerCase()) {
        case 'a':
          stageUser('amara');
          break;
        case 'k':
          stageUser('kofi');
          break;
        case 'arrowright':
          e.preventDefault();
          playManualStep(1);
          break;
        case 'arrowleft':
          e.preventDefault();
          playManualStep(-1);
          break;
        case ' ':
          e.preventDefault();
          playManualStep(1);
          break;
        case 'v':
          director.play(avaVoiceSample);
          break;
        case 'r':
          director.reset();
          audio.stopVoice();
          setAwake(false);
          setBackgroundVariant('clear');
          setCurrentSpeech(null);
          setManualStepIndex(-1);
          break;
        case 'o':
          setBackgroundVariant(backgroundVariant === 'clear' ? 'objects' : 'clear');
          break;
        case 't':
          if (e.shiftKey) {
            const order: TimeOfDay[] = ['morning', 'midday', 'evening'];
            setTimeOfDay(order[(order.indexOf(timeOfDay) + 1) % order.length]);
          }
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeUser.id, backgroundVariant, playManualStep, setAwake, setBackgroundVariant, setCurrentSpeech, setTimeOfDay, stageUser, timeOfDay]);

  // Time-of-day overlay tint on top of marble
  const timeTint: Record<TimeOfDay, string> = {
    morning: 'rgba(255, 220, 160, 0.08)',
    midday:  'rgba(255, 255, 255, 0.02)',
    evening: 'rgba(255, 140, 60, 0.14)',
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Marble surface — always present */}
      {(['clear', 'objects'] as BackgroundVariant[]).map((variant) => (
        <motion.div
          key={variant}
          className="absolute inset-0"
          initial={false}
          animate={{
            opacity: backgroundVariant === variant ? 1 : 0,
            scale: backgroundVariant === variant ? 1 : 1.015,
          }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          style={{
            backgroundImage: `url(${BG_IMAGE[variant]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}

      {/* Time-of-day colour wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: timeTint[timeOfDay],
          transition: 'background 1.4s ease',
        }}
      />

      {/* Dark veil — deepens when UI is awake so cards read on marble */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: awake ? 0.28 : 0 }}
        transition={{ duration: 1.0, ease: 'easeInOut' }}
        style={{ background: 'radial-gradient(circle at 50% 45%, rgba(0,0,0,0.04), rgba(0,0,0,0.20) 68%, rgba(0,0,0,0.42) 100%)' }}
      />

      {/* Sleeping pulse — marble veins glow hint when idle */}
      <AnimatePresence>
        {!awake && (
          <motion.div
            key="sleep-pulse"
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.06, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, var(--obi-glow) 0%, transparent 60%)',
            }}
          />
        )}
      </AnimatePresence>

      <PresenceGlow />

      {/* Main UI — only visible when awake */}
      <LayoutGroup>
        <AnimatePresence>
          {awake && (
            <motion.div
              key="ui-layer"
              className="absolute inset-0 flex items-center justify-center px-[clamp(24px,5vw,88px)]"
              initial={{ opacity: 0, y: 24, scale: 1, filter: 'blur(0px)' }}
              animate={{
                opacity: portalOpen ? 0.16 : 1,
                y: 0,
                scale: portalOpen ? 0.97 : 1,
                filter: portalOpen ? 'blur(5px)' : 'blur(0px)',
              }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeUser.id}
                  className="flex w-full items-center justify-center"
                  initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -14, filter: 'blur(8px)' }}
                  transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  {activeUser.id === 'amara'
                    ? <AmaraCards speech={currentSpeech} onOpenGarden={() => emit({ type: 'portal', open: true })} />
                    : <KofiCards speech={currentSpeech} />
                  }
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lagos herb portal */}
        <AnimatePresence>
          {portalOpen && awake && (
            <Portal key="portal" />
          )}
        </AnimatePresence>
      </LayoutGroup>

      {/* Sleep prompt — only shows when asleep */}
      <AnimatePresence>
        {!awake && (
          <motion.div
            key="sleep-hint"
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.2, duration: 1.0 }}
          >
            <div className="text-[10px] tracking-[0.4em] text-white/60 font-mono select-none">
              A — AMARA &nbsp;·&nbsp; K — KOFI
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GestureLayer />

      {/* Status bar — only when awake */}
      <AnimatePresence>
        {awake && (
          <motion.div
            key="status"
            className="absolute bottom-4 left-4 right-4 flex justify-between items-end gap-4 max-md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-[9px] tracking-[0.3em] text-white/30 font-mono select-none">
              ← / → voice steps · SPACE next · O objects · H hand · R sleep
            </div>
            <div className="text-[9px] tracking-[0.3em] font-mono select-none" style={{ color: 'var(--obi-glow)' }}>
              OBI · {activeUser.name.toUpperCase()} · {Math.max(manualStepIndex + 1, 0)}/{manualDemoSteps[activeUser.id].length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

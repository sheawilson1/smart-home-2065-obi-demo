import { useEffect, useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useObiStore, type TimeOfDay, type BackgroundVariant } from '../state/store';
import { applyPaletteToRoot } from '../state/user';
import { director } from '../director/DemoDirector';
import { audio } from '../audio/AudioDirector';
import { avaVoiceSample, manualDemoSteps } from '../director/beats';
import { PresenceGlow } from './PresenceGlow';
import { Card } from './Card';
import { Portal } from './Portal';
import { GestureLayer } from './GestureLayer';
import { publicPath } from '../assets/publicPath';
import {
  GARDEN_PANORAMA,
  KOFI_AMARA_PROFILE,
  KOFI_DAVID_PROFILE,
  KOFI_LENA_PROFILE,
  KOFI_LUCID_MIRAGE_COVER,
  KOFI_PRIYA_PROFILE,
  KOFI_SPATIAL_MIX_ENVIRONMENT,
  V3_BASIL_V2_CROP,
  V3_SURFACE_CLOSED,
  V3_SURFACE_OPEN,
} from '../assets/imagePaths';

const BG_IMAGE: Record<BackgroundVariant, string> = {
  clear:   V3_SURFACE_CLOSED,
  objects: V3_SURFACE_OPEN,
};

const STAGE_WIDTH = 1536;
const STAGE_HEIGHT = 1024;
const AMARA_FEEDBACK_AUDIO = publicPath('/audio/voices/obi/kofi-03-amara.wav');

const agendaItems = [
  { time: '09:00', title: 'Team stand-up', group: 'Work' },
  { time: '11:30', title: 'Design review', group: 'Work' },
  { time: '14:00', title: 'Pilates', group: 'Wellness' },
  { time: '16:30', title: 'Grocery pickup', group: 'Personal' },
  { time: '19:00', title: 'Family dinner', group: 'Home' },
];

function getStageScale() {
  if (typeof window === 'undefined') return 1;
  return Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT);
}

function useStageScale() {
  const [scale, setScale] = useState(getStageScale);

  useEffect(() => {
    const updateScale = () => setScale(getStageScale());
    updateScale();
    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      window.removeEventListener('orientationchange', updateScale);
    };
  }, []);

  return scale;
}

function GlassCard({
  children,
  className = '',
  onClick,
  id,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  id: string;
}) {
  return (
    <Card
      id={id}
      onClick={onClick}
      className={`border-[#f4dec0]/18 bg-[#211b14]/10 text-[#f8ead2] shadow-none ${className}`}
    >
      {children}
    </Card>
  );
}

function AgendaCard({
  title = "Today's agenda",
  items = agendaItems,
  itemGapClassName = 'gap-[16px]',
}: {
  title?: string;
  items?: Array<{ time: string; title: string; group?: string }>;
  itemGapClassName?: string;
}) {
  return (
    <GlassCard id="agenda" className="w-full p-[28px]" >
      <div className="font-serif text-[30px] leading-none text-[#fff1d7]">{title}</div>
      <div className={`relative mt-[26px] grid ${itemGapClassName} before:absolute before:bottom-[8px] before:left-[79px] before:top-[8px] before:w-px before:bg-[#fff1d7]/55`}>
        {items.map((item) => (
          <div key={`${item.time}-${item.title}`} className="grid grid-cols-[58px_18px_1fr] items-start gap-3 text-[#fff4df]/90">
            <div className="pt-[4px] text-[17px] leading-none">{item.time}</div>
            <div className="relative flex justify-center pt-[4px]">
              <div
                className="relative z-10 h-3 w-3 rounded-full bg-[#fff1d7] shadow-[0_0_10px_rgba(255,244,224,0.12)]"
              />
            </div>
            <div>
              <div className="text-[18px] leading-tight">{item.title}</div>
              {item.group && (
                <div className="mt-1 text-[15px] text-[#f7dfbd]/72">{item.group}</div>
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        className="mt-[26px] flex h-12 w-full items-center justify-between rounded-full border border-[#f4dec0]/10 bg-[#fff7e8]/[0.035] px-7 text-[15px] text-[#fff3df]/78 shadow-none backdrop-blur-md transition hover:border-[#f4dec0]/20 hover:bg-[#fff7e8]/[0.07]"
        type="button"
      >
        <span>View full schedule</span>
        <span className="text-3xl leading-none">›</span>
      </button>
    </GlassCard>
  );
}

function WeatherCard() {
  return (
    <GlassCard id="weather" className="min-h-[330px] p-[30px]">
      <div className="font-serif text-[26px] text-[#fff1d7]">Lagos, NG</div>
      <div className="mt-5 font-serif text-[86px] leading-[0.82] tracking-normal text-[#fff1d7]">26°</div>
      <div className="mt-5 text-[17px] text-[#fff4df]/88">Partly cloudy</div>
      <div className="my-7 h-px w-full bg-[#f4dec0]/20" />
      <div className="max-w-[16ch] text-[17px] leading-snug text-[#fff4df]/86">
        Rain expected tomorrow
      </div>
    </GlassCard>
  );
}

function BasilStatusCard({ speech }: { speech: string | null }) {
  return (
    <GlassCard id="basil-status" className="min-h-[330px] overflow-hidden p-[38px]">
      <div className="relative z-10 max-w-[52%]">
        <div className="font-serif text-[36px] leading-[1.08] text-[#fff1d7]">
          {speech ?? 'Your basil was watered this morning after temperatures rose in Lagos.'}
        </div>
        <div className="mt-[28px] max-w-[23ch] text-[18px] leading-relaxed text-[#fff4df]/86">
          Soil moisture restored to ideal levels.
        </div>
      </div>
      <img
        src={V3_BASIL_V2_CROP}
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-[-29%] right-[-38%] h-[132%] w-auto max-w-none select-none"
        style={{ filter: 'brightness(0.82) contrast(1.08) saturate(0.96) drop-shadow(0 26px 30px rgba(0,0,0,0.38))' }}
      />
    </GlassCard>
  );
}

function GardenPreviewCard({ onOpenGarden }: { onOpenGarden: () => void }) {
  return (
    <GlassCard id="herb-garden" onClick={onOpenGarden} className="p-[22px]">
      <div className="mb-3 flex items-center justify-between gap-4 px-2">
        <div className="font-serif text-[32px] text-[#fff1d7]">Lagos Herb Garden</div>
        <div
          className="grid h-10 w-10 place-items-center rounded-full border border-[#f4dec0]/10 bg-[#fff7e8]/[0.035] text-[#fff1d7]/58 shadow-none backdrop-blur-md transition group-hover:border-[#f4dec0]/18 group-hover:bg-[#fff7e8]/[0.06] group-hover:text-[#fff1d7]/72"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(255,238,205,0.055)' }}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path d="M14 5h5v5M19 5l-6.4 6.4M10 19H5v-5M5 19l6.4-6.4" fill="none" stroke="currentColor" strokeWidth="1.18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <motion.div
        className="relative h-[350px] overflow-hidden rounded-[20px]"
        whileHover={{ scale: 1.006 }}
        transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <motion.div
          className="absolute -inset-x-20 inset-y-0"
          animate={{ backgroundPosition: ['42% 58%', '58% 58%', '42% 58%'] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            backgroundImage: `url(${GARDEN_PANORAMA})`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: '176% auto',
            filter: 'saturate(1.05) contrast(1.02) brightness(0.86)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(20,15,9,0.02), rgba(20,15,9,0.22)), radial-gradient(circle at 50% 45%, transparent 0%, rgba(0,0,0,0.16) 76%)',
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[36%]"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(12,9,5,0.05) 18%, rgba(12,9,5,0.22) 58%, rgba(12,9,5,0.52) 100%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-5 pt-16 text-center text-[18px] text-[#fff4df]/90">
          Tap to explore your garden
        </div>
      </motion.div>
    </GlassCard>
  );
}

const kofiShareItems = [
  { name: 'Granny', image: KOFI_AMARA_PROFILE, canView: true },
  { name: 'Mum', image: KOFI_PRIYA_PROFILE, canView: true },
  { name: 'Lena', image: KOFI_LENA_PROFILE, canView: true },
  { name: 'Dad', image: KOFI_DAVID_PROFILE, canView: false },
];

const kofiFeedbackItems = [
  { name: 'Granny', time: '2m ago', image: KOFI_AMARA_PROFILE, type: 'audio' as const },
  {
    name: 'Mum',
    time: '15m ago',
    image: KOFI_PRIYA_PROFILE,
    type: 'text' as const,
    message: 'This one feels different from your last piece - in a good way.',
  },
  {
    name: 'Lena',
    time: '1h ago',
    image: KOFI_LENA_PROFILE,
    type: 'text' as const,
    message: 'It sounds like space magic.',
  },
];

function PersonAvatar({ src, name, className = 'h-[56px] w-[56px]' }: { src: string; name: string; className?: string }) {
  return (
    <img
      src={src}
      alt={name}
      className={`${className} shrink-0 rounded-full object-cover shadow-[0_8px_18px_rgba(0,0,0,0.28)]`}
    />
  );
}

function TogglePill({ enabled }: { enabled: boolean }) {
  return (
    <div
      className={`relative h-[32px] w-[56px] shrink-0 rounded-full backdrop-blur-md transition ${
        enabled
          ? 'bg-[#9B7DD4]/[0.72]'
          : 'bg-[#fff7e8]/[0.105]'
      }`}
      aria-hidden="true"
      style={{
        boxShadow: enabled
          ? 'inset 0 0 0 1px rgba(196,174,237,0.16), inset 0 1px 10px rgba(255,255,255,0.12), 0 0 16px rgba(155,125,212,0.13)'
          : 'inset 0 0 0 1px rgba(255,238,205,0.075), inset 0 1px 12px rgba(255,255,255,0.07), 0 0 10px rgba(255,238,205,0.035)',
      }}
    >
      <div
        className={`absolute top-1/2 h-[22px] w-[22px] -translate-y-1/2 rounded-full transition ${
          enabled ? 'right-[5px] bg-[#fff8ea]' : 'left-[5px] bg-[#fff8ea]'
        }`}
        style={{
          boxShadow: enabled
            ? '0 3px 12px rgba(0,0,0,0.22)'
            : '0 3px 10px rgba(0,0,0,0.16)',
        }}
      />
    </div>
  );
}

function SharedWithCard() {
  const [shareItems, setShareItems] = useState(kofiShareItems);

  const toggleShare = (name: string) => {
    setShareItems((items) =>
      items.map((item) => item.name === name ? { ...item, canView: !item.canView } : item),
    );
  };

  return (
    <GlassCard id="kofi-sharing" className="w-full p-[28px]">
      <div className="font-serif text-[30px] leading-none text-[#fff1d7]">Shared With</div>
      <div className="mt-[20px] h-px w-full bg-[#f4dec0]/14" />
      <div className="grid">
        {shareItems.map((person, index) => (
          <button
            key={person.name}
            className={`group flex w-full appearance-none items-center gap-[15px] bg-transparent py-[14px] text-left transition ${
              index === shareItems.length - 1 ? '' : 'border-b border-[#f4dec0]/10'
            }`}
            type="button"
            aria-pressed={person.canView}
            onClick={() => toggleShare(person.name)}
          >
            <PersonAvatar src={person.image} name={person.name} />
            <div className={`min-w-0 flex-1 transition group-hover:text-[#fff8ea] ${person.canView ? 'text-[#fff4df]' : 'text-[#fff4df]/70'}`}>
              <div className="font-serif text-[22px] leading-tight">{person.name}</div>
              <div className={`mt-[2px] text-[16px] leading-tight ${person.canView ? 'text-[#fff4df]/72' : 'text-[#fff4df]/62'}`}>
                {person.canView ? 'Can view' : 'Hidden'}
              </div>
            </div>
            <TogglePill enabled={person.canView} />
          </button>
        ))}
      </div>
    </GlassCard>
  );
}

function KofiCompositionCard() {
  return (
    <GlassCard id="lucid-mirage-status" className="min-h-[330px] overflow-hidden p-[38px]">
      <div className="relative z-10 max-w-[57%]">
        <div className="font-serif text-[36px] leading-[1.08] text-[#fff1d7]">
          Your latest composition finished generating overnight.
        </div>
        <div className="mt-[24px] max-w-[24ch] text-[18px] leading-relaxed text-[#fff4df]/86">
          Additional harmonic layers were added based on your previous session.
        </div>
      </div>
      <img
        src={KOFI_LUCID_MIRAGE_COVER}
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-[-20%] right-[-15%] h-[120%] w-auto max-w-none select-none"
        style={{ filter: 'brightness(0.88) contrast(1.08) saturate(0.98) drop-shadow(0 26px 30px rgba(0,0,0,0.4))' }}
      />
    </GlassCard>
  );
}

function FeedbackWaveform() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const playFeedback = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(AMARA_FEEDBACK_AUDIO);
      audioRef.current.addEventListener('ended', () => setPlaying(false));
    }

    audioRef.current.currentTime = 0;
    setPlaying(true);
    void audioRef.current.play().catch(() => setPlaying(false));
  };

  return (
    <button
      className={`mt-[9px] flex h-[36px] w-full items-center gap-[10px] rounded-full bg-[#3f3428]/32 px-[13px] text-[#fff4df]/84 backdrop-blur-md transition hover:bg-[#3f3428]/38 ${playing ? 'bg-[#3f3428]/42' : ''}`}
      style={{ boxShadow: 'inset 0 0 0 1px rgba(255,238,205,0.035), inset 0 1px 12px rgba(0,0,0,0.08)' }}
      type="button"
      aria-label="Play Amara voice message"
      onClick={playFeedback}
    >
      <svg viewBox="0 0 18 18" className="h-[16px] w-[16px] shrink-0 fill-current text-[#fff1d7]/88" aria-hidden="true">
        <path d="M5.8 3.6 14 9l-8.2 5.4V3.6Z" />
      </svg>
      <div className="flex h-[25px] flex-1 items-center justify-center gap-[3px]" aria-hidden="true">
        {[7, 13, 19, 25, 17, 22, 12, 18, 24, 15, 21, 11, 17, 23, 14, 20, 10, 16, 22, 12, 8].map((height, index) => (
          <span key={`${height}-${index}`} className="w-[2px] rounded-full bg-[#fff1d7]/90" style={{ height }} />
        ))}
      </div>
      <div className="shrink-0 text-[15px] leading-none text-[#fff4df]/78">0:18</div>
    </button>
  );
}

function FamilyFeedbackCard() {
  return (
    <GlassCard id="kofi-feedback" className="min-h-[330px] p-[28px]">
      <div className="font-serif text-[30px] leading-none text-[#fff1d7]">Family Feedback</div>
      <div className="mt-[18px] grid">
        {kofiFeedbackItems.map((item, index) => (
          <div
            key={item.name}
            className={`grid grid-cols-[56px_minmax(0,1fr)] gap-[15px] py-[14px] first:pt-0 ${
              index === kofiFeedbackItems.length - 1 ? 'pb-0' : 'border-b border-[#f4dec0]/10'
            }`}
          >
            <PersonAvatar src={item.image} name={item.name} />
            <div className="min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="font-serif text-[22px] leading-none text-[#fff4df]">{item.name}</div>
                <div className="shrink-0 pt-[2px] text-[13px] leading-none text-[#fff4df]/52">{item.time}</div>
              </div>
              {item.type === 'audio' ? (
                <FeedbackWaveform />
              ) : (
                <div className="mt-[6px] text-[16px] leading-snug text-[#fff4df]/82">{item.message}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function KofiSpatialMixPreviewCard({ onOpenSpatialMix }: { onOpenSpatialMix: () => void }) {
  return (
    <GlassCard id="lucid-mirage" onClick={onOpenSpatialMix} className="p-[22px]">
      <div className="mb-3 flex items-center justify-between gap-4 px-2">
        <div className="font-serif text-[32px] text-[#fff1d7]">Lucid Mirage</div>
        <div
          className="grid h-10 w-10 place-items-center rounded-full border border-[#f4dec0]/10 bg-[#fff7e8]/[0.035] text-[#fff1d7]/58 shadow-none backdrop-blur-md transition group-hover:border-[#f4dec0]/18 group-hover:bg-[#fff7e8]/[0.06] group-hover:text-[#fff1d7]/72"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(255,238,205,0.055)' }}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path d="M14 5h5v5M19 5l-6.4 6.4M10 19H5v-5M5 19l6.4-6.4" fill="none" stroke="currentColor" strokeWidth="1.18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <motion.div
        className="relative h-[350px] overflow-hidden rounded-[20px]"
        whileHover={{ scale: 1.006 }}
        transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <motion.div
          className="absolute -inset-x-20 inset-y-0"
          animate={{ backgroundPosition: ['36% 50%', '64% 50%', '36% 50%'] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            backgroundImage: `url(${KOFI_SPATIAL_MIX_ENVIRONMENT})`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: '142% auto',
            filter: 'saturate(1.02) contrast(1.03) brightness(0.84)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(20,15,9,0.02), rgba(20,15,9,0.22)), radial-gradient(circle at 50% 45%, transparent 0%, rgba(0,0,0,0.14) 76%)',
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[36%]"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(12,9,5,0.05) 18%, rgba(12,9,5,0.22) 58%, rgba(12,9,5,0.52) 100%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-5 pt-16 text-center text-[18px] text-[#fff4df]/90">
          Tap to Enter
        </div>
      </motion.div>
    </GlassCard>
  );
}

// Cards for Amara: V3 stone worktop layout
function AmaraCards({ speech, onOpenGarden }: { speech: string | null; onOpenGarden: () => void }) {
  return (
    <div className="grid w-[1220px] grid-cols-[350px_minmax(0,1fr)] gap-[28px]">
      <section className="flex flex-col justify-center gap-[24px] pt-[12px]">
        <div className="px-[20px] text-[#fff0d5] drop-shadow-[0_8px_28px_rgba(0,0,0,0.32)]">
          <div className="whitespace-nowrap font-serif text-[40px] leading-none">Good morning,</div>
          <div className="mt-3 whitespace-nowrap font-serif text-[88px] leading-[0.84] tracking-normal">Amara</div>
        </div>
        <AgendaCard />
      </section>

      <section className="grid grid-cols-[minmax(0,1fr)_270px] gap-[24px]">
        <BasilStatusCard speech={speech} />
        <WeatherCard />
        <div className="col-span-2">
          <GardenPreviewCard onOpenGarden={onOpenGarden} />
        </div>
      </section>
    </div>
  );
}

// Cards for Kofi: mirrors Amara's V3 stone worktop layout with studio copy
function KofiCards({ onOpenSpatialMix }: { onOpenSpatialMix: () => void }) {
  return (
    <div className="grid w-[1220px] grid-cols-[350px_minmax(0,1fr)] gap-[28px]">
      <section className="flex flex-col justify-center gap-[24px] pt-[12px]">
        <div className="px-[20px] text-[#fff0d5] drop-shadow-[0_8px_28px_rgba(0,0,0,0.32)]">
          <div className="whitespace-nowrap font-serif text-[40px] leading-none">Welcome back,</div>
          <div className="mt-3 whitespace-nowrap font-serif text-[88px] leading-[0.84] tracking-normal">Kofi</div>
        </div>
        <SharedWithCard />
      </section>

      <section className="grid grid-cols-[minmax(0,1fr)_335px] gap-[24px]">
        <KofiCompositionCard />
        <FamilyFeedbackCard />
        <div className="col-span-2">
          <KofiSpatialMixPreviewCard onOpenSpatialMix={onOpenSpatialMix} />
        </div>
      </section>
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
  const stageScale = useStageScale();

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

  // Time-of-day overlay tint on top of the stone worktop
  const timeTint: Record<TimeOfDay, string> = {
    morning: 'rgba(255, 225, 176, 0.05)',
    midday:  'rgba(255, 246, 224, 0.02)',
    evening: 'rgba(236, 151, 80, 0.10)',
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 overflow-hidden"
        style={{
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
          transform: `translate(-50%, -50%) scale(${stageScale})`,
          transformOrigin: 'center',
        }}
      >
        {/* Stone surface — always present */}
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
              backgroundSize: '100% 100%',
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

        {/* Dark veil — deepens when UI is awake so cards read on stone */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: awake ? 0.18 : 0 }}
          transition={{ duration: 1.0, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(circle at 52% 48%, rgba(0,0,0,0.00), rgba(0,0,0,0.13) 68%, rgba(0,0,0,0.36) 100%)' }}
        />

        {/* Sleeping pulse — surface glow hint when idle */}
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

        {/* Main UI — only visible when awake */}
        <LayoutGroup>
          <AnimatePresence>
            {awake && (
              <motion.div
                key="ui-layer"
                className="absolute inset-0 flex items-center justify-start overflow-hidden py-[48px] pl-[208px] pr-[88px]"
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
                      : <KofiCards onOpenSpatialMix={() => emit({ type: 'portal', open: true })} />
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
                A - AMARA &nbsp;·&nbsp; K - KOFI
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status bar — only when awake */}
        <AnimatePresence>
          {awake && (
            <motion.div
              key="status"
              className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="select-none font-mono text-[9px] tracking-[0.3em] text-white/30">
                Left / Right voice steps · SPACE next · O objects · H hand · R sleep
              </div>
              <div className="select-none font-mono text-[9px] tracking-[0.3em]" style={{ color: 'var(--obi-glow)' }}>
                OBI · {activeUser.name.toUpperCase()} · {Math.max(manualStepIndex + 1, 0)}/{manualDemoSteps[activeUser.id].length}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PresenceGlow />

      <GestureLayer />
    </div>
  );
}

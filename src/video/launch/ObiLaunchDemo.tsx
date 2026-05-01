import type { CSSProperties, ReactNode } from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const assets = {
  surfaceClosed: staticFile('images/v3/stone-worktop-notebook-closed.png'),
  surfaceOpen: staticFile('images/v3/stone-worktop-notebook-open.png'),
  garden360: staticFile('images/herb-garden-360-4k.png'),
  basil: staticFile('images/v3/basil-v2-crop.png'),
  lucidCover: staticFile('images/kofi/lucid-mirage-cover.png'),
  spatial360: staticFile('images/kofi/spatial-mix-environment.png'),
  kofiTrack: staticFile('audio/kofi/lucid-mirage.mp3'),
  amaraGreeting: staticFile('audio/voices/obi/amara-01-greeting.wav'),
  amaraGarden: staticFile('audio/voices/obi/amara-02-garden.wav'),
  amaraSprinklers: staticFile('audio/voices/obi/amara-03-sprinklers.wav'),
  kofiGreeting: staticFile('audio/voices/obi/kofi-01-greeting.wav'),
  kofiStudio: staticFile('audio/voices/obi/kofi-02-studio.wav'),
  avaSample: staticFile('audio/voices/obi/ava-neural.webm'),
};

const warm = {
  glow: '#f5d4a1',
  primary: '#e8b87a',
  text: '#fff1d7',
  panel: 'rgba(33, 27, 20, 0.28)',
  line: 'rgba(244, 222, 192, 0.17)',
};

const kofi = {
  glow: '#c4aeed',
  primary: '#9b7dd4',
  text: '#f4edff',
  panel: 'rgba(28, 20, 42, 0.34)',
  line: 'rgba(209, 190, 246, 0.2)',
};

const fps = 30;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function fade(frame: number, start: number, end: number) {
  return interpolate(frame, [start * fps, end * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
}

function between(frame: number, start: number, end: number, fadeSeconds = 0.8) {
  return Math.min(fade(frame, start, start + fadeSeconds), 1 - fade(frame, end - fadeSeconds, end));
}

function seconds(value: number) {
  return Math.round(value * fps);
}

function panelStyle(color: typeof warm): CSSProperties {
  return {
    border: `1px solid ${color.line}`,
    background: color.panel,
    boxShadow: 'inset 0 0 0 1px rgba(255, 244, 224, 0.035), 0 24px 80px rgba(0, 0, 0, 0.25)',
    backdropFilter: 'blur(18px)',
  };
}

function Shell({ children, surface = 'closed' }: { children: ReactNode; surface?: 'closed' | 'open' }) {
  const frame = useCurrentFrame();
  const objectMix = surface === 'open' ? 1 : 0;

  return (
    <AbsoluteFill style={{ background: '#050402', overflow: 'hidden' }}>
      <Img
        src={assets.surfaceClosed}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${interpolate(frame, [0, 1350], [1.035, 1.07])})`,
          filter: 'brightness(0.8) saturate(0.95)',
        }}
      />
      <Img
        src={assets.surfaceOpen}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: objectMix,
          transform: `scale(${interpolate(frame, [0, 1350], [1.02, 1.055])})`,
          filter: 'brightness(0.78) saturate(0.95)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 52% 44%, rgba(255, 232, 190, 0.05), transparent 38%), radial-gradient(circle at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.38) 82%)',
        }}
      />
      {children}
    </AbsoluteFill>
  );
}

function ProximityWake() {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame / 14) * 0.5 + 0.5;
  const handY = interpolate(frame, [0, seconds(3.2)], [170, -10], { extrapolateRight: 'clamp', easing: ease });
  const ring = interpolate(frame, [seconds(2.4), seconds(4.5)], [0.18, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 610,
          top: 310,
          width: 700,
          height: 420,
          borderRadius: '50%',
          background: `radial-gradient(ellipse at center, rgba(245, 212, 161, ${0.16 + pulse * 0.05}), transparent 64%)`,
          transform: `scale(${ring})`,
          opacity: between(frame, 0, 8.4),
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 830,
          top: 660 + handY,
          width: 260,
          height: 118,
          borderRadius: 999,
          background: 'rgba(255, 231, 197, 0.13)',
          filter: 'blur(18px)',
          transform: 'rotate(-12deg)',
          opacity: between(frame, 0.5, 6.2),
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 760,
          top: 794,
          width: 400,
          textAlign: 'center',
          color: 'rgba(255, 244, 224, 0.62)',
          fontFamily: 'SFMono-Regular, ui-monospace, Menlo, monospace',
          fontSize: 14,
          letterSpacing: 5,
          opacity: between(frame, 1.2, 5.5),
        }}
      >
        PRESENCE DETECTED
      </div>
    </AbsoluteFill>
  );
}

function VoiceCaption({ start, end, text, tone = 'warm' }: { start: number; end: number; text: string; tone?: 'warm' | 'kofi' }) {
  const frame = useCurrentFrame();
  const color = tone === 'warm' ? warm : kofi;
  const opacity = between(frame, start, end, 0.45);
  const y = interpolate(frame, [seconds(start), seconds(start + 0.8)], [22, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 448,
        right: 448,
        bottom: 72,
        padding: '22px 34px',
        borderRadius: 28,
        ...panelStyle(color),
        color: color.text,
        fontSize: 27,
        lineHeight: 1.25,
        textAlign: 'center',
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div style={{ marginBottom: 9, color: color.glow, fontFamily: 'SFMono-Regular, ui-monospace, Menlo, monospace', fontSize: 12, letterSpacing: 4 }}>
        OBI VOICE
      </div>
      {text}
    </div>
  );
}

function Agenda({ tone = 'warm' }: { tone?: 'warm' | 'kofi' }) {
  const color = tone === 'warm' ? warm : kofi;
  const items =
    tone === 'warm'
      ? [
          ['09:00', 'Tea and medication'],
          ['10:30', 'Garden harvest'],
          ['14:00', 'Cool house before heat peak'],
        ]
      : [
          ['09:30', 'Reference listening'],
          ['12:00', 'Spatial layering'],
          ['20:00', 'Generative render'],
        ];

  return (
    <div style={{ ...panelStyle(color), borderRadius: 28, padding: 30, width: 360 }}>
      <div style={{ color: color.text, fontFamily: 'Georgia, serif', fontSize: 34, lineHeight: 1 }}>Today</div>
      <div style={{ display: 'grid', gap: tone === 'warm' ? 22 : 16, marginTop: 26 }}>
        {items.map(([time, label]) => (
          <div key={label} style={{ display: 'grid', gridTemplateColumns: '68px 1fr', gap: 16, color: 'rgba(255, 244, 224, 0.82)', fontSize: 19 }}>
            <div style={{ fontFamily: 'SFMono-Regular, ui-monospace, Menlo, monospace', color: color.glow, fontSize: 14 }}>{time}</div>
            <div>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AmaraInterface() {
  const frame = useCurrentFrame();
  const opacity = between(frame, 4.1, 29, 0.9);
  const y = interpolate(frame, [seconds(4), seconds(5.5)], [42, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  return (
    <div style={{ position: 'absolute', inset: 0, opacity, transform: `translateY(${y}px)` }}>
      <div style={{ position: 'absolute', left: 260, top: 220, color: warm.text, textShadow: '0 12px 38px rgba(0,0,0,0.42)' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 50 }}>Good morning,</div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 112, lineHeight: 0.9 }}>Amara</div>
      </div>
      <div style={{ position: 'absolute', left: 260, top: 460 }}>
        <Agenda />
      </div>
      <div style={{ position: 'absolute', left: 680, top: 225, width: 620, height: 300, borderRadius: 28, overflow: 'hidden', ...panelStyle(warm) }}>
        <div style={{ position: 'relative', zIndex: 2, padding: 42, width: 360, color: warm.text }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 42, lineHeight: 1.05 }}>Your basil was watered as Lagos warmed.</div>
          <div style={{ marginTop: 24, fontSize: 21, color: 'rgba(255,244,224,0.78)' }}>Soil moisture is back in range.</div>
        </div>
        <Img src={assets.basil} style={{ position: 'absolute', right: -170, bottom: -120, height: 500, filter: 'brightness(0.82) contrast(1.06)' }} />
      </div>
      <div style={{ position: 'absolute', left: 1330, top: 225, width: 300, height: 300, borderRadius: 28, padding: 34, ...panelStyle(warm), color: warm.text }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 29 }}>Lagos, NG</div>
        <div style={{ marginTop: 25, fontFamily: 'Georgia, serif', fontSize: 86, lineHeight: 0.8 }}>26°</div>
        <div style={{ marginTop: 24, fontSize: 20, color: 'rgba(255,244,224,0.8)' }}>Partly cloudy</div>
      </div>
      <MiniPanorama image={assets.garden360} label="Lagos Herb Garden" left={680} top={560} width={950} tone="warm" />
    </div>
  );
}

function MiniPanorama({
  image,
  label,
  left,
  top,
  width,
  tone,
}: {
  image: string;
  label: string;
  left: number;
  top: number;
  width: number;
  tone: 'warm' | 'kofi';
}) {
  const frame = useCurrentFrame();
  const color = tone === 'warm' ? warm : kofi;
  const pos = interpolate(frame, [0, 1350], [40, 70]);

  return (
    <div style={{ position: 'absolute', left, top, width, height: 265, borderRadius: 28, padding: 22, ...panelStyle(color), overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 3, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: color.text }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 35 }}>{label}</div>
        <div style={{ width: 44, height: 44, borderRadius: 999, border: `1px solid ${color.line}`, display: 'grid', placeItems: 'center', color: color.glow, fontSize: 22 }}>↗</div>
      </div>
      <div style={{ position: 'absolute', left: 22, right: 22, bottom: 22, top: 78, borderRadius: 22, overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            inset: '-8px -120px',
            backgroundImage: `url(${image})`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: tone === 'warm' ? '150% auto' : '132% auto',
            backgroundPosition: `${pos}% 54%`,
            filter: 'brightness(0.82) saturate(1.05)',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.38))' }} />
      </div>
    </div>
  );
}

function Portal360({ start, end, image, title, subtitle, tone }: { start: number; end: number; image: string; title: string; subtitle: string; tone: 'warm' | 'kofi' }) {
  const frame = useCurrentFrame();
  const color = tone === 'warm' ? warm : kofi;
  const opacity = between(frame, start, end, 0.8);
  const local = frame - seconds(start);
  const pan = interpolate(local, [0, seconds(end - start)], [28, 78], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.5, 0, 0.5, 1) });
  const scale = interpolate(local, [0, seconds(1.4)], [0.96, 1], { extrapolateRight: 'clamp', easing: ease });
  const bars = Array.from({ length: 16 }, (_, i) => i);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.38)' }} />
      <div
        style={{
          position: 'absolute',
          left: 240,
          top: 150,
          width: 1440,
          height: 780,
          borderRadius: 36,
          overflow: 'hidden',
          transform: `scale(${scale})`,
          ...panelStyle(color),
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '-20px -240px',
            backgroundImage: `url(${image})`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: tone === 'warm' ? '188% auto' : '145% auto',
            backgroundPosition: `${pan}% ${tone === 'warm' ? 58 : 52}%`,
            filter: 'brightness(0.88) saturate(1.08) contrast(1.02)',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.05), transparent 42%, rgba(0,0,0,0.58) 100%)' }} />
        <div style={{ position: 'absolute', left: 54, top: 46, color: color.text }}>
          <div style={{ fontFamily: 'SFMono-Regular, ui-monospace, Menlo, monospace', fontSize: 13, letterSpacing: 5, color: color.glow }}>
            360 LIVE VISUAL
          </div>
          <div style={{ marginTop: 14, fontFamily: 'Georgia, serif', fontSize: 54 }}>{title}</div>
          <div style={{ marginTop: 10, fontSize: 22, color: 'rgba(255,244,224,0.74)' }}>{subtitle}</div>
        </div>
        <div style={{ position: 'absolute', left: 54, right: 54, bottom: 44, display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
          <div style={{ fontFamily: 'SFMono-Regular, ui-monospace, Menlo, monospace', fontSize: 14, letterSpacing: 4, color: 'rgba(255,244,224,0.65)' }}>
            PAN {Math.round(pan)} · DEPTH MAPPED SURFACE
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'end', height: 64 }}>
            {bars.map((bar) => {
              const h = 18 + Math.abs(Math.sin((local + bar * 10) / 12)) * 44;
              return <div key={bar} style={{ width: 8, height: h, borderRadius: 999, background: color.glow, opacity: 0.36 + clamp01(h / 80) * 0.42 }} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SurfaceChange() {
  const frame = useCurrentFrame();
  const opacity = between(frame, 24.5, 31.5, 0.7);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity }}>
      <div style={{ position: 'absolute', left: 144, top: 110, color: warm.text }}>
        <div style={{ fontFamily: 'SFMono-Regular, ui-monospace, Menlo, monospace', color: warm.glow, fontSize: 13, letterSpacing: 5 }}>SURFACE CONTEXT</div>
        <div style={{ marginTop: 14, fontFamily: 'Georgia, serif', fontSize: 58 }}>The interface makes room for real objects.</div>
      </div>
      <div style={{ position: 'absolute', right: 158, bottom: 120, width: 420, borderRadius: 28, padding: 30, ...panelStyle(warm), color: warm.text }}>
        <div style={{ fontSize: 24, lineHeight: 1.25 }}>Notebook detected. Projection path reduced around the work area.</div>
      </div>
    </div>
  );
}

function KofiInterface() {
  const frame = useCurrentFrame();
  const opacity = between(frame, 31, 44.5, 0.75);
  const y = interpolate(frame, [seconds(31), seconds(32.2)], [38, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  return (
    <div style={{ position: 'absolute', inset: 0, opacity, transform: `translateY(${y}px)` }}>
      <div style={{ position: 'absolute', left: 260, top: 220, color: kofi.text, textShadow: '0 12px 38px rgba(0,0,0,0.42)' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 50 }}>Welcome back,</div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 112, lineHeight: 0.9 }}>Kofi</div>
      </div>
      <div style={{ position: 'absolute', left: 260, top: 460 }}>
        <Agenda tone="kofi" />
      </div>
      <div style={{ position: 'absolute', left: 680, top: 225, width: 620, height: 300, borderRadius: 28, overflow: 'hidden', ...panelStyle(kofi) }}>
        <div style={{ position: 'relative', zIndex: 2, padding: 42, width: 360, color: kofi.text }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 42, lineHeight: 1.05 }}>Your latest composition finished generating overnight.</div>
          <div style={{ marginTop: 24, fontSize: 21, color: 'rgba(244,237,255,0.76)' }}>Harmonic layers matched to the last session.</div>
        </div>
        <Img src={assets.lucidCover} style={{ position: 'absolute', right: -10, bottom: -90, height: 430, filter: 'brightness(0.9) contrast(1.08)' }} />
      </div>
      <div style={{ position: 'absolute', left: 1330, top: 225, width: 300, height: 300, borderRadius: 28, padding: 34, ...panelStyle(kofi), color: kofi.text }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 29 }}>Version 07</div>
        <div style={{ marginTop: 25, fontFamily: 'Georgia, serif', fontSize: 86, lineHeight: 0.8 }}>82%</div>
        <div style={{ marginTop: 24, fontSize: 20, color: 'rgba(244,237,255,0.78)' }}>Complete</div>
      </div>
      <MiniPanorama image={assets.spatial360} label="Lucid Mirage" left={680} top={560} width={950} tone="kofi" />
    </div>
  );
}

function EndFrame() {
  const frame = useCurrentFrame();
  const opacity = fade(frame, 42.8, 44.2);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity, display: 'grid', placeItems: 'center', background: 'rgba(5,4,2,0.42)' }}>
      <div style={{ color: '#fff1d7', textAlign: 'center', textShadow: '0 14px 50px rgba(0,0,0,0.45)' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 118, lineHeight: 0.9 }}>Obi</div>
        <div style={{ marginTop: 24, fontFamily: 'SFMono-Regular, ui-monospace, Menlo, monospace', fontSize: 15, letterSpacing: 6, color: 'rgba(255, 232, 190, 0.72)' }}>
          SMART HOME 2065 · RESPONSIVE HOUSEHOLD INTERFACE
        </div>
      </div>
    </div>
  );
}

function AudioBed() {
  const { fps: videoFps } = useVideoConfig();

  return (
    <>
      <Sequence from={seconds(4.8)}>
        <Audio src={assets.amaraGreeting} volume={0.92} />
      </Sequence>
      <Sequence from={seconds(12.2)}>
        <Audio src={assets.amaraGarden} volume={0.9} />
      </Sequence>
      <Sequence from={seconds(19.7)}>
        <Audio src={assets.amaraSprinklers} volume={0.86} />
      </Sequence>
      <Sequence from={seconds(27.6)}>
        <Audio
          src={assets.kofiTrack}
          volume={(f) =>
            interpolate(f, [0, 2 * videoFps, 16 * videoFps, 18 * videoFps], [0, 0.13, 0.13, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          }
        />
      </Sequence>
      <Sequence from={seconds(32.2)}>
        <Audio src={assets.kofiGreeting} volume={0.92} />
      </Sequence>
      <Sequence from={seconds(38.1)}>
        <Audio src={assets.kofiStudio} volume={0.9} />
      </Sequence>
      <Sequence from={seconds(42.2)}>
        <Audio src={assets.avaSample} volume={0.65} />
      </Sequence>
    </>
  );
}

export function ObiLaunchDemo() {
  const frame = useCurrentFrame();
  const surface = frame >= seconds(24.5) ? 'open' : 'closed';
  const amaraDim = frame > seconds(15.2) && frame < seconds(24.6) ? 0.18 : 1;
  const kofiPortalOpacity = between(frame, 38.7, 43.2, 0.8);

  return (
    <Shell surface={surface}>
      <AudioBed />
      <ProximityWake />
      <div style={{ opacity: amaraDim }}>
        <AmaraInterface />
      </div>
      <Portal360
        start={15.2}
        end={24.4}
        image={assets.garden360}
        title="Amara's Herb Garden"
        subtitle="A countertop window into the home ecosystem."
        tone="warm"
      />
      <SurfaceChange />
      <KofiInterface />
      <div style={{ opacity: kofiPortalOpacity }}>
        <Portal360
          start={38.7}
          end={43.2}
          image={assets.spatial360}
          title="Lucid Mirage"
          subtitle="Voice, audio and 360 visuals shift for a creative session."
          tone="kofi"
        />
      </div>
      <VoiceCaption
        start={4.8}
        end={10.8}
        text="Good morning, Amara. Lagos is carrying some heat today, but your herbs are holding up nicely out there."
      />
      <VoiceCaption
        start={12.2}
        end={18.9}
        text="The basil's full and ready for picking. Rosemary's doing beautifully, and the mint is coming along well."
      />
      <VoiceCaption start={19.7} end={24.7} text="I've nudged the sprinklers up a little, before the afternoon gets too fierce." />
      <VoiceCaption start={32.2} end={37.8} text="Yo Kofi. That spatial render's still going, about twelve minutes left." tone="kofi" />
      <VoiceCaption start={38.1} end={42.3} text="Studio mode's on. No one's getting through." tone="kofi" />
      <EndFrame />
    </Shell>
  );
}

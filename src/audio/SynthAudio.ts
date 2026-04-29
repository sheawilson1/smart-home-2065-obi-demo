// Short synthesized UI sounds. Kept under a second so the surface feels tactile,
// not like it is playing notification ringtones.

class SynthAudio {
  private ctx: AudioContext | null = null;
  private gardenAmbience:
    | {
        wind: AudioBufferSourceNode;
        windGain: GainNode;
        leafTimer: number;
        birdTimer: number;
      }
    | null = null;

  private getCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  private tone(freq: number, start: number, dur: number, vol: number, type: OscillatorType = 'sine') {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 4200;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(vol, start + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(lp);
    lp.connect(env);
    env.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.03);
  }

  private shimmer(start: number, dur: number, vol: number, highpass = 1800) {
    const ctx = this.getCtx();
    const length = Math.max(1, Math.ceil(ctx.sampleRate * dur));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const fadeOut = 1 - i / data.length;
      data[i] = (Math.random() * 2 - 1) * fadeOut * fadeOut;
    }

    const src = ctx.createBufferSource();
    const hp = ctx.createBiquadFilter();
    const env = ctx.createGain();
    hp.type = 'highpass';
    hp.frequency.value = highpass;
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(vol, start + 0.015);
    env.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.buffer = buffer;
    src.connect(hp);
    hp.connect(env);
    env.connect(ctx.destination);
    src.start(start);
  }

  private noiseBuffer(duration = 2) {
    const ctx = this.getCtx();
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  chimeWarm(vol = 0.24) {
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    this.tone(392, t, 0.72, vol, 'sine');
    this.tone(784, t + 0.035, 0.42, vol * 0.28, 'sine');
    this.shimmer(t + 0.02, 0.32, 0.018, 2600);
  }

  chimeBright(vol = 0.2) {
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    this.tone(660, t, 0.36, vol, 'triangle');
    this.tone(1320, t + 0.065, 0.28, vol * 0.42, 'sine');
    this.shimmer(t, 0.22, 0.025, 3200);
  }

  wake(vol = 0.22) {
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    this.tone(196, t, 0.9, vol * 0.65, 'sine');
    this.tone(392, t + 0.05, 0.82, vol, 'sine');
    this.tone(587.33, t + 0.12, 0.62, vol * 0.35, 'sine');
    this.shimmer(t + 0.08, 0.5, 0.025, 1800);
  }

  hover(vol = 0.035) {
    const t = this.getCtx().currentTime;
    this.tone(1760, t, 0.07, vol, 'sine');
  }

  press(vol = 0.075) {
    const t = this.getCtx().currentTime;
    this.tone(880, t, 0.055, vol, 'triangle');
    this.tone(1320, t + 0.035, 0.08, vol * 0.6, 'sine');
  }

  select(vol = 0.12) {
    const t = this.getCtx().currentTime;
    this.tone(523.25, t, 0.12, vol * 0.8, 'sine');
    this.tone(783.99, t + 0.075, 0.18, vol, 'sine');
    this.shimmer(t + 0.015, 0.14, 0.018, 2800);
  }

  inhale(vol = 0.055) {
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    const dur = 0.32;
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(i / data.length, 0.7);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1800;
    bp.Q.value = 0.4;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(vol, t + dur * 0.6);
    env.gain.linearRampToValueAtTime(0, t + dur);
    src.connect(bp); bp.connect(env); env.connect(ctx.destination);
    src.start(t);
  }

  tick(vol = 0.04) {
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    this.tone(2400, t, 0.035, vol, 'sine');
  }

  notify(vol = 0.12, bright = false) {
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    const freqs = bright ? [740, 988] : [392, 523.25];
    freqs.forEach((freq, i) => {
      this.tone(freq, t + i * 0.12, 0.34, vol * (i ? 0.72 : 1), 'sine');
    });
  }

  portalOpen(vol = 0.16) {
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    this.shimmer(t, 0.62, 0.045, 900);
    this.tone(261.63, t + 0.04, 0.72, vol * 0.8, 'sine');
    this.tone(659.25, t + 0.11, 0.52, vol, 'sine');
  }

  portalClose(vol = 0.1) {
    const t = this.getCtx().currentTime;
    this.tone(659.25, t, 0.22, vol, 'sine');
    this.tone(329.63, t + 0.06, 0.28, vol * 0.72, 'sine');
    this.shimmer(t, 0.2, 0.018, 2400);
  }

  gesture(vol = 0.09) {
    const t = this.getCtx().currentTime;
    this.tone(1174.66, t, 0.09, vol, 'sine');
    this.tone(1567.98, t + 0.045, 0.11, vol * 0.55, 'sine');
  }

  startGardenAmbience() {
    if (this.gardenAmbience) return;
    const ctx = this.getCtx();
    const t = ctx.currentTime;

    const wind = ctx.createBufferSource();
    const windGain = ctx.createGain();
    const lowpass = ctx.createBiquadFilter();
    const highpass = ctx.createBiquadFilter();
    wind.buffer = this.noiseBuffer(3.5);
    wind.loop = true;
    highpass.type = 'highpass';
    highpass.frequency.value = 160;
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 780;
    windGain.gain.setValueAtTime(0.0001, t);
    windGain.gain.exponentialRampToValueAtTime(0.032, t + 1.2);
    wind.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(windGain);
    windGain.connect(ctx.destination);
    wind.start(t);

    const playLeaves = () => {
      if (!this.gardenAmbience) return;
      const now = ctx.currentTime;
      this.shimmer(now, 0.55 + Math.random() * 0.45, 0.012 + Math.random() * 0.01, 1100);
    };

    const playBird = () => {
      if (!this.gardenAmbience) return;
      const now = ctx.currentTime;
      const base = 1760 + Math.random() * 420;
      this.tone(base, now, 0.08, 0.018, 'sine');
      this.tone(base * 1.18, now + 0.09, 0.1, 0.014, 'sine');
    };

    const leafTimer = window.setInterval(playLeaves, 2600);
    const birdTimer = window.setInterval(playBird, 5200);
    this.gardenAmbience = { wind, windGain, leafTimer, birdTimer };
    window.setTimeout(playLeaves, 700);
    window.setTimeout(playBird, 1500);
  }

  stopGardenAmbience() {
    const ambience = this.gardenAmbience;
    if (!ambience) return;
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    window.clearInterval(ambience.leafTimer);
    window.clearInterval(ambience.birdTimer);
    ambience.windGain.gain.cancelScheduledValues(t);
    ambience.windGain.gain.setValueAtTime(Math.max(ambience.windGain.gain.value, 0.0001), t);
    ambience.windGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
    ambience.wind.stop(t + 0.9);
    this.gardenAmbience = null;
  }
}

export const synth = new SynthAudio();

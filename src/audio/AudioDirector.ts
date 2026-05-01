import { Howl } from 'howler';
import { useObiStore } from '../state/store';
import { synth } from './SynthAudio';
import type { VoiceProfile } from '../state/user';
import { publicPath } from '../assets/publicPath';

type Bus = 'ambient' | 'ui' | 'voice' | 'portal';

const BUS_BASE_VOLUMES: Record<Bus, number> = {
  ambient: 0.22,
  ui: 0.42,
  voice: 1.0,
  portal: 0.3,
};

type Entry = { howl: Howl; bus: Bus };

const NATURAL_VOICE_HINTS = [
  'ava',
  'samantha',
  'sonia',
  'serena',
  'daniel',
  'arthur',
  'google uk english',
  'microsoft',
];

const KOFI_SPATIAL_MIX_TRACK = publicPath('/audio/kofi/lucid-mirage.mp3');

export class AudioDirector {
  private sounds = new Map<string, Entry>();
  private unsubscribe: (() => void) | null = null;

  init() {
    if (this.unsubscribe) return;
    this.unsubscribe = useObiStore.getState().subscribe((e) => {
      if (e.type === 'fx')    this.handleFx(e.name);
      if (e.type === 'sound') this.playFile(e.src, e.bus ?? 'ui');
      if (e.type === 'portal') {
        const isKofi = useObiStore.getState().activeUser.id === 'kofi';
        if (isKofi) {
          if (e.open) this.playFile(KOFI_SPATIAL_MIX_TRACK, 'portal');
          else this.stop(KOFI_SPATIAL_MIX_TRACK);
        } else {
          this.handleFx(e.open ? 'portal-open' : 'portal-close');
          if (e.open) synth.startGardenAmbience();
          else synth.stopGardenAmbience();
        }
      }
      if (e.type === 'speak') {
        const { voice } = useObiStore.getState().activeUser;
        if (e.audio) this.playVoiceClip(e.audio);
        else         this.speakWebSpeech(e.text, voice);
      }
    });
  }

  teardown() {
    this.unsubscribe?.();
    this.unsubscribe = null;
    window.speechSynthesis?.cancel();
    synth.stopGardenAmbience();
    this.sounds.forEach(({ howl }) => howl.unload());
    this.sounds.clear();
  }

  private handleFx(name: string) {
    const bright = useObiStore.getState().activeUser.id === 'kofi';
    switch (name) {
      case 'wake':         synth.wake();        break;
      case 'chime-warm':   synth.chimeWarm();   break;
      case 'chime-bright': synth.chimeBright(); break;
      case 'hover':        synth.hover();       break;
      case 'press':        synth.press();       break;
      case 'select':       synth.select();      break;
      case 'inhale':       synth.inhale();      break;
      case 'tick':         synth.tick();        break;
      case 'notify':       synth.notify(0.12, bright); break;
      case 'portal-open':  synth.portalOpen();  break;
      case 'portal-close': synth.portalClose(); break;
      case 'gesture':      synth.gesture();     break;
    }
  }

  playFx(name: string) {
    this.handleFx(name);
  }

  speakWebSpeech(text: string, voice?: VoiceProfile) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate  = voice?.rate  ?? 1.0;
    utt.pitch = voice?.pitch ?? 1.0;
    utt.lang  = voice?.lang  ?? 'en-GB';
    // Pick best matching voice
    const loadAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length) {
        const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
        const score = (v: SpeechSynthesisVoice) => {
          const name = v.name.toLowerCase();
          const hintScore = NATURAL_VOICE_HINTS.reduce(
            (total, hint, index) => total + (name.includes(hint) ? 30 - index : 0),
            0,
          );
          return (
            (v.lang === utt.lang ? 24 : 0) +
            (v.lang.startsWith('en-GB') ? 12 : 0) +
            (v.localService ? 4 : 0) +
            hintScore
          );
        };
        const match = englishVoices.sort((a, b) => score(b) - score(a))[0];
        if (match) utt.voice = match;
      }
      utt.volume = 0.92;
      window.speechSynthesis.speak(utt);
      this.duck(['ambient', 'portal'], 0.3, 400);
      utt.onend = () => this.unduck(['ambient', 'portal'], 800);
    };
    // Voices may not be loaded yet on first call
    if (window.speechSynthesis.getVoices().length) {
      loadAndSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => { loadAndSpeak(); };
    }
  }

  private getOrLoad(src: string, bus: Bus): Entry {
    let e = this.sounds.get(src);
    if (!e) {
      const howl = new Howl({
        src: [src],
        html5: true,
        volume: BUS_BASE_VOLUMES[bus],
        onloaderror: () => { /* silent — files added later */ },
        onplayerror:  () => {},
      });
      e = { howl, bus };
      this.sounds.set(src, e);
    }
    return e;
  }

  private playVoiceClip(src: string) {
    window.speechSynthesis?.cancel();
    this.sounds.forEach((entry) => {
      if (entry.bus === 'voice') entry.howl.stop();
    });

    const previous = this.sounds.get(src);
    previous?.howl.stop();
    previous?.howl.unload();

    const howl = new Howl({
      src: [src],
      html5: true,
      volume: BUS_BASE_VOLUMES.voice,
      onloaderror: () => this.unduck(['ambient', 'portal'], 300),
      onplayerror: () => this.unduck(['ambient', 'portal'], 300),
    });

    this.sounds.set(src, { howl, bus: 'voice' });
    this.duck(['ambient', 'portal'], 0.3, 300);
    const id = howl.play();
    howl.once('end', () => this.unduck(['ambient', 'portal'], 700), id);
  }

  private playFile(src: string, bus: Bus) {
    const e = this.getOrLoad(src, bus);
    const looping = (bus === 'ambient' || bus === 'portal') && src !== KOFI_SPATIAL_MIX_TRACK;
    e.howl.loop(looping);
    e.howl.volume(BUS_BASE_VOLUMES[bus]);
    const id = e.howl.play();
    if (bus === 'voice') {
      this.duck(['ambient', 'portal'], 0.3, 400);
      e.howl.once('end', () => this.unduck(['ambient', 'portal'], 800), id);
    }
    return id;
  }

  stop(src: string) {
    this.sounds.get(src)?.howl.stop();
  }

  stopVoice() {
    window.speechSynthesis?.cancel();
    this.sounds.forEach((entry) => {
      if (entry.bus === 'voice') entry.howl.stop();
    });
    this.unduck(['ambient', 'portal'], 300);
  }

  private duck(buses: Bus[], factor: number, fadeMs: number) {
    this.sounds.forEach((e) => {
      if (!buses.includes(e.bus)) return;
      e.howl.fade(e.howl.volume(), BUS_BASE_VOLUMES[e.bus] * factor, fadeMs);
    });
  }

  private unduck(buses: Bus[], fadeMs: number) {
    this.sounds.forEach((e) => {
      if (!buses.includes(e.bus)) return;
      e.howl.fade(e.howl.volume(), BUS_BASE_VOLUMES[e.bus], fadeMs);
    });
  }
}

export const audio = new AudioDirector();

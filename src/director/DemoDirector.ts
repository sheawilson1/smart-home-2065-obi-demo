import { useObiStore } from '../state/store';
import type { Beat, BeatSequence } from './beats';

type RunningBeat = { beat: Beat; timer: number };

export class DemoDirector {
  private running: RunningBeat[] = [];
  private currentSequence: BeatSequence | null = null;

  play(sequence: BeatSequence) {
    this.stop();
    this.currentSequence = sequence;
    useObiStore.getState().setDirectorState('playing');
    for (const beat of sequence.beats) {
      const timer = window.setTimeout(() => this.fire(beat), beat.at);
      this.running.push({ beat, timer });
    }
    const last = sequence.beats[sequence.beats.length - 1];
    if (last) {
      const doneTimer = window.setTimeout(() => {
        useObiStore.getState().setDirectorState('stopped');
        useObiStore.getState().setCurrentBeat(null);
      }, last.at + 2000);
      this.running.push({ beat: { id: '__done__', at: last.at + 2000, event: { type: 'fx', name: 'done' } }, timer: doneTimer });
    }
  }

  private fire(beat: Beat) {
    useObiStore.getState().setCurrentBeat(beat.id);
    useObiStore.getState().emit(beat.event);
  }

  pause() {
    this.running.forEach(({ timer }) => window.clearTimeout(timer));
    this.running = [];
    useObiStore.getState().setDirectorState('paused');
  }

  stop() {
    this.running.forEach(({ timer }) => window.clearTimeout(timer));
    this.running = [];
    this.currentSequence = null;
    useObiStore.getState().setDirectorState('stopped');
    useObiStore.getState().setCurrentBeat(null);
    useObiStore.getState().setPortalOpen(false);
    window.speechSynthesis?.cancel();
  }

  reset() {
    this.stop();
    useObiStore.getState().setPortalOpen(false);
    useObiStore.getState().setUser('amara');
    window.speechSynthesis?.cancel();
  }

  get isPlaying() {
    return this.currentSequence !== null;
  }
}

export const director = new DemoDirector();

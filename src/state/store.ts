import { create } from 'zustand';
import { USERS, applyPaletteToRoot, type User, type UserId } from './user';
import type { BeatEvent } from '../director/beats';

export type TimeOfDay = 'morning' | 'midday' | 'evening';
export type DirectorState = 'stopped' | 'playing' | 'paused';
export type BackgroundVariant = 'clear' | 'objects';

type Listener = (e: BeatEvent) => void;

const listeners = new Set<Listener>();

interface ObiState {
  activeUser: User;
  awake: boolean;
  timeOfDay: TimeOfDay;
  directorState: DirectorState;
  currentBeatId: string | null;
  portalOpen: boolean;
  currentSpeech: string | null;
  backgroundVariant: BackgroundVariant;
  setUser: (id: UserId) => void;
  setAwake: (a: boolean) => void;
  setTimeOfDay: (t: TimeOfDay) => void;
  setDirectorState: (s: DirectorState) => void;
  setCurrentBeat: (id: string | null) => void;
  setPortalOpen: (o: boolean) => void;
  setCurrentSpeech: (text: string | null) => void;
  setBackgroundVariant: (v: BackgroundVariant) => void;
  emit: (e: BeatEvent) => void;
  subscribe: (l: Listener) => () => void;
}

export const useObiStore = create<ObiState>((set) => ({
  activeUser: USERS.amara,
  awake: false,
  timeOfDay: 'morning',
  directorState: 'stopped',
  currentBeatId: null,
  portalOpen: false,
  currentSpeech: null,
  backgroundVariant: 'clear',
  setUser: (id) => {
    const u = USERS[id];
    applyPaletteToRoot(u);
    set({ activeUser: u });
  },
  setAwake: (awake) => set({ awake }),
  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
  setDirectorState: (directorState) => set({ directorState }),
  setCurrentBeat: (currentBeatId) => set({ currentBeatId }),
  setPortalOpen: (portalOpen) => set({ portalOpen }),
  setCurrentSpeech: (currentSpeech) => set({ currentSpeech }),
  setBackgroundVariant: (backgroundVariant) => set({ backgroundVariant }),
  emit: (e) => {
    switch (e.type) {
      case 'theme': {
        const u = USERS[e.userId];
        applyPaletteToRoot(u);
        set({ activeUser: u });
        break;
      }
      case 'portal':
        set({ portalOpen: e.open });
        break;
      case 'speak': {
        set({ currentSpeech: e.text });
        const duration = Math.max(2500, e.text.length * 72);
        window.setTimeout(() => {
          const cur = useObiStore.getState().currentSpeech;
          if (cur === e.text) set({ currentSpeech: null });
        }, duration);
        break;
      }
    }
    listeners.forEach((l) => l(e));
  },
  subscribe: (l) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
}));

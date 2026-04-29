export type UserId = 'amara' | 'kofi';

export type Palette = {
  primary: string;
  glow: string;
  warmth: string;
};

export type VoiceProfile = {
  rate: number;
  pitch: number;
  lang: string;
  preRecordedFolder: string;
};

export type ChimePalette = {
  wake: string;
  confirm: string;
  notify: string;
};

export type User = {
  id: UserId;
  name: string;
  palette: Palette;
  voice: VoiceProfile;
  chimes: ChimePalette;
  density: 'comfortable' | 'compact';
  copyRegister: 'warm-formal' | 'creative';
  layoutVariant: 'a' | 'b';
  greeting: string;
  subtitle: string;
};

export const USERS: Record<UserId, User> = {
  amara: {
    id: 'amara',
    name: 'Amara',
    palette: { primary: '#E8B87A', glow: '#F5D4A1', warmth: '#3A2818' },
    voice: { rate: 0.82, pitch: 0.9, lang: 'en-GB', preRecordedFolder: 'amara' },
    chimes: {
      wake: '/audio/chimes/amara/wake.mp3',
      confirm: '/audio/chimes/amara/confirm.mp3',
      notify: '/audio/chimes/amara/notify.mp3',
    },
    density: 'comfortable',
    copyRegister: 'warm-formal',
    layoutVariant: 'a',
    greeting: 'Good morning, Amara.',
    subtitle: 'The balcony herbs are thriving.',
  },
  kofi: {
    id: 'kofi',
    name: 'Kofi',
    palette: { primary: '#9B7DD4', glow: '#C4AEED', warmth: '#1A1228' },
    voice: { rate: 0.92, pitch: 1.02, lang: 'en-GB', preRecordedFolder: 'kofi' },
    chimes: {
      wake: '/audio/chimes/kofi/wake.mp3',
      confirm: '/audio/chimes/kofi/confirm.mp3',
      notify: '/audio/chimes/kofi/notify.mp3',
    },
    density: 'compact',
    copyRegister: 'creative',
    layoutVariant: 'b',
    greeting: 'Hey Kofi.',
    subtitle: "Your track's still rendering.",
  },
};

export function applyPaletteToRoot(user: User) {
  const root = document.documentElement;
  root.style.setProperty('--obi-primary', user.palette.primary);
  root.style.setProperty('--obi-glow', user.palette.glow);
  root.style.setProperty('--obi-warmth', user.palette.warmth);
}

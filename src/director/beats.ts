import type { UserId } from '../state/user';
import { publicPath } from '../assets/publicPath';

export type BeatEvent =
  | { type: 'speak'; text: string; audio?: string }
  | { type: 'theme'; userId: UserId }
  | { type: 'layout'; variant: 'a' | 'b' }
  | { type: 'sound'; src: string; bus?: 'ui' | 'voice' | 'portal' | 'ambient' }
  | { type: 'portal'; open: boolean }
  | { type: 'fx'; name: string; payload?: unknown };

export type Beat = {
  id: string;
  at: number; // ms from sequence start
  event: BeatEvent;
};

export type BeatSequence = {
  id: string;
  label: string;
  beats: Beat[];
};

export type DemoStep = {
  id: string;
  label: string;
  events: BeatEvent[];
};

// Speech timing guide (rate 0.82-0.92 ≈ 120-138 wpm):
//   ~7 words → ~3.2s  ~10 words → ~4.5s  ~13 words → ~5.9s
// Keep the Friday demo spare: one setup, one reveal, one human care moment.

export const amaraMorning: BeatSequence = {
  id: 'amara-morning',
  label: "Amara's morning",
  beats: [
    // 0s — chime + inhale
    { id: 'chime',        at:     0, event: { type: 'fx',     name: 'wake' } },
    { id: 'inhale',       at:   300, event: { type: 'fx',     name: 'inhale' } },

    // 0.9s — greeting
    { id: 'greet',        at:   900, event: { type: 'speak',  text: 'Good morning, Amara. Lagos is carrying some heat today, but your herbs are holding up nicely out there.', audio: publicPath('/audio/voices/obi/amara-01-greeting.wav') } },

    // 6.4s — Lagos update
    { id: 'lagos-update', at:  6400, event: { type: 'speak',  text: "The basil's full and ready for picking. Rosemary's doing beautifully, and the mint is coming along well.", audio: publicPath('/audio/voices/obi/amara-02-garden.wav') } },

    // 10.6s — garden note
    { id: 'notify',       at: 10600, event: { type: 'fx',     name: 'notify' } },

    // 14.8s — sprinkler note
    { id: 'sprinkler',    at: 14800, event: { type: 'speak',  text: "I've nudged the sprinklers up a little, before the afternoon gets too fierce.", audio: publicPath('/audio/voices/obi/amara-03-sprinklers.wav') } },

    // 21.0s — human care moment
    { id: 'tea-note',     at: 21000, event: { type: 'speak',  text: "Your tea is ready. And while you're at it, don't let those tablets sit there forgotten.", audio: publicPath('/audio/voices/obi/amara-04-medication.wav') } },

  ],
};

export const kofiAfternoon: BeatSequence = {
  id: 'kofi-afternoon',
  label: "Kofi's studio mode",
  beats: [
    { id: 'chime',        at:     0, event: { type: 'fx',     name: 'chime-bright' } },
    { id: 'inhale',       at:   300, event: { type: 'fx',     name: 'inhale' } },
    { id: 'greet',        at:   900, event: { type: 'speak',  text: "Yo Kofi. That spatial render's still going, about twelve minutes left.", audio: publicPath('/audio/voices/obi/kofi-01-greeting.wav') } },
    { id: 'privacy',      at:  6800, event: { type: 'speak',  text: "Studio mode's on. No one's getting through.", audio: publicPath('/audio/voices/obi/kofi-02-studio.wav') } },
    { id: 'notify',       at: 11000, event: { type: 'fx',     name: 'notify' } },
    { id: 'amara-share',  at: 11500, event: { type: 'speak',  text: "Granny wants to hear the new piece when it's done. Said she'll wait for the finished version, so no rush.", audio: publicPath('/audio/voices/obi/kofi-03-amara.wav') } },
  ],
};

export const wakeAsAmara: BeatSequence = {
  id: 'wake-amara',
  label: 'Wake as Amara',
  beats: [
    { id: 'theme',  at:   0, event: { type: 'theme', userId: 'amara' } },
    { id: 'chime',  at:  50, event: { type: 'fx',    name: 'wake' } },
    { id: 'inhale', at: 350, event: { type: 'fx',    name: 'inhale' } },
  ],
};

export const wakeAsKofi: BeatSequence = {
  id: 'wake-kofi',
  label: 'Wake as Kofi',
  beats: [
    { id: 'theme',  at:   0, event: { type: 'theme', userId: 'kofi' } },
    { id: 'chime',  at:  50, event: { type: 'fx',    name: 'chime-bright' } },
    { id: 'inhale', at: 350, event: { type: 'fx',    name: 'inhale' } },
  ],
};

export const manualDemoSteps: Record<UserId, DemoStep[]> = {
  amara: [
    {
      id: 'amara-greeting',
      label: 'Greeting',
      events: [
        { type: 'fx', name: 'wake' },
        {
          type: 'speak',
          text: 'Good morning, Amara. Lagos is carrying some heat today, but your herbs are holding up nicely out there.',
          audio: publicPath('/audio/voices/obi/amara-01-greeting.wav'),
        },
      ],
    },
    {
      id: 'amara-garden',
      label: 'Garden',
      events: [
        { type: 'fx', name: 'notify' },
        {
          type: 'speak',
          text: "The basil's full and ready for picking, rosemary's doing beautifully, and the mint is coming along well, just give it a few more days.",
          audio: publicPath('/audio/voices/obi/amara-02-garden.wav'),
        },
      ],
    },
    {
      id: 'amara-sprinklers',
      label: 'Sprinklers',
      events: [
        {
          type: 'speak',
          text: "I've nudged the sprinklers up a little, before the afternoon gets too fierce.",
          audio: publicPath('/audio/voices/obi/amara-03-sprinklers.wav'),
        },
      ],
    },
    {
      id: 'amara-medication',
      label: 'Medication',
      events: [
        {
          type: 'speak',
          text: "Your tea is ready. And while you're at it, don't let those tablets sit there forgotten.",
          audio: publicPath('/audio/voices/obi/amara-04-medication.wav'),
        },
      ],
    },
  ],
  kofi: [
    {
      id: 'kofi-greeting',
      label: 'Greeting',
      events: [
        { type: 'fx', name: 'chime-bright' },
        {
          type: 'speak',
          text: "Yo Kofi. That spatial render's still going, about twelve minutes left.",
          audio: publicPath('/audio/voices/obi/kofi-01-greeting.wav'),
        },
      ],
    },
    {
      id: 'kofi-studio',
      label: 'Studio',
      events: [
        {
          type: 'speak',
          text: "Studio mode's on. No one's getting through.",
          audio: publicPath('/audio/voices/obi/kofi-02-studio.wav'),
        },
      ],
    },
    {
      id: 'kofi-amara',
      label: 'Amara',
      events: [
        { type: 'fx', name: 'notify' },
        {
          type: 'speak',
          text: "Granny wants to hear the new piece when it's done. Said she'll wait for the finished version, so no rush.",
          audio: publicPath('/audio/voices/obi/kofi-03-amara.wav'),
        },
      ],
    },
    {
      id: 'kofi-grass',
      label: 'Grass',
      events: [
        {
          type: 'speak',
          text: "You've been in here three hours. Go touch grass.",
          audio: publicPath('/audio/voices/obi/kofi-04-grass.wav'),
        },
      ],
    },
  ],
};

export const avaVoiceSample: BeatSequence = {
  id: 'ava-voice-sample',
  label: 'Ava voice sample',
  beats: [
    { id: 'tap', at: 0, event: { type: 'fx', name: 'select' } },
    {
      id: 'sample',
      at: 120,
      event: {
        type: 'speak',
        text: 'Ava Neural voice sample.',
        audio: publicPath('/audio/voices/obi/ava-neural.webm'),
      },
    },
  ],
};

# Obi Voice Clip Notes

The app can play pre-rendered voice clips from `public/audio/voices/obi`.
If a clip is missing or cannot load, Obi falls back to browser speech synthesis.

Recommended workflow:

1. Generate each final line as a short `.mp3`, `.wav`, or `.webm` file.
2. Keep each clip dry, with no background music.
3. Leave a small natural pause at the end, but avoid long silence.
4. Use the same voice family across lines so Obi feels consistent.

Imported sample:

- `ava-neural.webm` came from the supplied `en-US-AvaNeural.mp3` file. The file contents are WebM audio, so v2 stores it with a `.webm` extension.

Suggested Edge/Azure voices to audition:

- `en-US-AvaNeural`: polished, clear, good for a refined assistant.
- `en-US-JennyNeural`: warmer and more conversational.
- `en-GB-SoniaNeural`: calmer UK tone, good if the household should feel local.
- `en-NG-EzinneNeural`: useful if Amara's Lagos connection should come through more clearly.


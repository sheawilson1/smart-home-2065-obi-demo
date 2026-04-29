# Obi Demo V2

This version is a safe duplicate of the original `obi-demo` prototype.

## Demo Controls

- `A`: wake as Amara.
- `K`: wake as Kofi.
- `Space`: play the current user's staged demo.
- `O`: switch between clear surface and mug/notebook surface.
- `V`: play the imported Ava Neural voice sample.
- `H`: enable or disable webcam hand tracking.
- `C`: switch between selfie camera mode and surface camera mode.
- `Shift + T`: cycle the surface time tint.
- `R`: reset to sleep.

## Hand Tracking

Hand tracking uses MediaPipe's web Hand Landmarker from a CDN at runtime, so it needs:

- a browser with webcam access,
- a secure context such as `localhost` or `https`,
- an internet connection the first time it loads the MediaPipe assets.

Gestures:

- open palm: wake Obi or replay Amara's morning sequence,
- pinch: open or close the herb garden portal,
- horizontal swipe: toggle the surface object layout.

When hand tracking is enabled, v2 projects a soft hand shadow and fingertip glow onto the worktop. The small camera preview in the lower-right corner is intentionally visible so you can see what the browser camera is actually detecting.

## Voice

The imported Ava Neural sample is stored at:

- `public/audio/voices/obi/ava-neural.webm`

Future final Obi lines can be added as generated audio clips in the same folder. The app falls back to browser speech synthesis if a clip fails to load.

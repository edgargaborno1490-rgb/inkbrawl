# Project notes for Claude

**Ink Brawl** (owner's pick, Nov 18, 2026; repo `inkbrawl`): an anime
"Who Would Win" fight channel. It is separate from **WhiteBucket Explains** (`whitebucket-studio`),
**AI Club Town** (`AI_club_town`) and Kanaktical (`aloha-armor-forge`): never touch those repos from here.

For any video, use the **`fight-video` skill** (`.claude/skills/fight-video/SKILL.md`). It points to the stage
skills `/new-video`, `/video-styles`, `/render-video`, `/video-sound` (the 2D studio in
`.claude/skills/make-2d-video/`), which this project uses with its own locked look.

## Format
- **16:9 main shape, 60–80 s**; every video is also rendered in **9:16**.
- **Look (owner Nov 18, 2026, final):** match `reference/ref4-luffy-vs-naruto.mp4`: 2D TV-anime cel art (thick
  black ink lines, flat cel colors, glowing outlines in each fighter's color, extreme perspective, painted misty
  grass field). Made as **AI keyframes with Nano Banana** (Gemini image API; key = network secret on the "Anime
  Fights" environment, header `x-goog-api-key`), then cut together in the studio (camera push/shake, white flash
  frames, our captions, our SFX). Describe characters by look in prompts. The 3D toon test was rejected. **Skin: each fighter's usual anime skin tone**
  (owner, Nov 18, 2026; replaces the earlier brown-skin rule). **Faces like the owner's reference** (`reference/ref4-luffy-vs-naruto.mp4`): grins, eyes and glowing
  eyes on power-ups. Fighters are recognized by outfit colors, hair shape and signature moves.
- **Style confirmed by the owner (Nov 18, 2026, after comparing): ref4 look, NOT refs 1–3.** Refs 1–3 (faceless
  dark silhouettes, pale washed backgrounds) are a different style: use them only for pacing. Our fighters have faces
  and anime skin tones. Every video is **real animation**: Nano Banana keyframes are turned into moving clips with
  **Gemini Omni Flash** (Interactions API, `POST /v1beta/interactions`, model `gemini-omni-1.2-flash`,
  `response_format: {type: video, duration: "4s", aspect_ratio, resolution}`), not still pictures with camera moves.
- **SFX = the ElevenLabs library in `sfx-library/`** (real anime punches, kicks, rocks, booms, whooshes; key = network
  secret on `api.elevenlabs.io`, header `xi-api-key`). Never the code-generated synth SFX.
- **NO PAID AI SERVICES (owner, Nov 18, 2026): never call Google Gemini / Nano Banana / Omni or ElevenLabs again,
  and never ask for their keys.** The owner disconnected them. Work only with what is already in the repo (character
  sheets, keyframes, clips, `sfx-library/`) and free local tools. Ask the owner before anything that costs money.
- **Original drawings only:** never real anime footage, screenshots, logos or official art.
- **One big bold white word on screen at a time**, landing on the spoken word.
- **Very fast cuts like ref4:** ~110 shots per 80 s (median ~0.5 s), plus 1–2-frame white flashes / impact
  frames on hits; about half the shots are huge close-ups (faces, fists, feet, hand signs), the rest wide arena
  shots, craters/debris, power auras in each fighter's color.
- Sound: dense like ref4 (~1.3 hits/s, deep booms on big moments, rumble bed, whoosh on cuts), always our own
  generated or licensed SFX, never audio taken from a reference video. Light music under the voice.

## Story (every script)
1. Hook (first 3 s): the matchup + "who would win?"
2. The fight, beat by beat (**no "Round one / two / three"**: owner, Nov 18, 2026; the fight flows straight
   on), each side using real canon abilities (arc/chapter cited in the script's notes).
3. A turning point / counter-move.
4. Verdict with a short reason, then "Comment who YOU think wins" + "Who should fight next?"
Fair to both sides. Plain spoken English, ~150–190 words.

## Workflow
- Scripts: `scripts/<a>-vs-<b>.md`, written **Status: DRAFT**. Only the owner marks **APPROVED**; build nothing
  before that and before the owner's voiceover MP3.
- Matchups list and status: `IDEAS.md`.
- `reference/`: the owner's reference videos (+ contact sheets). They show **pacing, camera and look**; never copy
  their shots one-for-one or reuse their audio; our fighters have faces and their anime skin tones, never black silhouettes.
- TubeAlfred credits are shared with the owner's other channel: max 3 calls per video, none below 15 left.
- Push straight to `main`.

# Project notes for Claude

**Ink Brawl** (owner's pick, Nov 18, 2026; repo `inkbrawl`): an anime
"Who Would Win" fight channel. It is separate from **WhiteBucket Explains** (`whitebucket-studio`),
**AI Club Town** (`AI_club_town`) and Kanaktical (`aloha-armor-forge`): never touch those repos from here.

For any video, use the **`fight-video` skill** (`.claude/skills/fight-video/SKILL.md`). It points to the stage
skills `/new-video`, `/video-styles`, `/render-video`, `/video-sound` (the 2D studio in
`.claude/skills/make-2d-video/`), which this project uses with its own locked look.

## Format
- **16:9 main shape, 60–80 s**; every video is also rendered in **9:16**.
- **Look (style `brown-anime`):** flat 2D anime illustration with soft cel shading. Every fighter has the same
  **warm medium-brown skin**. Faces are simple and **faceless (no eyes, no mouth)**: fighters are recognized
  by iconic outfit colors, hair shape and signature moves.
- **Original drawings only:** never real anime footage, screenshots, logos or official art.
- **One big bold white word on screen at a time**, landing on the spoken word.
- **Fast cuts every 1–3 s:** wide arena shots, close-ups (fists, feet, hand signs), impact frames, speed lines,
  craters/debris, power auras in each fighter's color.
- Sound: punch impacts, whooshes, light music under the voice.

## Story (every script)
1. Hook (first 3 s): the matchup + "who would win?"
2. Round-by-round fight, each side using real canon abilities (arc/chapter cited in the script's notes).
3. A turning point / counter-move.
4. Verdict with a short reason, then "Comment who YOU think wins" + "Who should fight next?"
Fair to both sides. Plain spoken English, ~150–190 words.

## Workflow
- Scripts: `scripts/<a>-vs-<b>.md`, written **Status: DRAFT**. Only the owner marks **APPROVED**; build nothing
  before that and before the owner's voiceover MP3.
- Matchups list and status: `IDEAS.md`.
- `reference/`: the owner's reference videos (+ contact sheets). They show **pacing and camera only**; our
  fighters have brown skin, not black silhouettes.
- TubeAlfred credits are shared with the owner's other channel: max 3 calls per video, none below 15 left.
- Push straight to `main`.

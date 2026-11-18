---
name: fight-video
description: Make one Ink Brawl anime "Who Would Win" fight video, start to finish - research + DRAFT script, then (after the owner marks it APPROVED and sends the voiceover MP3) timestamps, shot list, the locked brown-skin anime style, contact sheet, render in 16:9 and 9:16, punches/whooshes/light music, cover, title and hashtags. Use for "make <A> vs <B>", "new matchup", "write the <A> vs <B> script", "here's the MP3", or "APPROVED".
---

# Ink Brawl fight video

One video per chat. The rules in `CLAUDE.md` win over anything here; the stage skills
(`new-video`, `video-styles`, `render-video`, `video-sound`, details in `make-2d-video/references/`)
are the engine, and **this file overrides their stickman look** (see "Style" below).

## Part A: research + script (stop at DRAFT)
1. Pick the matchup (the owner's, or the top unscripted row in `IDEAS.md`). Decide the **versions** that
   fight (e.g. "end-of-war Naruto vs Gear 5 Luffy") and say them in the script header.
2. Research each fighter's real canon abilities with web search. Every move in the narration gets a row in
   "Canon notes" with series, arc and chapter/episode. Mark chapters you confirmed this chat with ✔.
3. Hook: run `social-media-skills:hook-writer`; give 3 options, pick one that says the matchup + "who would win"
   inside the first 3 s.
4. Titles: `tubealfred-youtube:youtube-competitor` style check, but cheap: **one** TubeAlfred search
   ("<a> vs <b> who would win", sort by popularity). TubeAlfred credits are shared with the owner's other
   channel: max 3 calls per video, stop if fewer than 15 credits remain. Borrow topics, never titles or footage.
5. Write `scripts/<a>-vs-<b>.md` from `scripts/naruto-vs-luffy.md` as the template:
   hook → round 1 → round 2 → round 3 → turning point / counter → verdict with a short reason →
   "Comment who YOU think wins. And who should fight next?" Plain spoken English, **150–190 words**
   (check with `wc -w`). Fair to both: each side gets real wins on screen before the verdict.
   Add `## Packaging` (5 titles + cover words scored /10, `Pick: #N`, runner-up).
6. Mark it **Status: DRAFT**, add/refresh the row in `IDEAS.md`, commit and push. Stop and wait for the owner.

## Part B: build (only after **Status: APPROVED** and the owner's MP3)
1. **`/new-video`** inside `growkaz-stickman-studio/` (install it from `.claude/skills/make-2d-video/kit` the
   first time, per `references/install.md`): 16:9, 1080p, 30 fps, captions OFF in the engine (we draw our own
   one-word captions), generated music + SFX. Plain-script route with the approved narration (match ≥ 90%).
   Shot list: **cuts every 1–3 s** (median ~1.5 s; the references cut every 0.6–1.1 s, so faster is fine in
   rounds). Mix per minute: ~25% wide arena, ~30% medium action, ~20% close inserts (fists, feet, hand signs,
   blank face), ~10% impact frames, ~10% crater/debris, aura power-ups as needed.
2. **`/video-styles`**: only the first time (or when the owner asks): the style **`brown-anime`** must exist in
   `engine/styles.js` and be the default in every new project's `config.json`. Once it exists, skip this step.
3. **`/render-video`**: contact sheet first (open every sheet PNG and compare it with
   `reference/ref*-sheet.png` for pacing and framing), fix, then show the owner a 20–30 s preview, then the
   full render in **16:9**, then switch `config.json` to 9:16 and render the **9:16** cut (re-check the sheet:
   9:16 framing differs).
4. **`/video-sound`**: SFX `hit`/`kick`/`impact` on every contact, `whoosh`/`swish` on fast moves, `riser` into
   the turning point, `stinger` on the verdict; never more than 2 cues at once. Light generated music under the
   voice (mood `action`, intensity 0.6–0.8; `epic` for the turning point), ducked; −14 LUFS.
5. Cover + post text: `social-media-skills:thumbnail-design` (both fighters, brown skin, faceless, the cover
   word from Packaging in huge white letters, auras in their colors) and `social-media-skills:caption-writer`
   (title = the Pick, 3–5 hashtags, ends with the comment question). Save to `out/<slug>-post.md`.
6. QC: duration 60–80 s, audio present, one word on screen at a time, no eyes/mouths anywhere, no logos.
   Send the owner both MP4s + the cover. Update `IDEAS.md` (status: made) and commit/push.

## Style: `brown-anime` (locked look for every video)
- **Flat 2D anime illustration, cel shaded.** Fills plus a thin dark-brown outline (`#2A1A12`, ~3 px at 1080p),
  ONE hard shadow band per shape (no gradients on characters). No stickmen, no rim-light requirement.
- **Skin: warm medium brown, the same on every fighter:** base `#8D5B3E`, shade `#6B412B`, tiny highlight
  `#A8714F` (optional, on shoulders/knuckles). Never black silhouettes, never lighter or darker per character.
- **Faceless:** heads are skin-colored shapes with **no eyes, no mouth, no nose**. Emotion comes from pose,
  head tilt, hair motion, aura and camera. (Glows like Sage markings or a Haki glint may sit on the face area as
  colored light, never as eyes.)
- **Recognition = outfit colors + hair shape + signature moves.** Each fighter has a kit in
  `projects/<slug>/scenes/cast.js` (outfit colors, hair silhouette, aura color, move effects) kept identical
  across all videos; reuse a fighter's kit when they come back. No emblems or logos on clothes (plain
  headband plates, no symbols).
- **Arenas:** pale, low-contrast painted backgrounds (grass plains, rocky canyons, stone courtyards, misty
  water) so the fighters pop; sky and ground desaturated; debris and dust in warm grey.
- **Action language:** speed lines, impact frames (1–3 frames of inverted colors or white flash), shockwave
  rings, craters with radial cracks, flying rock chunks, motion smears, power auras in each fighter's color,
  camera shake on hits, slam zooms.
- **On-screen text: ONE big bold white word at a time**, landing on the spoken word (`wordTime()`): heavy
  condensed font, white fill, ~6 px black outline, lower-center (16:9: ~86% of height; 9:16: ~72%). Pick the
  word that carries the line (names, moves, ROUND, WINS). Nothing else on screen except the end cards.
- Original drawings only. Never real anime footage, screenshots, official art or logos; reference videos guide
  pacing and camera only.

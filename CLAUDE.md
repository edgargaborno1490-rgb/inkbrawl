# Project notes for Claude

**Ink Brawl** (repo `inkbrawl`). **NEW FORMAT (owner, Nov 21, 2026; replaces the anime "Who Would Win" format):**
a free-for-all stick man battle royale drawn on a piece of paper. **The stick men are the owner's followers.** Every
video is a brawl between many hand-drawn stick men, each one carrying a follower's name, until one is left standing.
The old anime format (Naruto vs Luffy etc.) is retired; its notes live in git history and `IDEAS.md`.

It is separate from **WhiteBucket Explains** (`whitebucket-studio`), **AI Club Town** (`AI_club_town`) and
Kanaktical (`aloha-armor-forge`): never touch those repos from here.

Videos are built in the free 2D studio (`growkaz-stickman-studio/`, skills `/new-video`, `/render-video`,
`/video-sound`, `make-2d-video`) with the Ink Brawl look below. The old `fight-video` skill is for the retired
anime format: don't use it for brawls.

## Look
- **Blank canvas in 3D (owner, Nov 21, 2026; replaces notebook paper):** a plain white blank drawing canvas (thin
  edge, small blue corner handles like a design app) floating in a soft gray 3D space with a shadow under it. The
  camera moves in 3D: it starts zoomed out showing the whole canvas, then pushes in low to the front where the stick
  men fight standing up on the canvas (each with a soft shadow at their feet). No paper lines, no app logos.
  Test scene: `samples/canvas3d.html` (render with `samples/render_canvas3d.cjs`, `--clip` for the 5 s zoom test).
- Stick men look drawn with a pen: wobbly hand-drawn black ink lines, never clean vector lines.
- **Stick men:** round head, line body, line arms and legs, simple faces allowed (dot eyes, angry brows, grin).
  Each one gets **one accent color item** so viewers can follow them (headband, scarf, cap, bandana, cape, etc.)
  and their **@name written above the head** in marker.
- Ink effects: scribble dust clouds, ink splats on hits, speed lines, pen-stroke "drawing in" when a fighter enters,
  eraser smudge or crumple when one is knocked out.
- Fighter designs: `samples/make_samples.py` (writes the old paper sheet `sample-stickmen.png` and the transparent `fighters-layer.svg` used in 3D).
- Original drawings only: no real anime/cartoon characters, logos or official art.

## Format
- **9:16 Shorts first, 30–45 s.** 16:9 longer cuts (60–90 s) later if the owner asks.
- Story of every video:
  1. Hook (first 2 s): the page + "N of YOU. Only 1 wins." 
  2. Drop-in: stick men are drawn onto the page with their names.
  3. Free-for-all: fast fights, eliminations, live "X left" counter on screen.
  4. Final 2: slow-motion showdown.
  5. Winner: crown + name card, then "Comment to join the next brawl."
- Fast cuts, 1–2-frame impact flashes on big hits, one big bold word on screen at a time.
- Sound: SFX from `sfx-library/` (punches, whooshes, booms), plus pen-scribble and paper sounds; light music.
  No voiceover unless the owner sends one.

## Workflow
- Scripts: `scripts/<name>.md`, written **Status: DRAFT**. Only the owner marks **APPROVED**; build the full video
  only after that (and after the owner's voiceover MP3, if the video has narration).
- Video list and status: `IDEAS.md`. First video: **100 Men vs 1 Gorilla** (no followers yet, so it opens with the
  internet's most argued fight debate and asks people to comment "ME" to be in the next brawl).
- Fight engine test: `samples/fight15/` (`fight15.html` = poses, keyframed fighters, hits, KOs, camera; 
  `render_fight15.cjs` renders frames and mixes SFX). Build real videos from this engine.

## Followers (fighters)
- Names come from people who **commented to join** (opt-in) on the owner's posts. Use only public usernames from
  people who opted in; never real faces, photos or private info.
- Ask the owner how the winner is picked (random with a shown seed, or the owner picks) before each video.

## Rules
- **NO PAID AI SERVICES (owner, Nov 18, 2026):** never call Google Gemini / Nano Banana / Omni or ElevenLabs, and
  never ask for their keys. Work only with what is in the repo and free local tools. Ask the owner before anything
  that costs money.
- Never use audio or footage taken from someone else's video.
- TubeAlfred credits are shared with the owner's other channel: max 3 calls per video, none below 15 left.
- Push straight to `main`.

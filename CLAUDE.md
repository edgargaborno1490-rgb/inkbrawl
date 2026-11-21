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
- **STYLE MASTER (owner, Nov 21, 2026): `reference/style-master.png`** (the owner made it). Every stick man is drawn in
  that style: cute big round heads, black oval eyes, little grey blush marks, "^ ^" happy eyes, angry slanted brows
  when attacking, clean smooth thick black lines (no wobble), small feet, black and white with white-filled
  accessories (headband, scarf, cap, headphones, cape...), soft flat grey shadow under each fighter.
- **Background (owner, Nov 21, 2026):** warm off-white floor `#ece9e3` (light grey-beige), faint scratch lines on the
  floor, soft darker vignette at the edges. Not pure white.
- **3D arena (owner, Nov 21, 2026; like a top-down arena game):** camera above at an angle looking down at the floor;
  fighters stand upright on the floor spread out in depth (closer = bigger), each with a flat soft shadow ellipse.
  Samples: `samples/style3d/` (`sample3d.html`, `render_samples.cjs`, `sample-*.png`). Build videos from that look.
- **Name tags:** plain black lettering above each head. No oval, no box.
- Color only on powers and hits (yellow impact stars, a colored energy beam); fighters stay black and white.
- Ink splats where fighters fall, an eraser wipe when one is knocked out, speed lines, dust puffs.
- Original drawings only: no real anime/cartoon characters, logos or official art. Don't copy stock images.

## Format
- **9:16 TikTok videos, about 1:00–1:10** (owner, Nov 21, 2026).
- Story of every video:
  1. Hook (first 2 s): the page + "N of YOU. Only 1 wins." 
  2. Drop-in: stick men are drawn onto the page with their names.
  3. Free-for-all: fast fights, eliminations, live "X left" counter on screen.
  4. Final 2: slow-motion showdown.
  5. Winner: crown + name card, Top 3 leaderboard, progress bar to the next boss, then "comment the fighter you want to be".
- Fast cuts, 1–2-frame impact flashes on big hits, one big bold word on screen at a time.
- Sound: SFX from `sfx-library/` (punches, whooshes, booms), plus pen-scribble and paper sounds; light music.
  No voiceover unless the owner sends one.

## Workflow
- Scripts: `scripts/<name>.md`, written **Status: DRAFT**. Only the owner marks **APPROVED**; build the full video
  only after that (and after the owner's voiceover MP3, if the video has narration).
- Video list and status: `IDEAS.md`. First video: **100 Men vs 1 Gorilla** (no followers yet, so it opens with the
  internet's most argued fight debate; the gorilla wins; ends with power levels, boss milestones and "comment the fighter you want to be").
- **CHARACTER ART = THE OWNER'S OWN DRAWINGS, TRACED (owner, Nov 21, 2026).** Don't redraw characters in code: code
  only approximates. The owner makes sprite sheets in ChatGPT (one character, 8 poses in a 2x4 grid on white: idle,
  punch, kick, hit, fly, ko, run, win) saved in `reference/sprites/<name>-sheet.png`.
  `samples/sprites/trace_sprites.py` cuts every pose out and traces it to vectors with potrace (white body fill, grey
  details, black ink, effect marks kept) -> `sprites.js`. `sprite-check.html/png` = check sheet (red dot = foot anchor).
  `sprite-test.html` + `render_sprite_test.cjs` -> `sprite-test.mp4` = 6 cap guys vs gorilla, pose-to-pose in the 3D
  arena. New characters: ask the owner for a sprite sheet, add its name in `trace_sprites.py`, re-run.
  Setup: `apt-get install -y potrace` and `pip install scipy` (numpy + Pillow already there).
- **Fight engine (current): `samples/style3d/`.** `ink.js` = the shared drawing library (style-master stick men,
  outfits/kits, poses, 3D arena camera, floor, stars, sparkles). `fight3d.html` = the 15 s 3D fight (keyframed
  fighters with depth lanes, hits, KOs, smoke-puff knockouts, camera moves, words, counter); `render_fight3d.cjs`
  renders frames and mixes SFX. `sample3d.html` + `render_samples.cjs` = the still picture samples.
- **Gorilla (owner's design, Nov 21, 2026): `reference/gorilla-master.png`.** Drawn in code in
  `samples/style3d/gorilla.js` (big domed head with crest, peanut face, furry bulky arms with fluffy edges + mitt
  fists, short legs; poses STAND/ROAR/SWINGR/SWINGL/RAISE/SLAM/TIRED). Pose sheet: `gorilla-sheet.html/png`.
  Sample: `gorilla-sample.html` + `render_gorilla.cjs` -> `gorilla-sample.mp4` (100 men vs 1 gorilla, 15 s).
- Old looks, don't use: `samples/make_samples.py`, `samples/canvas3d.*`, `samples/fight15/`.

## Platform + progression (owner, Nov 21, 2026)
- **TikTok only.** Every video is 9:16 (no 16:9 cut). Aim for just over 1 minute and at most 1:10 (TikTok's creator
  rewards later need videos over 1 minute).
- **Boss ladder + power levels: see `PROGRESSION.md`** (the full plan). Follower milestones (10, 25, 50, 100, 500,
  1k, 2.5k, 5k, 10k) each unlock an all-followers boss fight; 100 = the gorilla REMATCH. After 10k: original
  anime-style bosses only (never real anime characters or look-alikes). Fans level up from TikTok comments (XP),
  tracked in `data/leaderboard.csv` + `data/comments/`, read from the owner's comment screenshots.
- TubeAlfred is YouTube-only: not used for TikTok.

## Characters (roster)
- **Now (owner, Nov 21, 2026): only 2 stick man designs** + the gorilla, all from the owner's sprite sheets:
  `capguy` = backwards cap + hoodie (`reference/sprites/capguy-sheet.png`), `tee` = backwards cap + T-shirt
  (`tee-sheet.png`), `gorilla` (`gorilla-sheet.png`). Mix hoodie and T-shirt guys in every crowd.
- **Choose your fighter (owner, Nov 21, 2026):** viewers comment the character they want to be (anything). The most
  requested gets drawn next (owner's sprite sheet), everyone who asked fights as it, and the video shouts out who
  requested it ("NINJA UNLOCKED! Requested by @name and N others"). Counts in `data/requests.csv`; rules in
  `PROGRESSION.md` section 2. Don't invent new designs or redraw them in code.

## Followers (fighters)
- **Every follower joins the fight (owner, Nov 21, 2026).** No "comment to join" needed. Use only followers' public
  usernames (the owner provides the list); never real faces, photos or private info.
- Videos end with **"Comment the fighter you want to be"** (see Characters), not "comment ME".
- Ask the owner how the winner is picked (random with a shown seed, or the owner picks) before each video.
- Voiceovers: the owner may make the MP3 themselves (e.g. in ElevenLabs) and send it. Claude still never calls
  ElevenLabs or any paid AI service itself.

## Rules
- **NO PAID AI SERVICES (owner, Nov 18, 2026):** never call Google Gemini / Nano Banana / Omni or ElevenLabs, and
  never ask for their keys. Work only with what is in the repo and free local tools. Ask the owner before anything
  that costs money.
- Never use audio or footage taken from someone else's video.
- TubeAlfred credits are shared with the owner's other channel: max 3 calls per video, none below 15 left.
- Push straight to `main`.

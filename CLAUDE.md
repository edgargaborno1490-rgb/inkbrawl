# Project notes for Claude

**Ink Brawl** (repo `inkbrawl`). **NEW FORMAT (owner, Nov 21, 2026; replaces the anime "Who Would Win" format):**
a free-for-all stick man battle royale in a 3D arena. **The stick men are the owner's followers.** Every video is a
brawl between many stick men (or all followers vs a boss), each one carrying a follower's name.
The old anime format (Naruto vs Luffy etc.) is retired; its notes live in git history and `IDEAS.md`.

It is separate from **WhiteBucket Explains** (`whitebucket-studio`), **AI Club Town** (`AI_club_town`) and
Kanaktical (`aloha-armor-forge`): never touch those repos from here.

**For any video, use the `brawl-video` skill (`.claude/skills/brawl-video/SKILL.md`).** It covers script -> the owner's
MP3 -> word timings -> 9:16 video page -> render -> sound -> cover/caption -> fan data, plus adding new characters.
Videos live in `growkaz-stickman-studio/projects/<slug>/` (reference build: `100-men-vs-gorilla`). The old
`fight-video` skill is for the retired anime format: don't use it.

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
- Hits: yellow impact stars, shockwave rings, floor cracks, 1-2 frame white flashes, camera shake; knocked-out
  fighters lie down, then vanish in a cartoon smoke puff; speed lines and dust puffs come from the sprites.
- Original drawings only: no real anime/cartoon characters, logos or official art. Don't copy stock images.

## Format
- **9:16 TikTok videos, about 1:00–1:10** (owner, Nov 21, 2026).
- Story of every video:
  1. Hook (first 2 s): the arena + "N of YOU. Only 1 wins."
  2. Drop-in: the fighters land in the arena with their names.
  3. Free-for-all: fast fights, eliminations, live "X left" counter on screen.
  4. Final 2: slow-motion showdown.
  5. Winner: crown + name card, Top 3 leaderboard, progress bar to the next boss, then "comment the fighter you want to be".
- Fast cuts, 1–2-frame impact flashes on big hits, one big bold word on screen at a time.
- Sound: the owner's voiceover (ElevenLabs, made by the owner), SFX from `sfx-library/`, light generated music
  (`growkaz-stickman-studio/audio/music.py`) ducked under the voice, -14 LUFS.

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
- **Engine:** `samples/style3d/ink.js` = shared library (3D arena camera incl. 9:16, floor scratches, scene depth
  sorting, stars, sparkles, impact marks); `samples/sprites/sprites.js` = the traced characters.
- **Video #1 made (Nov 21, 2026): 100 Men vs 1 Gorilla** -> `growkaz-stickman-studio/projects/100-men-vs-gorilla/final/`
  (mp4, cover, caption). Channel bio + caption style: `CHANNEL.md`.
- Old experiments, don't use for new videos: `samples/make_samples.py`, `samples/canvas3d.*`, `samples/fight15/`,
  the code-drawn stick men in `samples/style3d/ink.js` (`fighter()`) and the code-drawn gorilla
  (`samples/style3d/gorilla.js`, `gorilla-sample.*`). Characters now come only from the traced sprite sheets.

## Platform + progression (owner, Nov 21, 2026)
- **TikTok only.** Every video is 9:16 (no 16:9 cut). Aim for just over 1 minute and at most 1:10 (TikTok's creator
  rewards later need videos over 1 minute).
- **Boss ladder + power levels: see `PROGRESSION.md`** (the full plan). Follower milestones (10, 25, 50, 100, 500,
  1k, 2.5k, 5k, 10k) each unlock an all-followers boss fight; 100 = the gorilla REMATCH. After 10k: original
  anime-style bosses only (never real anime characters or look-alikes). Fans level up from TikTok comments (XP),
  tracked in `data/leaderboard.csv` + `data/comments/`, read from the owner's comment screenshots.
- TubeAlfred is YouTube-only: not used for TikTok.

## Characters (roster)
- **Roster (owner's sprite sheets in `reference/sprites/`):** `capguy` (backwards cap + hoodie), `tee` (backwards cap +
  T-shirt), `caveman`, `samurai`, `ninja` (added Nov 21, 2026), `trainer` (beast tamer + husky partner drawn in every pose;
  unlocked Nov 21, 2026 for the first follower, kyleeee_017, with 1 request as the owner's exception), and the boss `gorilla`. Crowds mix hoodie and T-shirt
  guys; caveman / samurai / ninja / trainer go to the fans who asked for them.
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

---
name: brawl-video
description: Make one Ink Brawl TikTok video (stick man brawls / boss fights in the 3D arena, the owner's traced sprite characters), start to finish - DRAFT script, then after APPROVED + the owner's voiceover MP3 - word timings, the 9:16 video page, render, SFX + music mix, cover, caption, and the fan data (XP, levels, character requests). Also covers adding a new character from the owner's sprite sheet. Use for "new video", "next brawl", "boss fight", "here's the MP3", "APPROVED", "make the <boss> video", "add this character", "here are the comment screenshots", "update the leaderboard".
---

# Ink Brawl video (TikTok, 9:16)

`CLAUDE.md` and `PROGRESSION.md` win over anything here. One video per chat. Reference build (copy it):
`growkaz-stickman-studio/projects/100-men-vs-gorilla/` (video #1, made Nov 21, 2026).

## 0. Setup in a fresh container (free tools only)
```bash
apt-get install -y potrace          # sprite tracing
pip install scipy pocketsphinx      # tracer + offline word alignment (Whisper's model download is blocked here)
```
Playwright + Chromium are pre-installed (`NODE_PATH=$(npm root -g) node ...`). ffmpeg is installed.
Never call Gemini / ElevenLabs / any paid AI. The owner makes voiceovers and sprite sheets themselves.

## 1. Script (stop at DRAFT)
- Write `scripts/<slug>.md` with **Status: DRAFT**: spoken script (~170-185 words = 1:00-1:10 at an energetic pace;
  aim just over 1 minute, max 1:10), a visual plan table (line -> picture -> on-screen word), and notes (facts hedged,
  sources). Add a row to `IDEAS.md`.
- Every video ends with: how Ink Brawl works (follow = you become a fighter, comment = you get stronger), the next boss
  milestone, and "Comment the fighter you want to be". No "comment ME".
- Ask the owner who wins (or random with a shown seed) before writing the fight. Only the owner marks APPROVED.
- Give the owner the final text to paste into ElevenLabs. Wait for the MP3.

## 2. Voiceover -> word timings
```bash
cd growkaz-stickman-studio
cp -r projects/100-men-vs-gorilla projects/<slug>       # then clear out/ and final/ in the copy
cp <mp3> ../voiceovers/<slug>.mp3 && cp <mp3> projects/<slug>/audio/voiceover.mp3
# projects/<slug>/input/script.txt = the spoken script only (exact words of the recording)
python3 tools/align_sphinx.py --project projects/<slug>          # -> timeline/words.json (expect ~100% aligned)
python3 -c "import json;w=json.load(open('projects/<slug>/timeline/words.json'))['words'];open('projects/<slug>/timeline/words.js','w').write('const VO_WORDS = '+json.dumps([[x['word'],round(x['start'],3),round(x['end'],3)] for x in w])+';\n')"
```
Check `timeline/transcript.txt` for the length (must be <= 70 s).

## 3. The video page (`projects/<slug>/video.html`)
Plain HTML/SVG, 1080x1920, drawn per frame by `window.setT(seconds)`; `window.VIDEO_END` = length.
Libraries: `samples/style3d/ink.js` (camera, floor, stars, sparkles, marks; `camera({..., cx: 540, cy: ...})` for 9:16)
and `samples/sprites/sprites.js` (the owner's traced characters).
- **Time everything from the voice:** `T(word, n)` = start of the n-th occurrence of a word. Watch for repeated words
  ("hundred", "comment", "Fifty" appear several times: pick the right n, then check stills).
- **Characters:** only sprites from `sprites.js` via `spr(who, pose, k)` (`<use>` of symbols built once, so 100+ fighters
  stay fast). Poses: idle, punch, kick, hit, fly, ko, run, win. Pose-to-pose like a flipbook; motion comes from moving
  positions, run bounce, hit shudder, fly arc + spin, smoke puff + fade after a KO. Bosses ~2.3x a fighter.
- **Never redraw a character in code.** Missing a character/boss? Ask the owner for its sprite sheet (section 6).
  Until then use a locked "?" card or the grey `GHOST` outline.
- Fighters: hoodie (`capguy`) + T-shirt (`tee`) mix by default; fans who requested caveman / samurai / ninja (or later
  unlocks) fight as those. Name tags = plain black text (followers' public usernames from the owner's list).
- Screen layout (TikTok UI): big word at top ~y 210 (one word at a time, auto-fit, no wrap), counter ~y 440, keep the
  bottom ~350 px and right ~150 px free of important things.
- Effects: yellow impact stars + `marks`, shockwave rings on the floor, floor cracks, white 1-2 frame flash on big hits,
  camera shake, sparkles for winners, crown on the winner. Color only on powers/hits.
- Use 1850 focal length for 9:16 so fighters fill the frame; hard cuts = two camera keys 0.01 s apart.

## 4. Check, render, sound
```bash
cd growkaz-stickman-studio/projects/<slug>
NODE_PATH=$(npm root -g) node render.cjs --stills 1,9,16,24,33,41,53,62   # out/stills/s-<t>.png - LOOK at them
NODE_PATH=$(npm root -g) node render.cjs          # ~3-4 min, run in background -> out/video-silent.mp4
cd ../.. && python3 projects/<slug>/sound.py       # VO + sfx-library hits + generated music ducked under the voice
```
- `sound.py`: list SFX at voice-word times (`sfx-library/sounds.tsv` describes each file); music plan = sections of
  moods (`audio/music.py --list`); output is -14 LUFS for TikTok -> `out/<slug>.mp4`.
- Check frames from the final mp4 (ffmpeg -ss), duration, and loudness (`ebur128`).
- Don't `rm` with globs after `cd` (a safety check blocks it); overwrite files instead.

## 5. Cover, caption, save
- Cover: screenshot of a strong frame with the title overlaid (`out/cover.png`); caption + hashtags + pinned comment
  in `out/post.md` (see `CHANNEL.md` for the bio and the caption style).
- `out/` is git-ignored: copy the final mp4, cover and post into `projects/<slug>/final/` and commit them.
- Update `IDEAS.md` (MADE + date + paths) and the script's Status. Commit and push to `main`.

## 6. New character from the owner's sprite sheet
1. Owner makes it in ChatGPT: one character, 8 poses, 2 rows x 4 on white, same style as `reference/style-master.png`
   (idle, punch, kick, hit, fly, ko, run, win).
2. Save as `reference/sprites/<name>-sheet.png`, add `<name>` to the list at the bottom of
   `samples/sprites/trace_sprites.py`, run `python3 samples/sprites/trace_sprites.py`.
3. Add the row to `samples/sprites/sprite-check.html`, render it, and look: every pose present, marks (speed lines,
   sweat, swirl, dust) on the right pose, red foot dot under the feet. The tracer already handles drawings that touch
   the sheet edge and characters drawn in more than one piece.
4. Add it to the roster in `CLAUDE.md` and mark it `unlocked` in `data/requests.csv`.

## 7. After posting: fans, XP, requests
The owner sends the follower count + screenshots of the comments (and of the followers list). Then, per
`PROGRESSION.md`: write `data/comments/<slug>.csv`, update `data/leaderboard.csv` (XP, streak, level, character) and
`data/requests.csv`, tell the owner the most requested character (= next sprite sheet) and whether a boss milestone
was reached (= the next video is a boss fight).

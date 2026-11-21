# Ink Brawl progression: boss ladder + power levels

Owner's plan (Nov 21, 2026). Platform: **TikTok only** (9:16). Every follower is a stick man in the fight.

## 1. Boss ladder (follower milestones)

Each follower goal unlocks one boss video: **all followers vs the boss**. Normal follower free-for-alls fill the time
between bosses. Every video shows a progress bar to the next boss, e.g. `NEXT BOSS: 63/100 FOLLOWERS`.

| Followers | Boss | Notes |
|---|---|---|
| 10 | Angry goose | small, fast, honks; easy first win |
| 25 | Boxing kangaroo | kicks + punches |
| 50 | Grizzly bear | |
| **100** | **Silverback gorilla: the REMATCH** | video #1 showed 100 men losing; now 100 real followers try again |
| 500 | T-rex | |
| 1,000 | Giant robot | |
| 2,500 | Dragon | |
| 5,000 | City-sized monster (kaiju) | |
| 10,000 | Final boss: the giant hand holding the pen that draws everyone | |
| 10,000+ | **Anime-style bosses** (see rule below) | |

- Each boss needs one sprite sheet from the owner (ChatGPT, same 2x4 grid: idle, punch, kick, hit, fly, ko, run,
  win), traced in with `samples/sprites/trace_sprites.py`. Bosses can be drawn bigger than the 8-pose stick men.
- Who wins a boss fight: the owner decides before each video (bosses can win or lose; a loss = rematch later).
- **Anime bosses after 10,000:** only **original** anime-style bosses (e.g. a sword demon, a thunder ninja, a nine-
  tailed spirit fox, a giant mech pilot). Never real anime characters, their names or look-alikes (copyright, and
  TikTok removes or mutes those videos). The project rule "original drawings only" still applies.

## 2. Choose your fighter (owner, Nov 21, 2026)

Viewers pick what character they want to be by commenting it ("I want to be a ninja", "make me a pirate", anything).
This replaces the fixed caveman / gym rat / samurai / fisherman vote.

1. Claude reads the requests from the owner's comment screenshots and counts them in `data/requests.csv`
   (`character,requests,requested_by,status`) and in `data/leaderboard.csv` (`character` column = what each fan asked for).
2. **The most-requested character gets drawn next:** the owner makes its 8-pose sprite sheet in ChatGPT (same 2x4 grid),
   Claude traces it in (`samples/sprites/trace_sprites.py`) and it joins the roster.
3. Everyone who asked for an unlocked character fights as it from then on. Fans whose pick isn't drawn yet fight as
   the hoodie or T-shirt guy until it unlocks.
4. **Shout-out** at the start of the video that unlocks it: "NINJA UNLOCKED! Requested by @name and 13 others"
   (the first fan who asked gets the name on screen).
5. Each video's ending asks: "Comment the fighter you want to be." A request comment also earns XP (it's a comment).
6. Never draw or allow real anime/cartoon characters or look-alikes; suggest an original version instead
   (e.g. "spiky-haired fighter" instead of a named anime hero). Owner, Nov 21, 2026: tell fans this in the videos
   ("we can't copy Naruto, Goku or Ash, but ask anyway and we'll make our own version"); a request for a named
   character counts toward its original version ("pokemon trainer" -> `trainer`).

## 3. Power levels (loyal fans get stronger)

**XP comes from TikTok comments** (the only per-person activity we can see).

| Action | XP |
|---|---|
| Comment on a video (only 1 comment per video counts, spam gives nothing) | +1 |
| Commented on the previous video too (streak) | +1 bonus |
| Asks for a character ("I want to be a ...") | counts as their comment (+1) |

| Level | XP | What it looks like in the fight |
|---|---|---|
| Lv 1 | 0 | plain stick man, name tag |
| Lv 2 | 3 | "Lv 2" next to the name + a small spark |
| Lv 3 | 6 | takes one extra hit before going down |
| Lv 4 | 10 | colored power aura (color only on powers, per the look rules) |
| Lv 5 | 15 | special move (dash punch or ground slam) |
| Lv 6 Legend | 25 | Legend crown outline, slightly bigger, both perks above |

- **Fair play:** a higher level raises a fighter's chance to last longer/win, never guarantees it. Each fighter's
  weight in the random draw = `1 + 0.25 x (level - 1)`, so a Legend is about 2x as likely as a new follower to win,
  and new people can still win. The seed is shown on screen so nobody can say it was rigged.
- **No plot armor (owner, Nov 21, 2026):** when the owner picks a winner, it's the one that makes sense (e.g. ninja
  beats trainer), never a favourite. Video #2: @bombardinocrocodilee (ninja) beats @kyleeee_017 (trainer).
- **Seasons:** every 3 months XP is cut in half (not wiped), so newer fans can catch up. Announce it in a video.
- **Leaderboard on screen:** end each free-for-all with "Top 3 strongest followers" (name + level).
- Never reward spam, bots, buying comments or anything that breaks TikTok's rules on fake engagement.

## 4. How we track it on TikTok

TikTok has no free comment export for small creators (its research API is only for academics), and Claude's
YouTube tool (TubeAlfred) does not cover TikTok. So:

1. **Free way (start here):** after each video, the owner sends **screenshots of the comment list** (scroll through
   it, screenshot every screen) and, for the free-for-alls, of the **followers list**. Claude reads the usernames
   from the screenshots and updates the files below. Fine up to a few hundred comments per video.
2. **Later, when there are too many comments:** a comment-export website (several have free tiers, paid above
   that) gives a CSV that Claude reads directly. Ask the owner before anything that costs money.

Files:
- `data/leaderboard.csv`: one row per follower: `username,xp,level,streak,character,last_video,joined,notes`.
- `data/requests.csv`: character requests: `character,requests,requested_by,status` (status: requested / drawing / unlocked).
- `data/comments/<video-slug>.csv`: who commented on each video (from the screenshots/export):
  `username,commented,requested_character`.
- Claude updates both before each new video, then uses the leaderboard for name tags, levels and perks.

## 5. Each new video, step by step

1. Owner sends: follower count, followers list screenshots, comment screenshots of the last video, voiceover MP3.
2. Claude updates `data/comments/`, `data/leaderboard.csv` (XP, streaks, levels, characters) and `data/requests.csv`;
   tells the owner which character is most requested (= next sprite sheet to make).
3. Next boss check: if a milestone was passed, the next video is the boss fight; otherwise a free-for-all.
4. Build the video: every follower as a stick man (hoodie / T-shirt mix), level perks on screen, progress bar to the
   next boss, Top 3 leaderboard, unlock shout-outs, "comment the fighter you want to be" at the end.

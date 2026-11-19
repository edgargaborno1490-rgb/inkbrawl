# Handoff: new art style, made free on the owner's PC

Written Nov 19, 2026 for a Claude Code session running **on the owner's Windows PC** (Claude desktop app → Code tab,
in the `inkbrawl` folder). The cloud session could not reach the PC (Remote Control folder "not available" to cloud
sessions), so this session does the local setup. Read `CLAUDE.md` first; its rules still apply.

## The PC
- Windows, **AMD RX 7900 GRE (16 GB VRAM, RDNA3 / gfx1100)**, Ryzen 7 5700G, ASUS TUF X570, **32 GB RAM**.
- No paid AI services (owner rule). Everything below is free and runs on this PC.

## The new look (owner, Nov 19, 2026)
The owner wants the style of `reference/ref1-naruto-vs-aang.mov`, `ref2.mov`, `ref3-sakura-vs-sukuna.mp4`
(see the `*-sheet.png` contact sheets), "exactly the same":
- **Faceless fighters:** solid dark heads and skin, no eyes, no mouth. Recognized only by hair shape, outfit colors
  and signature moves.
- **Pale washed backgrounds:** off-white / beige skies, soft misty grass fields, desert cliffs, tiled arena floors,
  lots of empty space, low contrast.
- **Clean thin ink lines, flat cel colors,** little shading; calm, minimal.
- **Bright color only on powers:** fire, water, glowing hands, aura bubbles, impact flashes.
- Same editing as before: fast cuts, huge close-ups (fists, feet, torsos), one bold white word on screen.

Make **original** drawings in this style. Do not copy that channel's shots, and do **not** train on frames from
those videos. Use them only to judge whether our pictures match.

## Plan (do in order, show the owner after each step)
1. **GPU check.** Latest AMD Adrenalin driver. Confirm the 7900 GRE is used (Task Manager → GPU load during a run).
2. **Install ComfyUI** for AMD on Windows. Prefer ComfyUI's AMD/ROCm Windows build (PyTorch ROCm for Windows supports
   RX 7900 cards). If that fails, fall back to ComfyUI-Zluda. DirectML only as a last resort (slow). Put it in
   `C:\AI\ComfyUI` (outside the repo; models are huge and must never be committed).
3. **Image model:** a free anime SDXL checkpoint (an Illustrious-XL / NoobAI-XL family model). Check its license
   allows commercial YouTube use. Work at 1344×768 (16:9), downscale/crop for 9:16.
4. **Style test:** prompt for the look above. Example base prompt:
   `anime cel shading, thin clean black lineart, flat colors, faceless character, head and skin solid dark charcoal
   silhouette, no facial features, pale off-white misty sky, washed out grass field, minimal background, wide shot`
   Negative: `eyes, mouth, nose, facial features, detailed face, saturated background, heavy shading, text, logo,
   watermark`. Make ~12 test pictures of Naruto-like and Luffy-like fighters (describe by look, not name), plus
   close-ups (fist, foot, torso). Make a contact sheet and **show the owner before going further.**
5. **Style LoRA (optional, after the owner approves a set):** train a small SDXL LoRA only on our own approved
   pictures (20–40 images) so every fighter comes out the same. 16 GB VRAM is enough for SDXL LoRA training.
6. **Animation:** **Wan 2.2 image-to-video** in ComfyUI. With 32 GB RAM use the quantized **GGUF 14B I2V**
   (Q4/Q5, high+low noise) plus a 4-step speed LoRA; also try **Wan 2.2 TI2V-5B** and keep whichever looks better.
   Time one 3–5 s clip at 832×480 and report real speed to the owner (expect minutes per clip; long jobs overnight).
7. **Into the studio:** keyframes → `growkaz-stickman-studio/projects/<matchup>/keyframes/`, clips →
   `.../clips/`. Then the normal `fight-video` skill steps (render 16:9 + 9:16, `sfx-library/` SFX, captions).

## Rules reminder
- Nothing that costs money without asking the owner.
- Never commit model files or ComfyUI itself; commit only our keyframes, clips (if size allows), scripts and notes.
- Script status rules, story format and 60–80 s length are unchanged (`CLAUDE.md`).

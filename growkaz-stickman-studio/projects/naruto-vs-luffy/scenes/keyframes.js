// keyframes.js — Naruto vs Luffy. Each story beat plays its animated Omni clip (build/clipframes/gNN/*.jpg, 24 fps)
// at NORMAL speed, with a short crossfade from the previous beat's clip so it reads as one continuous fight.
// Falls back to the still keyframe when a beat has no clip. Only the biggest hits get a white flash + shake.
// Captions come from _captions.js.
import { E, registerShot, clamp, ease, prog } from '/engine/core.js';
import './_captions.js';

const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
const IMG = {};
await Promise.all(E.shots.map(async s => {
  const p = s.params || {}; if (!p.kf) return;
  IMG[s.id] = { h: await load(`/project/keyframes/169/${s.id}.png`) };
}));

// beats (groups) in time order
const G = []; for (const s of E.shots) { const p = s.params || {}; if (p.g && !G.find(x => x.g === p.g)) G.push({ g: p.g, start: p.gStart, len: p.gLen, frames: p.gFrames }); }
const XF = 0.25;                                              // crossfade seconds between beats
const beatAt = t => { let b = null; for (const x of G) if (t >= x.start - 1e-6) b = x; return b; };
const urlFor = (b, t) => {
  if (!b || !b.frames) return null;
  const sp = clamp(b.frames / 24 / b.len, 1, 1.25);                       // near-normal speed: at most 1.25x so each beat finishes
  const idx = clamp(1 + Math.floor((t - b.start) * 24 * sp), 1, b.frames);  // hold last frame if the clip is short
  return `/project/build/clipframes/${b.g}/${String(idx).padStart(4, '0')}.jpg`;
};
const FR = new Map();
async function want(u) { if (!u || FR.has(u)) return; FR.set(u, await load(u)); while (FR.size > 16) FR.delete(FR.keys().next().value); }
window.PREP = async f => {
  const t = f / E.fps, b = beatAt(t); await want(urlFor(b, t));
  const i = G.indexOf(b); if (i > 0 && t - b.start < XF) await want(urlFor(G[i - 1], t));
};

const F = () => 1 / E.fps;
const shake = (t, i, amp) => [amp * Math.sin(t * 71 + i * 1.7) * Math.cos(t * 23 + i), amp * Math.sin(t * 53 + i * 2.3) * Math.cos(t * 31)];
function cover(g, img, z, ox, oy, a = 1) {
  const sc = Math.max(E.W / img.width, E.H / img.height) * z, w = img.width * sc, h = img.height * sc;
  g.save(); g.globalAlpha = a; g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(img, E.W / 2 - w / 2 + ox, E.H / 2 - h / 2 + oy, w, h); g.restore();
}

function draw(g, t, info) {
  const s = info.shot, p = s.params, i = p.i, T = s.start + t;
  g.fillStyle = '#fff'; g.fillRect(0, 0, E.W, E.H);
  if (p.big && t < F()) return;                                // biggest hits: one pure white frame
  const b = beatAt(T), bi = G.indexOf(b), cur = FR.get(urlFor(b, T));
  let ox = 0, oy = 0, z = 1.0;
  if (p.big) { const a = 18 * (1 - prog(t, 0, 0.3)) ** 2; [ox, oy] = shake(t, i, a); z = 1.0 + 0.04 * (1 - ease.out(prog(t, 0, 0.25))); }
  if (cur) {
    const into = T - b.start;
    if (bi > 0 && into < XF) { const prev = FR.get(urlFor(G[bi - 1], T)); if (prev) cover(g, prev, 1.0, 0, 0); cover(g, cur, z, ox, oy, ease.inOut(into / XF)); }
    else cover(g, cur, z, ox, oy);
  } else if (IMG[s.id]?.h) {                                   // no clip yet: still keyframe with a gentle push
    const k = clamp(t / info.dur); cover(g, IMG[s.id].h, 1.03 + 0.06 * k, ox, oy);
  }
  if (p.big && t >= F()) { const a = 0.35 * (1 - prog(t, F(), 0.12)); if (a > 0) { g.fillStyle = `rgba(255,255,255,${a})`; g.fillRect(0, 0, E.W, E.H); } }
  if (p.sepia) { g.save(); g.globalCompositeOperation = 'color'; g.fillStyle = 'rgba(150,110,60,0.75)'; g.fillRect(0, 0, E.W, E.H); g.restore(); }
}

for (const s of E.shots) if (s.params?.kf) registerShot(s.id, { kind: '2d', draw });

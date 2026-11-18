// keyframes.js — Naruto vs Luffy. Each shot plays its beat's animated Omni clip (build/clipframes/gNN/*.jpg, 24 fps,
// time-fitted to the beat) and falls back to the still keyframe (keyframes/169 or 916) when no clip exists.
// On top: shake + white/inverted flash frames on hits, sepia for the flashback. Captions come from _captions.js.
import { E, registerShot, clamp, ease, prog } from '/engine/core.js';
import './_captions.js';

const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
const IMG = {};
await Promise.all(E.shots.map(async s => {
  const p = s.params || {}; if (!p.kf) return;
  IMG[s.id] = { h: await load(`/project/keyframes/169/${s.id}.png`), v: E.vertical && p.v ? await load(`/project/keyframes/916/${s.id}.png`) : null };
}));

// ---- clip frames: loaded per output frame by window.PREP (render.mjs awaits it before renderFrame)
const FR = new Map();                       // url -> Image (small LRU)
function clipUrl(t) {
  const s = E.shots.find(x => t < x.end) || E.shots[E.shots.length - 1], p = s.params || {};
  if (!p.g || !p.gFrames) return null;
  const k = clamp((t - p.gStart) / p.gLen, 0, 0.9999), idx = 1 + Math.floor(k * p.gFrames);
  return `/project/build/clipframes/${p.g}/${String(idx).padStart(4, '0')}.jpg`;
}
window.PREP = async f => {
  const u = clipUrl(f / E.fps); if (!u || FR.has(u)) return;
  const im = await load(u); FR.set(u, im);
  while (FR.size > 12) FR.delete(FR.keys().next().value);
};

const F = () => 1 / E.fps;
const shake = (t, i, amp) => [amp * Math.sin(t * 71 + i * 1.7) * Math.cos(t * 23 + i), amp * Math.sin(t * 53 + i * 2.3) * Math.cos(t * 31)];

function draw(g, t, info) {
  const s = info.shot, p = s.params, i = p.i, d = info.dur, k = clamp(t / d);
  g.fillStyle = '#fff'; g.fillRect(0, 0, E.W, E.H);
  if (p.flash && t < F()) return;                               // frame 0 of a hit: pure white
  const cu = clipUrl(s.start + t), clip = cu && FR.get(cu);
  const set = IMG[s.id] || {}, img = clip || (E.vertical && set.v) || set.h;
  if (!img) return;
  const iw = img.width, ih = img.height, cover = Math.max(E.W / iw, E.H / ih);
  let z, dx = 0, dy = 0; const alt = i % 2 ? 1 : -1;
  if (clip) { z = 1.02 + (p.flash ? 0.06 * (1 - ease.out(prog(t, 0, 0.2))) : 0); }   // real motion: only a hit punch-in
  else if (p.kind === 'CU' || p.kind === 'FX') { z = 1.04 + 0.2 * (1 - ease.out(prog(t, 0, 0.22))) + 0.05 * k; dx = alt * 0.012 * k; dy = -0.008 * k; }
  else if (p.kind === 'W') { z = i % 3 === 0 ? 1.12 - 0.08 * ease.sine(k) : 1.03 + 0.09 * k; dx = alt * (0.03 - 0.06 * k); }
  else { z = 1.05 + 0.1 * ease.out(k); dx = alt * 0.02 * k; dy = 0.01 * k; }
  const sc = cover * z, w = iw * sc, h = ih * sc;
  const roomX = Math.max(0, w - E.W) / 2, roomY = Math.max(0, h - E.H) / 2;
  let ox = clamp(dx * E.W, -roomX, roomX), oy = clamp(dy * E.H, -roomY, roomY);
  if (p.flash) { const a = 30 * (1 - prog(t, 0, 0.35)) ** 2; const [sx, sy] = shake(t, i, a); ox += sx; oy += sy; }
  g.save();
  if (p.flash && t < 2 * F()) g.filter = 'invert(1)';         // frame 1 of a hit: inverted impact frame
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(img, E.W / 2 - w / 2 + ox, E.H / 2 - h / 2 + oy, w, h);
  g.restore();
  if (p.flash && t >= 2 * F()) { const a = 0.5 * (1 - prog(t, 2 * F(), 0.15)); if (a > 0) { g.fillStyle = `rgba(255,255,255,${a})`; g.fillRect(0, 0, E.W, E.H); } }
  if (p.sepia) { g.save(); g.globalCompositeOperation = 'color'; g.fillStyle = 'rgba(150,110,60,0.75)'; g.fillRect(0, 0, E.W, E.H); g.restore(); }
}

for (const s of E.shots) if (s.params?.kf) registerShot(s.id, { kind: '2d', draw });

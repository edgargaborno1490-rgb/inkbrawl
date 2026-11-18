// keyframes.js — the Nano Banana version: every shot is one AI keyframe (keyframes/169 or keyframes/916)
// with a camera move (slam zoom, push, drift, pan), shake + white/inverted flash frames on hits.
import { E, V, registerShot, clamp, ease, prog } from '/engine/core.js';
import './_captions.js';

const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
const IMG = {};
await Promise.all(E.shots.map(async s => {
  const p = s.params || {}; if (!p.kf) return;
  IMG[s.id] = { h: await load(`/project/keyframes/169/${s.id}.png`), v: E.vertical && p.v ? await load(`/project/keyframes/916/${s.id}.png`) : null };
}));

const F = () => 1 / E.fps;
// deterministic shake
const shake = (t, i, amp) => [amp * Math.sin(t * 71 + i * 1.7) * Math.cos(t * 23 + i), amp * Math.sin(t * 53 + i * 2.3) * Math.cos(t * 31)];

function draw(g, t, info) {
  const s = info.shot, p = s.params, i = p.i, d = info.dur, k = clamp(t / d);
  const set = IMG[s.id] || {}, img = (E.vertical && set.v) || set.h;
  g.fillStyle = '#fff'; g.fillRect(0, 0, E.W, E.H);
  if (!img) return;
  // flash frames: frame 0 pure white, frame 1 inverted
  if (p.flash && t < F()) return;
  const iw = img.width, ih = img.height, cover = Math.max(E.W / iw, E.H / ih);
  // camera move by shot kind
  let z, dx = 0, dy = 0;
  const alt = i % 2 ? 1 : -1;
  if (p.kind === 'CU' || p.kind === 'FX') {
    z = 1.04 + 0.2 * (1 - ease.out(prog(t, 0, 0.22))) + 0.05 * k;            // slam in, then slow creep
    dx = alt * 0.012 * k; dy = -0.008 * k;
  } else if (p.kind === 'W') {
    z = i % 3 === 0 ? 1.12 - 0.08 * ease.sine(k) : 1.03 + 0.09 * k;          // pull-out or push-in
    dx = alt * (0.03 - 0.06 * k);
  } else {
    z = 1.05 + 0.1 * ease.out(k); dx = alt * 0.02 * k; dy = 0.01 * k;
  }
  const sc = cover * z, w = iw * sc, h = ih * sc;
  // free room around the frame; in 9:16 with a wide image, pan across it
  const roomX = Math.max(0, w - E.W) / 2, roomY = Math.max(0, h - E.H) / 2;
  let ox = clamp(dx * E.W, -roomX, roomX), oy = clamp(dy * E.H, -roomY, roomY);
  if (E.vertical && !set.v) ox = roomX * alt * (0.6 - 1.2 * ease.inOut(k)) * 0.9;
  if (p.flash) { const a = 34 * (1 - prog(t, 0, 0.35)) ** 2; const [sx, sy] = shake(t, i, a); ox += sx; oy += sy; }
  else if (p.kind !== 'W') { const [sx, sy] = shake(t, i, 2.5); ox += sx; oy += sy; }          // handheld jitter
  g.save();
  if (p.flash && t < 2 * F()) g.filter = 'invert(1)';
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(img, E.W / 2 - w / 2 + ox, E.H / 2 - h / 2 + oy, w, h);
  g.restore();
  // short white flare after the flash
  if (p.flash && t >= 2 * F()) { const a = 0.55 * (1 - prog(t, 2 * F(), 0.16)); if (a > 0) { g.fillStyle = `rgba(255,255,255,${a})`; g.fillRect(0, 0, E.W, E.H); } }
  // sepia flashback (Kizaru memory)
  if (p.sepia) { g.save(); g.globalCompositeOperation = 'color'; g.fillStyle = 'rgba(150,110,60,0.75)'; g.fillRect(0, 0, E.W, E.H); g.restore(); }
}

for (const s of E.shots) if (s.params?.kf) registerShot(s.id, { kind: '2d', draw });

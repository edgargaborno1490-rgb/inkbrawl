// _world.js — arenas, camera and action FX for the brown-anime look (pale painted backgrounds, warm grey debris).
import { E, V, clamp, lerp, mix, alpha, rng, noise, ease, layer, shake, key } from '/engine/core.js';
import { OUT } from './_anime.js';

export const CX = () => E.W / 2;
export const GYF = () => E.H * V(0.8, 0.7);

// ---------- camera ----------
// camAt(t, [[t,{x,y,z,r}],...]) + optional shake {at:[times], amp}
export function camAt(t, frames, hits = [], amp = 14) {
  const c = frames ? key(t, frames, ease.out) : { x: 0, y: 0, z: 1 };
  let sx = 0, sy = 0;
  for (const h of hits) { const d = t - h; if (d >= 0 && d < 0.35) { const k = (1 - d / 0.35) ** 2; const [a, b] = shake(t * 40, amp * k, 1, 11); sx += a; sy += b; } }
  return { x: (c.x || 0) + sx, y: (c.y || 0) + sy, z: c.z || 1, r: c.r || 0 };
}

// ---------- arenas ----------
const PAL = {
  sky: ['#cdd8de', '#e3e8e6', '#f1efe8'], far: '#c2cbd0', hill: '#b9c3a6', hill2: '#a9b693', grass: '#a7b48a', grassD: '#94a37a',
  grassL: '#b8c49b', rock: '#b7aea3', rockD: '#8f867c', dirt: '#b9a993', crack: '#6e6257', cloud: '#f7f6f2',
};
export function plains(g, cam, t = 0, o = {}) {
  const GY = GYF(), W = E.W, H = E.H;
  layer(g, cam, 0.05, g => { const gr = g.createLinearGradient(0, -H, 0, GY); gr.addColorStop(0, PAL.sky[0]); gr.addColorStop(0.7, PAL.sky[1]); gr.addColorStop(1, PAL.sky[2]); g.fillStyle = gr; g.fillRect(-W * 2, -H * 2, W * 5, H * 4); });
  layer(g, cam, 0.12, g => { // clouds
    const R = rng(3); g.fillStyle = alpha(PAL.cloud, 0.85);
    for (let i = 0; i < 7; i++) { const x = (R() * W * 1.8 - W * 0.4 + t * 8 * (1 + i % 3)) % (W * 1.8) - W * 0.2, y = GY * (0.12 + R() * 0.35); for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(x + k * 46, y - (k % 2) * 16, 70, 26, 0, 0, Math.PI * 2); g.fill(); } }
  });
  layer(g, cam, 0.22, g => { // far mountains
    g.fillStyle = PAL.far; g.beginPath(); g.moveTo(-W, GY);
    for (let x = -W; x <= W * 2.2; x += 60) g.lineTo(x, GY - 140 - 90 * (noise(x * 0.004, 2) + 1) * 0.6 - 60 * Math.abs(noise(x * 0.011, 4)));
    g.lineTo(W * 2.2, GY + H * 2); g.lineTo(-W, GY + H * 2); g.closePath(); g.fill();
  });
  layer(g, cam, 0.45, g => { // hills
    for (const [c, h, sd] of [[PAL.hill, 70, 7], [PAL.hill2, 40, 9]]) { g.fillStyle = c; g.beginPath(); g.moveTo(-W, GY + 2); for (let x = -W; x <= W * 2.2; x += 40) g.lineTo(x, GY - h * (0.6 + 0.6 * noise(x * 0.003, sd))); g.lineTo(W * 2.2, GY + H * 2); g.lineTo(-W, GY + H * 2); g.closePath(); g.fill(); }
  });
  layer(g, cam, 1, g => { // ground plane
    const gr = g.createLinearGradient(0, GY, 0, H * 1.6); gr.addColorStop(0, PAL.grassL); gr.addColorStop(0.35, PAL.grass); gr.addColorStop(1, PAL.grassD);
    g.fillStyle = gr;
    if (o.wave) { // rubber ground: top edge and stripes follow wave(x, depth01)
      g.beginPath(); g.moveTo(-W * 2, H * 3); for (let x = -W * 2; x <= W * 3; x += 20) g.lineTo(x, GY + o.wave(x, 0)); g.lineTo(W * 3, H * 3); g.closePath(); g.fill();
      g.strokeStyle = OUT; g.lineWidth = 3; g.beginPath(); for (let x = -W * 2; x <= W * 3; x += 20) (x === -W * 2 ? g.moveTo(x, GY + o.wave(x, 0)) : g.lineTo(x, GY + o.wave(x, 0))); g.stroke();
      g.strokeStyle = alpha(PAL.grassD, 0.8); g.lineWidth = 4;
      for (let r = 1; r < 9; r++) { const d = r / 9, yb = GY + d ** 1.4 * (H - GY + 200); g.beginPath(); for (let x = -W; x <= W * 2; x += 30) (x === -W ? g.moveTo(x, yb + o.wave(x, d)) : g.lineTo(x, yb + o.wave(x, d))); g.stroke(); }
    } else g.fillRect(-W * 2, GY, W * 5, H * 2);
    g.strokeStyle = alpha(PAL.grassD, 0.6); g.lineWidth = 3; const R = rng(5);
    if (!o.wave) for (let i = 0; i < 60; i++) { const x = R() * W * 3 - W, y = GY + 10 + R() ** 1.6 * (H - GY + 300), w = 30 + R() * 90; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.stroke(); }
    if (o.scarred) scars(g, GY, o.scarred);
    // rocks
    const R2 = rng(11);
    if (!o.wave && o.rocks !== false) for (let i = 0; i < 6; i++) { const x = R2() * W * 2.4 - W * 0.6, y = GY + 20 + R2() * (H - GY) * 0.8, r = 18 + R2() * 40; rock(g, x, y, r, R2); }
  });
  if (o.tufts !== false) layer(g, cam, 1.35, g => { // foreground grass tufts
    const R = rng(21);
    for (let i = 0; i < 9; i++) { const x = R() * W * 1.6 - W * 0.3, y = H * (0.97 + R() * 0.08); tuft(g, x, y, 40 + R() * 40, t, i); }
  });
  return { GY };
}
function scars(g, GY, k) {
  g.save(); g.strokeStyle = alpha(PAL.crack, 0.75); g.lineWidth = 4; const R = rng(31);
  for (let i = 0; i < 9 * k; i++) { let x = R() * E.W * 1.4 - E.W * 0.2, y = GY + 30 + R() * (E.H - GY); g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 5; j++) { x += (R() - 0.3) * 90; y += (R() - 0.5) * 30; g.lineTo(x, y); } g.stroke(); }
  g.fillStyle = alpha(PAL.dirt, 0.55);
  for (let i = 0; i < 4 * k; i++) { g.beginPath(); g.ellipse(R() * E.W, GY + 40 + R() * (E.H - GY) * 0.8, 120 + R() * 140, 24 + R() * 20, 0, 0, Math.PI * 2); g.fill(); }
  g.restore();
}
export function rock(g, x, y, r, R = Math.random) {
  const pts = []; for (let i = 0; i < 7; i++) { const a = Math.PI + (i / 6) * Math.PI, rr = r * (0.75 + R() * 0.4); pts.push([x + Math.cos(a) * rr * 1.3, y + Math.sin(a) * rr]); }
  g.fillStyle = PAL.rock; g.strokeStyle = OUT; g.lineWidth = 2.5; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(...pts[0]); pts.forEach(p => g.lineTo(...p)); g.closePath(); g.fill();
  g.save(); g.clip(); g.fillStyle = PAL.rockD; g.beginPath(); g.ellipse(x + r * 0.5, y, r * 1.0, r * 0.55, 0, 0, Math.PI * 2); g.fill(); g.restore();
  g.beginPath(); g.moveTo(...pts[0]); pts.forEach(p => g.lineTo(...p)); g.closePath(); g.stroke();
}
function tuft(g, x, y, h, t, i) {
  g.fillStyle = '#8f9d72'; g.strokeStyle = alpha(OUT, 0.6); g.lineWidth = 2;
  for (let k = -3; k <= 3; k++) { const sw = Math.sin(t * 3 + i + k) * 6; g.beginPath(); g.moveTo(x + k * 12 - 7, y); g.quadraticCurveTo(x + k * 14 + sw * 0.5, y - h * 0.6, x + k * 18 + sw, y - h * (0.8 + 0.25 * ((k + 7) % 3) / 2)); g.quadraticCurveTo(x + k * 14 + sw * 0.5 + 6, y - h * 0.5, x + k * 12 + 7, y); g.fill(); g.stroke(); }
}
// plain pale sky (for air shots) with fast clouds
export function skyBg(g, t, dir = [0, 1], speed = 900) {
  const W = E.W, H = E.H, gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#c8d6e0'); gr.addColorStop(1, '#eef0ec'); g.fillStyle = gr; g.fillRect(-W, -H, W * 3, H * 3);
  const R = rng(4); g.fillStyle = alpha('#ffffff', 0.85);
  for (let i = 0; i < 9; i++) { const bx = R() * W, by = R() * H, x = ((bx + dir[0] * t * speed) % (W + 400) + W + 400) % (W + 400) - 200, y = ((by + dir[1] * t * speed) % (H + 400) + H + 400) % (H + 400) - 200; for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(x + k * 50, y + (k % 2) * 14, 80, 30, 0, 0, Math.PI * 2); g.fill(); } }
}
// flat off-white "manga" backdrop
export function paper(g, col = '#efece6') { g.fillStyle = col; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); }

// ---------- action FX ----------
// anime focus lines converging on (cx, cy)
export function focusLines(g, cx, cy, t, o = {}) {
  const { color = '#ffffff', n = 70, inner = Math.min(E.W, E.H) * 0.3, a = 0.9, w = 14 } = o;
  const R = rng(1 + Math.floor(t * 15)); const L = Math.hypot(E.W, E.H);
  g.save(); g.fillStyle = alpha(color, a);
  for (let i = 0; i < n; i++) { const ang = R() * Math.PI * 2, r0 = inner * (0.8 + R() * 0.6), ww = (0.002 + R() * 0.006) * w; g.beginPath(); g.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0); g.lineTo(cx + Math.cos(ang - ww) * L, cy + Math.sin(ang - ww) * L); g.lineTo(cx + Math.cos(ang + ww) * L, cy + Math.sin(ang + ww) * L); g.closePath(); g.fill(); }
  g.restore();
}
// horizontal / angled motion streaks
export function streaks(g, t, o = {}) {
  const { color = '#ffffff', n = 40, a = 0.7, ang = 0, speed = 3000 } = o; const R = rng(9);
  g.save(); g.translate(E.W / 2, E.H / 2); g.rotate(ang); g.fillStyle = alpha(color, a);
  for (let i = 0; i < n; i++) { const y = (R() - 0.5) * E.H * 1.6, len = 200 + R() * 500, x = ((R() * 4000 - t * speed * (0.6 + R())) % 4000 + 4000) % 4000 - 2000; g.fillRect(x, y, len, 2 + R() * 5); }
  g.restore();
}
export function flash(g, a, col = '#ffffff') { if (a <= 0) return; g.save(); g.globalAlpha = clamp(a); g.fillStyle = col; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore(); }
// expanding flat shock ring on the ground or in the air
export function shockRing(g, x, y, t, o = {}) {
  const { dur = 0.45, r0 = 30, r1 = 520, flat = 0.3, color = '#ffffff', w = 22 } = o; const k = clamp(t / dur); if (k >= 1 || t < 0) return;
  const r = lerp(r0, r1, ease.out(k)); g.save(); g.globalAlpha *= 1 - k; g.strokeStyle = color; g.lineWidth = w * (1 - k) + 2;
  g.beginPath(); g.ellipse(x, y, r, r * flat, 0, 0, Math.PI * 2); g.stroke(); g.strokeStyle = alpha(OUT, 0.5); g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, r * 1.04, r * flat * 1.04, 0, 0, Math.PI * 2); g.stroke(); g.restore();
}
// spiky impact star (white with dark outline) — the "hit spark"
export function hitSpark(g, x, y, t, o = {}) {
  const { dur = 0.25, size = 220, color = '#ffffff', core = '#fff6c8', seed = 2 } = o; const k = clamp(t / dur); if (k >= 1 || t < 0) return;
  const R = rng(seed), N = 14, s = size * (0.6 + 0.6 * ease.out(k));
  g.save(); g.globalAlpha *= 1 - k * k; g.beginPath();
  for (let i = 0; i <= N * 2; i++) { const a = (i / (N * 2)) * Math.PI * 2, r = i % 2 ? s * 0.32 : s * (0.7 + R() * 0.5); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
  g.closePath(); g.fillStyle = color; g.fill(); g.lineWidth = 4; g.strokeStyle = OUT; g.stroke();
  g.fillStyle = core; g.beginPath(); g.arc(x, y, s * 0.22, 0, Math.PI * 2); g.fill(); g.restore();
}
// inverted impact frame: black with white burst lines (use for 2–4 frames)
export function impactFrame(g, cx, cy, t, seed = 1) {
  g.save(); g.fillStyle = '#16100c'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  focusLines(g, cx, cy, seed, { color: '#ffffff', n: 90, inner: 60, a: 1, w: 26 });
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(cx, cy, 120, 0, Math.PI * 2); g.fill(); g.restore();
}
// crater with radial cracks
export function crater(g, x, y, rx, k = 1) {
  const ry = rx * 0.3; g.save();
  g.fillStyle = '#8e8174'; g.beginPath(); g.ellipse(x, y, rx * k, ry * k, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#6f6359'; g.beginPath(); g.ellipse(x, y + ry * 0.15 * k, rx * 0.7 * k, ry * 0.62 * k, 0, 0, Math.PI * 2); g.fill();
  g.lineWidth = 3; g.strokeStyle = OUT; g.beginPath(); g.ellipse(x, y, rx * k, ry * k, 0, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = alpha('#5e5249', 0.9); g.lineWidth = 4; const R = rng(17);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + R() * 0.3; let px = x + Math.cos(a) * rx * k, py = y + Math.sin(a) * ry * k; g.beginPath(); g.moveTo(px, py); for (let j = 0; j < 3; j++) { px += Math.cos(a + (R() - 0.5)) * rx * 0.35 * k; py += Math.sin(a + (R() - 0.5)) * ry * 0.35 * k; g.lineTo(px, py); } g.stroke(); }
  const R2 = rng(5); for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI; rock(g, x + Math.cos(a) * rx * 1.02 * k, y + Math.sin(a) * ry * 1.02 * k + 6, 14 + R2() * 18, R2); }
  g.restore();
}
// flying rock chunks from (x,y)
export function debris(g, x, y, t, o = {}) {
  const { n = 14, spread = 700, up = 900, seed = 3, size = 26, grav = 1800 } = o; if (t < 0) return; const R = rng(seed);
  g.save(); g.strokeStyle = OUT; g.lineWidth = 2.5; g.lineJoin = 'round';
  for (let i = 0; i < n; i++) {
    const vx = (R() - 0.5) * spread * 2, vy = -up * (0.4 + R() * 0.8), s = size * (0.4 + R()), rot = R() * 6 + t * (R() - 0.5) * 10;
    const px = x + vx * t, py = y + vy * t + 0.5 * grav * t * t; if (py > y + 200) continue;
    g.save(); g.translate(px, py); g.rotate(rot); g.fillStyle = i % 3 ? '#b2a89c' : '#9a9085';
    g.beginPath(); g.moveTo(-s, -s * 0.4); g.lineTo(-s * 0.2, -s * 0.8); g.lineTo(s * 0.9, -s * 0.3); g.lineTo(s * 0.6, s * 0.6); g.lineTo(-s * 0.7, s * 0.5); g.closePath(); g.fill(); g.stroke(); g.restore();
  }
  g.restore();
}
// cartoon smoke puff (clone pop / dust)
export function puff(g, x, y, r, t, o = {}) {
  const { dur = 0.6, col = '#f4f1ec', shd = '#d6cfc5', seed = 1 } = o; const k = clamp(t / dur); if (t < 0 || k >= 1) return;
  const R = rng(seed), rr = r * (0.5 + 0.7 * ease.out(k)); g.save(); g.globalAlpha *= 1 - k ** 2;
  const blobs = []; for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2 + R(); blobs.push([x + Math.cos(a) * rr * 0.6, y + Math.sin(a) * rr * 0.45 - k * r * 0.4, rr * (0.45 + R() * 0.3)]); }
  g.strokeStyle = alpha(OUT, 0.7); g.lineWidth = 3; blobs.forEach(([bx, by, br]) => { g.beginPath(); g.arc(bx, by, br, 0, Math.PI * 2); g.stroke(); });
  g.fillStyle = shd; blobs.forEach(([bx, by, br]) => { g.beginPath(); g.arc(bx, by, br, 0, Math.PI * 2); g.fill(); });
  g.fillStyle = col; blobs.forEach(([bx, by, br]) => { g.beginPath(); g.arc(bx - br * 0.15, by - br * 0.18, br * 0.85, 0, Math.PI * 2); g.fill(); });
  g.restore();
}
export function dustCloud(g, x, y, w, t, o = {}) { const R = rng(o.seed || 4); for (let i = 0; i < 8; i++) puff(g, x + (R() - 0.5) * w, y - R() * 20, 50 + R() * 50, t - R() * 0.15, { dur: o.dur || 0.9, seed: i + 3, col: '#e9e3d8', shd: '#cbbfae' }); }

// Rasenshuriken: bright core + four spinning translucent blades + ring
export function rasenshuriken(g, x, y, r, t, k = 1) {
  g.save(); g.translate(x, y); g.globalAlpha *= k;
  const rot = t * 26;
  g.save(); g.rotate(rot); g.fillStyle = alpha('#d9f2ff', 0.75); g.strokeStyle = alpha('#7fc8f0', 0.9); g.lineWidth = 3;
  for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(r * 0.3, -r * 0.18); g.quadraticCurveTo(r * 1.4, -r * 0.5, r * 2.6, 0); g.quadraticCurveTo(r * 1.4, r * 0.1, r * 0.3, r * 0.22); g.closePath(); g.fill(); g.stroke(); }
  g.restore();
  g.strokeStyle = alpha('#ffffff', 0.8); g.lineWidth = 6; g.beginPath(); g.ellipse(0, 0, r * 1.7, r * 0.35, rot * 0.3, 0, Math.PI * 2); g.stroke();
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, r * 1.25); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.45, '#bfe8ff'); gr.addColorStop(0.8, '#4fa8e8'); gr.addColorStop(1, alpha('#4fa8e8', 0));
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r * 1.25, 0, Math.PI * 2); g.fill();
  g.strokeStyle = alpha('#2a6aa8', 0.8); g.lineWidth = 3; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(0, 0, r * (0.5 + i * 0.18), rot * (1 + i * 0.3), rot * (1 + i * 0.3) + 2.2); g.stroke(); }
  g.restore();
}
// black-red Conqueror's Haki lightning around a point
export function hakiBolts(g, x, y, r, t, o = {}) {
  const { n = 6, seed = 1, col = '#e0182a' } = o; const R = rng(seed + Math.floor(t * 18));
  g.save(); g.lineJoin = 'miter';
  for (let i = 0; i < n; i++) {
    const a = R() * Math.PI * 2, L = r * (0.8 + R() * 1.3); let px = x + Math.cos(a) * r * 0.3, py = y + Math.sin(a) * r * 0.3; const pts = [[px, py]];
    for (let j = 0; j < 5; j++) { px += Math.cos(a + (R() - 0.5) * 1.6) * L / 5; py += Math.sin(a + (R() - 0.5) * 1.6) * L / 5; pts.push([px, py]); }
    for (const [w, c] of [[12, '#120607'], [5, col]]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); pts.forEach((p, k) => (k ? g.lineTo(...p) : g.moveTo(...p))); g.stroke(); }
  }
  g.restore();
}
// rising steam wisps (Gear 2 pink, Gear 5 white)
export function steam(g, x, y, w, h, t, col = '#ffb6cf', a = 0.75, seed = 2) {
  const R = rng(seed); g.save();
  for (let i = 0; i < 12; i++) { const ph = (R() + t * (0.8 + R() * 0.6)) % 1, px = x + (R() - 0.5) * w + Math.sin(t * 3 + i) * 10, py = y - ph * h, r = 18 + ph * 40; g.globalAlpha = a * (1 - ph) * 0.9; g.fillStyle = col; g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.fill(); g.strokeStyle = alpha(OUT, 0.25); g.lineWidth = 2; g.stroke(); }
  g.restore();
}
// Gear 5 cloud halo ring around the shoulders
export function cloudRing(g, x, y, s, t, k = 1) {
  if (k <= 0.01) return; g.save(); g.globalAlpha *= k;
  const N = 11, rx = 62 * s, ry = 20 * s;
  for (let pass = 0; pass < 2; pass++) for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + t * 0.8, front = Math.sin(a) > 0; if ((pass === 0) === front) continue;
    const px = x + Math.cos(a) * rx, py = y + Math.sin(a) * ry, r = (16 + 5 * Math.sin(t * 4 + i * 2)) * s;
    g.fillStyle = '#e4dcea'; g.strokeStyle = alpha(OUT, 0.7); g.lineWidth = 2.5; g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(px - r * 0.2, py - r * 0.2, r * 0.75, 0, Math.PI * 2); g.fill();
  }
  g.restore();
}
// drum-beat rings (rhythmic pulses)
export function drumPulse(g, x, y, t, bpm = 150, col = '#ffffff') {
  const per = 60 / bpm; g.save();
  for (let i = 0; i < 3; i++) { const ph = ((t + i * per) % (per * 3)) / (per * 3); g.globalAlpha = (1 - ph) * 0.8; g.strokeStyle = col; g.lineWidth = 10 * (1 - ph) + 2; g.beginPath(); g.arc(x, y, 60 + ph * 520, 0, Math.PI * 2); g.stroke(); }
  g.restore();
}
// the nine tailed-beast chakra streams orbiting a point
export const NINE = ['#c84a3a', '#5aa0e0', '#9aa0a8', '#e0603a', '#f0f0e0', '#6ac0b0', '#80c050', '#b0e060', '#ff8a1a'];
export function wisps9(g, cx, cy, R, t, k = 1, size = 1) {
  g.save(); g.globalAlpha *= k; g.lineCap = 'round';
  NINE.forEach((c, i) => {
    const base = (i / 9) * Math.PI * 2 + t * 1.6;
    for (let j = 0; j < 14; j++) { const a = base - j * 0.06, rr = R * (1 + 0.08 * Math.sin(t * 3 + i)), px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr * 0.45 - Math.sin(a * 2 + i) * 30; g.globalAlpha = k * (1 - j / 14) * 0.9; g.fillStyle = c; g.beginPath(); g.arc(px, py, 18 * size * (1 - j / 16), 0, Math.PI * 2); g.fill(); if (j === 0) { g.strokeStyle = alpha(OUT, 0.6); g.lineWidth = 2; g.stroke(); } }
  });
  g.restore();
}
// Truth-Seeking Balls: dark orbs in an arc behind the fighter
export function truthBalls(g, cx, cy, R, t, k = 1, n = 9, size = 26) {
  g.save();
  for (let i = 0; i < n; i++) {
    const kk = clamp(k * n - i), a = Math.PI * (1.05 + (i / (n - 1)) * 0.9), px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R * 0.9 + Math.sin(t * 2 + i) * 6;
    if (kk <= 0) continue; const r = size * ease.outBack(kk);
    g.fillStyle = '#1c1820'; g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#5a4a66'; g.lineWidth = 3; g.stroke();
    g.fillStyle = alpha('#ffffff', 0.35); g.beginPath(); g.arc(px - r * 0.35, py - r * 0.35, r * 0.25, 0, Math.PI * 2); g.fill();
  }
  g.restore();
}
// speed smear behind a moving shape
export function smear(g, x0, y0, x1, y1, w, col = '#ffffff', a = 0.6) {
  g.save(); g.globalAlpha *= a; const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, alpha(col, 0)); gr.addColorStop(1, col); g.strokeStyle = gr; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.restore();
}

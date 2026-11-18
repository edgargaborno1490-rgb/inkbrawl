// shots.js — Naruto vs Luffy, all 53 shots. Screen direction is fixed: Naruto LEFT facing right, Luffy RIGHT facing left.
import { E, V, registerShot, clamp, lerp, ease, key, prog, alpha, mix, rng, layer, noise } from '/engine/core.js';
import { drawFighter, FP, aura, groundShadow, poseKey, sway, run, OUT, SKIN } from './_anime.js';
import * as W from './_world.js';
import * as K from './cast.js';
import './_captions.js';

const HX = () => V(1, 0.55);                       // horizontal spread factor (narrow in 9:16)
const CXv = () => E.W / 2;
// draw a fighter (with ground shadow + optional aura) in world space
function F(g, kit, x, y, s, facing, pose, t, o = {}) {
  if (o.aura) aura(g, x, y, s * (o.auraS || 1), o.auraCol || kit.aura, o.auraCol2 || kit.aura2, t, o.aura, o.auraOpt || {});
  if (o.shadow !== false && !o.air) groundShadow(g, x, y, s);
  drawFighter(g, { x, y, s, facing, pose, kit, t, faceGlow: o.faceGlow ?? kit.faceGlow, ...o });
}
// camera that frames world point (fx, fy) at zoom z
const frame = (fx, fy, z, extra = {}) => ({ x: fx - E.W / 2, y: fy - E.H / 2, z, ...extra });
const camK = (t, frames, hits, amp) => W.camAt(t, frames, hits, amp);
// fist close-up: a big fist (front view) with forearm going back toward (ax, ay)
function bigFist(g, x, y, r, ax, ay, col = SKIN, o = {}) {
  const base = col.base, shd = col.shade, sl = o.sleeve;
  g.save(); g.lineJoin = 'round';
  // forearm
  const ang = Math.atan2(ay - y, ax - x), px = -Math.sin(ang), py = Math.cos(ang), wr = r * 0.62;
  const armPath = () => { g.beginPath(); g.moveTo(x + px * wr, y + py * wr); g.lineTo(ax + px * wr * 1.2, ay + py * wr * 1.2); g.lineTo(ax - px * wr * 1.2, ay - py * wr * 1.2); g.lineTo(x - px * wr, y - py * wr); g.closePath(); };
  armPath(); g.fillStyle = sl ? sl[1] : shd; g.fill(); g.save(); armPath(); g.clip(); g.translate(-r * 0.12, -r * 0.18); armPath(); g.fillStyle = sl ? sl[0] : base; g.fill(); g.restore(); armPath(); g.lineWidth = 5; g.strokeStyle = OUT; g.stroke();
  if (sl && sl[2]) { g.save(); armPath(); g.clip(); g.strokeStyle = sl[2]; g.lineWidth = r * 0.35; g.beginPath(); g.moveTo(lerp(x, ax, 0.12) + px * wr * 2, lerp(y, ay, 0.12) + py * wr * 2); g.lineTo(lerp(x, ax, 0.12) - px * wr * 2, lerp(y, ay, 0.12) - py * wr * 2); g.stroke(); g.restore(); }
  // fist block
  const fp = () => { g.beginPath(); g.roundRect(x - r, y - r * 0.8, r * 2, r * 1.6, r * 0.45); };
  fp(); g.fillStyle = shd; g.fill(); g.save(); fp(); g.clip(); g.translate(-r * 0.1, -r * 0.14); fp(); g.fillStyle = base; g.fill(); g.restore(); fp(); g.lineWidth = 5; g.strokeStyle = OUT; g.stroke();
  // finger lines + knuckles
  g.strokeStyle = OUT; g.lineWidth = 4; for (let i = 1; i < 4; i++) { const fx = x - r + (r * 2 * i) / 4; g.beginPath(); g.moveTo(fx, y - r * 0.8); g.lineTo(fx, y + r * 0.05); g.stroke(); }
  g.beginPath(); g.moveTo(x - r * 0.95, y + r * 0.05); g.quadraticCurveTo(x, y + r * 0.2, x + r * 0.95, y + r * 0.05); g.stroke();
  // thumb
  const th = () => { g.beginPath(); g.ellipse(x - r * 0.15, y + r * 0.45, r * 0.75, r * 0.26, -0.1, 0, Math.PI * 2); };
  th(); g.fillStyle = shd; g.fill(); g.save(); th(); g.clip(); g.translate(-r * 0.05, -r * 0.08); th(); g.fillStyle = base; g.fill(); g.restore(); th(); g.lineWidth = 4; g.stroke();
  if (o.glint) { g.fillStyle = alpha('#ffffff', 0.5); g.beginPath(); g.ellipse(x - r * 0.4, y - r * 0.5, r * 0.3, r * 0.1, -0.3, 0, Math.PI * 2); g.fill(); }
  g.restore();
}
const HAKI = { base: '#2b1517', shade: '#150a0b' };
// helpers for plains shots: draw the arena under camera c and run fn inside the character layer
function arena(g, c, t, fn, o = {}) { const { GY } = W.plains(g, c, t, { ...o, tufts: false }); layer(g, c, 1, g => fn(g, GY)); if (o.tufts !== false) W.plains.tuftsOnly?.(g, c, t); return GY; }
const T = {};

// ======================= HOOK =======================
T.heroNaruto = (g, t, d) => {
  const GY = W.GYF(), x = CXv(), s = V(2.3, 2.6);
  const c = camK(t, [[0, frame(x, GY - 140 * s, 1.1)], [0.16, frame(x, GY - 140 * s, 1.45)], [d, frame(x, GY - 140 * s, 1.52)]]);
  arena(g, c, t, g => F(g, K.NARUTO, x, GY, s, 1, sway(FP.guard, t), t, { aura: ease.out(prog(t, 0.05, 0.4)) }));
  W.focusLines(g, E.W / 2, E.H * 0.45, t, { a: 0.55 * (1 - prog(t, 0.2, 0.6)) });
};
T.heroLuffy = (g, t, d) => {
  const GY = W.GYF(), x = CXv(), s = V(2.3, 2.6);
  const c = camK(t, [[0, frame(x, GY - 140 * s, 1.1)], [0.16, frame(x, GY - 140 * s, 1.45)], [d, frame(x, GY - 140 * s, 1.52)]]);
  arena(g, c, t, g => F(g, K.LUFFY, x, GY, s, -1, sway(poseKey(t, [[0, 'ready'], [0.3, 'guard']], 0.2), t), t, { aura: ease.out(prog(t, 0.05, 0.4)) }));
  W.focusLines(g, E.W / 2, E.H * 0.45, t, { a: 0.55 * (1 - prog(t, 0.2, 0.6)) });
};
T.g5Flash = (g, t, d) => {
  W.paper(g, '#cfc7de'); W.focusLines(g, E.W / 2, E.H * 0.42, t, { color: '#ffffff', a: 0.8 });
  const s = V(2.4, 2.9), x = E.W / 2, y = E.H * V(0.98, 0.84);
  layer(g, { z: 1 + 0.06 * t }, 1, g => {
    aura(g, x, y, s, '#ffffff', '#f4ecff', t, 1, { w: 120 });
    F(g, K.LUFFY_G5, x, y, s, -1, sway(FP.laugh, t, 1.5), t, { shadow: false });
    W.cloudRing(g, x - 4 * s, y - 172 * s, s, t, 1);
  });
};
T.sixFlash = (g, t, d) => {
  W.paper(g, '#eadcbc'); W.focusLines(g, E.W / 2, E.H * 0.42, t, { color: '#fff6d8', a: 0.85 });
  const s = V(2.4, 2.9), x = E.W / 2, y = E.H * V(0.98, 0.84);
  layer(g, { z: 1 + 0.06 * t }, 1, g => {
    W.truthBalls(g, x, y - 200 * s, 120 * s, t, ease.out(prog(t, 0.1, 0.9)), 9, 13 * s);
    aura(g, x, y, s, K.NARUTO_SIX.aura, K.NARUTO_SIX.aura2, t, 1);
    F(g, K.NARUTO_SIX, x, y, s, 1, sway(FP.tall, t), t, { shadow: false });
  });
};
T.split = (g, t, d) => {
  const z = 1 + 0.05 * t, s = V(2.0, 1.7);
  const L = () => { g.beginPath(); g.moveTo(-10, -10); g.lineTo(E.W * 0.58, -10); g.lineTo(E.W * 0.42, E.H + 10); g.lineTo(-10, E.H + 10); g.closePath(); };
  W.paper(g, '#d9d0e4'); W.focusLines(g, E.W * 0.75, E.H * 0.45, t, { color: '#ffffff', a: 0.7 });
  layer(g, { z }, 1, g => { const x = E.W * V(0.76, 0.72), y = E.H * V(0.98, 0.96); aura(g, x, y, s, '#ffffff', '#f4ecff', t, 1); F(g, K.LUFFY_G5, x, y, s, -1, sway(FP.guard, t, 1, 2), t, { shadow: false }); W.cloudRing(g, x + 4 * s, y - 172 * s, s, t, 1); });
  g.save(); L(); g.clip(); W.paper(g, '#efdcae'); W.focusLines(g, E.W * 0.25, E.H * 0.45, t, { color: '#fff3c8', a: 0.8 });
  layer(g, { z }, 1, g => { const x = E.W * V(0.24, 0.28), y = E.H * V(0.98, 0.72); aura(g, x, y, s, K.NARUTO_SIX.aura, K.NARUTO_SIX.aura2, t, 1); F(g, K.NARUTO_SIX, x, y, s, 1, sway(FP.guard, t), t, { shadow: false }); });
  g.restore();
  g.strokeStyle = '#ffffff'; g.lineWidth = 16; g.beginPath(); g.moveTo(E.W * 0.58, -10); g.lineTo(E.W * 0.42, E.H + 10); g.stroke();
  g.strokeStyle = OUT; g.lineWidth = 4; g.stroke();
};

// ======================= OPENING CLASH =======================
T.dash = (g, t, d) => {
  const GY = W.GYF(), s = V(1.25, 1.2), k = t / d;
  const lx = CXv() + lerp(V(520, 300), V(-120, -60), ease.inOut(k));
  const c = camK(t, [[0, frame(lx + 80, GY - 160, 1.0)], [d, frame(lx + 80, GY - 160, 1.0)]], [], 0);
  arena(g, c, t, g => {
    F(g, K.NARUTO, CXv() - V(560, 330), GY, s * 0.95, 1, sway(FP.guard, t), t);
    W.dustCloud(g, lx + 70, GY, 60, (t % 0.4), { seed: Math.floor(t / 0.4) + 1, dur: 0.4 });
    F(g, K.LUFFY, lx, GY, s, -1, run(t, 3.2), t);
  });
  W.streaks(g, t, { a: 0.55, speed: -2600 });
};
T.gear2 = (g, t, d) => {
  const GY = W.GYF(), x = CXv(), s = V(2.5, 2.7);
  const c = camK(t, [[0, frame(x, GY - 90 * s, 1.25)], [d, frame(x, GY - 100 * s, 1.35)]]);
  arena(g, c, t, g => {
    W.steam(g, x, GY - 60 * s, 140 * s, 260 * s, t, '#ffb3cc', 0.75, 3);
    F(g, K.LUFFY_G2, x, GY, s, -1, sway(FP.crouch, t, 0.6), t, { aura: 0.55, auraCol: '#ff8fb5', auraCol2: '#ffe0ea' });
    W.steam(g, x - 20, GY - 30 * s, 100 * s, 200 * s, t + 0.5, '#ffc9da', 0.6, 7);
  });
};
T.jetFist = (g, t, d) => {
  W.paper(g, '#efe9e2'); W.focusLines(g, E.W / 2, E.H / 2, t, { color: '#b8aea2', a: 0.9, inner: 160 });
  const k = ease.in(prog(t, 0, 0.42)), hit = t - 0.45;
  const sh = hit > 0 && hit < 0.3 ? W.camAt(t, null, [0.45], 26) : { x: 0, y: 0 };
  g.save(); g.translate(-sh.x, -sh.y);
  const r = lerp(70, V(330, 300), k), x = lerp(E.W * 0.78, E.W * 0.5, k), y = lerp(E.H * 0.42, E.H * 0.47, k);
  W.smear(g, E.W * 1.2, E.H * 0.2, x, y, r * 1.5, '#ffffff', 0.6);
  bigFist(g, x, y, r, E.W * 1.4, E.H * 0.1, SKIN, { glint: true });
  g.restore();
  W.hitSpark(g, E.W / 2, E.H * 0.47, hit, { size: 520, dur: 0.35 });
  W.flash(g, hit >= 0 && hit < 0.08 ? 0.9 : 0);
};
T.naruHit = (g, t, d) => {
  const GY = W.GYF(), s = V(1.2, 1.15), k = ease.out(prog(t, 0, 0.75));
  const nx = CXv() + lerp(V(-60, -30), V(-720, -420), k), ny = GY - Math.sin(k * Math.PI) * 140;
  const c = camK(t, [[0, frame(CXv() - 120, GY - 170, 1.0)], [d, frame(CXv() - 260, GY - 170, 0.96)]], [0], 22);
  arena(g, c, t, g => {
    F(g, K.LUFFY, CXv() + V(200, 120), GY, s, -1, FP.punch, t);
    W.shockRing(g, CXv() + V(60, 40), GY - 160 * s, t, { flat: 1, r1: 380, dur: 0.4 });
    W.smear(g, nx + 260, ny - 120 * s, nx + 40, ny - 120 * s, 70 * s, '#ffffff', 0.7 * (1 - k));
    F(g, K.NARUTO, nx, ny, s, 1, FP.hit, t, { rot: -0.25 * Math.sin(k * Math.PI), shadow: k > 0.9 });
    W.dustCloud(g, nx, GY, 80, t - 0.6, { seed: 3 });
    W.hitSpark(g, CXv() + V(60, 40), GY - 165 * s, t, { size: 240 });
  });
};
T.naruSkid = (g, t, d) => {
  const GY = W.GYF(), s = V(1.9, 2.0), k = ease.out(prog(t, 0, 0.7));
  const nx = CXv() + lerp(V(260, 150), V(-140, -80), k);
  const c = camK(t, [[0, frame(nx, GY - 130 * s, 1.0)], [d, frame(CXv() - V(140, 80), GY - 130 * s, 1.04)]]);
  arena(g, c, t, g => {
    g.fillStyle = alpha('#8f7f6c', 0.6); g.beginPath(); g.ellipse((nx + CXv() + V(320, 180)) / 2, GY + 6, Math.abs(CXv() + V(320, 180) - nx) / 2, 9, 0, 0, Math.PI * 2); g.fill();
    W.debris(g, nx + 40, GY - 10, t, { n: 10, spread: 260, up: 500, seed: 6, size: 14 });
    W.dustCloud(g, nx + 90, GY, 120, t * 0.8, { seed: 5, dur: 1.1 });
    F(g, K.NARUTO, nx, GY, s, 1, poseKey(t, [[0, 'land'], [0.75, 'guard']], 0.25), t);
  });
};
T.handSign = (g, t, d) => {
  W.paper(g, '#f2e2cc'); W.focusLines(g, E.W / 2, E.H * 0.45, t, { color: '#ffffff', a: 0.85, inner: 220 });
  const cx = E.W / 2, cy = E.H * V(0.46, 0.44), R = V(1, 1.15), k = ease.outBack(prog(t, 0, 0.22)), j = (t > 0.2 && t < 0.4) ? W.camAt(t, null, [0.2], 10) : { x: 0, y: 0 };
  g.save(); g.translate(j.x, j.y);
  const sleeve = [K.NARUTO.top.color, K.NARUTO.top.shade, '#2B2A33'];
  // left arm: vertical two fingers; right arm: horizontal two fingers (the clone cross)
  const arm = (x0, y0, x1, y1) => bigFist(g, x1, y1, 95 * R, x0, y0, SKIN, { sleeve });
  arm(E.W * -0.05, E.H * 1.1, lerp(cx - 330 * R, cx - 70 * R, k), cy + 120 * R);
  arm(E.W * 1.05, E.H * 1.1, lerp(cx + 330 * R, cx + 60 * R, k), cy + 150 * R);
  const fing = (x, y, w, h) => { g.beginPath(); g.roundRect(x, y, w, h, Math.min(w, h) / 2); g.fillStyle = SKIN.base; g.fill(); g.lineWidth = 5; g.strokeStyle = OUT; g.stroke(); g.save(); g.clip(); g.fillStyle = SKIN.shade; g.fillRect(x + w * 0.6, y, w, h); g.restore(); g.beginPath(); g.roundRect(x, y, w, h, Math.min(w, h) / 2); g.stroke(); };
  if (k > 0.6) {
    fing(cx - 70 * R - 50 * R, cy - 220 * R, 46 * R, 260 * R); fing(cx - 70 * R + 2 * R, cy - 230 * R, 46 * R, 270 * R);
    fing(cx - 230 * R, cy - 40 * R, 330 * R, 46 * R); fing(cx - 220 * R, cy + 10 * R, 320 * R, 46 * R);
  }
  g.restore();
  const p = t - 0.2; if (p > 0) { g.save(); g.globalAlpha = clamp(1 - p / 0.5); g.strokeStyle = '#ff9a2a'; g.lineWidth = 8; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, r0 = 260 + p * 600; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a) * (r0 + 120), cy + Math.sin(a) * (r0 + 120)); g.stroke(); } g.restore(); }
};
const CLONES = (n, seed, spanX, depth = 1) => { const R = rng(seed); const a = []; for (let i = 0; i < n; i++) a.push({ x: CXv() + (R() - 0.5) * spanX * HX(), dz: R() * depth, ph: R() * 6 }); return a.sort((p, q) => p.dz - q.dz); };
T.clonePop = (g, t, d) => {
  const GY = W.GYF(), c = camK(t, [[0, frame(CXv(), GY - 200, 0.95)], [d, frame(CXv(), GY - 200, 0.98)]]);
  const L = CLONES(7, 4, 1500, 1);
  arena(g, c, t, g => L.forEach((p, i) => {
    const y = GY - 150 + p.dz * 260, s = 0.7 + p.dz * 0.45, ti = t - i * 0.07;
    if (ti > 0.12) F(g, K.NARUTO, p.x, y, s, 1, sway(FP.guard, t, 1, p.ph), t);
    W.puff(g, p.x, y - 100 * s, 120 * s, ti, { dur: 0.45, seed: i + 2 });
  }));
};
T.clonesWide = (g, t, d) => {
  const GY = W.GYF(), c = camK(t, [[0, frame(CXv() - 100, GY - 200, 0.9)], [d, frame(CXv() + 120, GY - 200, 0.95)]]);
  const L = CLONES(16, 8, 1900, 1);
  arena(g, c, t, g => {
    F(g, K.LUFFY, CXv() + V(820, 470), GY - 40, 0.9, -1, sway(FP.ready, t), t);
    L.forEach((p, i) => { const y = GY - 160 + p.dz * 300, s = 0.62 + p.dz * 0.5, x = p.x - 300 + t * (220 + p.dz * 120); F(g, K.NARUTO, x, y, s, 1, run(t + p.ph, 2.8), t); if (i % 3 === 0) W.dustCloud(g, x - 50, y, 40, (t + p.ph) % 0.5, { seed: i, dur: 0.5 }); });
  });
  W.streaks(g, t, { a: 0.3, speed: 1400 });
};

// ======================= COUNTER =======================
T.luffySense = (g, t, d) => {
  W.paper(g, '#ecd9d3'); W.focusLines(g, E.W / 2, E.H * 0.36, t, { color: '#ffffff', a: 0.6, inner: 260 });
  const s = V(4.6, 4.9), x = E.W / 2 + V(60, 0), y = E.H * V(0.32, 0.36) + 208 * s;
  layer(g, { z: 1 + 0.05 * t }, 1, g => {
    aura(g, x, y, s, '#e0313a', '#ff9a9a', t, 0.35 + 0.15 * Math.sin(t * 9));
    const gl = 0.25 + 0.75 * ease.out(prog(t, 0.15, 0.35));
    F(g, K.LUFFY, x, y, s, -1, sway(FP.stand, t, 0.4), t, { shadow: false, faceGlow: ['#ff2236', gl] });
  });
};
T.foresight = (g, t, d) => {
  const GY = W.GYF(), x = CXv(), s = V(1.6, 1.7);
  const c = camK(t, [[0, frame(x, GY - 160, 1.0)], [d, frame(x, GY - 160, 1.05)]]);
  arena(g, c, t, g => {
    const atk = [[-1, 0.0], [1, 0.45], [-1, 0.9]];
    atk.forEach(([side, t0], i) => {
      const ti = t - t0, cxp = x + side * V(330, 200), k = ease.out(prog(ti, 0.2, 0.45));
      const gx = lerp(cxp, x + side * 60, 1);
      if (ti > -0.1 && ti < 0.25) F(g, K.NARUTO, gx, GY, s, -side, FP.punch, t, { alpha: 0.45, tint: ['#ff2a3a', 0.65], shadow: false }); // red ghost of the future
      F(g, K.NARUTO, lerp(cxp, x + side * 90, k), GY, s, -side, ti > 0.2 ? FP.punch : FP.guard, t);
    });
    const lean = Math.sin(t * 6.5) > 0 ? 'dodge' : 'guard';
    F(g, K.LUFFY, x + Math.sin(t * 6.5) * 30, GY, s, Math.sin(t * 6.5) > 0 ? -1 : 1, poseKey(t, [[0, lean]], 0.1), t, { faceGlow: ['#ff2236', 0.8] });
  });
};
T.dodge = (g, t, d) => {
  const GY = W.GYF(), s = V(2.2, 2.2), k = ease.inOut(prog(t, 0.05, 0.6));
  const nx = CXv() + lerp(V(-420, -240), V(160, 90), k), lx = CXv() + V(60, 30);
  const c = camK(t, [[0, frame(CXv(), GY - 140 * s, 1.0)], [d, frame(CXv() + 40, GY - 140 * s, 1.06)]]);
  arena(g, c, t, g => {
    F(g, K.LUFFY, lx, GY, s, -1, poseKey(t, [[0, 'guard'], [0.1, 'dodge']], 0.12), t, { faceGlow: ['#ff2236', 0.7] });
    W.smear(g, nx - 300, GY - 160 * s, nx + 40, GY - 166 * s, 40 * s, '#ffffff', 0.6 * (1 - prog(t, 0.6, 0.9)));
    F(g, K.NARUTO, nx, GY, s, 1, FP.punch, t);
  });
};
T.gear4 = (g, t, d) => {
  const GY = W.GYF(), x = CXv(), b = lerp(1, 1.35, ease.outBack(prog(t, 0.05, 0.35))), s = V(2.0, 2.2);
  const c = camK(t, [[0, frame(x, GY - 125 * s, 1.22)], [d, frame(x, GY - 125 * s, 1.32)]], [0.05], 18);
  arena(g, c, t, g => {
    W.steam(g, x, GY - 120 * s, 180 * s, 320 * s, t * 1.6, '#ff6a7a', 0.6, 4);
    F(g, t < 0.12 ? K.LUFFY : K.LUFFY_G4, x, GY, s, -1, sway(FP.power, t, 1.2), t, { bulk: b, aura: 0.9 });
    W.shockRing(g, x, GY, t, { r1: 700, dur: 0.5 });
  });
};
T.snakeCU = (g, t, d) => {
  W.paper(g, '#e9d8d4'); W.focusLines(g, E.W * 0.45, E.H * 0.45, t, { color: '#ffffff', a: 0.75 });
  const s = V(3.3, 3.6), x = E.W * V(0.5, 0.52), y = E.H * V(0.98, 0.86);
  layer(g, { z: 1 + 0.05 * t, x: -20 * t }, 1, g => {
    W.steam(g, x, y - 150 * s, 120 * s, 260 * s, t, '#ff7a8a', 0.5, 9);
    F(g, K.LUFFY_G4, x, y, s, -1, sway(poseKey(t, [[0, 'guard'], [0.35, 'windup']], 0.25), t, 1.2), t, { shadow: false, aura: 0.7 });
    W.hakiBolts(g, x + 48 * s, y - 160 * s, 70 * s, t, { n: 3 });
  });
};
// snake arm: bezier from shoulder to target, drawn up to fraction k
function snakeArm(g, pts, k, w, t) {
  const N = 60, P = (u) => { // cubic through 4 control points
    const [a, b, c, d] = pts, iu = 1 - u; return [iu ** 3 * a[0] + 3 * iu * iu * u * b[0] + 3 * iu * u * u * c[0] + u ** 3 * d[0], iu ** 3 * a[1] + 3 * iu * iu * u * b[1] + 3 * iu * u * u * c[1] + u ** 3 * d[1]]; };
  const q = []; for (let i = 0; i <= N * k; i++) q.push(P(i / N)); if (q.length < 2) return null;
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [ww, col] of [[w + 7, OUT], [w, HAKI.base]]) { g.strokeStyle = col; g.lineWidth = ww; g.beginPath(); q.forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p))); g.stroke(); }
  g.strokeStyle = '#ff2a3a'; g.lineWidth = 3; g.beginPath(); q.forEach((p, i) => (i ? g.lineTo(p[0], p[1] - w * 0.25) : g.moveTo(p[0], p[1] - w * 0.25))); g.stroke();
  const tip = q[q.length - 1]; g.fillStyle = HAKI.base; g.strokeStyle = OUT; g.lineWidth = 4; g.beginPath(); g.arc(tip[0], tip[1], w * 0.95, 0, Math.PI * 2); g.fill(); g.stroke();
  g.restore(); return tip;
}
T.snakeArc = (g, t, d) => {
  const GY = W.GYF(), s = V(1.25, 1.2), lx = CXv() + V(600, 330), nx = CXv() - V(620, 340);
  const c = camK(t, [[0, frame(CXv() + 100, GY - 220, 0.95)], [d, frame(CXv() - 60, GY - 220, 0.98)]]);
  arena(g, c, t, g => {
    F(g, K.NARUTO, nx, GY, s, 1, sway(FP.guard, t), t);
    F(g, K.LUFFY_G4, lx, GY, s, -1, FP.punch, t, { aura: 0.5 });
    const sh = [lx - 20 * s, GY - 168 * s], tgt = [nx + 40, GY - 170 * s];
    snakeArm(g, [sh, [lerp(sh[0], tgt[0], 0.3), GY - 560], [lerp(sh[0], tgt[0], 0.7), GY + 60], tgt], ease.out(prog(t, 0.05, 0.95)), 16 * s, t);
  });
  W.streaks(g, t, { a: 0.25, speed: -1800 });
};
T.cornerHit = (g, t, d) => {
  const GY = W.GYF(), s = V(1.5, 1.45), bx = CXv() - V(120, 60), cx2 = CXv() - V(440, 250);
  const c = camK(t, [[0, frame(CXv() - 120, GY - 200, 1.0)], [d, frame(CXv() - 160, GY - 200, 1.04)]], [0.45], 18);
  arena(g, c, t, g => {
    if (t < 0.48) F(g, K.NARUTO, cx2, GY, s, 1, sway(FP.guard, t), t);
    W.puff(g, cx2, GY - 120 * s, 160 * s, t - 0.45, { dur: 0.7, seed: 5 });
    const tip = snakeArm(g, [[E.W + 200, GY - 300], [bx + 200, GY - 720], [cx2 - 260, GY - 520], [cx2 + 30, GY - 170 * s]], ease.inOut(prog(t, 0, 0.45)), 20 * s, t);
    W.rock(g, bx, GY + 10, 190 * V(1, 0.8), rng(2));
    W.hitSpark(g, cx2 + 20, GY - 170 * s, t - 0.45, { size: 260 });
  });
};
T.clonesBurst = (g, t, d) => {
  const GY = W.GYF(), s = V(1.05, 1.0), n = 6;
  const c = camK(t, [[0, frame(CXv(), GY - 180, 0.95)], [d, frame(CXv() + 60, GY - 180, 0.98)]], [0.1, 0.5, 0.9, 1.3], 10);
  arena(g, c, t, g => {
    for (let i = 0; i < n; i++) {
      const x = CXv() + V(-760, -420) + i * V(280, 150), y = GY - (i % 2) * 40, th = 0.1 + i * 0.32;
      if (t < th + 0.03) F(g, K.NARUTO, x, y, s * (1 - (i % 2) * 0.1), 1, sway(FP.guard, t, 1, i), t);
      W.hitSpark(g, x + 10, y - 150 * s, t - th, { size: 170, seed: i });
      W.puff(g, x, y - 110 * s, 140 * s, t - th - 0.02, { dur: 0.7, seed: i + 7 });
    }
    const sweep = clamp((t - 0.05) / (n * 0.32)), hx = CXv() + V(-760, -420) + sweep * (n - 1) * V(280, 150);
    snakeArm(g, [[E.W + 300, GY - 360], [CXv() + 300, GY - 600], [hx + 200, GY - 380], [hx + 10, GY - 150 * s]], 1, 15 * s, t);
  });
};
T.memory = (g, t, d) => {
  const GY = W.GYF(), s = V(1.6, 1.6), nx = CXv() - V(520, 280), ny = GY - 30;
  const c = camK(t, [[0, frame(CXv() - 120, GY - 220, 1.0)], [d, frame(CXv() - 220, GY - 220, 1.05)]]);
  arena(g, c, t, g => {
    W.rock(g, nx, ny + 40, 120, rng(4));
    F(g, K.NARUTO, nx, ny, s, 1, sway(FP.crouch, t, 0.5), t, { shadow: false });
    const R = rng(12);
    for (let i = 0; i < 5; i++) {
      const px = CXv() + V(150, 80) + R() * V(800, 360), py = GY - 60 - R() * 220, ti = t - i * 0.18;
      W.puff(g, px, py, 110, ti + 0.2, { dur: 0.9, seed: i + 30 });
      const k = ease.inOut(prog(ti, 0.1, 0.8)); if (ti > 0.1 && k < 1) {
        const hx = nx + 20, hy = ny - 150 * s, x1 = lerp(px, hx, k), y1 = lerp(py, hy, k) - Math.sin(k * Math.PI) * 120;
        W.smear(g, lerp(px, hx, Math.max(0, k - 0.25)), lerp(py, hy, Math.max(0, k - 0.25)) - Math.sin(Math.max(0, k - 0.25) * Math.PI) * 120, x1, y1, 14, '#ffb347', 0.9);
        g.fillStyle = '#fff3c0'; g.beginPath(); g.arc(x1, y1, 10, 0, Math.PI * 2); g.fill();
      }
    }
  });
};
T.naruKnow = (g, t, d) => {
  W.paper(g, '#f0e4d0'); W.focusLines(g, E.W * 0.35, E.H * 0.4, t, { color: '#ffffff', a: 0.55, inner: 280 });
  const s = V(4.2, 4.6), x = E.W * V(0.32, 0.5), y = E.H * V(0.34, 0.5) + 208 * s;
  const ghosts = [[FP.punch, 0.66, 0.3, 0.0], [FP.dodge, 0.84, 0.52, 0.25], [FP.windup, 0.7, 0.75, 0.5]];
  layer(g, { z: 1 + 0.04 * t }, 1, g => {
    ghosts.forEach(([p, gx, gy, t0]) => { const a = ease.out(prog(t, t0, t0 + 0.4)); F(g, K.LUFFY, E.W * V(gx, gx - 0.2), E.H * V(gy, gy * 0.6) + 240 * 0.9, 0.9 * V(1, 1.2), -1, p, t, { alpha: 0.55 * a, tint: ['#ff4a5a', 0.55], shadow: false }); });
    F(g, K.NARUTO, x, y + Math.max(0, Math.sin((t - 1.2) * 8)) * 10 * (t > 1.2 && t < 1.6), s, 1, sway(FP.stand, t, 0.4), t, { shadow: false });
  });
};

// ======================= POWER-UP =======================
T.sage = (g, t, d) => {
  const GY = W.GYF(), x = CXv(), s = V(2.4, 2.6);
  const c = camK(t, [[0, frame(x, GY - 140 * s, 1.3)], [d, frame(x, GY - 145 * s, 1.45)]]);
  const gl = ease.out(prog(t, 0.6, 1.0));
  arena(g, c, t, g => {
    F(g, K.NARUTO_SAGE, x, GY, s, 1, sway(FP.tall, t, 0.5), t, { aura: 0.2 + 0.7 * gl, faceGlow: ['#FF6A1A', gl] });
    const R = rng(3); g.fillStyle = '#9fb07a'; for (let i = 0; i < 8; i++) { const lx = ((R() * E.W * 1.4 + t * 300) % (E.W * 1.4)) - E.W * 0.2, ly = GY - 100 - R() * 500 + Math.sin(t * 3 + i) * 20; g.beginPath(); g.ellipse(lx, ly, 14, 6, t * 3 + i, 0, Math.PI * 2); g.fill(); }
  });
};
T.kurama = (g, t, d) => {
  const GY = W.GYF(), x = CXv(), s = V(2.2, 2.4);
  const c = camK(t, [[0, frame(x, GY - 135 * s, 1.4)], [d, frame(x, GY - 135 * s, 1.28)]], [0.05], 20);
  arena(g, c, t, g => {
    F(g, K.NARUTO_KCM, x, GY, s, 1, sway(FP.power, t, 1.4), t, { aura: 1, auraOpt: { w: 115 } });
    W.shockRing(g, x, GY, t, { r1: 800, dur: 0.6, color: '#ffe27a' });
  });
  W.focusLines(g, E.W / 2, E.H * 0.45, t, { color: '#fff1a8', a: 0.7 });
};
T.rasenCharge = (g, t, d) => {
  W.paper(g, '#dbe7ee'); W.focusLines(g, E.W * 0.55, E.H * 0.3, t, { color: '#ffffff', a: 0.7 });
  const s = V(2.9, 3.2), x = E.W * V(0.4, 0.42), y = E.H * V(1.02, 0.9);
  layer(g, { z: 1 + 0.06 * t }, 1, g => {
    aura(g, x, y, s, K.NARUTO_KCM.aura, K.NARUTO_KCM.aura2, t, 0.7);
    F(g, K.NARUTO_KCM, x, y, s, 1, FP.palmUp, t, { shadow: false });
    const hx = x + 46 * s, hy = y - 176 * s - 70 * s * ease.out(prog(t, 0, 0.5));
    W.rasenshuriken(g, hx, hy - 30 * s, 30 * s * ease.outBack(prog(t, 0, 0.5)) + 1, t);
  });
};
T.rasenThrow = (g, t, d) => {
  const GY = W.GYF(), s = V(1.3, 1.25), nx = CXv() - V(640, 340), lx = CXv() + V(640, 340), k = ease.in(prog(t, 0.05, 1.0));
  const c = camK(t, [[0, frame(CXv() - 160, GY - 200, 0.95)], [d, frame(CXv() + 160, GY - 200, 0.98)]]);
  arena(g, c, t, g => {
    F(g, K.LUFFY_HAKI, lx, GY, s, -1, sway(FP.guard, t), t);
    F(g, K.NARUTO_KCM, nx, GY, s, 1, FP.throw, t, { aura: 0.6 });
    const rx = lerp(nx + 100 * s, lx - 120, k), ry = GY - 200 * s - Math.sin(k * Math.PI) * 60;
    W.smear(g, rx - 380, ry, rx, ry, 70, '#cfefff', 0.6);
    W.rasenshuriken(g, rx, ry, 34, t);
    W.debris(g, rx, GY, (t % 0.3), { n: 4, spread: 200, up: 400, seed: Math.floor(t / 0.3), size: 12 });
  });
};
T.hakiFists = (g, t, d) => {
  W.paper(g, '#e4d9d6'); W.focusLines(g, E.W / 2, E.H / 2, t, { color: '#ffffff', a: 0.7, inner: 300 });
  const k = ease.inOut(prog(t, 0.1, 0.6)), col = { base: mix(SKIN.base, HAKI.base, k), shade: mix(SKIN.shade, HAKI.shade, k) };
  const r = V(170, 150), y = E.H * V(0.48, 0.45), gap = V(250, 170);
  bigFist(g, E.W / 2 - gap, y, r, E.W * 0.1, E.H * 1.3, col);
  bigFist(g, E.W / 2 + gap, y + 20, r, E.W * 0.9, E.H * 1.3, col);
  if (k > 0.3) { W.hakiBolts(g, E.W / 2 - gap, y, r * 1.2, t, { n: 4, seed: 2 }); W.hakiBolts(g, E.W / 2 + gap, y, r * 1.2, t, { n: 4, seed: 9 }); }
};
T.conqueror = (g, t, d) => {
  const GY = W.GYF(), x = CXv() + V(60, 0), s = V(2.2, 2.4);
  const c = camK(t, [[0, frame(x, GY - 135 * s, 1.28)], [d, frame(x, GY - 135 * s, 1.38)]], [0.1, 0.6], 10);
  const { GY: gy } = W.plains(g, c, t, { scarred: 1, tufts: false });
  layer(g, c, 1, g => {
    F(g, K.LUFFY_HAKI, x, GY, s, -1, sway(FP.power, t, 1.3), t, { aura: 0.8, auraCol: '#3a0a10', auraCol2: '#c0102a' });
    W.hakiBolts(g, x, GY - 120 * s, 170 * s, t, { n: 7 });
  });
};
T.clash = (g, t, d) => {
  if (t < 0.1) { W.impactFrame(g, E.W / 2, E.H / 2, t, 3); return; }
  W.paper(g, '#f4f1ea'); W.focusLines(g, E.W / 2, E.H / 2, t, { color: '#2a1a12', a: 0.85, inner: 240 });
  const j = W.camAt(t, null, [0.1, 0.4], 24); g.save(); g.translate(j.x, j.y);
  W.rasenshuriken(g, E.W / 2 - V(170, 110), E.H / 2, V(90, 70), t, 1 - prog(t, 0.5, 0.9));
  bigFist(g, E.W / 2 + V(90, 60), E.H / 2, V(150, 120), E.W * 1.2, E.H * 0.85, HAKI);
  W.hakiBolts(g, E.W / 2, E.H / 2, 300, t, { n: 8 });
  g.restore();
  W.hitSpark(g, E.W / 2, E.H / 2, t - 0.1, { size: 600, dur: 0.5 });
};
T.crater = (g, t, d) => {
  const GY = W.GYF(), x = CXv(), s = V(1.2, 1.2);
  const c = camK(t, [[0, frame(x, GY + 60, 0.9)], [d, frame(x, GY + 40, 0.95)]], [0], 14);
  arena(g, c, t, g => {
    W.crater(g, x, GY + 120, V(620, 420), 1);
    F(g, K.LUFFY_HAKI, x, GY + 120, s, -1, sway(FP.ready, t), t, { shadow: false });
    W.shockRing(g, x, GY + 120, t, { r1: 1200, dur: 0.6, flat: 0.3, color: '#efe6d8', w: 40 });
    W.dustCloud(g, x, GY + 140, 900, t, { seed: 8, dur: 1.0 });
    W.debris(g, x, GY + 100, t + 0.2, { n: 18, spread: 900, up: 700, seed: 4 });
  }, { scarred: 1 });
};

// ======================= TURNING POINT =======================
T.drums = (g, t, d) => {
  const GY = W.GYF(), x = CXv() + V(80, 0), s = V(2.3, 2.5);
  const beats = [0.1, 0.5, 0.9], c = camK(t, [[0, frame(x, GY - 140 * s, 1.25)], [d, frame(x, GY - 150 * s, 1.5)]], beats, 6);
  arena(g, c, t, g => {
    W.dustCloud(g, x, GY, 500, t * 0.4 + 0.3, { seed: 2, dur: 1.4 });
    F(g, K.LUFFY, x, GY, s, -1, sway(FP.pant, t, 0.5), t);
    beats.forEach(b => { const p = t - b; if (p > 0 && p < 0.6) { g.save(); g.globalAlpha = 1 - p / 0.6; g.strokeStyle = '#ffffff'; g.lineWidth = 14 * (1 - p / 0.6) + 3; g.beginPath(); g.arc(x - 10 * s, GY - 150 * s, 40 + p * 900, 0, Math.PI * 2); g.stroke(); g.strokeStyle = alpha('#c8102a', 0.55); g.lineWidth = 4; g.beginPath(); g.arc(x - 10 * s, GY - 150 * s, 40 + p * 900 + 10, 0, Math.PI * 2); g.stroke(); g.restore(); } });
  }, { scarred: 1 });
};
T.g5Transform = (g, t, d) => {
  const GY = W.GYF(), x = CXv(), s = V(2.3, 2.5);
  const c = camK(t, [[0, frame(x, GY - 140 * s, 1.38)], [d, frame(x, GY - 140 * s, 1.26)]], [0.05], 14);
  W.plains(g, c, t, { scarred: 1, tufts: false });
  W.flash(g, 0.25); W.focusLines(g, E.W / 2, E.H * 0.42, t, { color: '#ffffff', a: 0.8 });
  layer(g, c, 1, g => {
    aura(g, x, GY, s, '#ffffff', '#f2e8ff', t, 1, { w: 120 });
    F(g, K.LUFFY_G5, x, GY, s, -1, sway(FP.laugh, t, 1.6), t);
    W.cloudRing(g, x - 4 * s, GY - 174 * s, s, t, ease.out(prog(t, 0.1, 0.5)));
  });
};
const waveFn = (t, A, x0) => (x, dpt) => A * Math.sin((x - x0) * 0.006 - t * 7) * (1 - dpt * 0.5);
T.rubber = (g, t, d) => {
  const GY = W.GYF(), s = V(1.3, 1.25), lx = CXv() + V(560, 300), nx = CXv() - V(520, 300), A = 90 * ease.out(prog(t, 0.1, 0.8));
  const wv = waveFn(t, A, lx), c = camK(t, [[0, frame(CXv(), GY - 200, 0.92)], [d, frame(CXv(), GY - 200, 0.95)]]);
  W.plains(g, c, t, { wave: wv, tufts: false });
  layer(g, c, 1, g => {
    F(g, K.NARUTO_KCM, nx, GY + wv(nx, 0), s, 1, poseKey(t, [[0, 'guard'], [0.6, 'dodge']], 0.2), t, { shadow: false, rot: Math.atan(A * 0.006 * Math.cos((nx - lx) * 0.006 - t * 7)) * 0.8 });
    F(g, K.LUFFY_G5, lx, GY + wv(lx, 0), s, -1, sway(FP.crouch, t, 1.4), t, { shadow: false, aura: 0.6, auraCol: '#ffffff', auraCol2: '#f2e8ff' });
    W.cloudRing(g, lx - 8 * s, GY + wv(lx, 0) - 118 * s, s, t, 1);
  });
};
T.bounce = (g, t, d) => {
  const GY = W.GYF(), s = V(1.2, 1.2), lx = CXv() + V(520, 280), nx = CXv() - V(420, 240);
  const A = 150, up = Math.max(0, Math.sin(t * 7)) * 120, wv = (x, dp) => waveFn(t, A, lx)(x, dp) - up * (1 - dp);
  const c = camK(t, [[0, frame(CXv(), GY - 260, 0.9)], [d, frame(CXv() - 100, GY - 400, 0.86)]], [0.1, 0.55, 1.0], 16);
  W.plains(g, c, t, { wave: wv, tufts: false });
  layer(g, c, 1, g => {
    const k = ease.out(prog(t, 0.15, 1.6)), ny = GY + wv(nx, 0) - k * 1100;
    W.debris(g, CXv(), GY, t, { n: 22, spread: 1100, up: 1300, seed: 12, size: 30, grav: 1200 });
    F(g, K.NARUTO_KCM, nx + k * 120, ny, s, 1, k > 0.05 ? FP.fall : FP.guard, t, { rot: k * 5, shadow: false });
    const by = GY + wv(lx, 0) - Math.abs(Math.sin(t * 7)) * 160;
    F(g, K.LUFFY_G5, lx, by, s, -1, sway(FP.laugh, t, 1.6), t, { shadow: false });
    W.cloudRing(g, lx - 4 * s, by - 174 * s, s, t, 1);
  });
};
T.naruAir = (g, t, d) => {
  W.skyBg(g, t, [0, 1], 1400);
  W.streaks(g, t, { a: 0.5, ang: Math.PI / 2, speed: 2400 });
  const s = V(2.0, 2.2); F(g, K.NARUTO_KCM, E.W / 2, E.H * 0.62 + 120 * s - t * 60, s, 1, FP.fall, t, { rot: -0.8 + t * 4, shadow: false });
};
T.naruLand = (g, t, d) => {
  const GY = W.GYF(), x = CXv() - V(100, 0), s = V(2.0, 2.2), k = prog(t, 0, 0.3);
  const c = camK(t, [[0, frame(x, GY - 130 * s, 1.0)], [d, frame(x, GY - 110 * s, 1.08)]], [0.3], 24);
  arena(g, c, t, g => {
    if (t > 0.3) W.crater(g, x, GY + 10, 180 * s * ease.out(prog(t, 0.3, 0.45)), 1);
    const y = t < 0.3 ? lerp(GY - 1400, GY, ease.in(k)) : GY;
    F(g, K.NARUTO_KCM, x, y, s, 1, t < 0.3 ? FP.fall : poseKey(t, [[0.3, 'land'], [0.9, 'kneel']], 0.3), t, { shadow: t > 0.3, rot: t < 0.3 ? 0.4 : 0 });
    W.dustCloud(g, x, GY, 300, t - 0.3, { seed: 6, dur: 1.2 });
    W.debris(g, x, GY, t - 0.3, { n: 12, spread: 600, up: 700, seed: 3 });
  }, { scarred: 1 });
};

// ======================= STAMINA =======================
T.g5Bounce = (g, t, d) => {
  const GY = W.GYF(), s = V(1.35, 1.3), x = CXv() + lerp(V(-600, -300), V(500, 260), t / d), y = GY - Math.abs(Math.sin(t * 5.5)) * 300;
  const c = camK(t, [[0, frame(CXv() - 100, GY - 220, 0.95)], [d, frame(CXv() + 100, GY - 220, 0.95)]]);
  arena(g, c, t, g => {
    groundShadow(g, x, GY, s * (1 - (GY - y) / 600));
    F(g, K.LUFFY_G5, x, y, s, 1, sway(FP.laugh, t, 2), t, { shadow: false, rot: Math.sin(t * 5.5) * 0.2 });
    W.cloudRing(g, x + 4 * s, y - 174 * s, s, t, 0.85 - 0.35 * (t / d));
  }, { scarred: 1 });
};
T.drain = (g, t, d) => {
  const GY = W.GYF(), x = CXv() + V(80, 0), s = V(2.3, 2.5), k = ease.inOut(prog(t, 0.1, 1.2));
  const c = camK(t, [[0, frame(x, GY - 140 * s, 1.25)], [d, frame(x, GY - 125 * s, 1.38)]]);
  arena(g, c, t, g => {
    W.steam(g, x, GY - 120 * s, 120 * s, 300 * s, t, '#ffffff', 0.85, 5);
    F(g, K.LUFFY_G5, x, GY, s, -1, poseKey(t, [[0, 'laugh'], [0.4, 'pant']], 0.6), t, { tint: ['#a8a0a8', 0.25 * k] });
    W.cloudRing(g, x - 4 * s, GY - lerp(174, 136, k) * s, s, t, 0.5 * (1 - k) + 0.05);
  }, { scarred: 1 });
};
T.memoryK = (g, t, d) => {
  W.paper(g, '#d9c6a2');
  const s = V(2.3, 2.5), x = E.W * 0.55, y = E.H * V(0.92, 0.8);
  g.save(); for (let i = 0; i < 5; i++) { const ph = (t * 2 + i * 0.2) % 1, bx = E.W * (0.1 + i * 0.22); g.globalAlpha = 0.8 * (1 - ph); g.fillStyle = '#fff1a0'; g.strokeStyle = '#e8b830'; g.lineWidth = 4; g.beginPath(); g.moveTo(bx, -50); g.lineTo(bx + 60, -50); g.lineTo(x + (i - 2) * 50 + 20, y - 130 * s); g.lineTo(x + (i - 2) * 50 - 10, y - 130 * s); g.closePath(); g.fill(); g.stroke(); } g.restore();
  F(g, K.LUFFY_G5, x, y, s, -1, poseKey(t, [[0, 'hit'], [0.6, 'kneel']], 0.3), t, { tint: ['#9c7f58', 0.45], shadow: false });
  W.hitSpark(g, x - 10 * s, y - 140 * s, (t % 0.33), { size: 200, color: '#fff6c0', core: '#ffe060', seed: Math.floor(t * 3) });
  g.save(); g.globalAlpha = 0.25; g.strokeStyle = '#6b5638'; g.lineWidth = 2; const R = rng(Math.floor(t * 12)); for (let i = 0; i < 6; i++) { const lx = R() * E.W; g.beginPath(); g.moveTo(lx, 0); g.lineTo(lx, E.H); g.stroke(); } g.restore();
  g.save(); const v = g.createRadialGradient(E.W / 2, E.H / 2, E.H * 0.3, E.W / 2, E.H / 2, E.W * 0.7); v.addColorStop(0, 'rgba(60,40,20,0)'); v.addColorStop(1, 'rgba(60,40,20,0.55)'); g.fillStyle = v; g.fillRect(0, 0, E.W, E.H); g.restore();
};
T.shrivel = (g, t, d) => {
  const GY = W.GYF(), x = CXv() + V(60, 0), k = ease.inOut(prog(t, 0.1, 1.2)), s = V(2.3, 2.5) * lerp(1, 0.82, k);
  const c = camK(t, [[0, frame(x, GY - 130 * V(2.3, 2.5), 1.25)], [d, frame(x, GY - 90 * V(2.3, 2.5), 1.4)]]);
  arena(g, c, t, g => {
    W.steam(g, x, GY - 80 * s, 100 * s, 220 * s, t, '#f4f0ea', 0.6 * (1 - k), 8);
    F(g, K.LUFFY_DRAINED, x, GY, s, -1, poseKey(t, [[0, 'pant'], [0.9, 'kneel']], 0.5), t, { thin: lerp(1, 0.55, k), tint: ['#b8aca0', 0.2 * k] });
  }, { scarred: 1 });
};

// ======================= NARUTO'S TANK =======================
T.naruRise = (g, t, d) => {
  const GY = W.GYF(), x = CXv() - V(60, 0), s = V(2.3, 2.5);
  const c = camK(t, [[0, frame(x, GY - 110 * s, 1.35)], [d, frame(x, GY - 140 * s, 1.28)]]);
  arena(g, c, t, g => F(g, K.NARUTO_KCM, x, GY, s, 1, poseKey(t, [[0, 'kneel'], [0.3, 'stand'], [0.9, 'tall']], 0.5), t, { aura: ease.out(prog(t, 0.2, 1.2)) }), { scarred: 1 });
};
T.nine = (g, t, d) => {
  W.paper(g, '#efe3c6'); W.focusLines(g, E.W / 2, E.H * 0.45, t, { color: '#fff8e0', a: 0.6 });
  const s = V(2.4, 2.8), x = E.W / 2, y = E.H * V(0.96, 0.82), R = 230 * s * ease.out(prog(t, 0, 0.6)) / 2.4 * V(1, 0.75);
  layer(g, { z: 1 + 0.05 * t }, 1, g => {
    aura(g, x, y, s, K.NARUTO_SIX.aura, K.NARUTO_SIX.aura2, t, 0.6);
    F(g, K.NARUTO_SIX, x, y, s, 1, sway(FP.armsOut, t), t, { shadow: false });
    W.wisps9(g, x, y - 120 * s, R + 60, t, 1, 1.8);
  });
};
T.sixPaths = (g, t, d) => {
  const GY = W.GYF(), x = CXv() - V(60, 0), s = V(2.3, 2.5);
  const c = camK(t, [[0, frame(x, GY - 140 * s, 1.4)], [d, frame(x, GY - 140 * s, 1.3)]], [0.05], 14);
  arena(g, c, t, g => F(g, K.NARUTO_SIX, x, GY, s, 1, sway(FP.tall, t), t, { aura: 1 }), { scarred: 1 });
  W.focusLines(g, E.W / 2, E.H * 0.42, t, { color: '#fff3c0', a: 0.6 });
};
T.balls = (g, t, d) => {
  W.paper(g, '#e9e2d0'); W.focusLines(g, E.W / 2, E.H * 0.35, t, { color: '#ffffff', a: 0.55, inner: 300 });
  const s = V(3.8, 4.2), x = E.W / 2, y = E.H * V(0.4, 0.42) + 208 * s;
  layer(g, { z: 1 + 0.04 * t }, 1, g => {
    W.truthBalls(g, x - 10 * s, y - 190 * s, 115 * s * V(1, 0.8), t, ease.out(prog(t, 0.05, 1.1)), 9, 13 * s);
    aura(g, x, y, s, K.NARUTO_SIX.aura, K.NARUTO_SIX.aura2, t, 0.5);
    F(g, K.NARUTO_SIX, x, y, s, 1, sway(FP.tall, t, 0.4), t, { shadow: false });
  });
};
T.outlast = (g, t, d) => {
  const GY = W.GYF(), s = V(1.5, 1.4), nx = CXv() - V(480, 260), lx = CXv() + V(480, 260);
  const c = camK(t, [[0, frame(CXv(), GY - 200, 0.92)], [d, frame(CXv(), GY - 190, 1.04)]]);
  arena(g, c, t, g => {
    F(g, K.NARUTO_SIX, nx, GY, s, 1, sway(FP.tall, t), t, { aura: 0.85 });
    W.steam(g, lx, GY - 120 * s, 70 * s, 160 * s, t, '#f4f0ea', 0.4, 2);
    F(g, K.LUFFY_DRAINED, lx, GY, s * 0.9, -1, sway(FP.pant, t, 1.6), t, { thin: 0.75 });
  }, { scarred: 1 });
};

// ======================= VERDICT =======================
T.verdict = (g, t, d) => {
  const GY = W.GYF(), x = CXv(), s = V(2.4, 2.7);
  const c = camK(t, [[0, frame(x, GY - 140 * s, 1.1)], [0.15, frame(x, GY - 140 * s, 1.45)], [d, frame(x, GY - 145 * s, 1.52)]], [0.15], 12);
  arena(g, c, t, g => F(g, K.NARUTO_SIX, x, GY, s, 1, sway(FP.tall, t), t, { aura: 1 }), { scarred: 1 });
  W.focusLines(g, E.W / 2, E.H * 0.42, t, { color: '#fff3c0', a: 0.7 * (1 - prog(t, 0.3, 0.8)) });
};
T.close = (g, t, d) => {
  W.paper(g, '#efe6dc');
  const j = W.camAt(t, null, [0.1, 0.5, 0.9], 8); g.save(); g.translate(j.x, j.y);
  g.save(); g.globalAlpha = 0.55; const gl = g.createLinearGradient(0, 0, E.W, 0); gl.addColorStop(0, '#ffc93a'); gl.addColorStop(0.5, 'rgba(255,255,255,0)'); gl.addColorStop(1, '#d0102a'); g.fillStyle = gl; g.fillRect(0, 0, E.W, E.H); g.restore();
  W.focusLines(g, E.W / 2, E.H * 0.47, t, { color: '#ffffff', a: 0.8, inner: 200 });
  const push = Math.sin(t * 9) * 12, r = V(150, 120);
  bigFist(g, E.W / 2 - r * 1.05 + push, E.H * 0.47, r, -E.W * 0.1, E.H * 0.75, SKIN, { sleeve: [K.NARUTO_SIX.top.color, K.NARUTO_SIX.top.shade, '#2B2A33'] });
  bigFist(g, E.W / 2 + r * 1.05 + push, E.H * 0.47, r, E.W * 1.1, E.H * 0.75, HAKI);
  W.hakiBolts(g, E.W / 2 + 40, E.H * 0.47, 200, t, { n: 4 });
  W.hitSpark(g, E.W / 2, E.H * 0.47, (t % 0.4), { size: 200, seed: Math.floor(t / 0.4) });
  g.restore();
};
T.replay = (g, t, d) => {
  const GY = W.GYF(), s = V(1.9, 2.0), k = ease.out(prog(t, 0.4, 0.9));
  const lx = CXv() + V(260, 150) - 120 * ease.in(prog(t, 0, 0.4)), nx = CXv() - V(200, 110) - 160 * k;
  const c = camK(t, [[0, frame(CXv(), GY - 140 * s, 1.0)], [d, frame(CXv() - 60, GY - 140 * s, 1.05)]], [0.4], 22);
  arena(g, c, t, g => {
    F(g, K.NARUTO_SIX, nx, GY, s, 1, t > 0.4 ? poseKey(t, [[0.4, 'hit'], [1.1, 'guard']], 0.3) : FP.guard, t, { aura: 0.5 });
    F(g, K.LUFFY_HAKI, lx, GY, s, -1, poseKey(t, [[0, 'windup'], [0.3, 'punch']], 0.1), t, { aura: 0.6, auraCol: '#3a0a10', auraCol2: '#c0102a' });
    W.hitSpark(g, nx + 50 * s, GY - 165 * s, t - 0.4, { size: 280 });
    W.hakiBolts(g, lx - 90 * s, GY - 168 * s, 90, t, { n: 3 });
  }, { scarred: 1 });
};
T.tank = (g, t, d) => {
  const GY = W.GYF(), s = V(1.4, 1.4), nx = CXv() - V(300, 140), lx = CXv() + V(560, 300);
  const c = camK(t, [[0, frame(CXv(), GY - 300, 0.9)], [d, frame(CXv() - 60, GY - 330, 0.86)]]);
  arena(g, c, t, g => {
    aura(g, nx, GY, s * 4.2 * ease.out(prog(t, 0, 0.6)) + 0.01, '#ffb21a', '#fff1a8', t, 0.75);
    F(g, K.NARUTO_SIX, nx, GY, s, 1, sway(FP.tall, t), t, { aura: 1 });
    F(g, K.LUFFY_DRAINED, lx, GY, s * 0.9, -1, sway(FP.pant, t, 1.4), t, { thin: 0.75 });
  }, { scarred: 1 });
};
T.wear = (g, t, d) => {
  const GY = W.GYF(), s = V(1.35, 1.3), lx = CXv();
  const c = camK(t, [[0, frame(lx, GY - 190, 0.95)], [d, frame(lx, GY - 190, 1.04)]]);
  arena(g, c, t, g => {
    F(g, K.LUFFY_DRAINED, lx, GY, s * 0.9, -1, sway(FP.pant, t, 1.5), t, { thin: 0.75 });
    for (let i = 0; i < 8; i++) {
      const side = i % 2 ? 1 : -1, t0 = i * 0.16, k = ease.out(prog(t, t0, t0 + 0.5)), dep = (i % 3) * 30;
      const x = lerp(lx + side * V(1100, 650), lx + side * (110 + (i >> 1) * 40), k);
      F(g, K.NARUTO, x, GY + dep - 40, s * (0.9 + (i % 3) * 0.06), -side, k < 1 ? run(t + i, 3) : FP.punch, t);
    }
    W.dustCloud(g, lx, GY, 400, t - 1.2, { seed: 9, dur: 0.8 });
  }, { scarred: 1 });
};
T.endBoth = (g, t, d) => {
  const GY = W.GYF(), s = V(1.6, 1.5), nx = CXv() - V(380, 220), lx = CXv() + V(380, 220);
  const c = camK(t, [[0, frame(CXv(), GY - 200, 0.94)], [d, frame(CXv(), GY - 200, 1.02)]]);
  arena(g, c, t, g => {
    F(g, K.NARUTO_SIX, nx, GY, s, 1, sway(FP.tall, t), t, { aura: 0.5 });
    F(g, K.LUFFY, lx, GY, s, -1, sway(FP.kneel, t, 0.8), t);
  }, { scarred: 1 });
};
T.endNext = (g, t, d) => {
  W.paper(g, '#ebe5da'); W.focusLines(g, E.W / 2, E.H * 0.45, t, { color: '#ffffff', a: 0.6 });
  const s = V(2.1, 1.8), y = E.H * V(0.9, 0.62), a = ease.out(prog(t, 0, 0.5));
  [[-1, '#ff8a1a'], [1, '#4aa0e0']].forEach(([side, col], i) => {
    const x = E.W / 2 + side * V(430, 250);
    aura(g, x, y, s, col, '#ffffff', t + i, 0.5 * a);
    drawFighter(g, { x, y, s, facing: -side, pose: sway(FP.guard, t, 1, i), kit: K.NARUTO, t, tint: ['#d8cfc2', 0.9], alpha: 0.85 * a });
    g.save(); g.font = `400 ${V(220, 190)}px "Anton"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 14; g.strokeStyle = '#000';
    const qy = y - 300 * s + Math.sin(t * 3 + i) * 10; g.globalAlpha = a; g.strokeText('?', x, qy); g.fillStyle = col; g.fillText('?', x, qy); g.restore();
  });
};

// ---------- register ----------
for (const s of E.shots) {
  const fn = T[s.params?.tpl];
  if (fn) registerShot(s.id, { draw: (g, t, info) => fn(g, t, info.dur, info) });
}

// _anime.js — Ink Brawl "brown-anime" fighter rig: flat 2D anime cel look, faceless, same brown skin for all.
// Skeleton = the engine's 11-point poses (feet at y=0, up is -y, faces +x, ~240 units tall at s=1).
// Each body part: base fill, ONE hard shadow band (shape minus a copy shifted toward the light), thin dark-brown outline.
import { E, clamp, lerp, mix, alpha, rng, noise, ease, mixVal } from '/engine/core.js';
import { POSES, walkPose } from '/engine/rig2d.js';

export const OUT = '#2A1A12';
export const SKIN = { base: '#8D5B3E', shade: '#6B412B', hi: '#A8714F' };

// fight poses, same point format as rig2d POSES
export const FP = {
  stand: POSES.stand, ready: POSES.ready, jump: POSES.jump, fall: POSES.fall, kick: POSES.kick, crouch: POSES.crouch,
  guard: { head: [10, -200], sh: [4, -168], hip: [0, -96], eF: [28, -140], hF: [40, -170], eB: [14, -138], hB: [26, -166], kF: [22, -50], fF: [30, 0], kB: [-18, -48], fB: [-30, 0] },
  punch: { head: [22, -196], sh: [14, -166], hip: [0, -92], eF: [52, -168], hF: [92, -170], eB: [-8, -140], hB: [8, -156], kF: [34, -48], fF: [52, 0], kB: [-26, -44], fB: [-56, 0] },
  windup: { head: [0, -194], sh: [-4, -164], hip: [0, -94], eF: [-30, -150], hF: [-52, -166], eB: [22, -140], hB: [36, -160], kF: [24, -50], fF: [36, 0], kB: [-24, -46], fB: [-40, 0] },
  sign: { head: [8, -204], sh: [2, -170], hip: [0, -98], eF: [24, -136], hF: [26, -162], eB: [20, -138], hB: [24, -164], kF: [22, -50], fF: [28, 0], kB: [-18, -50], fB: [-28, 0] },
  throw: { head: [18, -200], sh: [10, -168], hip: [0, -94], eF: [44, -184], hF: [80, -196], eB: [-20, -140], hB: [-34, -122], kF: [30, -48], fF: [44, 0], kB: [-24, -46], fB: [-50, 0] },
  palmUp: { head: [8, -204], sh: [3, -170], hip: [0, -98], eF: [34, -146], hF: [46, -176], eB: [-10, -138], hB: [-16, -104], kF: [16, -50], fF: [22, 0], kB: [-16, -50], fB: [-26, 0] },
  power: { head: [6, -194], sh: [2, -162], hip: [0, -88], eF: [32, -124], hF: [48, -94], eB: [-28, -124], hB: [-44, -94], kF: [32, -46], fF: [40, 0], kB: [-32, -46], fB: [-40, 0] },
  laugh: { head: [-8, -214], sh: [-4, -176], hip: [0, -100], eF: [24, -206], hF: [44, -238], eB: [-28, -200], hB: [-46, -230], kF: [26, -74], fF: [34, -34], kB: [-6, -50], fB: [-12, 0] },
  pant: { head: [26, -160], sh: [14, -136], hip: [0, -84], eF: [30, -102], hF: [38, -68], eB: [18, -102], hB: [24, -64], kF: [26, -44], fF: [26, 0], kB: [-16, -42], fB: [-28, 0] },
  kneel: { head: [24, -142], sh: [12, -118], hip: [0, -58], eF: [30, -84], hF: [40, -50], eB: [8, -84], hB: [16, -48], kF: [36, -46], fF: [36, 0], kB: [-6, -4], fB: [-48, 0] },
  meditate: { head: [2, -150], sh: [0, -118], hip: [0, -44], eF: [22, -80], hF: [14, -56], eB: [-14, -80], hB: [-4, -56], kF: [38, -22], fF: [-6, -6], kB: [-34, -20], fB: [8, -6] },
  land: { head: [34, -118], sh: [22, -96], hip: [0, -56], eF: [42, -60], hF: [52, -8], eB: [-6, -72], hB: [-34, -84], kF: [34, -50], fF: [26, 0], kB: [-14, -18], fB: [-46, 0] },
  dodge: { head: [-28, -194], sh: [-20, -162], hip: [0, -96], eF: [0, -140], hF: [18, -162], eB: [-36, -138], hB: [-44, -110], kF: [20, -50], fF: [36, 0], kB: [-16, -48], fB: [-30, 0] },
  hit: { head: [-32, -186], sh: [-22, -158], hip: [0, -100], eF: [8, -186], hF: [30, -206], eB: [-42, -168], hB: [-62, -188], kF: [22, -56], fF: [42, -20], kB: [-6, -52], fB: [-10, 0] },
  tall: { head: [2, -212], sh: [0, -176], hip: [0, -100], eF: [14, -136], hF: [20, -100], eB: [-10, -136], hB: [-16, -100], kF: [8, -50], fF: [10, 0], kB: [-8, -50], fB: [-14, 0] },
  armsOut: { head: [2, -210], sh: [0, -174], hip: [0, -100], eF: [34, -150], hF: [62, -130], eB: [-32, -150], hB: [-60, -130], kF: [16, -50], fF: [24, 0], kB: [-16, -50], fB: [-24, 0] },
};
export const run = (t, speed = 2.6) => walkPose(t * speed * Math.PI * 2, { run: true });
// keyed poses: poseKey(t, [[0,'guard'],[0.3,'punch']], blend)
export function poseKey(t, keys, blend = 0.12) {
  const P = (p) => (typeof p === 'string' ? FP[p] || POSES[p] : p);
  let cur = P(keys[0][1]);
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) break;
    const k = clamp((t - keys[i][0]) / blend);
    const nxt = P(keys[i][1]);
    cur = k >= 1 ? nxt : mixVal(cur, nxt, ease.out(k));
    if (k < 1) return cur;
  }
  return cur;
}
// idle sway on top of a pose
export function sway(p, t, amt = 1, seed = 0) {
  const b = Math.sin(t * 2.4 + seed) * 2 * amt, s = Math.sin(t * 1.1 + seed) * 1.5 * amt, q = {};
  for (const k in p) q[k] = ['head', 'sh', 'eF', 'hF', 'eB', 'hB'].includes(k) ? [p[k][0] + s, p[k][1] + b] : p[k];
  return q;
}

// ---------- cel-shaded shape helpers ----------
let OLW = 3, LIGHT = [-1, -1];
function cel(g, path, base, shd, k = 0.36, size = 10) {
  path(); g.fillStyle = shd; g.fill();
  g.save(); path(); g.clip(); g.translate(LIGHT[0] * size * k, LIGHT[1] * size * k); path(); g.fillStyle = base; g.fill(); g.restore();
  path(); g.lineWidth = OLW; g.strokeStyle = OUT; g.lineJoin = 'round'; g.stroke();
}
const capsule = (a, b, r1, r2) => (g) => () => {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  g.beginPath(); g.arc(a[0], a[1], r1, ang + Math.PI / 2, ang - Math.PI / 2); g.arc(b[0], b[1], r2, ang - Math.PI / 2, ang + Math.PI / 2); g.closePath();
};
const ell = (x, y, rx, ry, rot = 0) => (g) => () => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); };
const polyP = (pts) => (g) => () => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
const smoothP = (pts) => (g) => () => { // closed smooth curve through midpoints
  const n = pts.length; g.beginPath();
  const m = (i) => [(pts[i % n][0] + pts[(i + 1) % n][0]) / 2, (pts[i % n][1] + pts[(i + 1) % n][1]) / 2];
  g.moveTo(...m(0)); for (let i = 1; i <= n; i++) g.quadraticCurveTo(pts[i % n][0], pts[i % n][1], ...m(i)); g.closePath();
};
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const nrm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
const perp = (v) => [-v[1], v[0]];
const lp = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ---------- the fighter ----------
// o = {x, y, s, facing, pose, kit, rot, alpha, bulk, thin, tint:[color,k], hairT}
export function drawFighter(g, o) {
  const kit = o.kit, p = o.pose || FP.stand, s = o.s || 1, f = o.facing || 1;
  const bulk = o.bulk ?? kit.bulk ?? 1, thin = o.thin ?? 1, t = o.t ?? 0;
  g.save(); g.translate(o.x, o.y); g.scale(s * f, s); if (o.rot) g.rotate(o.rot); if (o.alpha != null) g.globalAlpha *= o.alpha;
  OLW = clamp(2.6 / Math.sqrt(s), 1.1, 3.4); LIGHT = [-1, -1];
  const tint = (c) => (o.tint ? mix(c, o.tint[0], o.tint[1]) : c);
  const C = (base, shd) => [tint(base), tint(shd)];
  const skin = C(SKIN.base, SKIN.shade), far = (c) => [mix(c[0], c[1], 0.35), mix(c[1], OUT, 0.15)];
  const armW = [11 * bulk * thin, 9 * bulk * thin], legW = [14 * thin, 10.5 * thin];
  const top = kit.top || {}, pants = kit.pants || {};
  const sleeve = top.sleeves === 'long' ? C(top.color, top.shade) : null;
  const armCol = kit.hakiArms ? C('#2b1517', '#150a0b') : null;

  const arm = (e, h, isFar) => {
    const sh = [p.sh[0] + (isFar ? -3 : 3), p.sh[1] + 4];
    const up = armCol || sleeve || skin, lo = armCol || sleeve || skin;
    const U = isFar ? far(up) : up, L = isFar ? far(lo) : lo;
    cel(g, capsule(sh, e, armW[0], armW[1])(g), U[0], U[1], 0.5, armW[0]);
    cel(g, capsule(e, h, armW[1], armW[1] * 0.9)(g), L[0], L[1], 0.5, armW[1]);
    if (sleeve && !armCol) { const cuff = lp(e, h, 0.82); cel(g, capsule(lp(e, h, 0.74), cuff, armW[1] * 1.12, armW[1] * 1.12)(g), ...(isFar ? far(C(top.cuff || top.shade, OUT)) : C(top.cuff || top.shade, OUT)), 0.3, 4); }
    const hs = isFar ? far(armCol || skin) : armCol || skin; // fist
    const dir = nrm(sub(h, e));
    cel(g, ell(h[0] + dir[0] * 4, h[1] + dir[1] * 4, 12 * bulk * thin, 10.5 * bulk * thin, Math.atan2(dir[1], dir[0]))(g), hs[0], hs[1], 0.45, 8);
    if (kit.hakiArms && !isFar) { g.save(); g.globalAlpha *= 0.85; g.strokeStyle = '#ff2a3a'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(...add(e, [2, -3])); g.lineTo(...lp(e, h, 0.5)); g.lineTo(...add(h, [-3, 2])); g.stroke(); g.restore(); }
  };
  const leg = (k, ft, isFar) => {
    const hip = [p.hip[0] + (isFar ? -4 : 4), p.hip[1]];
    const P = C(pants.color, pants.shade), pf = isFar ? far(P) : P, sk = isFar ? far(skin) : skin;
    cel(g, capsule(hip, k, legW[0] * (kit.wideLegs || 1), legW[1] * (kit.wideLegs || 1))(g), pf[0], pf[1], 0.5, legW[0]);
    if (pants.len === 'knee') {
      cel(g, capsule(k, ft, legW[1], legW[1] * 0.85)(g), sk[0], sk[1], 0.5, legW[1]);
      const cuff = isFar ? far(C(pants.cuff || '#eee', '#bbb')) : C(pants.cuff || '#eee', '#bbb');
      cel(g, capsule(lp(hip, k, 0.86), lp(k, ft, 0.1), legW[0] * 1.08, legW[0] * 1.02)(g), cuff[0], cuff[1], 0.3, 5);
    } else {
      cel(g, capsule(k, ft, legW[1] * (kit.wideLegs || 1), legW[1] * 0.9)(g), pf[0], pf[1], 0.5, legW[1]);
      if (pants.wrap) { const w = isFar ? far(C(pants.wrap, mix(pants.wrap, OUT, 0.3))) : C(pants.wrap, mix(pants.wrap, OUT, 0.3)); cel(g, capsule(lp(k, ft, 0.6), lp(k, ft, 0.92), legW[1] * 0.98, legW[1] * 0.9)(g), w[0], w[1], 0.3, 4); }
    }
    const shoe = kit.shoes ? (isFar ? far(C(kit.shoes, mix(kit.shoes, OUT, 0.4))) : C(kit.shoes, mix(kit.shoes, OUT, 0.4))) : sk;
    const dir = nrm(sub(ft, k)), fwd = [dir[1] * -1 >= 0 ? 1 : 1, 0];
    cel(g, ell(ft[0] + 9, ft[1] - 5, 17 * thin + 3, 8, 0)(g), shoe[0], shoe[1], 0.4, 6);
    if (kit.sandalStrap) { g.strokeStyle = kit.sandalStrap; g.lineWidth = 2; g.beginPath(); g.moveTo(ft[0] + 2, ft[1] - 7); g.lineTo(ft[0] + 10, ft[1] - 2); g.stroke(); }
  };

  // ---- draw order: far arm, far leg, pelvis, torso, near leg, head, near arm
  arm(p.eB, p.hB, true);
  leg(p.kB, p.fB, true);
  const P = C(pants.color, pants.shade);
  cel(g, ell(p.hip[0], p.hip[1] - 2, 20 * thin * (kit.wideLegs || 1), 15, 0)(g), P[0], P[1], 0.4, 10);
  // torso quad
  const up = nrm(sub(p.sh, p.hip)), n = perp(up), sw = 25 * bulk * thin, hw = 18 * thin;
  const tA = add(add(p.sh, n, sw), up, -2), tB = add(add(p.sh, n, -sw), up, -2), tC = add(p.hip, n, -hw), tD = add(p.hip, n, hw);
  const torso = smoothP([add(tA, up, 3), lp(tA, tD, 0.5), add(tD, up, -2), add(lp(tC, tD, 0.5), up, -4), add(tC, up, -2), lp(tB, tC, 0.5), add(tB, up, 3), add(p.sh, up, 7)])(g);
  const TC = top.color ? C(top.color, top.shade) : skin;
  if (top.style === 'vest') {
    cel(g, torso, skin[0], skin[1], 0.4, 14);            // bare chest
    g.save(); torso(); g.clip();                          // vest panels (open front)
    const vf = C(top.color, top.shade);
    const front = (side) => { const a = add(p.sh, n, side * sw * 1.3), b = add(p.hip, n, side * hw * 1.4), c = add(lp(p.hip, p.sh, 0.15), n, side * hw * 0.25), d = add(lp(p.sh, p.hip, 0.05), n, side * sw * 0.35); return [add(a, up, 12), b, c, d]; };
    cel(g, polyP(front(1))(g), vf[0], vf[1], 0.4, 12); cel(g, polyP(front(-1))(g), vf[0], vf[1], 0.4, 12);
    g.restore(); torso(); g.lineWidth = OLW; g.strokeStyle = OUT; g.stroke();
  } else {
    cel(g, torso, TC[0], TC[1], 0.4, 14);
    if (top.shoulder) { g.save(); torso(); g.clip(); const sc = C(top.shoulder, mix(top.shoulder, '#000', 0.4)); cel(g, ell(p.sh[0], p.sh[1] + 2, sw * 1.25, 15, Math.atan2(n[1], n[0]))(g), sc[0], sc[1], 0.4, 8); g.restore(); torso(); g.lineWidth = OLW; g.strokeStyle = OUT; g.stroke(); }
    if (top.zip) { g.strokeStyle = alpha(OUT, 0.8); g.lineWidth = OLW * 0.7; g.beginPath(); g.moveTo(...add(p.sh, up, 2)); g.lineTo(...add(p.hip, up, 6)); g.stroke(); }
    if (top.lines) { g.save(); torso(); g.clip(); g.strokeStyle = top.lines; g.lineWidth = 3; for (let i = 0; i < 3; i++) { const a = lp(p.sh, p.hip, 0.25 + i * 0.22); g.beginPath(); g.moveTo(...add(a, n, -sw)); g.lineTo(...add(a, n, sw)); g.stroke(); } g.restore(); }
  }
  if (kit.sash) { const sc = C(kit.sash, mix(kit.sash, OUT, 0.3)); cel(g, capsule(add(p.hip, n, hw * 1.05), add(p.hip, n, -hw * 1.05), 5, 5)(g), sc[0], sc[1], 0.3, 5); }
  if (kit.belt) { const sc = C(kit.belt, mix(kit.belt, OUT, 0.3)); cel(g, capsule(add(add(p.hip, up, 6), n, hw * 1.02), add(add(p.hip, up, 6), n, -hw * 1.02), 3.5, 3.5)(g), sc[0], sc[1], 0.3, 4); }
  leg(p.kF, p.fF, false);
  // neck + head
  const hd = p.head, hr = 21 * (kit.headScale || 1), neckTop = lp(p.sh, hd, 0.55);
  cel(g, capsule(add(p.sh, up, 2), neckTop, 8 * thin + 1, 7.5 * thin + 1)(g), skin[0], skin[1], 0.4, 6);
  if (top.collar) { const cc = C(top.collar, mix(top.collar, OUT, 0.35)); cel(g, capsule(add(p.sh, n, sw * 0.6), add(p.sh, n, -sw * 0.6), 5, 5)(g), cc[0], cc[1], 0.3, 4); }
  const tilt = Math.atan2(hd[0] - p.sh[0], -(hd[1] - p.sh[1])) * 0.6;
  drawHair(g, kit, hd, hr, tilt, 'back', t, tint);
  cel(g, ell(hd[0], hd[1], hr * 0.92, hr, tilt)(g), skin[0], skin[1], 0.38, hr);
  if (o.faceGlow && o.faceGlow[1] > 0.01) { g.save(); g.beginPath(); g.ellipse(hd[0], hd[1], hr * 0.92, hr, tilt, 0, Math.PI * 2); g.clip(); g.globalAlpha *= o.faceGlow[1] * 0.75; const fg = g.createRadialGradient(hd[0] + hr * 0.6, hd[1] - hr * 0.1, 0, hd[0] + hr * 0.6, hd[1] - hr * 0.1, hr * 1.1); fg.addColorStop(0, o.faceGlow[0]); fg.addColorStop(1, alpha(o.faceGlow[0], 0)); g.fillStyle = fg; g.fillRect(hd[0] - hr * 2, hd[1] - hr * 2, hr * 4, hr * 4); g.restore(); g.save(); g.globalAlpha *= o.faceGlow[1] * 0.5; g.strokeStyle = o.faceGlow[0]; g.lineWidth = 3; g.beginPath(); g.ellipse(hd[0], hd[1], hr * 0.92 + 3, hr + 3, tilt, -0.9, 0.9); g.stroke(); g.restore(); }
  drawHair(g, kit, hd, hr, tilt, 'front', t, tint);
  arm(p.eF, p.hF, false);
  g.restore();
}

// hair / headwear (local fighter space, facing +x)
function drawHair(g, kit, hd, r, tilt, layerName, t, tint) {
  const H = kit.hair; if (!H) return;
  const hc = [tint(H.color), tint(H.shade)];
  g.save(); g.translate(hd[0], hd[1]); g.rotate(tilt);
  if (H.style === 'spiky' && layerName === 'back') {
    const pts = [], N = 9;
    for (let i = 0; i <= N; i++) {
      const a = -Math.PI * 1.1 + (i / N) * Math.PI * 1.05, sp = i % 2 === 0 ? r * 2.1 : r * 1.1;
      const w = Math.sin(t * 9 + i) * 1.2;
      pts.push([Math.cos(a) * sp + w - r * 0.15, Math.sin(a) * sp * 0.92 - r * 0.15]);
    }
    pts.push([-r * 0.3, r * 0.55], [-r * 0.95, r * 0.35]);
    cel(g, polyP(pts)(g), hc[0], hc[1], 0.35, r);
  }
  if (H.style === 'spiky' && layerName === 'front') {
    const band = kit.band;
    if (band) {
      const bc = [tint(band.color), tint(mix(band.color, OUT, 0.35))];
      cel(g, () => { g.beginPath(); g.ellipse(0, -r * 0.62, r * 0.9, r * 0.26, 0, Math.PI * 0.95, Math.PI * 2.05); g.ellipse(0, -r * 0.42, r * 0.97, r * 0.26, 0, Math.PI * 2.05, Math.PI * 0.95, true); g.closePath(); }, bc[0], bc[1], 0.3, 4);
      const pc = [tint(band.plate), tint(mix(band.plate, OUT, 0.3))];
      cel(g, () => { g.beginPath(); g.roundRect(r * 0.25, -r * 0.86, r * 0.62, r * 0.3, 2); }, pc[0], pc[1], 0.3, 3);
      // tails
      const w = Math.sin(t * 8) * 4;
      cel(g, polyP([[-r * 0.85, -r * 0.55], [-r * 2.0, -r * 0.35 + w], [-r * 1.9, -r * 0.1 + w], [-r * 0.8, -r * 0.35]])(g), bc[0], bc[1], 0.3, 3);
    }
    // front fringe spikes over the brow
    cel(g, polyP([[-r * 0.5, -r * 0.95], [r * 0.15, -r * 1.25], [r * 0.45, -r * 0.92], [r * 1.15, -r * 1.0], [r * 0.7, -r * 0.8], [r * 1.05, -r * 0.62], [r * 0.3, -r * 0.78], [-r * 0.2, -r * 0.75]])(g), hc[0], hc[1], 0.3, r * 0.4);
  }
  if (H.style === 'shaggy') {
    if (layerName === 'back') {
      const pts = []; const N = 14;
      for (let i = 0; i <= N; i++) { const a = Math.PI * 0.45 + (i / N) * Math.PI * 1.25, rr = (i % 2 ? 1.12 : 1.28) * r; pts.push([Math.cos(a) * rr - r * 0.1, Math.sin(a) * rr - r * 0.12]); }
      cel(g, polyP(pts)(g), hc[0], hc[1], 0.35, r);
    } else {
      cel(g, polyP([[-r * 0.8, -r * 0.75], [r * 0.2, -r * 1.05], [r * 0.95, -r * 0.5], [r * 0.75, -r * 0.3], [r * 0.55, -r * 0.42], [r * 0.4, -r * 0.18], [r * 0.15, -r * 0.45], [-r * 0.1, -r * 0.3], [-r * 0.5, -r * 0.5]])(g), hc[0], hc[1], 0.3, r * 0.4);
      if (kit.hat) {
        const hc2 = [tint(kit.hat.color), tint(kit.hat.shade)];
        cel(g, ell(r * 0.05, -r * 0.62, r * 1.9, r * 0.42, -0.08)(g), hc2[0], hc2[1], 0.35, 6);
        cel(g, () => { g.beginPath(); g.ellipse(0, -r * 0.82, r * 0.98, r * 0.78, 0, Math.PI, Math.PI * 2); g.closePath(); }, hc2[0], hc2[1], 0.35, r * 0.6);
        const bd = [tint(kit.hat.band), tint(mix(kit.hat.band, OUT, 0.35))];
        cel(g, () => { g.beginPath(); g.rect(-r * 0.97, -r * 0.98, r * 1.94, r * 0.24); }, bd[0], bd[1], 0.3, 3);
      }
    }
  }
  if (H.style === 'flame') { // Gear 5: white flame-like hair rising
    if (layerName === 'back') {
      const pts = []; const N = 11;
      for (let i = 0; i <= N; i++) {
        const a = -Math.PI * 1.15 + (i / N) * Math.PI * 1.3, up = i % 2 === 0;
        const rr = up ? r * (2.4 + 0.3 * Math.sin(t * 11 + i * 1.7)) : r * 1.15;
        pts.push([Math.cos(a) * rr * 0.85 - r * 0.25 + (up ? -r * 0.25 : 0), Math.sin(a) * rr - r * 0.25]);
      }
      pts.push([-r * 0.4, r * 0.6], [-r * 1.0, r * 0.3]);
      cel(g, smoothP(pts)(g), hc[0], hc[1], 0.35, r);
    } else cel(g, polyP([[-r * 0.6, -r * 0.7], [r * 0.3, -r * 1.1], [r * 1.0, -r * 0.55], [r * 0.55, -r * 0.4], [r * 0.2, -r * 0.5], [-r * 0.3, -r * 0.4]])(g), hc[0], hc[1], 0.3, r * 0.4);
  }
  g.restore();
}

// ---------- aura (draw BEFORE the fighter) ----------
// x,y = feet position, s = fighter scale, col = main colour, col2 = core colour
export function aura(g, x, y, s, col, col2, t, k = 1, o = {}) {
  if (k <= 0.01) return;
  const h = (o.h || 240) * s, cx = x, cy = y - h * 0.48, rx = (o.w || 95) * s, ry = h * 0.62;
  g.save(); g.globalAlpha *= clamp(k);
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry) * 1.25);
  gr.addColorStop(0, alpha(col2, 0.35)); gr.addColorStop(0.55, alpha(col, 0.22)); gr.addColorStop(1, alpha(col, 0));
  g.fillStyle = gr; g.beginPath(); g.ellipse(cx, cy, rx * 1.35, ry * 1.25, 0, 0, Math.PI * 2); g.fill();
  const N = 16, fr = Math.floor(t * 12);
  for (const [sc, c, a] of [[1.15, col, 0.42], [0.86, col2, 0.38]]) {
    g.fillStyle = alpha(c, a); g.strokeStyle = alpha(mix(c, OUT, 0.35), 0.6); g.lineWidth = 2;
    g.beginPath();
    for (let i = 0; i <= N; i++) {
      const a0 = Math.PI * (0.15 + 0.7 * 0) + (i / N) * Math.PI * 2, j = (noise(i * 3.1 + fr * 0.7, 5) + 1) / 2;
      const up = Math.max(0, -Math.sin(a0));
      const R = 1 + 0.18 * j + up * (0.35 + 0.35 * j);
      const px = cx + Math.cos(a0) * rx * sc * (i % 2 ? 0.86 : 1.0) * (1 - up * 0.25), py = cy + Math.sin(a0) * ry * sc * R * (i % 2 ? 0.9 : 1.06);
      i === 0 ? g.moveTo(px, py) : g.lineTo(px, py);
    }
    g.closePath(); g.fill(); if (sc > 1) g.stroke();
  }
  // rising sparks
  const R = rng(7 + fr);
  g.fillStyle = alpha(col2, 0.9);
  for (let i = 0; i < 10; i++) { const px = cx + (R() - 0.5) * rx * 2.2, py = cy + ry * 0.6 - ((R() + t * 1.6) % 1) * ry * 2.2; g.beginPath(); g.ellipse(px, py, 2.5 * s + 1, 9 * s + 2, 0, 0, Math.PI * 2); g.fill(); }
  g.restore();
}

// soft ground shadow under a fighter
export function groundShadow(g, x, y, s, a = 0.22) { g.save(); g.fillStyle = alpha('#3a2c22', a); g.beginPath(); g.ellipse(x, y + 2, 55 * s, 10 * s, 0, 0, Math.PI * 2); g.fill(); g.restore(); }

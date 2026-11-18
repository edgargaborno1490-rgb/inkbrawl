// _toon3d.js — Ink Brawl 3D toon fighters + misty grass arena (Three.js).
// Cel-shaded (MeshToonMaterial, 3-step ramp), inverted-hull outlines (dark, or glowing in a power mode),
// shared warm-brown skin, faces drawn onto the head (grin / eyes / glowing eyes). 1 unit = 1 metre.
// Skeleton = the 2D 11-point poses (x forward, y up) with near/far limbs offset in depth.
import { E, rng, clamp, lerp, mix, noise } from '/engine/core.js';
import { THREE, canvasTex } from '/engine/three-kit.js';
import { FP } from './_anime.js';

export const SKIN3 = '#8D5B3E', OUTC = '#1d120c';
const U = 1 / 140;
let RAMP = null;
function ramp() {
  if (RAMP) return RAMP;
  const d = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]);
  RAMP = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); RAMP.minFilter = RAMP.magFilter = THREE.NearestFilter; RAMP.needsUpdate = true; return RAMP;
}
export const toon = (c, o = {}) => new THREE.MeshToonMaterial({ color: new THREE.Color(c), gradientMap: ramp(), ...o });
const hullMat = (c, glow) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(glow ? 1.25 : 1), side: THREE.BackSide, toneMapped: !glow });
const SPH = new THREE.SphereGeometry(1, 20, 14);

// ---------- face textures (equirect: +x forward = u 0.5) ----------
const faceCache = {};
export function faceTex(expr, skin = SKIN3) {
  const k = expr + skin; if (faceCache[k]) return faceCache[k];
  const draw = (glowOnly) => (g, w, h) => {
    g.fillStyle = glowOnly ? '#000' : skin; g.fillRect(0, 0, w, h);
    const cx = w / 2, ey = h * 0.47, my = h * 0.6, ink = '#1d120c';
    g.lineCap = 'round'; g.lineJoin = 'round';
    if (expr === 'grin') { // Gear 5 laugh: closed happy eyes, huge toothy grin
      if (glowOnly) return;
      g.strokeStyle = ink; g.lineWidth = 7;
      for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * 34, ey + 6, 16, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
      g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(cx - 62, my - 10); g.quadraticCurveTo(cx, my + 62, cx + 62, my - 10); g.quadraticCurveTo(cx, my + 6, cx - 62, my - 10); g.fill();
      g.lineWidth = 5; g.stroke(); g.lineWidth = 2.5; for (let i = -4; i <= 4; i++) { g.beginPath(); g.moveTo(cx + i * 12, my - 4 + Math.abs(i) * 0.8); g.lineTo(cx + i * 11, my + 22 - Math.abs(i) * 2.2); g.stroke(); }
      g.beginPath(); g.moveTo(cx - 52, my + 4); g.quadraticCurveTo(cx, my + 22, cx + 52, my + 4); g.stroke();
    } else if (expr === 'glow') { // power mode: glowing slit eyes
      g.fillStyle = glowOnly ? '#fff3b0' : '#fff3b0';
      for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * 12, ey - 2); g.quadraticCurveTo(cx + s * 34, ey - 16, cx + s * 54, ey - 12); g.quadraticCurveTo(cx + s * 36, ey + 8, cx + s * 12, ey - 2); g.fill(); }
      if (!glowOnly) { g.strokeStyle = ink; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 14, my + 10); g.lineTo(cx + 14, my + 10); g.stroke(); }
    } else if (expr === 'wide') { // shocked white eyes
      if (glowOnly) return;
      for (const s of [-1, 1]) { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(cx + s * 32, ey, 17, 21, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = ink; g.lineWidth = 4; g.stroke(); g.fillStyle = ink; g.beginPath(); g.arc(cx + s * 30, ey + 2, 5, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = ink; g.beginPath(); g.ellipse(cx, my + 14, 12, 16, 0, 0, Math.PI * 2); g.fill();
    } else { // 'focus' (default): sharp determined eyes + brows
      if (glowOnly) return;
      for (const s of [-1, 1]) {
        g.fillStyle = '#fff'; g.beginPath(); g.moveTo(cx + s * 12, ey); g.quadraticCurveTo(cx + s * 32, ey - 14, cx + s * 52, ey - 6); g.quadraticCurveTo(cx + s * 34, ey + 12, cx + s * 12, ey); g.fill();
        g.strokeStyle = ink; g.lineWidth = 4; g.stroke(); g.fillStyle = ink; g.beginPath(); g.arc(cx + s * 30, ey - 2, 6.5, 0, Math.PI * 2); g.fill();
        g.lineWidth = 7; g.beginPath(); g.moveTo(cx + s * 10, ey - 18); g.lineTo(cx + s * 52, ey - 26); g.stroke();
      }
      g.strokeStyle = ink; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 16, my + 12); g.quadraticCurveTo(cx, my + 8, cx + 18, my + 14); g.stroke();
    }
  };
  const map = canvasTex(512, 256, draw(false)), em = canvasTex(512, 256, draw(true));
  return (faceCache[k] = { map, em });
}

// ---------- the fighter ----------
// kit = cast.js kit (colours). o = { glow: colour for glowing outline, expr, bulk, thin }
export function fighter3D(kit, o = {}) {
  const root = new THREE.Group(), g = new THREE.Group(); root.add(g);
  const glow = o.glow || kit.glow3d || null, outC = glow || OUTC, hull = hullMat(outC, !!glow);
  const parts = [];
  const add = (mesh, olK = 1.08) => { mesh.castShadow = true; g.add(mesh); if (olK) { const h = new THREE.Mesh(mesh.geometry, hull); h.userData.k = olK; g.add(h); mesh.userData.hull = h; } return mesh; };
  const M = (c) => toon(c);
  const skin = M(SKIN3), em = (c, i = 0.6) => toon(c, { emissive: new THREE.Color(c), emissiveIntensity: i });
  const powerCloth = (c) => (glow ? em(c, 0.12) : M(c));
  const top = kit.top || {}, pants = kit.pants || {};
  const sleeve = top.sleeves === 'long' ? powerCloth(top.color) : null, haki = kit.hakiArms ? toon('#2b1517', { emissive: new THREE.Color('#3a0006'), emissiveIntensity: 0.4 }) : null;
  const pantM = powerCloth(pants.color || '#444');
  // limb: tapered cylinder + end sphere
  const limb = (a, b, r1, r2, mat) => { const geo = new THREE.CylinderGeometry(r2 / r1, 1, 1, 14); const m = add(new THREE.Mesh(geo, mat), 1.18); const j = add(new THREE.Mesh(SPH, mat), 1.18); parts.push({ a, b, r: r1, m, j, r2 }); };
  const bulk = o.bulk ?? kit.bulk ?? 1, thin = o.thin ?? 1;
  const ar = 0.062 * bulk * thin, lr = 0.08 * thin;
  limb('sh', 'eB', ar, ar * 0.85, haki || sleeve || skin); limb('eB', 'hB', ar * 0.85, ar * 0.75, haki || sleeve || skin);
  limb('sh', 'eF', ar, ar * 0.85, haki || sleeve || skin); limb('eF', 'hF', ar * 0.85, ar * 0.75, haki || sleeve || skin);
  const shin = pants.len === 'knee' ? skin : pantM;
  limb('hip', 'kB', lr, lr * 0.8, pantM); limb('kB', 'fB', lr * 0.8, lr * 0.6, shin); limb('hip', 'kF', lr, lr * 0.8, pantM); limb('kF', 'fF', lr * 0.8, lr * 0.6, shin);
  // hands, feet
  const hands = ['hB', 'hF'].map(k => ({ k, m: add(new THREE.Mesh(SPH, haki || skin), 1.12) }));
  const shoeM = M(kit.shoes || SKIN3), feet = ['fB', 'fF'].map(k => ({ k, m: add(new THREE.Mesh(SPH, shoeM), 1.12) }));
  // torso: chest + waist + pelvis
  const torsoM = top.style === 'vest' ? powerCloth(top.color) : top.color ? powerCloth(top.color) : skin;
  const chest = add(new THREE.Mesh(SPH, torsoM), 1.06), waist = add(new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.62, 1, 16), torsoM), 1.08), pelvis = add(new THREE.Mesh(SPH, pantM), 1.08);
  const chestSkin = top.style === 'vest' ? add(new THREE.Mesh(SPH, skin), 0) : null;
  const sash = kit.sash ? add(new THREE.Mesh(new THREE.TorusGeometry(1, 0.28, 8, 20), M(kit.sash)), 0) : null;
  const shoulderPad = top.shoulder ? add(new THREE.Mesh(SPH, powerCloth(top.shoulder)), 1.05) : null;
  // neck + head with face
  const neck = add(new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 10), skin), 1.12);
  const head = new THREE.Group(); g.add(head);
  const ft = faceTex(o.expr || 'focus');
  const headMat = toon('#ffffff', { map: ft.map, emissiveMap: ft.em, emissive: new THREE.Color(o.expr === 'glow' ? '#ffd860' : '#000000'), emissiveIntensity: 1.6 });
  const hs = new THREE.Mesh(SPH, headMat); hs.scale.set(0.125, 0.14, 0.125); hs.castShadow = true; head.add(hs);
  const hh = new THREE.Mesh(SPH, hull); hh.scale.set(0.133, 0.149, 0.133); head.add(hh);
  buildHair(head, kit, glow, o);
  root.userData = { kit, head, faceMat: headMat };
  const P3 = (p, k) => { const near = /F$/.test(k) ? 0.11 : /B$/.test(k) ? -0.11 : 0; return new THREE.Vector3(p[0] * U, -p[1] * U, near); };
  const up = new THREE.Vector3(0, 1, 0), tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  const setHull = (m) => { const h = m.userData.hull; if (!h) return; h.position.copy(m.position); h.quaternion.copy(m.quaternion); h.scale.copy(m.scale).multiplyScalar(h.userData.k); };
  root.setPose = (pose) => {
    const p = typeof pose === 'string' ? FP[pose] : pose;
    for (const L of parts) {
      const A = P3(p[L.a], L.a), B = P3(p[L.b], L.b); if (L.a === 'sh') A.z = /F$/.test(L.b) ? 0.17 * bulk : -0.17 * bulk; if (L.a === 'hip') A.z = /F$/.test(L.b) ? 0.09 : -0.09;
      const len = A.distanceTo(B); tmp.copy(A).sub(B).normalize();
      L.m.position.copy(A).add(B).multiplyScalar(0.5); L.m.quaternion.setFromUnitVectors(up, tmp); L.m.scale.set(L.r, len, L.r); setHull(L.m);
      L.j.position.copy(B); L.j.scale.setScalar(L.r2 * 1.02); setHull(L.j);
    }
    for (const h of hands) { const P = P3(p[h.k], h.k); h.m.position.copy(P); h.m.scale.set(0.075 * bulk * thin + 0.01, 0.07 * bulk * thin + 0.01, 0.07 * bulk * thin + 0.01); setHull(h.m); }
    for (const f of feet) { const P = P3(p[f.k], f.k); f.m.position.copy(P).add(new THREE.Vector3(0.06, 0.04, 0)); f.m.scale.set(0.13, 0.055, 0.07); setHull(f.m); }
    const S0 = P3(p.sh, 'sh'), Hp = P3(p.hip, 'hip'); tmp.copy(S0).sub(Hp); const tl = tmp.length(); tmp.normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(up, tmp);
    chest.position.copy(Hp).addScaledVector(tmp, tl * 0.72); chest.quaternion.copy(q); chest.scale.set(0.15 * bulk * thin + 0.03, 0.17 * thin + 0.03, 0.2 * bulk * thin + 0.02); setHull(chest);
    waist.position.copy(Hp).addScaledVector(tmp, tl * 0.35); waist.quaternion.copy(q); waist.scale.set(0.15 * thin, tl * 0.55, 0.15 * thin); setHull(waist);
    pelvis.position.copy(Hp); pelvis.quaternion.copy(q); pelvis.scale.set(0.12 * thin + 0.01, 0.1, 0.15 * thin + 0.01); setHull(pelvis);
    if (chestSkin) { chestSkin.position.copy(chest.position).add(new THREE.Vector3(0.05 * thin, -0.02, 0)); chestSkin.quaternion.copy(q); chestSkin.scale.set(chest.scale.x * 0.82, chest.scale.y * 1.0, chest.scale.z * 0.42); }
    if (sash) { sash.position.copy(Hp).addScaledVector(tmp, tl * 0.08); sash.quaternion.copy(q).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2)); sash.scale.set(0.135 * thin + 0.005, 0.165 * thin + 0.005, 0.12); }
    if (shoulderPad) { shoulderPad.position.copy(S0).addScaledVector(tmp, -0.03); shoulderPad.quaternion.copy(q); shoulderPad.scale.set(0.13 * bulk * thin + 0.02, 0.07, 0.21 * bulk * thin + 0.03); setHull(shoulderPad); }
    const Hd = P3(p.head, 'head'); tmp2.copy(Hd).sub(S0);
    neck.position.copy(S0).addScaledVector(tmp2, 0.45); neck.quaternion.setFromUnitVectors(up, tmp2.clone().normalize()); neck.scale.set(0.05 * thin + 0.01, tmp2.length() * 0.7, 0.05 * thin + 0.01); setHull(neck);
    head.position.copy(Hd); head.rotation.z = -Math.atan2(p.head[0] - p.sh[0], -(p.head[1] - p.sh[1])) * 0.7;
    return root;
  };
  root.setExpr = (expr) => { const f = faceTex(expr); headMat.map = f.map; headMat.emissiveMap = f.em; headMat.emissive.set(expr === 'glow' ? '#ffd860' : '#000000'); headMat.needsUpdate = true; };
  root.setPose(o.pose || 'stand');
  return root;
}

function buildHair(head, kit, glow, o) {
  const H = kit.hair || {}, hm = toon(H.color || '#222', glow && H.style === 'spiky' ? { emissive: new THREE.Color(H.color), emissiveIntensity: 0.4 } : {}), hull = hullMat(glow || OUTC, !!glow);
  const piece = (geo, pos, rot, sc, k = 1.1, mat = hm) => { const m = new THREE.Mesh(geo, mat); m.position.set(...pos); m.rotation.set(...rot); m.scale.set(...sc); m.castShadow = true; head.add(m); const h = new THREE.Mesh(geo, hull); h.position.copy(m.position); h.rotation.copy(m.rotation); h.scale.set(sc[0] * k, sc[1] * k, sc[2] * k); head.add(h); return m; };
  const CONE = new THREE.ConeGeometry(1, 1, 7);
  if (H.style === 'spiky') { // Naruto: spikes fanning up/back
    piece(SPH, [-0.015, 0.03, 0], [0, 0, 0], [0.13, 0.13, 0.135], 1.06);
    const R = rng(5);
    for (let i = 0; i < 16; i++) {
      const a = -0.5 + (i % 8) / 7 * (Math.PI * 0.95 + 0.6) * 1.0, side = i < 8 ? 1 : -1, el = 0.15 + R() * 0.25;
      const dir = new THREE.Vector3(-Math.cos(a) * 0.9 - 0.15, Math.sin(a) * 0.9 + 0.35, side * (0.35 + R() * 0.3)).normalize();
      const len = 0.13 + R() * 0.07, pos = dir.clone().multiplyScalar(0.1);
      const m = piece(CONE, [pos.x, pos.y + 0.02, pos.z], [0, 0, 0], [0.045, len, 0.045], 1.15);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); m.position.addScaledVector(dir, len * 0.45);
      const h = head.children[head.children.length - 1]; h.quaternion.copy(m.quaternion); h.position.copy(m.position);
    }
    for (let i = 0; i < 3; i++) { const m = piece(CONE, [0.09, 0.07 - i * 0.015, -0.05 + i * 0.05], [0, 0, -2.1], [0.03, 0.09, 0.03], 1.15); }
    if (kit.band) { const b = new THREE.Mesh(new THREE.TorusGeometry(0.128, 0.022, 8, 28), toon(kit.band.color)); b.rotation.set(Math.PI / 2, 0.25, 0); b.position.y = 0.045; head.add(b);
      const pl = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.09), toon(kit.band.plate)); pl.position.set(0.122, 0.07, 0); pl.rotation.z = -0.25; head.add(pl); }
  }
  if (H.style === 'shaggy') { // Luffy: black mop + straw hat
    piece(SPH, [-0.02, 0.035, 0], [0, 0, 0], [0.135, 0.12, 0.14], 1.06);
    for (let i = 0; i < 7; i++) { const z = -0.1 + i * 0.033; piece(CONE, [0.075, -0.005, z], [0, 0, -2.6 + (i % 2) * 0.3], [0.03, 0.08, 0.03], 1.15); }
    if (kit.hat && o.hat !== false) {
      const hc = toon(kit.hat.color), brim = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.3, 0.018, 28), hc); brim.position.y = 0.085; brim.rotation.z = -0.12; brim.castShadow = true; head.add(brim);
      const bh = new THREE.Mesh(brim.geometry, hull); bh.position.copy(brim.position); bh.rotation.copy(brim.rotation); bh.scale.set(1.03, 1.8, 1.03); head.add(bh);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), hc); dome.position.y = 0.09; dome.rotation.z = -0.12; dome.scale.y = 0.95; head.add(dome);
      const dh = new THREE.Mesh(dome.geometry, hull); dh.position.copy(dome.position); dh.rotation.copy(dome.rotation); dh.scale.set(1.06, 1.0, 1.06); head.add(dh);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.152, 0.152, 0.035, 24, 1, true), toon(kit.hat.band)); band.position.y = 0.11; band.rotation.z = -0.12; head.add(band);
    }
  }
  if (H.style === 'flame') { // Gear 5: white flame hair streaming up/back
    const wm = toon(H.color);
    piece(SPH, [-0.02, 0.04, 0], [0, 0, 0], [0.14, 0.13, 0.145], 1.05, wm);
    const R = rng(9);
    for (let i = 0; i < 22; i++) {
      const dir = new THREE.Vector3(-0.4 - R() * 0.6, 0.6 + R() * 0.9, (R() - 0.5) * 1.6).normalize(), len = 0.18 + R() * 0.22;
      const m = piece(CONE, [0, 0, 0], [0, 0, 0], [0.05, len, 0.05], 1.12, wm); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); m.position.copy(dir).multiplyScalar(0.09 + len * 0.45);
      const h = head.children[head.children.length - 1]; h.quaternion.copy(m.quaternion); h.position.copy(m.position);
    }
  }
}

// cloud halo (Gear 5) as a ring of toon puffs; returns group, animate with .rotation.y
export function cloudRing3D(r = 0.32) {
  const g = new THREE.Group(), m = toon('#f4f0f6'), h = hullMat(OUTC);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, s = 0.07 + 0.025 * Math.sin(i * 2.3); const p = new THREE.Mesh(SPH, m); p.position.set(Math.cos(a) * r, Math.sin(i * 1.7) * 0.02, Math.sin(a) * r); p.scale.setScalar(s); const ph = new THREE.Mesh(SPH, h); ph.position.copy(p.position); ph.scale.setScalar(s * 1.1); g.add(ph, p); }
  return g;
}

// ---------- arena ----------
const grassTex = () => canvasTex(1024, 1024, (g, w, h) => {
  g.fillStyle = '#5f7f45'; g.fillRect(0, 0, w, h); const R = rng(3);
  for (let i = 0; i < 9000; i++) { const x = R() * w, y = R() * h, l = 8 + R() * 18; g.strokeStyle = ['#4f6e3a', '#6f9150', '#587a42', '#7c9c5a'][i % 4]; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - 0.5) * 6, y - l); g.stroke(); }
}, [24, 24]);
const bladeTex = () => canvasTex(256, 256, (g, w, h) => {
  const R = rng(7); for (let i = 0; i < 26; i++) { const x = R() * w, bh = h * (0.45 + R() * 0.55), lean = (R() - 0.5) * 50; g.fillStyle = ['#3f5f2e', '#557a3c', '#6b8f4a', '#4a6b35'][i % 4]; g.beginPath(); g.moveTo(x - 5, h); g.quadraticCurveTo(x + lean * 0.4, h - bh * 0.6, x + lean, h - bh); g.quadraticCurveTo(x + lean * 0.4 + 2, h - bh * 0.5, x + 5, h); g.fill(); }
});
// arena({ fogNear, fogFar, tall:true, rocks }) -> group (add to stage scene); also sets fog + sky
export function arena3D(st, o = {}) {
  const sc = st.scene, R = rng(o.seed || 2);
  sc.background = canvasTex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9fb0b8'); gr.addColorStop(0.6, '#c3ccce'); gr.addColorStop(1, '#d4d8d4'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  sc.fog = new THREE.Fog(new THREE.Color('#c4cbcc'), o.fogNear ?? 14, o.fogFar ?? 55);
  const grp = new THREE.Group();
  const gm = toon('#ffffff', { map: grassTex() }); const ground = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), gm); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; grp.add(ground);
  // tall grass tufts (crossed planes, instanced)
  if (o.tall !== false) {
    const bt = bladeTex(), bm = new THREE.MeshToonMaterial({ map: bt, alphaTest: 0.4, side: THREE.DoubleSide, gradientMap: ramp(), color: new THREE.Color('#ffffff') });
    const geo = new THREE.PlaneGeometry(1, 1); geo.translate(0, 0.5, 0);
    const N = o.grassN || 2600, inst = new THREE.InstancedMesh(geo, bm, N * 2), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    const clear = o.clear || 2.2;
    for (let i = 0; i < N; i++) {
      let x, z; do { x = (R() - 0.5) * 60; z = (R() - 0.5) * 60; } while (Math.hypot(x, z) < clear && R() < 0.85);
      const hgt = 0.35 + R() * 0.55, w = 0.9 + R() * 0.8, a = R() * Math.PI;
      for (let k = 0; k < 2; k++) { q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), a + k * Math.PI / 2); p.set(x, 0, z); s.set(w, hgt, 1); m4.compose(p, q, s); inst.setMatrixAt(i * 2 + k, m4); }
    }
    grp.add(inst);
  }
  // misty tree blobs far away
  const tm = toon('#4d6a50');
  for (let i = 0; i < 26; i++) { const a = R() * Math.PI * 2, d = 30 + R() * 25, x = Math.cos(a) * d, z = Math.sin(a) * d; for (let k = 0; k < 3; k++) { const m = new THREE.Mesh(SPH, tm); m.position.set(x + (R() - 0.5) * 3, 2.5 + R() * 2.5, z + (R() - 0.5) * 3); m.scale.set(2.2 + R(), 2.6 + R() * 1.5, 2.2 + R()); grp.add(m); } }
  // rocks
  const rm = toon('#8d867c'), rh = hullMat(OUTC);
  for (let i = 0; i < (o.rocks ?? 14); i++) { const geo = new THREE.DodecahedronGeometry(1, 0), m = new THREE.Mesh(geo, rm); const d = 4 + R() * 18, a = R() * Math.PI * 2; m.position.set(Math.cos(a) * d, 0.1, Math.sin(a) * d); const sc2 = 0.3 + R() * 0.8; m.scale.set(sc2 * 1.4, sc2, sc2); m.rotation.set(R(), R(), R()); m.castShadow = true; m.receiveShadow = true; const h = new THREE.Mesh(geo, rh); h.position.copy(m.position); h.rotation.copy(m.rotation); h.scale.copy(m.scale).multiplyScalar(1.05); grp.add(m, h); }
  // lighting tuned for toon look
  st.hemi.color.set('#e8eef0'); st.hemi.groundColor.set('#6f7a62'); st.hemi.intensity = 1.05; st.sun.color.set('#fff6ea'); st.sun.intensity = 1.5; st.sun.position.set(-6, 12, 8);
  sc.add(grp); return grp;
}

// ---------- 3D FX ----------
// glowing aura shell: back-faced, additive, flickering; follow a fighter with .position
export function auraShell(col, o = {}) {
  const g = new THREE.Group(); const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(0.9), transparent: true, opacity: o.opacity ?? 0.16, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  for (let i = 0; i < 14; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1, 8, 1, true), m); const a = (i / 14) * Math.PI * 2; c.position.set(Math.cos(a) * 0.3, 1.0, Math.sin(a) * 0.3); c.userData.a = a; g.add(c); }
  g.userData.tick = (t) => g.children.forEach((c, i) => { const f = 0.7 + 0.5 * (noise(t * 6 + i * 3.1, 2) + 1) / 2; c.scale.set(1, 1.6 * f, 1); c.position.y = 0.6 + 0.8 * f; });
  return g;
}
// Truth-Seeking Ball: black sphere with glowing orange rim
export function truthBall(r = 0.14) { const g = new THREE.Group(); g.add(new THREE.Mesh(SPH, toon('#151116'))); g.children[0].scale.setScalar(r); const h = new THREE.Mesh(SPH, hullMat('#ffa020', true)); h.scale.setScalar(r * 1.14); g.add(h); return g; }
export function rasen3D(r = 0.25) {
  const g = new THREE.Group(); const core = new THREE.Mesh(SPH, new THREE.MeshBasicMaterial({ color: new THREE.Color('#bfe8ff').multiplyScalar(2), toneMapped: false })); core.scale.setScalar(r); g.add(core);
  const bm = new THREE.MeshBasicMaterial({ color: new THREE.Color('#d8f2ff').multiplyScalar(1.4), transparent: true, opacity: 0.55, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const blades = new THREE.Group(); for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.PlaneGeometry(r * 5, r * 0.9), bm); b.position.x = r * 2.6; const p = new THREE.Group(); p.add(b); p.rotation.y = (i / 4) * Math.PI * 2; blades.add(p); } g.add(blades);
  g.userData.tick = (t) => { blades.rotation.y = t * 28; core.scale.setScalar(r * (1 + 0.08 * Math.sin(t * 40))); }; return g;
}
export function shockTorus(col = '#ffffff') { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 8, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(1.5), transparent: true, toneMapped: false })); m.rotation.x = Math.PI / 2; return m; }

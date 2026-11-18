import { E, registerShot } from '/engine/core.js';
import { THREE } from '/engine/three-kit.js';
import { fighter3D, arena3D, cloudRing3D, truthBall, auraShell } from './_toon3d.js';
import { FP } from './_anime.js';
import * as K from './cast.js';
const mk = (T) => { const st = T.stage({ fov: 35, bloom: 0.45, bloomThreshold: 0.97 }); T.getRenderer().toneMapping = THREE.NoToneMapping; arena3D(st); return st; };
registerShot('s01', { kind: '3d', init(T) {
  const st = mk(T);
  const n = fighter3D(K.NARUTO_SIX, { glow: '#ffb020', expr: 'glow', pose: FP.guard }); n.position.set(-1.3, 0, 0); st.add(n);
  const l = fighter3D(K.LUFFY_G5, { expr: 'grin', pose: FP.guard }); l.position.set(1.3, 0, 0); l.rotation.y = Math.PI; st.add(l);
  const cr = cloudRing3D(); cr.position.set(1.3, 1.25, 0); st.add(cr);
  for (let i = 0; i < 6; i++) { const b = truthBall(); const a = Math.PI * (0.3 + i * 0.12); b.position.set(-1.3 - 0.3 + Math.cos(a) * -0.6, 1.2 + Math.sin(a) * 0.7, -0.3); st.add(b); }
  return { stage: st };
}, draw(s, t) { const c = s.stage.camera; c.position.set(0.3, 1.1, 5.2); c.lookAt(0, 0.95, 0); } });
registerShot('s02', { kind: '3d', init(T) {
  const st = mk(T); const l = fighter3D(K.LUFFY_G5, { expr: 'grin', pose: FP.laugh }); l.rotation.y = -Math.PI / 2 + 0.25; st.add(l); const cr = cloudRing3D(); cr.position.set(0, 1.2, 0); st.add(cr); return { stage: st, l };
}, draw(s, t) { const c = s.stage.camera; c.position.set(0.6, 1.5, 1.3); c.lookAt(0, 1.45, 0); } });
registerShot('s03', { kind: '3d', init(T) {
  const st = mk(T); const n = fighter3D(K.NARUTO_SIX, { glow: '#ffb020', expr: 'glow', pose: FP.tall }); n.rotation.y = -Math.PI / 2; st.add(n);
  for (let i = 0; i < 9; i++) { const b = truthBall(0.12); const a = Math.PI * (0.05 + i * 0.112); b.position.set(Math.cos(a) * 0.75, 1.3 + Math.sin(a) * 0.6, -0.4); st.add(b); }
  const au = auraShell("#ffb020"); st.add(au); return { stage: st, au };
}, draw(s, t) { s.au.userData.tick(t); const c = s.stage.camera; c.position.set(0, 1.25, 2.3); c.lookAt(0, 1.3, 0); } });

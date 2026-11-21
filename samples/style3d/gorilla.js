// Ink Brawl gorilla, drawn to match reference/gorilla-master.png (owner's design): white fill, thick black outline,
// domed head with a hair crest, round ears, peanut-shaped face, chest pecs + belly, huge furry arms with tufted cuffs,
// big fists, short thick legs. Local units = world units, feet at y=0, front-facing. Needs ink.js.
const GLW = 13;                                    // gorilla line width (a bit heavier than the stick men, like the reference)
const G_ARMS = {   // per pose: left/right shoulder->elbow->hand (left = screen left)
  STAND:  { le:[-222,-215], lh:[-212,-92],  re:[222,-215], rh:[212,-92] },
  ROAR:   { le:[-220,-200], lh:[-78,-248],  re:[220,-200], rh:[78,-248] },
  SWINGR: { le:[-222,-215], lh:[-212,-92],  re:[300,-330], rh:[455,-318] },
  SWINGL: { le:[-300,-330], lh:[-455,-318], re:[222,-215], rh:[212,-92] },
  RAISE:  { le:[-215,-430], lh:[-140,-590], re:[215,-430], rh:[140,-590] },
  SLAM:   { le:[-232,-200], lh:[-190,-48],  re:[232,-200], rh:[190,-48] },
  TIRED:  { le:[-212,-180], lh:[-188,-56],  re:[212,-180], rh:[188,-56] },
};
function gorillaPose(name) { const a = G_ARMS[name]; return { ...JSON.parse(JSON.stringify(a)), dip: name === 'TIRED' ? 40 : name === 'SLAM' ? 30 : 0 }; }
function gorillaLerp(a, b, k) { const o = {}; for (const n of ['le','lh','re','rh']) o[n] = [lerp(a[n][0], b[n][0], k), lerp(a[n][1], b[n][1], k)]; o.dip = lerp(a.dip, b.dip, k); return o; }
const gOut = (d, fill = W, w = GLW) => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
function furArm(sh, el, hd) {                      // bulky furry arm in one piece: fluffy edge bumps, tufted cuff, big mitt fist
  const WU = 138, WF = 118;
  const segs = [[sh, el, WU], [el, hd, WF]];
  let black = '', white = '';
  for (const [p, q, w] of segs) {
    black += pen([p, q], INK, w + GLW * 2); white += pen([p, q], W, w);
    const d = [q[0] - p[0], q[1] - p[1]], L = Math.hypot(...d), u = [d[0] / L, d[1] / L], n = [-u[1], u[0]];
    for (let t = .15; t < .95; t += .17) for (const sg of [-1, 1]) {           // fur bumps along both edges
      const c = [p[0] + d[0] * t + n[0] * sg * (w / 2 + 2), p[1] + d[1] * t + n[1] * sg * (w / 2 + 2)];
      black += `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${16 + GLW}" fill="${INK}"/>`;
      white += `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="16" fill="${W}"/>`;
    }
  }
  black += `<circle cx="${el[0]}" cy="${el[1]}" r="${WU / 2 + GLW}" fill="${INK}"/>`; white += `<circle cx="${el[0]}" cy="${el[1]}" r="${WU / 2}" fill="${W}"/>`;
  let g = black + white;
  const d = [hd[0] - el[0], hd[1] - el[1]], L = Math.hypot(...d), u = [d[0] / L, d[1] / L], n = [-u[1], u[0]];
  const c = [hd[0] - u[0] * 46, hd[1] - u[1] * 46], z = [];                 // fur line across the cuff
  for (let i = -3; i <= 3; i++) { const o = i * 16, back = i % 2 ? 0 : 13; z.push([c[0] + n[0] * o - u[0] * back, c[1] + n[1] * o - u[1] * back]); }
  g += pen(z, INK, 7);
  const f = [hd[0] + u[0] * 12, hd[1] + u[1] * 12];                          // big mitt fist with finger lines
  g += `<ellipse cx="${f[0]}" cy="${f[1]}" rx="56" ry="50" transform="rotate(${Math.atan2(u[1], u[0]) * 180 / Math.PI - 90} ${f[0]} ${f[1]})" fill="${W}" stroke="${INK}" stroke-width="${GLW}"/>`;
  for (const k of [-18, 6]) { const p0 = [f[0] + u[0] * 26 + n[0] * k, f[1] + u[1] * 26 + n[1] * k];
    g += pen([[p0[0] - u[0] * 22, p0[1] - u[1] * 22], [p0[0], p0[1]]], INK, 6); }
  return g;
}
function gorillaFace(x, y, mood) {                  // (x,y) = centre of the face area
  let g = gOut(`M${x-74},${y-34} Q${x-44},${y-62} ${x},${y-42} Q${x+44},${y-62} ${x+74},${y-34} Q${x+98},${y-2} ${x+74},${y+26} Q${x+90},${y+72} ${x+48},${y+86} Q${x},${y+100} ${x-48},${y+86} Q${x-90},${y+72} ${x-74},${y+26} Q${x-98},${y-2} ${x-74},${y-34} Z`, W, GLW * .9);
  if (mood === 'ko') return g + [-1, 1].map(s => pen([[x+s*32-11,y-8],[x+s*32+11,y+14]], INK, 8) + pen([[x+s*32+11,y-8],[x+s*32-11,y+14]], INK, 8)).join('')
                          + `<ellipse cx="${x}" cy="${y+56}" rx="16" ry="12" fill="${INK}"/>`;
  if (mood === 'happy') return g + pen([[x-46,y+8],[x-32,y-8],[x-18,y+8]], INK, 9) + pen([[x+18,y+8],[x+32,y-8],[x+46,y+8]], INK, 9)
                          + pen([[x-22,y+56],[x,y+66],[x+22,y+56]], INK, 7);
  // angry brows + small eyes
  g += pen([[x-60,y-20],[x-14,y-6]], INK, 10) + pen([[x+60,y-20],[x+14,y-6]], INK, 10);
  g += `<ellipse cx="${x-32}" cy="${y+12}" rx="7" ry="12" fill="${INK}"/><ellipse cx="${x+32}" cy="${y+12}" rx="7" ry="12" fill="${INK}"/>`;
  if (mood === 'roar') g += `<ellipse cx="${x}" cy="${y+56}" rx="30" ry="32" fill="${INK}"/>`
      + poly([[x-20,y+30],[x-12,y+30],[x-16,y+46]], W) + poly([[x+12,y+30],[x+20,y+30],[x+16,y+46]], W)
      + `<ellipse cx="${x}" cy="${y+76}" rx="16" ry="8" fill="#b9b2a8"/>`;
  else if (mood === 'tired') g += `<ellipse cx="${x}" cy="${y+58}" rx="18" ry="14" fill="${INK}"/>`;
  return g;
}
function drawGorilla(st) {                         // st: {arms (from gorillaPose/gorillaLerp), mood, sweat}
  const a = st.arms, dip = a.dip, hy = -405 + dip, HS = 1.3;   // head centre, head scale (big head like the reference)
  let g = '';
  g += gOut(`M-112,-112 L-116,-14 Q-116,0 -100,0 L-40,0 Q-28,0 -28,-14 L-28,-44 Q0,-62 28,-44 L28,-14 Q28,0 40,0 L100,0 Q116,0 116,-14 L112,-112 Z`);
  g += gOut(`M-152,${-318 + dip} Q-198,-226 -130,-98 Q0,-72 130,-98 Q198,-226 152,${-318 + dip} Q0,${-356 + dip} -152,${-318 + dip} Z`);
  const py = dip + 62;
  g += gOut(`M-78,${-335 + py} Q-112,${-300 + py} -76,${-262 + py} Q-38,${-248 + py} 0,${-272 + py} Q38,${-248 + py} 76,${-262 + py} Q112,${-300 + py} 78,${-335 + py} Q38,${-352 + py} 0,${-326 + py} Q-38,${-352 + py} -78,${-335 + py} Z`, W, GLW * .85);
  g += `<path d="M-60,${-196 + dip} Q-66,-112 0,-106 Q66,-112 60,${-196 + dip}" fill="none" stroke="${INK}" stroke-width="${GLW * .85}" stroke-linecap="round"/>`;
  const shL = [-140, -300 + dip], shR = [140, -300 + dip];
  const armsUp = a.lh[1] < -420;
  const arms = furArm(shL, a.le, a.lh) + furArm(shR, a.re, a.rh);
  if (armsUp) g += arms;
  let h = '';
  for (const s of [-1, 1]) h += `<circle cx="${s * 112}" cy="${10}" r="36" fill="${W}" stroke="${INK}" stroke-width="${GLW / HS}"/>` + pen([[s*104,-2],[s*116,18]], INK, 6 / HS);
  h += `<path d="M-104,50 Q-124,-60 -50,-108 Q-36,-136 -10,-128 Q4,-150 24,-128 Q46,-132 52,-108 Q124,-60 104,50 Q0,92 -104,50 Z" fill="${W}" stroke="${INK}" stroke-width="${GLW / HS}" stroke-linejoin="round"/>`;
  h += pen([[-12,-112],[-2,-96]], INK, 6 / HS) + pen([[10,-114],[18,-98]], INK, 6 / HS);
  g += `<g transform="translate(0,${hy}) scale(${HS})">${h}</g>`;
  g += `<g transform="translate(0,${hy + 8}) scale(1.22)">${gorillaFace(0, 0, st.mood)}</g>`;
  if (!armsUp) g += arms;
  if (st.sweat) for (const [sx, sy, r] of [[-200, hy - 90, 18], [205, hy - 50, 15], [180, hy - 140, 11]])
    g += `<path d="M${sx},${sy - r * 1.8} Q${sx + r},${sy} ${sx},${sy + r} Q${sx - r},${sy} ${sx},${sy - r * 1.8} Z" fill="${W}" stroke="${INK}" stroke-width="6"/>`;
  return { svg: g, top: hy - 150 * HS };
}

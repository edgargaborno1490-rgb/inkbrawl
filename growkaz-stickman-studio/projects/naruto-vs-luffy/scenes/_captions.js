// _captions.js — ONE big bold white word at a time, landing on the spoken word (Ink Brawl rule).
// Each entry: [spoken word to match, text shown]. Matched in order against timeline/words.json.
import { E, V, clamp, ease, wordTime, measure } from '/engine/core.js';

const PICKS = [
  ['naruto', 'NARUTO'], ['luffy', 'LUFFY'], ['gear', 'GEAR'], ['five', 'FIVE'], ['six', 'SIX'], ['paths', 'PATHS'], ['who', 'WHO'], ['win', 'WIN?'],
  ['luffy', 'LUFFY'], ['first', 'FIRST'], ['second', 'SECOND'], ['jet', 'JET'], ['pistol', 'PISTOL'], ['faster', 'FASTER'], ['eye', 'EYE'],
  ['naruto', 'NARUTO'], ['answers', 'ANSWERS'], ['army', 'ARMY'], ['clones', 'CLONES'],
  ['future', 'FUTURE'], ['sight', 'SIGHT'], ['every', 'EVERY'], ['clone', 'CLONE'], ['moves', 'MOVES'], ['fourth', 'FOURTH'], ['snakeman', 'SNAKEMAN'],
  ['punches', 'PUNCHES'], ['bend', 'BEND'], ['corners', 'CORNERS'], ['burst', 'BURST'], ['smoke', 'SMOKE'],
  ['pops', 'POPS'], ['naruto', 'NARUTO'], ['saw', 'SAW'],
  ['sage', 'SAGE'], ['mode', 'MODE'], ["kurama's", 'KURAMA'], ['golden', 'GOLDEN'], ['throws', 'THROWS'], ['rasenshuriken', 'RASENSHURIKEN'],
  ['luffy', 'LUFFY'], ['fists', 'FISTS'], ["conqueror's", 'CONQUEROR'], ['haki', 'HAKI'], ['head', 'HEAD-ON'],
  ['drums', 'DRUMS'], ['gear', 'GEAR'], ['five', 'FIVE'], ['ground', 'GROUND'], ['rubber', 'RUBBER'], ['bounces', 'BOUNCES'], ['arena', 'ARENA'],
  ['moment', 'MOMENT'], ['no', 'NO'], ['answer', 'ANSWER'],
  ['burns', 'BURNS'], ['stamina', 'STAMINA'], ['kizaru', 'KIZARU'], ['shriveled', 'SHRIVELED'], ['drained', 'DRAINED'],
  ['naruto', 'NARUTO'], ['chakra', 'CHAKRA'], ['nine', 'NINE'], ['beasts', 'BEASTS'], ['six', 'SIX'], ['paths', 'PATHS'], ['truth', 'TRUTH-SEEKING'], ['balls', 'BALLS'],
  ['outlast', 'OUTLAST'],
  ['naruto', 'NARUTO'], ['wins', 'WINS'], ['close', 'CLOSE'], ['luffy', 'LUFFY'], ['harder', 'HARDER'], ['bigger', 'BIGGER'], ['tank', 'TANK'],
  ['clones', 'CLONES'], ['down', 'DOWN'], ['comment', 'COMMENT'], ['you', 'YOU'], ['wins', 'WINS'], ['fight', 'FIGHT'], ['next', 'NEXT?'],
];

let CAPS = null;
function build() {
  CAPS = []; let after = 0;
  for (const [m, txt] of PICKS) {
    const t = wordTime(m, after); if (t == null) { console.log('caption word missing: ' + m + ' after ' + after); continue; }
    const w = E.words.find(w => Math.abs(w.start - t) < 1e-6);
    CAPS.push({ t, end: w ? w.end : t + 0.4, txt }); after = t + 0.01;
  }
  CAPS.forEach((c, i) => { const nxt = CAPS[i + 1]; c.until = Math.min(nxt ? nxt.t : 1e9, c.end + 1.1); });
  CAPS[CAPS.length - 1].until = 1e9;
}
export function captionAt(t) { if (!CAPS) build(); for (const c of CAPS) if (t >= c.t && t < c.until) return c; return null; }

window.OVERLAY = (g, t) => {
  const c = captionAt(t); if (!c) return;
  const k = clamp((t - c.t) / 0.09), sc = 1.28 - 0.28 * ease.out(k);
  let size = V(132, 118); const maxW = E.W * V(0.82, 0.88);
  const w = measure(g, c.txt, size, 'Anton', 400); if (w > maxW) size *= maxW / w;
  const x = E.W / 2, y = E.H * V(0.86, 0.72);
  g.save(); g.translate(x, y); g.scale(sc, sc);
  g.font = `400 ${size}px "Anton"`; g.textAlign = 'center'; g.textBaseline = 'middle'; if ('letterSpacing' in g) g.letterSpacing = '2px';
  g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#000'; g.strokeText(c.txt, 0, 0);   // ~6 px outline outside the fill
  g.fillStyle = '#fff'; g.fillText(c.txt, 0, 0); g.restore();
};

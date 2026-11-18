// cast.js — Ink Brawl fighter kits. Keep these IDENTICAL across videos; copy a kit when a fighter returns.
// Skin is never set here: every fighter uses the shared brown SKIN from _anime.js. No emblems or logos.

// ---- Naruto Uzumaki (end-of-war) ----
export const NARUTO = {
  name: 'Naruto',
  hair: { style: 'spiky', color: '#F6C21C', shade: '#D2950C' },
  band: { color: '#22304F', plate: '#BCC3CB' },                    // plain headband plate, no symbol
  top: { style: 'jacket', color: '#F27A1D', shade: '#C65A0E', sleeves: 'long', shoulder: '#2B2A33', collar: '#2B2A33', zip: true, cuff: '#2B2A33' },
  pants: { color: '#F27A1D', shade: '#C65A0E', len: 'long', wrap: '#E8E2D6' },
  shoes: '#2B2A33',
  aura: '#FF8A1A', aura2: '#FFD25A',
};
// Sage Mode: same outfit, orange glow band across the face area (light, not eyes)
export const NARUTO_SAGE = { ...NARUTO, faceGlow: ['#FF6A1A', 0.85], aura: '#FF6A1A', aura2: '#FFB04A' };
// Kurama chakra mode: golden cloak with dark lines
export const NARUTO_KCM = {
  ...NARUTO,
  top: { style: 'jacket', color: '#FFC62E', shade: '#E39A12', sleeves: 'long', shoulder: '#FFE27A', collar: '#2B2A33', cuff: '#E39A12' },
  pants: { color: '#FFC62E', shade: '#E39A12', len: 'long', wrap: '#FFE9A8' },
  hair: { style: 'spiky', color: '#FFD84A', shade: '#E9A815' },
  aura: '#FFB21A', aura2: '#FFF1A8',
};
// Six Paths Sage Mode: brighter gold-white cloak
export const NARUTO_SIX = {
  ...NARUTO_KCM,
  top: { style: 'jacket', color: '#FFE07A', shade: '#F0B23A', sleeves: 'long', shoulder: '#FFF4C8', collar: '#2B2A33', cuff: '#F0B23A' },
  pants: { color: '#2B2A33', shade: '#17161c', len: 'long', wrap: '#FFE9A8' },
  faceGlow: ['#FF7A1A', 0.8],
  aura: '#FFC93A', aura2: '#FFFBE0',
};

// ---- Monkey D. Luffy ----
export const LUFFY = {
  name: 'Luffy',
  hair: { style: 'shaggy', color: '#1E1A1D', shade: '#0C0A0C' },
  hat: { color: '#EBC86A', shade: '#C9A146', band: '#C8282E' },
  top: { style: 'vest', color: '#D7262D', shade: '#A81A20' },
  sash: '#F2C230',
  pants: { color: '#2F5DA8', shade: '#21437D', len: 'knee', cuff: '#F1ECE2' },
  shoes: '#B98A55', sandalStrap: '#6b4a2a',
  aura: '#E0313A', aura2: '#FF8A8A',
};
// Gear 2: same look, pink steam (drawn as FX)
export const LUFFY_G2 = { ...LUFFY, aura: '#FF6FA0', aura2: '#FFD0E0' };
// Gear 4 Snakeman: bigger upper body, Haki-black arms with red glints
export const LUFFY_G4 = { ...LUFFY, bulk: 1.35, hakiArms: true, aura: '#C0102A', aura2: '#FF5A6A' };
// Haki-coated fists (normal build)
export const LUFFY_HAKI = { ...LUFFY, hakiArms: true, aura: '#B0101E', aura2: '#2A0A0E' };
// Gear 5: white hair like flames, white clothes, no hat (on his back)
export const LUFFY_G5 = {
  ...LUFFY,
  hair: { style: 'flame', color: '#F7F4EF', shade: '#D8D0DE' },
  hat: null,
  top: { style: 'vest', color: '#F4F0F6', shade: '#D2C8DE' },
  sash: '#E9E2F2',
  pants: { color: '#EEEAF4', shade: '#CFC6DE', len: 'knee', cuff: '#FFFFFF' },
  aura: '#FFFFFF', aura2: '#F2E8FF',
};
// Gear 5 worn out: shriveled (drawn with thin < 1 and smaller s)
export const LUFFY_DRAINED = { ...LUFFY, hat: { color: '#D9BE78', shade: '#B79A55', band: '#A8282E' } };

// Renders the 15 s sprite test (owner's traced drawings): frames from sprite-test.html, then SFX from sfx-library mixed in with ffmpeg.
// Usage: NODE_PATH=$(npm root -g) node render_sprite_test.cjs [--stills 1,4.2,11.4]   (stills only, for checking)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const D = __dirname, LIB = path.join(D, '../../sfx-library'), FPS = 30, DUR = 15;

// [time s, sound, volume]
const SFX = [
  [0.0, 'drums_1', .7], [0.3, 'whoosh_big_1', .7], [0.9, 'impact_frame_1', .8], [1.3, 'stinger_1', .7],
  [2.0, 'whoosh_1', .6], [2.55, 'punch_1', .9], [3.12, 'punch_heavy_1', 1], [3.95, 'ground_slam_1', .6], [4.6, 'smoke_pop_1', .6],
  [4.0, 'whoosh_2', .6], [4.6, 'kick_1', 1], [4.85, 'punch_2', .8], [5.42, 'punch_heavy_2', 1], [5.5, 'ground_slam_2', .5],
  [6.1, 'smoke_pop_2', .6], [6.1, 'whoosh_big_2', .6], [6.3, 'aura_charge_1', 1], [6.4, 'rumble_1', .5], [6.9, 'smoke_pop_1', .6],
  [7.2, 'kick_2', .9], [7.25, 'punch_1', .8], [7.8, 'kick_1', .9], [8.0, 'punch_2', .8], [8.4, 'punch_heavy_1', 1],
  [8.45, 'whoosh_big_1', .7], [9.2, 'ground_slam_1', 1], [9.2, 'boom_1', .8], [10.0, 'stinger_2', .9], [13.6, 'impact_frame_2', .8],
];

(async () => {
  const stillsArg = process.argv.indexOf('--stills');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.join(D, 'sprite-test.html'), { waitUntil: 'networkidle' }).catch(() => {});
  await p.evaluate(() => document.fonts.ready);
  if (stillsArg > 0) {
    for (const t of process.argv[stillsArg + 1].split(',').map(Number)) {
      await p.evaluate(t => setT(t), t); await p.screenshot({ path: path.join(D, `still-${t}.png`) });
    }
    return b.close();
  }
  const tmp = fs.mkdtempSync('/tmp/spr-');
  for (let i = 0; i < FPS * DUR; i++) {
    await p.evaluate(t => setT(t), i / FPS);
    await p.screenshot({ path: path.join(tmp, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
  }
  await b.close();
  const ins = SFX.map(s => `-i ${path.join(LIB, s[1] + '.mp3')}`).join(' ');
  const chains = SFX.map((s, i) => `[${i + 1}:a]adelay=${Math.round(s[0] * 1000)}:all=1,volume=${s[2]}[a${i}]`).join(';');
  const mix = SFX.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${SFX.length}:normalize=0,alimiter=limit=0.9,apad,atrim=0:${DUR}[aout]`;
  execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i ${tmp}/f%04d.jpg ${ins} -filter_complex "${chains};${mix}" ` +
    `-map 0:v -map "[aout]" -c:v libx264 -pix_fmt yuv420p -crf 18 -c:a aac -b:a 192k -t ${DUR} ${path.join(D, 'sprite-test.mp4')}`);
  fs.rmSync(tmp, { recursive: true });
  console.log('wrote sprite-test.mp4');
})();

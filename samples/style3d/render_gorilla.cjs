// Renders the 15 s gorilla sample: frames from gorilla-sample.html, then SFX from sfx-library mixed in with ffmpeg.
// Usage: NODE_PATH=$(npm root -g) node render_gorilla.cjs [--stills 1,4.2,11.4]   (stills only, for checking)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const D = __dirname, LIB = path.join(D, '../../sfx-library'), FPS = 30, DUR = 15;

// [time s, sound, volume]
const SFX = [
  [0.0, 'drums_1', .7], [0.3, 'whoosh_big_1', .7], [1.0, 'impact_frame_1', .8], [1.45, 'stinger_1', .8],
  [2.6, 'riser_1', .5], [2.75, 'aura_charge_1', 1], [3.0, 'ground_slam_1', .7], [3.35, 'punch_heavy_1', .6], [3.7, 'punch_heavy_2', .6],
  [4.0, 'whoosh_1', .6], [4.2, 'kick_combo_1', .5], [4.85, 'whoosh_big_2', .7], [4.95, 'punch_heavy_1', 1], [5.35, 'whoosh_big_1', .7],
  [5.45, 'punch_heavy_2', 1], [6.0, 'whoosh_2', .6], [6.2, 'kick_combo_2', .5], [6.8, 'riser_2', .6], [7.3, 'ground_slam_2', 1],
  [7.3, 'boom_1', .9], [7.95, 'whoosh_big_2', .6], [8.05, 'punch_heavy_1', .9], [8.4, 'smoke_pop_multi_1', .7],
  [8.9, 'heartbeat_1', 1], [9.6, 'heartbeat_2', 1], [9.7, 'rumble_1', .6], [10.2, 'kick_combo_1', .7], [10.6, 'kick_combo_2', .7],
  [11.3, 'punch_heavy_2', .8], [11.6, 'kick_combo_1', .6], [12.1, 'whoosh_big_1', .7], [12.6, 'ground_slam_1', 1], [12.6, 'boom_2', .8],
  [12.6, 'smoke_pop_multi_2', .6], [13.6, 'stinger_2', 1],
];

(async () => {
  const stillsArg = process.argv.indexOf('--stills');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.join(D, 'gorilla-sample.html'), { waitUntil: 'networkidle' }).catch(() => {});
  await p.evaluate(() => document.fonts.ready);
  if (stillsArg > 0) {
    for (const t of process.argv[stillsArg + 1].split(',').map(Number)) {
      await p.evaluate(t => setT(t), t); await p.screenshot({ path: path.join(D, `still-${t}.png`) });
    }
    return b.close();
  }
  const tmp = fs.mkdtempSync('/tmp/gor-');
  for (let i = 0; i < FPS * DUR; i++) {
    await p.evaluate(t => setT(t), i / FPS);
    await p.screenshot({ path: path.join(tmp, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
  }
  await b.close();
  const ins = SFX.map(s => `-i ${path.join(LIB, s[1] + '.mp3')}`).join(' ');
  const chains = SFX.map((s, i) => `[${i + 1}:a]adelay=${Math.round(s[0] * 1000)}:all=1,volume=${s[2]}[a${i}]`).join(';');
  const mix = SFX.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${SFX.length}:normalize=0,alimiter=limit=0.9,apad,atrim=0:${DUR}[aout]`;
  execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i ${tmp}/f%04d.jpg ${ins} -filter_complex "${chains};${mix}" ` +
    `-map 0:v -map "[aout]" -c:v libx264 -pix_fmt yuv420p -crf 18 -c:a aac -b:a 192k -t ${DUR} ${path.join(D, 'gorilla-sample.mp4')}`);
  fs.rmSync(tmp, { recursive: true });
  console.log('wrote gorilla-sample.mp4');
})();

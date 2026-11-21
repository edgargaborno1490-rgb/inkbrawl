// Renders the 15 s fight test: frames from fight15.html, then SFX from sfx-library mixed in with ffmpeg.
// Usage: NODE_PATH=$(npm root -g) node render_fight15.cjs [--stills 1,4.2,11.4]   (stills only, for checking)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const D = __dirname, LIB = path.join(D, '../../sfx-library'), FPS = 30, DUR = 15;

// [time s, sound, volume]
const SFX = [
  [0.0, 'riser_1', .6], [0.3, 'whoosh_big_1', .7], [2.6, 'impact_frame_1', .9],
  [2.95, 'whoosh_1', .6], [3.1, 'aura_charge_1', .55], [3.45, 'punch_1', .9], [3.6, 'punch_2', .7],
  [4.05, 'whoosh_2', .6], [4.2, 'kick_1', 1], [4.2, 'impact_frame_2', .8], [4.4, 'punch_1', .6],
  [4.9, 'ground_slam_1', .7], [5.3, 'smoke_pop_1', .6], [5.6, 'aura_charge_2', .5],
  [6.1, 'whoosh_big_2', .7], [6.3, 'boom_1', 1], [7.1, 'ground_slam_2', .6], [7.4, 'smoke_pop_2', .6],
  [7.3, 'whoosh_1', .6], [7.95, 'punch_2', .8], [8.3, 'punch_heavy_1', 1], [9.1, 'ground_slam_1', .6],
  [9.4, 'smoke_pop_1', .6], [9.6, 'heartbeat_1', 1], [10.1, 'riser_2', .7], [10.4, 'heartbeat_2', .9],
  [10.9, 'whoosh_big_1', .7], [11.4, 'shockwave_1', 1], [11.4, 'punch_heavy_2', .9], [12.0, 'punch_heavy_1', 1],
  [12.0, 'impact_frame_1', .8], [12.85, 'ground_slam_2', .7], [13.2, 'smoke_pop_2', .6], [13.3, 'stinger_1', 1],
];

(async () => {
  const stillsArg = process.argv.indexOf('--stills');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.join(D, 'fight15.html'), { waitUntil: 'networkidle' }).catch(() => {});
  await p.evaluate(() => document.fonts.ready);
  if (stillsArg > 0) {
    for (const t of process.argv[stillsArg + 1].split(',').map(Number)) {
      await p.evaluate(t => setT(t), t); await p.screenshot({ path: path.join(D, `still-${t}.png`) });
    }
    return b.close();
  }
  const tmp = fs.mkdtempSync('/tmp/f15-');
  for (let i = 0; i < FPS * DUR; i++) {
    await p.evaluate(t => setT(t), i / FPS);
    await p.screenshot({ path: path.join(tmp, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
  }
  await b.close();
  const ins = SFX.map(s => `-i ${path.join(LIB, s[1] + '.mp3')}`).join(' ');
  const chains = SFX.map((s, i) => `[${i + 1}:a]adelay=${Math.round(s[0] * 1000)}:all=1,volume=${s[2]}[a${i}]`).join(';');
  const mix = SFX.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${SFX.length}:normalize=0,alimiter=limit=0.9,apad,atrim=0:${DUR}[aout]`;
  execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i ${tmp}/f%04d.jpg ${ins} -filter_complex "${chains};${mix}" ` +
    `-map 0:v -map "[aout]" -c:v libx264 -pix_fmt yuv420p -crf 18 -c:a aac -b:a 192k -t ${DUR} ${path.join(D, 'fight15-test.mp4')}`);
  fs.rmSync(tmp, { recursive: true });
  console.log('wrote fight15-test.mp4');
})();

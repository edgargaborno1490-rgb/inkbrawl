// Renders video.html frame by frame (1080x1920, 30 fps) and muxes voiceover + SFX + music.
// Usage: NODE_PATH=$(npm root -g) node render.cjs [--stills 1,15.9,27.2]   (stills only, for checking)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const D = __dirname, FPS = 30;
(async () => {
  const si = process.argv.indexOf('--stills');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('PAGE ERROR', e.message));
  await p.goto('file://' + path.join(D, 'video.html'), { waitUntil: 'networkidle' }).catch(() => {});
  await p.evaluate(() => document.fonts.ready);
  if (si > 0) {
    fs.mkdirSync(path.join(D, 'out/stills'), { recursive: true });
    for (const t of process.argv[si + 1].split(',').map(Number)) { await p.evaluate(t => setT(t), t); await p.screenshot({ path: path.join(D, `out/stills/s-${t}.png`) }); }
    return b.close();
  }
  const END = await p.evaluate(() => VIDEO_END), N = Math.round(END * FPS);
  const tmp = fs.mkdtempSync('/tmp/gor-'); const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    await p.evaluate(t => setT(t), i / FPS);
    await p.screenshot({ path: path.join(tmp, `f${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92 });
    if (i % 300 === 0) console.log(`frame ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  await b.close();
  execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i ${tmp}/f%05d.jpg -c:v libx264 -pix_fmt yuv420p -crf 17 -preset medium ${path.join(D, 'out/video-silent.mp4')}`);
  fs.rmSync(tmp, { recursive: true });
  console.log('wrote out/video-silent.mp4');
})();

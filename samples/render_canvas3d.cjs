// Renders the 3D blank-canvas test: stills (wide + close) and a 5 s clip (wide -> push in).
// Usage: NODE_PATH=$(npm root -g) node render_canvas3d.cjs
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
(async () => {
  const d = __dirname;
  const html = fs.readFileSync(path.join(d, 'canvas3d.html'), 'utf8')
    .replace('__SVG__', fs.readFileSync(path.join(d, 'fighters-layer.svg'), 'utf8'));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.setContent(html, { waitUntil: 'networkidle' }).catch(() => {});
  await p.evaluate(() => document.fonts.ready);
  for (const [t, n] of [[0, 'canvas3d-wide.png'], [1, 'canvas3d-close.png']]) {
    await p.evaluate(t => setT(t), t); await p.screenshot({ path: path.join(d, n) });
  }
  if (process.argv.includes('--clip')) {
    const tmp = fs.mkdtempSync('/tmp/c3d-'); const N = 150;   // 5 s at 30 fps
    for (let i = 0; i < N; i++) {
      await p.evaluate(t => setT(t), i / (N - 1));
      await p.screenshot({ path: path.join(tmp, `f${String(i).padStart(4, '0')}.png`) });
    }
    execSync(`ffmpeg -y -loglevel error -framerate 30 -i ${tmp}/f%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 ${path.join(d, 'canvas3d-test.mp4')}`);
    fs.rmSync(tmp, { recursive: true });
  }
  await b.close();
})();

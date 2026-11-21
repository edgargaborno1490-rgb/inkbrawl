// Screenshots every scene in sample3d.html to sample-<name>.png.
// Usage: NODE_PATH=$(npm root -g) node render_samples.cjs
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.join(__dirname, 'sample3d.html'), { waitUntil: 'networkidle' }).catch(() => {});
  await p.evaluate(() => document.fonts.ready);
  for (const n of await p.evaluate(() => SCENE_NAMES)) {
    await p.evaluate(n => draw(n), n); await p.screenshot({ path: path.join(__dirname, `sample-${n}.png`) });
  }
  await b.close();
})();

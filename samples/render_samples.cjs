// Renders samples/sample-stickmen.svg to PNG with the Permanent Marker font (falls back if offline).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const svg = fs.readFileSync(path.join(__dirname, 'sample-stickmen.svg'), 'utf8');
  const html = `<html><head><link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&display=block" rel="stylesheet">
<style>body{margin:0}</style></head><body>${svg}</body></html>`;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.setContent(html, { waitUntil: 'networkidle' }).catch(() => {});
  await p.evaluate(() => document.fonts.ready);
  console.log('marker font loaded:', await p.evaluate(() => document.fonts.check('34px "Permanent Marker"')));
  await p.screenshot({ path: path.join(__dirname, 'sample-stickmen.png') }); await b.close();
})();

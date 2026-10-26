// Render each slide HTML to a 2x PNG (body area 1760x790, placed under the slide title in Canva).
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || 'playwright');
import { readdirSync } from 'fs';
import { pathToFileURL } from 'url';
import path from 'path';
const dir = path.dirname(new URL(import.meta.url).pathname);
const only = process.argv.slice(2);
const files = readdirSync(dir).filter(f => /^\d+-.*\.html$/.test(f) && (!only.length || only.some(o => f.startsWith(o))));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1760, height: 790 }, deviceScaleFactor: 2 });
for (const f of files) {
  await page.goto(pathToFileURL(path.join(dir, f)).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(dir, 'png', f.replace('.html', '.png')) });
  console.log('rendered', f);
}
await browser.close();

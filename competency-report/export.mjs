// Export report payload(s) → PDF (16:9, one slide per page) + PNG previews.
// Usage: node export.mjs [company|function|department|subdepartment|individual|path/to/payload.json ...] [--no-png]
import { createRequire } from 'module';
import { createServer } from 'http';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || 'playwright');

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(ROOT, 'output');
mkdirSync(path.join(OUT, 'preview'), { recursive: true });
const LEVELS = ['company', 'function', 'department', 'subdepartment', 'individual'];
const args = process.argv.slice(2);
const previews = !args.includes('--no-png');
const names = args.filter(a => !a.startsWith('--'));
const targets = (names.length ? names : LEVELS).map(a => LEVELS.includes(a)
  ? { name: a, file: path.join(ROOT, 'data', `sample-${a}.json`) }
  : { name: path.basename(a, '.json'), file: path.resolve(a) });

// tiny static server so fonts / CSS / JS load exactly as in production
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' };
const server = createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' });
  res.end(readFileSync(p));
}).listen(0);
const port = server.address().port;

const exe = [process.env.CHROME_PATH, '/opt/pw-browsers/chromium'].filter(Boolean).find(p => existsSync(p) && !p.endsWith('/chromium'));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
for (const t of targets) {
  const data = JSON.parse(readFileSync(t.file, 'utf8'));
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
  await page.addInitScript(d => { window.__REPORT_DATA__ = d; }, data);
  await page.goto(`http://localhost:${port}/template/report.html`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__READY__ === true);
  const pdf = path.join(OUT, `competency-report-${t.name}.pdf`);
  await page.pdf({ path: pdf, width: '1280px', height: '720px', printBackground: true, preferCSSPageSize: true });
  if (previews) {
    const pages = await page.$$('section.page');
    for (let i = 0; i < pages.length; i++) {
      await pages[i].screenshot({ path: path.join(OUT, 'preview', `${t.name}-${String(i + 1).padStart(2, '0')}.png`), scale: 'css' });
    }
  }
  console.log('exported', path.relative(ROOT, pdf));
  await page.close();
}
await browser.close();
server.close();

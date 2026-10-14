#!/usr/bin/env node
// Render a photo-english-card content JSON into a PNG poster.
//   node render.mjs <content.json> [out.png] [--scale 2] [--keep-html]
// No npm dependencies: it drives an installed Chrome / Edge in headless mode.
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve, extname, join, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const args = process.argv.slice(2);
const flag = name => { const i = args.indexOf(name); return i < 0 ? null : args.splice(i, 2)[1] ?? ''; };
const scale = Number(flag('--scale') || 2);
const keepIdx = args.indexOf('--keep-html');
const keepHtml = keepIdx >= 0 && !!args.splice(keepIdx, 1);
const [jsonArg, outArg] = args;
if (!jsonArg) { console.error('usage: node render.mjs <content.json> [out.png] [--scale 2] [--keep-html]'); process.exit(1); }

const skillDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = resolve(jsonArg);
const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
const outPath = resolve(outArg || jsonPath.replace(/(\.content)?\.json$/i, '') + '.png');

// --- photo -> data URI (keeps the HTML self-contained) ---
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif', '.bmp': 'image/bmp' };
const photoPath = resolve(dirname(jsonPath), data.photo || '');
if (!data.photo || !existsSync(photoPath)) { console.error(`photo not found: ${photoPath}`); process.exit(1); }
const mime = MIME[extname(photoPath).toLowerCase()];
if (!mime) { console.error(`unsupported photo type "${extname(photoPath)}" - convert it to jpg/png/webp first (HEIC is not supported by Chrome)`); process.exit(1); }
const b64 = p => readFileSync(p).toString('base64');
data.photo = `data:${mime};base64,${b64(photoPath)}`;

const html = readFileSync(join(skillDir, 'assets', 'template.html'), 'utf8')
  .replace('__FONT_ROMAN__', () => `data:font/woff2;base64,${b64(join(skillDir, 'assets', 'fonts', 'fraunces.woff2'))}`)
  .replace('__FONT_ITALIC__', () => `data:font/woff2;base64,${b64(join(skillDir, 'assets', 'fonts', 'fraunces-italic.woff2'))}`)
  .replace('__DATA__', () => JSON.stringify(data).replace(/</g, '\\u003c'));

// --- locate a Chromium-based browser ---
function findBrowser() {
  const env = process.env;
  const candidates = [
    env.CARD_BROWSER,
    ...[env['ProgramFiles'], env['ProgramFiles(x86)'], env.LOCALAPPDATA].filter(Boolean).flatMap(r => [
      join(r, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      join(r, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    ]),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge',
  ].filter(Boolean);
  return candidates.find(existsSync);
}
const browser = findBrowser();
if (!browser) { console.error('No Chrome/Edge/Chromium found. Set CARD_BROWSER to the browser executable.'); process.exit(1); }

const work = mkdtempSync(join(tmpdir(), 'english-card-'));
const htmlPath = keepHtml ? outPath.replace(/\.png$/i, '') + '.html' : join(work, 'card.html');
writeFileSync(htmlPath, html);
const url = pathToFileURL(htmlPath).href;
const common = ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
  '--allow-file-access-from-files', `--user-data-dir=${join(work, 'profile')}`, '--virtual-time-budget=10000'];
const run = extra => spawnSync(browser, [...common, ...extra], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 120000 });

try {
  // pass 1: lay the poster out and read back its natural height
  const m = run(['--window-size=1080,2400', '--dump-dom', url + '#measure']);
  const hit = /MEASURE:(.*?):END/s.exec(m.stdout || '');
  if (!hit) { console.error('layout pass failed\n' + (m.stderr || m.error || '').toString().slice(0, 2000)); process.exit(1); }
  const info = JSON.parse(hit[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));

  // pass 2: screenshot at exactly that height
  rmSync(outPath, { force: true });
  const s = run([`--window-size=1080,${info.height}`, `--force-device-scale-factor=${scale}`, `--screenshot=${outPath}`, url]);
  if (!existsSync(outPath)) { console.error('screenshot failed\n' + (s.stderr || s.error || '').toString().slice(0, 2000)); process.exit(1); }

  console.log(`saved ${outPath}  (${1080 * scale}x${info.height * scale}px, ${(statSync(outPath).size / 1024).toFixed(0)} KB)`);
  console.log(`title font size: ${info.titlePx}px` + (info.titlePx < 110 ? '  <- small: shorten the title lines' : ''));
  if (info.wrapped.length) console.log(`rows that wrap or overflow (shorten the English or the Chinese gloss): ${info.wrapped.map(t => `"${t}"`).join(', ')}`);
  if (keepHtml) console.log(`html: ${htmlPath}`);
} finally {
  try { rmSync(work, { recursive: true, force: true }); } catch {}
}

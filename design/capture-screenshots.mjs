#!/usr/bin/env node
/**
 * Capture design mockup PNGs (1280 desktop pages, 360 mobile).
 * Usage: node design/capture-screenshots.mjs
 * Optional: ARTIFACTS_DIR=/path/to/dir also copies every PNG there.
 */
import { createRequire } from 'node:module';
import { mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const designDir = __dirname;
const outDir = path.join(designDir, 'screenshots');
const artifactsDir = process.env.ARTIFACTS_DIR || '';

const shots = [
  { file: 'overview-desktop.html', png: 'overview-desktop.png', width: 1280, height: 900 },
  { file: 'overview-mobile.html', png: 'overview-mobile.png', width: 360, height: 900 },
  { file: 'components.html', png: 'components.png', width: 1280, height: 900 },
  { file: 'explorer.html', png: 'explorer.png', width: 1280, height: 900 },
  { file: 'enacted.html', png: 'enacted.png', width: 1280, height: 900 },
];

const browser = await chromium.launch();
const page = await browser.newPage();

await mkdir(outDir, { recursive: true });
if (artifactsDir) await mkdir(artifactsDir, { recursive: true });

for (const shot of shots) {
  await page.setViewportSize({ width: shot.width, height: shot.height });
  await page.goto(`file://${path.join(designDir, shot.file)}`, { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  const outPath = path.join(outDir, shot.png);
  await page.screenshot({ path: outPath, fullPage: true });
  if (artifactsDir) await copyFile(outPath, path.join(artifactsDir, shot.png));
  const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientW = await page.evaluate(() => document.documentElement.clientWidth);
  if (scrollW > clientW + 1) {
    console.warn(`WARN horizontal scroll ${shot.png}: scrollWidth=${scrollW} clientWidth=${clientW}`);
  }
}

await page.setViewportSize({ width: 375, height: 812 });
await page.goto(`file://${path.join(designDir, 'overview-mobile.html')}`, { waitUntil: 'load' });
await page.waitForTimeout(1000);
const scroll375 = await page.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
);
if (scroll375) console.warn('WARN horizontal scroll overview-mobile at 375px');

await browser.close();
console.log('Screenshots written to', outDir);
if (artifactsDir) console.log('Also copied to', artifactsDir);

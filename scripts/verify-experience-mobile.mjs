/**
 * Smoke test rápido: sección Experiencia en mobile.
 * Confirma que el strip "Destacados" no renderiza a <sm.
 *
 *   node scripts/verify-experience-mobile.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.DEV_URL ?? "http://localhost:3000";
const OUT_DIR = path.resolve(".next/exp-mobile-verify");

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE_URL}/#experiencia`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  });
  await page.waitForTimeout(800);

  /* Scroll a experiencia. */
  await page.evaluate(() => {
    const s = document.getElementById("experiencia");
    if (s) s.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await page.waitForTimeout(400);

  for (let i = 0; i < 4; i++) {
    await page.screenshot({
      path: path.join(OUT_DIR, `mobile-exp-${i}.jpg`),
      type: "jpeg",
      quality: 85,
    });
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.7));
    await page.waitForTimeout(300);
  }

  await browser.close();
  process.stdout.write(`\nCaptures en ${OUT_DIR}\n`);
}

main().catch((e) => {
  process.stderr.write(`Fatal: ${e?.stack ?? e}\n`);
  process.exit(1);
});

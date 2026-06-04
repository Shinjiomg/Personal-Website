/**
 * scripts/verify-portfolio.mjs
 * ─────────────────────────────────────────────────────────────
 * Smoke test visual del Portafolio en 3 viewports:
 *   desktop (1440) · tablet (820) · mobile (390)
 *
 *   node scripts/verify-portfolio.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.DEV_URL ?? "http://localhost:3000";
const OUT_DIR = path.resolve(".next/portfolio-verify");

async function captureViewport(browser, label, viewport, deviceScaleFactor = 1) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE_URL}/#portafolio`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  });
  await page.waitForTimeout(800);

  /* Scroll a la sección portafolio. */
  await page.evaluate(() => {
    const section = document.getElementById("portafolio");
    if (section) section.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await page.waitForTimeout(400);

  /* Múltiples capturas haciendo scroll progresivo. */
  for (let i = 0; i < 4; i++) {
    await page.screenshot({
      path: path.join(OUT_DIR, `${label}-scroll${i}.jpg`),
      type: "jpeg",
      quality: 85,
    });
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.7));
    await page.waitForTimeout(300);
  }

  await ctx.close();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  await captureViewport(browser, "desktop", { width: 1440, height: 900 });
  await captureViewport(browser, "tablet", { width: 820, height: 1180 });
  await captureViewport(browser, "mobile", { width: 390, height: 844 }, 2);

  await browser.close();
  process.stdout.write(`\nCaptures saved to ${OUT_DIR}\n`);
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err?.stack ?? err}\n`);
  process.exit(1);
});

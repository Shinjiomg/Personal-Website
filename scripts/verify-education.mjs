/**
 * Captura visual del EducationStrip al pie de #experiencia.
 *   node scripts/verify-education.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.DEV_URL ?? "http://localhost:3000";
const OUT_DIR = path.resolve(".next/education-verify");

async function capture(browser, label, viewport, dsf = 1) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: dsf });
  const page = await ctx.newPage();
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(500);

  /* Scroll al final de Experiencia · ahí vive el strip */
  await page.evaluate(() => {
    const exp = document.getElementById("experiencia");
    if (!exp) return;
    const rect = exp.getBoundingClientRect();
    window.scrollTo({
      top: window.scrollY + rect.bottom - window.innerHeight + 80,
      behavior: "instant",
    });
  });
  await page.waitForTimeout(600);

  await page.screenshot({
    path: path.join(OUT_DIR, `${label}.jpg`),
    type: "jpeg",
    quality: 88,
  });

  await ctx.close();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  await capture(browser, "desktop", { width: 1440, height: 900 });
  await capture(browser, "tablet", { width: 820, height: 1180 });
  await capture(browser, "mobile", { width: 390, height: 844 }, 2);
  await browser.close();
  process.stdout.write(`Captures → ${OUT_DIR}\n`);
}

main().catch((e) => {
  process.stderr.write(`Fatal: ${e?.stack ?? e}\n`);
  process.exit(1);
});

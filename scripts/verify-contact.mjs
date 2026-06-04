/**
 * Smoke test visual del Contact en 3 viewports.
 *
 * Captura 2 modos por viewport:
 *   · full-section.jpg  → todo `#contacto` en un solo frame
 *     (clipping al boundingBox, sin scroll) → permite comparar
 *     altura visual de columnas izq/der de un vistazo.
 *   · scroll-N.jpg      → 3 captures progresivos del fold visible
 *     mientras scrolleamos por la sección.
 *
 *   node scripts/verify-contact.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.DEV_URL ?? "http://localhost:3000";
const OUT_DIR = path.resolve(".next/contact-verify");

async function capture(browser, label, viewport, dsf = 1) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: dsf,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE_URL}/#contacto`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  });
  await page.waitForTimeout(800);

  /* ─── full-section capture ─── *
   * `locator.screenshot()` captura el elemento entero sin importar
   * scroll/viewport — usa internamente fullPage + clip al bbox del
   * elemento en coords absolutas del documento. Esto da la vista
   * definitiva para comparar el alto visual de cols izq/der. */
  await page.locator("#contacto").screenshot({
    path: path.join(OUT_DIR, `${label}-full-section.jpg`),
    type: "jpeg",
    quality: 88,
    animations: "disabled",
  });

  /* ─── scroll captures ─── */
  await page.evaluate(() => {
    const s = document.getElementById("contacto");
    if (s) s.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await page.waitForTimeout(500);

  for (let i = 0; i < 3; i++) {
    await page.screenshot({
      path: path.join(OUT_DIR, `${label}-scroll-${i}.jpg`),
      type: "jpeg",
      quality: 85,
    });
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.6));
    await page.waitForTimeout(300);
  }

  await ctx.close();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  await capture(browser, "desktop", { width: 1440, height: 900 });
  await capture(browser, "tablet", { width: 820, height: 1180 });
  await capture(browser, "mobile", { width: 390, height: 844 }, 2);
  await browser.close();
  process.stdout.write(`\nCaptures saved to ${OUT_DIR}\n`);
}

main().catch((e) => {
  process.stderr.write(`Fatal: ${e?.stack ?? e}\n`);
  process.exit(1);
});

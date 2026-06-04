/**
 * scripts/verify-portfolio-once.mjs
 * ─────────────────────────────────────────────────────────────
 * Captura ad-hoc: portafolio scrolled deep + dialog del nuevo
 * proyecto Daniel Demo Reel para confirmar render.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.DEV_URL ?? "http://localhost:3000";
const OUT_DIR = path.resolve(".next/portfolio-verify");

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const dp = await desktop.newPage();
  await dp.goto(`${BASE_URL}/#portafolio`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  });
  await dp.waitForTimeout(800);

  /* Scroll deep para ver filas 3 y 4 (Orinoco/CaribeVan + Daniel/Koala). */
  await dp.evaluate(() => {
    const section = document.getElementById("portafolio");
    if (section) {
      const rect = section.getBoundingClientRect();
      window.scrollBy(0, rect.top + 1400);
    }
  });
  await dp.waitForTimeout(600);
  await dp.screenshot({
    path: path.join(OUT_DIR, "desktop-grid-row34.jpg"),
    type: "jpeg",
    quality: 85,
  });

  /* Click en el 7º proyecto (Daniel Demo Reel) y captura dialog. */
  await dp.evaluate(() => {
    const cards = document.querySelectorAll("#portafolio ul button");
    if (cards[6]) cards[6].click();
  });
  await dp.waitForTimeout(700);
  await dp.screenshot({
    path: path.join(OUT_DIR, "desktop-daniel-dialog.jpg"),
    type: "jpeg",
    quality: 85,
  });

  await browser.close();
  process.stdout.write(`\nCaptures saved to ${OUT_DIR}\n`);
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err?.stack ?? err}\n`);
  process.exit(1);
});

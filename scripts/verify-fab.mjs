/**
 * Verifica el comportamiento del WhatsApp FAB.
 *   node scripts/verify-fab.mjs
 *
 * Casos cubiertos:
 *   1. Hero (top of page)        → FAB visible.
 *   2. Mid scroll (About)        → FAB visible.
 *   3. Contact section in view   → FAB hidden.
 *   4. Portfolio dialog open     → FAB hidden.
 *   5. Mobile viewport, top      → FAB visible (icon-only).
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.DEV_URL ?? "http://localhost:3000";
const OUT_DIR = path.resolve(".next/fab-verify");

async function isFabVisible(page) {
  /* El FAB es un Link con aria-label "Hablar conmigo por WhatsApp"
   * envuelto en un motion.div. Lo encontramos por aria-label. */
  return page.evaluate(() => {
    const el = document.querySelector(
      'a[aria-label="Hablar conmigo por WhatsApp"]',
    );
    if (!el) return { exists: false, visible: false };
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    /* "Visible" si está en DOM, tiene tamaño y opacity > 0.1 */
    const visible =
      rect.width > 0 &&
      rect.height > 0 &&
      parseFloat(style.opacity) > 0.1 &&
      style.display !== "none" &&
      style.visibility !== "hidden";
    return { exists: true, visible, opacity: style.opacity };
  });
}

async function capture(page, name) {
  await page.screenshot({
    path: path.join(OUT_DIR, `${name}.jpg`),
    type: "jpeg",
    quality: 85,
  });
}

async function runDesktop(browser) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(800);

  /* 1. Hero (top) */
  let result = await isFabVisible(page);
  await capture(page, "desktop-1-hero");
  process.stdout.write(
    `${result.visible ? "✓" : "✗"} desktop · Hero    → fab visible=${result.visible}\n`,
  );

  /* 2. Mid scroll (About) */
  await page.evaluate(() => {
    const el = document.getElementById("sobre-mi");
    el?.scrollIntoView({ behavior: "instant", block: "center" });
  });
  await page.waitForTimeout(500);
  result = await isFabVisible(page);
  await capture(page, "desktop-2-about");
  process.stdout.write(
    `${result.visible ? "✓" : "✗"} desktop · About   → fab visible=${result.visible}\n`,
  );

  /* 3. Contact in view */
  await page.evaluate(() => {
    const el = document.getElementById("contacto");
    el?.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await page.waitForTimeout(600);
  result = await isFabVisible(page);
  await capture(page, "desktop-3-contact");
  process.stdout.write(
    `${!result.visible ? "✓" : "✗"} desktop · Contact → fab hidden  (visible=${result.visible})\n`,
  );

  /* 4. Portfolio dialog open */
  await page.evaluate(() => {
    const el = document.getElementById("portafolio");
    el?.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await page.waitForTimeout(400);
  /* Abrir el primer dialog: click en el primer "Ver caso" o card */
  await page.evaluate(() => {
    const card = document.querySelector('[role="list"] li button, [role="list"] li a[role="button"]');
    if (card instanceof HTMLElement) card.click();
  });
  await page.waitForTimeout(600);
  result = await isFabVisible(page);
  await capture(page, "desktop-4-dialog");
  process.stdout.write(
    `${!result.visible ? "✓" : "✗"} desktop · Dialog  → fab hidden  (visible=${result.visible})\n`,
  );

  await ctx.close();
}

async function runMobile(browser) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(800);

  const result = await isFabVisible(page);
  await capture(page, "mobile-1-hero");
  process.stdout.write(
    `${result.visible ? "✓" : "✗"} mobile  · Hero    → fab visible=${result.visible}\n`,
  );

  await ctx.close();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  await runDesktop(browser);
  await runMobile(browser);
  await browser.close();
  process.stdout.write(`\nCaptures saved to ${OUT_DIR}\n`);
}

main().catch((e) => {
  process.stderr.write(`Fatal: ${e?.stack ?? e}\n`);
  process.exit(1);
});

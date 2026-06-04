/**
 * Verifica end-to-end el form de contacto post-migración a Resend.
 *
 * Flow:
 *   1. Visita /contacto
 *   2. Llena name + email + message
 *   3. Submitea
 *   4. Espera el estado de éxito (FeedbackBlock con "Mensaje enviado")
 *   5. Captura screenshot del estado final
 *
 * Output:
 *   · captures/contact-form-success.png — screenshot del éxito
 *   · Exit code 0 si OK, 1 si falla
 *
 * Run:
 *   node scripts/verify-contact-form.mjs
 *   (requiere dev server corriendo en localhost:3000)
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const URL = "http://localhost:3000/#contacto";
const SCREENSHOT_PATH = "captures/contact-form-success.png";

async function main() {
  console.log("→ Launching browser…");
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Log console errors of the page (no email rendering errors, etc.)
  page.on("pageerror", (err) => console.error("PAGE ERROR:", err.message));
  page.on("response", (res) => {
    if (res.url().includes("/api/contact")) {
      console.log(`  ← ${res.request().method()} ${res.url()} → ${res.status()}`);
    }
  });

  console.log("→ Navigating to", URL);
  await page.goto(URL, { waitUntil: "networkidle" });

  // Scroll to the contact section to make the form visible
  await page.locator("#contacto").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  console.log("→ Filling form…");
  await page.fill('input[name="name"]', "Playwright Smoke Test");
  await page.fill('input[name="email"]', "playwright@delivered.resend.dev");
  await page.fill(
    'textarea[name="message"]',
    "Verificacion end-to-end del form post-migracion a Resend. Si recibis este mensaje, el form esta operativo desde el browser real (no solo desde curl directo al endpoint).",
  );

  console.log("→ Submitting…");
  await page.click('button[type="submit"]');

  // Wait for either success or error state. The role=status region
  // gets populated with one of the two FeedbackBlock variants.
  const success = page.locator('[role="status"]:has-text("Mensaje enviado")');
  const error = page.locator('[role="status"]:has-text("No se pudo enviar")');

  const winner = await Promise.race([
    success.waitFor({ state: "visible", timeout: 15000 }).then(() => "success"),
    error.waitFor({ state: "visible", timeout: 15000 }).then(() => "error"),
  ]).catch(() => "timeout");

  if (winner === "success") {
    console.log("✓ Form submitted successfully — feedback shown.");
  } else if (winner === "error") {
    const errBody = await error.textContent();
    console.error("✗ Form returned error:", errBody?.trim());
  } else {
    console.error("✗ Timed out waiting for feedback (15s).");
  }

  // Screenshot regardless of outcome so we have a reference frame
  await mkdir(dirname(SCREENSHOT_PATH), { recursive: true });
  await page.locator("#contacto").screenshot({ path: SCREENSHOT_PATH });
  console.log(`→ Screenshot saved to ${SCREENSHOT_PATH}`);

  await browser.close();

  if (winner !== "success") process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * scripts/capture-portfolio.mjs
 * ─────────────────────────────────────────────────────────────
 * Captura screenshots above-the-fold de cada proyecto del
 * portafolio en alta calidad (retina) y los guarda como JPEG
 * en `public/portfolio/<slug>.jpg`.
 *
 * Filosofía:
 *  - Mismo viewport (1440×900) para que las cards se vean
 *    alineadas en el grid, sin que un site capture más bajo
 *    o salga "fuera de proporción".
 *  - `deviceScaleFactor: 2` → retina, los screenshots se ven
 *    nítidos al hacer hover (los displays modernos hacen
 *    downscale mejor de retina que upscale de 1x).
 *  - JPEG quality 90 → ~80% más liviano que PNG sin diferencia
 *    perceptible en screenshots (no son fotos).
 *  - `networkidle` + 1500ms de gracia → da tiempo a fonts,
 *    hero images, y animaciones de entrada para asentarse
 *    antes de la captura. Algunos sites tienen reveal-on-mount
 *    que tarda ~800ms.
 *  - Cookie banners + chat widgets quedan visibles a propósito
 *    — son parte de la experiencia real del site, y borrarlos
 *    con CSS injection sería ocultar la realidad. Si después
 *    decidimos limpiar alguno, agregamos un `selectorsToHide`
 *    por proyecto.
 *
 * Re-ejecutar después de cualquier cambio visual mayor en los
 * sites listados:
 *
 *   node scripts/capture-portfolio.mjs
 *
 * Playwright es devDep solo para esta tarea; no entra al bundle
 * de producción.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const PROJECTS = [
  { slug: "jarvlabs", url: "https://www.jarvlabs.online/" },
  { slug: "pagetook", url: "https://pagetook.jarvlabs.online/" },
  { slug: "citook", url: "https://citook.jarvlabs.online/" },
  { slug: "toolstacksuite", url: "https://www.toolstacksuite.com/" },
  { slug: "orinoco", url: "https://orinocosanducheria.vercel.app/" },
  { slug: "caribevan", url: "https://caribevan.vercel.app/" },
  { slug: "daniel-demo-reel", url: "https://daniel-demo-reel.vercel.app/" },
  { slug: "koaladevs", url: "https://koaladevs.pages.dev/" },
];

const OUT_DIR = path.resolve("public/portfolio");
const VIEWPORT = { width: 1440, height: 900 };

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: "light",
    /* User agent honesto: identifica el script como bot pero
     * no spoofea un user real. Algunos sites podrían capear
     * traffic de "Headless"; si pasa, ajustar acá. */
    userAgent:
      "Mozilla/5.0 (PortfolioCaptureBot) Chrome/131.0 Safari/537.36",
  });

  let okCount = 0;
  let failCount = 0;

  for (const project of PROJECTS) {
    process.stdout.write(`[${project.slug}] capturando ${project.url}\n`);
    const page = await context.newPage();

    try {
      await page.goto(project.url, {
        waitUntil: "networkidle",
        timeout: 60_000,
      });

      /* Tiempo de gracia para animaciones de entrada (reveal-on-mount,
       * GSAP timelines, etc.). Los sites con motion fuerte tardan
       * ~800-1500ms en quedar estables visualmente. */
      await page.waitForTimeout(1500);

      const outPath = path.join(OUT_DIR, `${project.slug}.jpg`);
      await page.screenshot({
        path: outPath,
        type: "jpeg",
        quality: 90,
        fullPage: false,
        clip: { x: 0, y: 0, ...VIEWPORT },
      });

      process.stdout.write(`  → ${outPath}\n`);
      okCount++;
    } catch (err) {
      process.stderr.write(`  ✗ falló: ${err?.message ?? err}\n`);
      failCount++;
    } finally {
      await page.close();
    }
  }

  await browser.close();

  process.stdout.write(
    `\nListo. ${okCount} ok · ${failCount} fallaron.\n`,
  );
  if (failCount > 0) process.exit(1);
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err?.stack ?? err}\n`);
  process.exit(1);
});

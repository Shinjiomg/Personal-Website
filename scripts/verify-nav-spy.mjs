/**
 * Verifica que el scroll-spy del header se active correctamente
 * para cada sección al hacer scroll.
 *
 *   node scripts/verify-nav-spy.mjs
 *
 * Estrategia:
 *   1. Cargar la home en viewport desktop.
 *   2. Para cada sección [sobre-mi, experiencia, portafolio, contacto]:
 *        a. Scroll al middle de la sección (no al top — el band
 *           del scroll-spy se activa mejor con la sección bien
 *           dentro del viewport).
 *        b. Esperar a que el observer estabilice (rAF + buffer).
 *        c. Leer `aria-current="page"` en los links del desktop nav.
 *        d. Confirmar que coincide con la sección esperada.
 *   3. Imprimir pass/fail por sección.
 */
import { chromium } from "playwright";

const BASE_URL = process.env.DEV_URL ?? "http://localhost:3000";
const SECTIONS = ["sobre-mi", "experiencia", "portafolio", "contacto"];

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 60_000 });

  /* Header lleva activeId vía IntersectionObserver — esperá a que
   * los observers se enganchen tras mount. */
  await page.waitForTimeout(800);

  const results = [];

  for (const sectionId of SECTIONS) {
    await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      /* Scroll al middle de la sección — el header band está en el
       * top 60% del viewport, así nos aseguramos de quedar dentro. */
      const rect = el.getBoundingClientRect();
      const target =
        window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
      window.scrollTo({ top: target, behavior: "instant" });
    }, sectionId);

    /* Tiempo para que IO dispare callbacks + nuestro hook procese. */
    await page.waitForTimeout(450);

    const activeFromNav = await page.evaluate(() => {
      const links = Array.from(
        document.querySelectorAll('nav a[aria-current="page"]'),
      );
      /* Filtramos sólo los links que empiezan con # (excluye el CTA
       * "Hablemos" que también es #contacto pero está fuera del nav).
       * Devolvemos el primero del desktop nav. */
      const desktopNavLink = links.find((a) => {
        const href = a.getAttribute("href") ?? "";
        return href.startsWith("#") && a.closest("nav");
      });
      const href = desktopNavLink?.getAttribute("href") ?? null;
      return href ? href.replace(/^#/, "") : null;
    });

    const pass = activeFromNav === sectionId;
    results.push({ section: sectionId, active: activeFromNav, pass });
    process.stdout.write(
      `${pass ? "✓" : "✗"} ${sectionId.padEnd(12)} → activeId="${activeFromNav}"\n`,
    );
  }

  await browser.close();

  const fails = results.filter((r) => !r.pass);
  if (fails.length > 0) {
    process.stderr.write(`\n${fails.length} sección(es) fallando.\n`);
    process.exit(1);
  }
  process.stdout.write("\nAll sections detected correctly.\n");
}

main().catch((e) => {
  process.stderr.write(`Fatal: ${e?.stack ?? e}\n`);
  process.exit(1);
});

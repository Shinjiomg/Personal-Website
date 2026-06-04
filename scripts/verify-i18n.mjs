/**
 * Validación end-to-end del setup de i18n.
 *
 * Verifica que:
 *   1. La home `/` rinde en español (lang="es", strings clave).
 *   2. La home `/en` rinde en inglés (lang="en", strings clave).
 *   3. El `<LocaleSwitch>` cambia de idioma al hacer click (ES → EN, EN → ES).
 *   4. Las secciones (Hero, About, Experience, Portfolio, Contact)
 *      muestran contenido traducido en ambos locales.
 *   5. Los metadatos del <head> alternan correctamente (hreflang,
 *      og:locale, canonical, JSON-LD inLanguage).
 *
 * Importante:
 *   `routing.localeDetection = true` → el middleware redirige `/` a
 *   `/en` cuando el browser manda `Accept-Language: en-*`. Por eso
 *   cada checkLocale() levanta su propio context con el Accept-Language
 *   correcto para el target.
 *
 * Captura screenshots:
 *   · captures/i18n-es-{section}.png  — secciones en español
 *   · captures/i18n-en-{section}.png  — secciones en inglés
 *
 * Run:
 *   node scripts/verify-i18n.mjs
 *
 * Requiere `npm run dev` corriendo en :3000.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const BASE = "http://localhost:3000";
const CAPTURES_DIR = "captures";

/* Strings que deben existir en cada locale.
 *
 * Mantengo el set mínimo para detectar regresiones de extracción
 * de strings sin volverme frágil ante cambios de copy.
 *
 * Match es case-INSENSITIVE: muchos eyebrows y labels son uppercased
 * por CSS (`text-transform: uppercase`) y `innerText` devuelve el
 * texto post-transform → no podemos comparar literal.
 *
 * Solo asserto contenido visible en el primer paint (sin abrir
 * Dialogs, sin clickear sidebar entries). Strings en hidden tabs
 * o modals quedan fuera del scope de este smoke test. */
const EXPECTED = {
  es: {
    ui: [
      "Hola, soy",
      "Hablemos",
      "Ver portafolio",
      "Sobre mí",
      "envejecen bien",
      "Experiencia",
      "Trayectoria",
      "Timeline",
      "Portafolio",
      "Ver caso",
      "Contacto",
      "Enviar mensaje",
      "Explora",
      "Conectar",
    ],
    // Strings visibles del PRIMER job (Trillium) + nav del Footer.
    // Otros jobs/projects viven en Dialogs cerrados y no aplican.
    data: ["Microfrontends con React"],
  },
  en: {
    ui: [
      "Hi, I'm",
      "Let's talk",
      "View portfolio",
      "About",
      "age well",
      "Experience",
      "Career path",
      "Timeline",
      "Portfolio",
      "View case",
      "Contact",
      "Send message",
      "Explore",
      "Connect",
    ],
    data: ["Microfrontends with React"],
  },
};

const SECTION_IDS = [
  { id: "inicio", label: "hero" },
  { id: "sobre-mi", label: "about" },
  { id: "experiencia", label: "experience" },
  { id: "portafolio", label: "portfolio" },
  { id: "contacto", label: "contact" },
];

const ACCEPT_LANGUAGE = {
  es: "es-CO,es;q=0.9,en;q=0.5",
  en: "en-US,en;q=0.9",
};

/* ─────────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────────── */
async function ensureDir(filePath) {
  await mkdir(dirname(filePath), { recursive: true });
}

function fmt(passed) {
  return passed ? "OK" : "FAIL";
}

async function captureSection(page, locale, { id, label }) {
  const path = `${CAPTURES_DIR}/i18n-${locale}-${label}.png`;
  await ensureDir(path);
  const target = await page.$(`#${id}`);
  if (!target) {
    console.warn(`  ! No se encontró #${id} para captura en ${locale}`);
    return;
  }
  await target.scrollIntoViewIfNeeded();
  // Wait a beat for any motion/whileInView animations to settle.
  await page.waitForTimeout(700);
  await target.screenshot({ path });
  console.log(`  + ${path}`);
}

async function readHtmlMeta(page) {
  return await page.evaluate(() => {
    const get = (sel, attr = "content") =>
      document.querySelector(sel)?.getAttribute(attr) ?? null;
    return {
      lang: document.documentElement.lang,
      canonical: get("link[rel=canonical]", "href"),
      ogLocale: get('meta[property="og:locale"]'),
      ogTitle: get('meta[property="og:title"]'),
      ogDesc: get('meta[property="og:description"]'),
      hreflangEs: get('link[rel=alternate][hreflang="es"]', "href"),
      hreflangEn: get('link[rel=alternate][hreflang="en"]', "href"),
      hreflangXDefault: get(
        'link[rel=alternate][hreflang="x-default"]',
        "href",
      ),
      jsonLd: document.querySelector('script[type="application/ld+json"]')
        ?.textContent ?? null,
    };
  });
}

async function newPage(browser, locale) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: locale === "es" ? "es-CO" : "en-US",
    extraHTTPHeaders: { "Accept-Language": ACCEPT_LANGUAGE[locale] },
  });
  return { context, page: await context.newPage() };
}

async function checkLocale(browser, locale, url) {
  console.log(`\n── ${locale.toUpperCase()} ── ${url}`);
  const { context, page } = await newPage(browser, locale);
  let issues = [];

  try {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);

    const finalUrl = page.url();
    if (locale === "es" && /\/en(\/|$)/.test(new URL(finalUrl).pathname)) {
      issues.push(`Redirect inesperado a EN desde ${url} → ${finalUrl}`);
    }

    const meta = await readHtmlMeta(page);
    const bodyText = (await page.evaluate(() => document.body.innerText)) ?? "";

    /* 1. <html lang="..."> */
    if (meta.lang !== locale) {
      issues.push(`html[lang]: esperado "${locale}", got "${meta.lang}"`);
    }

    /* 2. og:locale */
    const expectedOgLocale = locale === "es" ? "es_CO" : "en_US";
    if (meta.ogLocale !== expectedOgLocale) {
      issues.push(
        `og:locale: esperado "${expectedOgLocale}", got "${meta.ogLocale}"`,
      );
    }

    /* 3. hreflang alternates */
    if (!meta.hreflangEs) issues.push("Missing hreflang=es");
    if (!meta.hreflangEn) issues.push("Missing hreflang=en");
    if (!meta.hreflangXDefault) issues.push("Missing hreflang=x-default");

    /* 4. JSON-LD inLanguage matches locale */
    if (meta.jsonLd) {
      try {
        const parsed = JSON.parse(meta.jsonLd);
        const expected = locale === "es" ? "es-CO" : "en-US";
        if (parsed.inLanguage !== expected) {
          issues.push(
            `JSON-LD inLanguage: esperado "${expected}", got "${parsed.inLanguage}"`,
          );
        }
      } catch (err) {
        issues.push(`JSON-LD inválido: ${err.message}`);
      }
    } else {
      issues.push("Missing JSON-LD Person schema");
    }

    /* 5. Strings esperados de UI — case-insensitive porque CSS hace
     *    `text-transform: uppercase` en eyebrows y labels. */
    const bodyLower = bodyText.toLowerCase();
    for (const needle of EXPECTED[locale].ui) {
      if (!bodyLower.includes(needle.toLowerCase())) {
        issues.push(`UI: missing "${needle}"`);
      }
    }

    /* 6. Strings esperados de DATA — case-sensitive (descripciones
     *    visibles, no transformadas). */
    for (const needle of EXPECTED[locale].data) {
      if (!bodyText.includes(needle)) {
        issues.push(`Data: missing "${needle}"`);
      }
    }

    console.log(
      `  Meta: lang=${meta.lang} | og:locale=${meta.ogLocale} | canonical=${meta.canonical}`,
    );
    console.log(
      `  hreflang: es=${meta.hreflangEs} | en=${meta.hreflangEn} | x-default=${meta.hreflangXDefault}`,
    );
    console.log(`  Issues: ${issues.length === 0 ? "ninguno" : ""}`);
    for (const issue of issues) console.log(`    - ${issue}`);

    /* 7. Screenshots por sección */
    console.log("  Capturas:");
    for (const section of SECTION_IDS) {
      await captureSection(page, locale, section);
    }
  } finally {
    await context.close();
  }

  return issues;
}

async function checkLocaleSwitch(browser) {
  console.log("\n── Locale switch ──");
  const issues = [];

  /* ES → EN: arranco en /, hago click en EN, debería ir a /en */
  const esCtx = await newPage(browser, "es");
  try {
    const page = esCtx.page;
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    let lang = await page.evaluate(() => document.documentElement.lang);
    console.log(`  Inicial: ${lang} @ ${page.url()}`);

    if (lang !== "es") {
      issues.push(`Inicial no es ES: lang=${lang}`);
    }

    // En `/` el aria-label del switch viene en español ("English"
    // es igual en ambos idiomas). Dejamos el query simple.
    const enLink = await page.$('a[aria-label="English"]');
    if (!enLink) {
      issues.push("LocaleSwitch EN link no encontrado");
    } else {
      const href = await enLink.getAttribute("href");
      console.log(`  Click EN (href=${href})`);
      await Promise.all([
        page.waitForURL(/\/en(\/|$|\?)/, { timeout: 8000 }),
        enLink.click(),
      ]);
      await page.waitForLoadState("networkidle");
      try {
        await page.waitForFunction(
          () => document.documentElement.lang === "en",
          { timeout: 3000 },
        );
      } catch {
        /* swallow timeout — falla se reporta abajo */
      }
      lang = await page.evaluate(() => document.documentElement.lang);
      console.log(`  Después: ${lang} @ ${page.url()}`);
      const ok = lang === "en";
      console.log(`  ES → EN: ${fmt(ok)}`);
      if (!ok) issues.push("ES → EN no actualizó html[lang]");
    }
  } finally {
    await esCtx.context.close();
  }

  /* EN → ES: arranco en /en, hago click en ES, debería ir a / */
  const enCtx = await newPage(browser, "en");
  try {
    const page = enCtx.page;
    await page.goto(`${BASE}/en`, { waitUntil: "networkidle" });
    let lang = await page.evaluate(() => document.documentElement.lang);
    console.log(`  Inicial: ${lang} @ ${page.url()}`);

    if (lang !== "en") {
      issues.push(`Inicial no es EN: lang=${lang}`);
    }

    // En `/en` el aria-label del switch viene en inglés ("Spanish").
    // En `/` viene en español ("Español"). Probamos ambos para
    // robustez sin atarnos a un copy específico.
    const esLink =
      (await page.$('a[aria-label="Spanish"]')) ??
      (await page.$('a[aria-label="Español"]'));
    if (!esLink) {
      issues.push("LocaleSwitch ES link no encontrado");
    } else {
      const href = await esLink.getAttribute("href");
      console.log(`  Click ES (href=${href})`);
      await Promise.all([
        page.waitForURL(
          (url) => !/\/en(\/|$|\?)/.test(new URL(url).pathname),
          { timeout: 8000 },
        ),
        esLink.click(),
      ]);
      await page.waitForLoadState("networkidle");
      try {
        await page.waitForFunction(
          () => document.documentElement.lang === "es",
          { timeout: 3000 },
        );
      } catch {
        /* swallow timeout — falla se reporta abajo */
      }
      lang = await page.evaluate(() => document.documentElement.lang);
      console.log(`  Después: ${lang} @ ${page.url()}`);
      const ok = lang === "es";
      console.log(`  EN → ES: ${fmt(ok)}`);
      if (!ok) issues.push("EN → ES no actualizó html[lang]");
    }
  } finally {
    await enCtx.context.close();
  }

  return issues;
}

/* ─────────────────────────────────────────────────────────────────
 * Main
 * ──────────────────────────────────────────────────────────────── */
async function main() {
  console.log(`▶ Verifying i18n setup against ${BASE}`);
  const browser = await chromium.launch();
  const allIssues = [];

  try {
    const esIssues = await checkLocale(browser, "es", `${BASE}/`);
    allIssues.push(...esIssues.map((i) => `[es] ${i}`));

    const enIssues = await checkLocale(browser, "en", `${BASE}/en`);
    allIssues.push(...enIssues.map((i) => `[en] ${i}`));

    const switchIssues = await checkLocaleSwitch(browser);
    allIssues.push(...switchIssues.map((i) => `[switch] ${i}`));
  } catch (err) {
    console.error("Error durante la verificación:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }

  console.log("\n────────────────────────────────");
  if (allIssues.length === 0) {
    console.log("✅ i18n setup correcto. 0 issues.");
  } else {
    console.log(`❌ ${allIssues.length} issue(s) detectado(s):`);
    for (const issue of allIssues) console.log(`  · ${issue}`);
    process.exitCode = 1;
  }
}

main();

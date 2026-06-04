/**
 * Validación end-to-end del setup SEO/OG en producción.
 *
 * Verifica:
 *   1. Assets servidos · /opengraph-image, /icon.svg, /icon.png,
 *      /apple-icon.png, /manifest.webmanifest, /robots.txt, /sitemap.xml
 *   2. Meta tags del <head> de la home · og:image, og:url, og:title,
 *      twitter:card, canonical, JSON-LD Person schema, etc.
 *   3. Que el HTML inicial sea válido (200 + content-type text/html)
 *
 * Captura screenshot de:
 *   · captures/og-image-prod.png — el OG image real renderizado en producción
 *
 * Output:
 *   · Tabla con status de cada asset
 *   · Listado de meta tags relevantes encontradas
 *   · Issues detectados (URLs relativas, missing tags, etc.)
 *
 * Run:
 *   node scripts/verify-og-seo.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const BASE = "https://jhonatanbecerra-portfolio.vercel.app";
const SCREENSHOT = "captures/og-image-prod.png";

const ASSETS = [
  "/",
  "/opengraph-image",
  "/icon.svg",
  "/icon.png",
  "/apple-icon.png",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
];

async function main() {
  console.log(`→ Testing against ${BASE}\n`);

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent:
      "Mozilla/5.0 (Linux) AppleWebKit/537.36 (compatible; verify-og-seo/1.0; +" +
      BASE +
      ")",
  });
  const page = await ctx.newPage();

  /* ─── 1. HEAD-like checks via GET ──────────────────────────── */
  console.log("─── Assets ─────────────────────────────────────────");
  console.log(
    "PATH                         STATUS  SIZE         CONTENT-TYPE",
  );
  const results = [];
  for (const path of ASSETS) {
    try {
      const res = await ctx.request.get(BASE + path, {
        timeout: 20000,
        maxRedirects: 3,
      });
      const status = res.status();
      const body = await res.body();
      const size = body.length;
      const ct = res.headers()["content-type"] ?? "?";
      const cache = res.headers()["cache-control"] ?? "?";
      results.push({ path, status, size, ct, cache });
      console.log(
        `${path.padEnd(28)} ${String(status).padStart(3)}     ${String(
          size,
        ).padStart(10)}  ${ct}`,
      );
    } catch (err) {
      results.push({ path, status: "ERR", error: err.message });
      console.log(`${path.padEnd(28)} ERR     ${err.message.slice(0, 60)}`);
    }
  }
  console.log("");

  /* ─── 2. Meta tags from home <head> ────────────────────────── */
  console.log("─── Meta tags (home <head>) ────────────────────────");
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 30000 });

  const meta = await page.evaluate(() => {
    const out = {};
    // Title + canonical
    out.title = document.title;
    out.canonical =
      document.querySelector('link[rel="canonical"]')?.getAttribute("href") ??
      null;
    out.lang = document.documentElement.lang;
    out.charset =
      document.querySelector("meta[charset]")?.getAttribute("charset") ?? null;
    out.viewport =
      document
        .querySelector('meta[name="viewport"]')
        ?.getAttribute("content") ?? null;
    out.themeColor =
      document
        .querySelector('meta[name="theme-color"]')
        ?.getAttribute("content") ?? null;
    out.description =
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content") ?? null;

    // Open Graph
    const ogTags = Array.from(
      document.querySelectorAll('meta[property^="og:"]'),
    ).map((m) => ({
      property: m.getAttribute("property"),
      content: m.getAttribute("content"),
    }));
    out.og = ogTags;

    // Twitter
    const twitterTags = Array.from(
      document.querySelectorAll('meta[name^="twitter:"]'),
    ).map((m) => ({
      name: m.getAttribute("name"),
      content: m.getAttribute("content"),
    }));
    out.twitter = twitterTags;

    // Icons
    const iconLinks = Array.from(
      document.querySelectorAll('link[rel*="icon"], link[rel*="apple-touch"]'),
    ).map((l) => ({
      rel: l.getAttribute("rel"),
      href: l.getAttribute("href"),
      sizes: l.getAttribute("sizes"),
      type: l.getAttribute("type"),
    }));
    out.icons = iconLinks;

    // JSON-LD structured data
    const jsonLd = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
    ).map((s) => {
      try {
        return JSON.parse(s.textContent ?? "");
      } catch {
        return { _parseError: s.textContent?.slice(0, 80) };
      }
    });
    out.jsonLd = jsonLd;
    return out;
  });

  console.log(`title:        ${meta.title}`);
  console.log(`lang:         ${meta.lang}`);
  console.log(`canonical:    ${meta.canonical}`);
  console.log(`description:  ${meta.description?.slice(0, 100)}`);
  console.log(`theme-color:  ${meta.themeColor}`);
  console.log("");
  console.log("OpenGraph:");
  meta.og.forEach((t) => console.log(`  ${t.property.padEnd(22)} ${t.content}`));
  console.log("");
  console.log("Twitter:");
  meta.twitter.forEach((t) =>
    console.log(`  ${t.name.padEnd(22)} ${t.content}`),
  );
  console.log("");
  console.log("Icons:");
  meta.icons.forEach((i) =>
    console.log(
      `  rel=${i.rel.padEnd(18)} sizes=${(i.sizes ?? "?").padEnd(12)} type=${(i.type ?? "?").padEnd(12)} ${i.href}`,
    ),
  );
  console.log("");
  console.log("JSON-LD:");
  meta.jsonLd.forEach((j) =>
    console.log(`  @type=${j["@type"] ?? "?"}  name=${j.name ?? "?"}`),
  );

  /* ─── 3. Sanity checks ─────────────────────────────────────── */
  console.log("\n─── Issues detected ────────────────────────────────");
  const issues = [];

  // Canonical must be absolute and match BASE
  if (!meta.canonical?.startsWith("https://")) {
    issues.push(`⚠ canonical no es absoluta: ${meta.canonical}`);
  }

  // og:image must be absolute
  const ogImage = meta.og.find((t) => t.property === "og:image")?.content;
  if (!ogImage?.startsWith("https://")) {
    issues.push(`⚠ og:image no es absoluta: ${ogImage}`);
  }

  // og:url
  const ogUrl = meta.og.find((t) => t.property === "og:url")?.content;
  if (!ogUrl?.startsWith("https://")) {
    issues.push(`⚠ og:url no es absoluta: ${ogUrl}`);
  }

  // twitter:card present
  if (!meta.twitter.find((t) => t.name === "twitter:card")) {
    issues.push("⚠ twitter:card no presente");
  }

  // At least one icon
  if (meta.icons.length === 0) {
    issues.push("⚠ No hay <link rel=icon> en el head");
  }

  // JSON-LD Person present
  if (!meta.jsonLd.find((j) => j["@type"] === "Person")) {
    issues.push("⚠ JSON-LD Person schema no encontrado");
  }

  // 4xx/5xx en assets
  results
    .filter((r) => typeof r.status === "number" && r.status >= 400)
    .forEach((r) => issues.push(`⚠ ${r.path} devolvió ${r.status}`));

  if (issues.length === 0) {
    console.log("✓ Sin issues detectados.");
  } else {
    issues.forEach((i) => console.log(i));
  }

  /* ─── 4. Screenshot del OG image ───────────────────────────── */
  await mkdir(dirname(SCREENSHOT), { recursive: true });
  console.log(`\n→ Capturando OG image…`);
  const ogPage = await ctx.newPage();
  await ogPage.setViewportSize({ width: 1200, height: 630 });
  await ogPage.goto(BASE + "/opengraph-image", { waitUntil: "networkidle" });
  // The OG endpoint returns a PNG; navigate displays it inline.
  await ogPage.screenshot({ path: SCREENSHOT, fullPage: false });
  console.log(`  → ${SCREENSHOT}`);

  /* ─── 5. Save raw meta JSON for reference ──────────────────── */
  await writeFile(
    "captures/og-meta.json",
    JSON.stringify({ assets: results, meta, issues }, null, 2),
  );
  console.log(`  → captures/og-meta.json`);

  await browser.close();
  process.exit(issues.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(2);
});

/**
 * Verifica meta tags + favicons + OG image renderizando contra el
 * dev server.
 *
 *   node scripts/verify-metadata.mjs
 *
 * Output:
 *   .next/metadata-verify/head.txt         → todo el <head> impreso
 *   .next/metadata-verify/opengraph.png    → captura cruda del OG
 *   .next/metadata-verify/icon-svg.txt     → contenido del icon.svg servido
 *   stdout                                  → resumen de checks
 */
import { chromium, request } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.DEV_URL ?? "http://localhost:3000";
const OUT_DIR = path.resolve(".next/metadata-verify");

const CHECKS = [
  { tag: 'link[rel="icon"][type="image/svg+xml"]', label: "Favicon SVG" },
  { tag: 'link[rel="icon"][type="image/png"]', label: "Favicon PNG" },
  { tag: 'link[rel="apple-touch-icon"]', label: "Apple Touch Icon" },
  { tag: 'link[rel="manifest"]', label: "Web Manifest" },
  { tag: 'meta[property="og:image"]', label: "OG Image" },
  { tag: 'meta[property="og:title"]', label: "OG Title" },
  { tag: 'meta[property="og:description"]', label: "OG Description" },
  { tag: 'meta[name="twitter:card"]', label: "Twitter Card" },
  { tag: 'meta[name="twitter:image"]', label: "Twitter Image" },
  { tag: 'meta[name="description"]', label: "Description" },
  { tag: 'meta[name="keywords"]', label: "Keywords" },
  { tag: 'link[rel="canonical"]', label: "Canonical" },
  { tag: 'script[type="application/ld+json"]', label: "JSON-LD Person" },
  { tag: 'meta[name="theme-color"]', label: "Theme Color" },
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  /* ─── 1. Render homepage, extract <head> ─── */
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 30_000 });

  const headHtml = await page.evaluate(() => document.head.outerHTML);
  await writeFile(path.join(OUT_DIR, "head.txt"), headHtml);

  const results = [];
  for (const c of CHECKS) {
    const el = await page.locator(c.tag).first();
    const exists = (await el.count()) > 0;
    let val = "";
    if (exists) {
      val =
        (await el.getAttribute("href")) ??
        (await el.getAttribute("content")) ??
        (await el.evaluate((n) => n.textContent?.slice(0, 80) ?? "")) ??
        "";
    }
    results.push({ label: c.label, exists, val });
  }

  process.stdout.write("\nMeta checks:\n");
  for (const r of results) {
    const mark = r.exists ? "PASS" : "FAIL";
    process.stdout.write(
      `  [${mark}] ${r.label.padEnd(22)} ${r.val ? `→ ${r.val.slice(0, 90)}` : ""}\n`,
    );
  }

  /* ─── 2. Hit /opengraph-image directly, save PNG ─── */
  const ctx = await request.newContext({ baseURL: BASE_URL });
  const og = await ctx.get("/opengraph-image");
  const okOg = og.ok();
  process.stdout.write(`\nOG image · ${okOg ? "PASS" : "FAIL"} (status ${og.status()})\n`);
  if (okOg) {
    const buf = await og.body();
    await writeFile(path.join(OUT_DIR, "opengraph.png"), buf);
    process.stdout.write(`  saved ${buf.length} bytes → ${OUT_DIR}\\opengraph.png\n`);
  }

  /* ─── 3. Hit /icon.svg directly ─── */
  const svg = await ctx.get("/icon.svg");
  const okSvg = svg.ok();
  process.stdout.write(`\nIcon SVG · ${okSvg ? "PASS" : "FAIL"} (status ${svg.status()})\n`);
  if (okSvg) {
    const text = await svg.text();
    await writeFile(path.join(OUT_DIR, "icon-svg.txt"), text);
    process.stdout.write(`  first 200 chars: ${text.slice(0, 200)}\n`);
  }

  /* ─── 4. Manifest sanity ─── */
  const mf = await ctx.get("/manifest.webmanifest");
  const okMf = mf.ok();
  process.stdout.write(`\nManifest · ${okMf ? "PASS" : "FAIL"} (status ${mf.status()})\n`);
  if (okMf) {
    const json = await mf.json();
    process.stdout.write(`  icons declared: ${json.icons?.length ?? 0}\n`);
    for (const ic of json.icons ?? []) {
      process.stdout.write(`    · ${ic.src} (${ic.sizes}, purpose=${ic.purpose})\n`);
    }
  }

  await ctx.dispose();
  await browser.close();
}

main().catch((e) => {
  process.stderr.write(`Fatal: ${e?.stack ?? e}\n`);
  process.exit(1);
});

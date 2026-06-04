/**
 * Generate raster favicons from a master SVG.
 *
 * Outputs:
 *   src/app/icon.png        256x256  ← PNG fallback (Android, RSS readers, browsers
 *                                       que no rinden <text> en favicon SVG)
 *   src/app/apple-icon.png  180x180  ← iOS home screen + macOS Safari favorites
 *
 * Notas:
 *   · iOS aplica masking superrounded por encima del PNG, así que no
 *     necesitamos border-radius en el apple-icon (lo agrega el sistema).
 *     Mantenemos el rx del master SVG porque librsvg lo respeta y queda
 *     bien para los demás contextos donde el PNG sí se ve "as-is".
 *   · El apple-icon usa un design AMPLIADO (más padding interno + dot
 *     más grande proporcionalmente) porque iOS lo renderea a 60x60
 *     efectivo en el home screen — el diseño tiene que respirar.
 *
 * Re-run con: `node scripts/generate-favicons.mjs`. Es idempotente —
 * sobreescribe los PNGs sin tocar el SVG master.
 */
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SVG_PATH = path.join(ROOT, "src/app/icon.svg");
const OUT_ICON = path.join(ROOT, "src/app/icon.png");
const OUT_APPLE = path.join(ROOT, "src/app/apple-icon.png");

/* Apple-icon usa un master SVG distinto (más espacioso) para que el
 * masking de iOS no recorte el dot lima ni el wordmark. */
const APPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" shape-rendering="geometricPrecision">
  <rect width="180" height="180" rx="40" fill="#0A0B0F"/>
  <text x="90" y="118" text-anchor="middle"
        font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
        font-weight="800" font-size="92" letter-spacing="-5" fill="#FAFAF8">jb</text>
  <circle cx="142" cy="50" r="14" fill="#C4FF00"/>
</svg>`;

async function main() {
  const masterSvg = await readFile(SVG_PATH);

  /* ── icon.png · 256x256 ── *
   * 256 es el "sweet spot" para PNG icon — sirve como source para
   * downscaling del browser (16, 32, 48, 96) y queda nítido hasta
   * 256 (Android home shortcut). Tamaño en disco ~3-5KB. */
  await sharp(masterSvg, { density: 384 /* 4x supersampling */ })
    .resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, palette: true })
    .toFile(OUT_ICON);

  /* ── apple-icon.png · 180x180 ── *
   * 180x180 es el tamaño recomendado por Apple para iOS 7+
   * (cubre iPhone Plus models también). Usa el master SVG
   * agrandado, no el de 32x32, para evitar pixelation del
   * letterforming. */
  await sharp(Buffer.from(APPLE_SVG), { density: 384 })
    .resize(180, 180, { fit: "contain" })
    .png({ compressionLevel: 9 })
    .toFile(OUT_APPLE);

  process.stdout.write(
    `✓ icon.png      → ${OUT_ICON}\n` +
    `✓ apple-icon.png → ${OUT_APPLE}\n`
  );
}

main().catch((e) => {
  process.stderr.write(`Fatal: ${e?.stack ?? e}\n`);
  process.exit(1);
});

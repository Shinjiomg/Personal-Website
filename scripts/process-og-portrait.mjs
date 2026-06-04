/**
 * Pre-procesa el retrato para usarlo en la OG image.
 *
 * Source: public/team/jhonatan-becerra.webp (1.28 MB · alta resolución
 *         del shoot original, reusada en el footer del site)
 * Output: src/app/og-portrait.jpg (~40-60 KB · solo lo que la OG necesita)
 *
 * Por qué co-localizamos en src/app/ y no en public/:
 *   · El edge runtime de `opengraph-image.tsx` puede leer assets
 *     adyacentes via `new URL('./og-portrait.jpg', import.meta.url)`
 *     — más confiable que un fetch HTTP al mismo origen (que en
 *     dev requiere conocer el puerto, en prod la URL absoluta).
 *   · Next NO expone archivos arbitrarios .jpg en app/ como rutas
 *     — solo respeta el file convention (icon, opengraph-image,
 *     apple-icon, etc.). Verificado en el build output: og-portrait.jpg
 *     no aparece como ruta pública.
 *   · La imagen quedaba bundleada con el bundle de la edge fn vs
 *     siendo fetcheada por HTTP — menos latencia, mismo CDN cache.
 *
 * Dimensiones:
 *   720x945 = ratio ~0.76 (vertical portrait), oversample 1.5x del
 *   render real (480x630). Suficiente para una imagen que se ve a
 *   un máx de 2x DPR en clients (LinkedIn, WhatsApp web) — pasar a
 *   2x no agrega calidad perceptible y duplica peso.
 *
 * Crop:
 *   `fit: "cover"` con `position: "top"` — para retratos, mantener
 *   la cabeza/hombros en vez de centrar (que cortaría la frente
 *   en aspect ratios verticales).
 */
import sharp from "sharp";
import path from "node:path";

const SRC = path.resolve("public/team/jhonatan-becerra.webp");
const OUT = path.resolve("src/app/og-portrait.jpg");

async function main() {
  const meta = await sharp(SRC).metadata();
  process.stdout.write(
    `Source: ${path.basename(SRC)} (${meta.width}x${meta.height}, ${meta.format})\n`,
  );

  await sharp(SRC)
    .rotate() // honor EXIF orientation (algunas cams rotan via metadata)
    .resize(720, 945, {
      fit: "cover",
      position: "top",
    })
    .jpeg({
      quality: 82,
      mozjpeg: true, // mejor compression ratio que el JPEG default
    })
    .toFile(OUT);

  const outMeta = await sharp(OUT).metadata();
  process.stdout.write(
    `✓ ${path.relative(process.cwd(), OUT)}\n` +
      `  ${outMeta.width}x${outMeta.height} · ${(outMeta.size / 1024).toFixed(1)} KB\n`,
  );
}

main().catch((e) => {
  process.stderr.write(`Fatal: ${e?.stack ?? e}\n`);
  process.exit(1);
});

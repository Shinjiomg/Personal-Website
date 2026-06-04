import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/site-config";

/**
 * Sitemap data-driven y i18n-aware.
 *
 * El sitio es one-page real: TODO vive bajo `/` (es) y `/en`. Las
 * secciones (#sobre-mi, #experiencia, #portafolio, #contacto) no se
 * listan como URLs separadas — los buscadores las descubren e indexan
 * por fragment desde el HTML del home cuando relevan.
 *
 * Cada entry incluye `alternates.languages` con todos los locales para
 * que Google entienda que `/` y `/en` son traducciones del mismo
 * contenido y no duplicados. Esto es la contraparte de los `hreflang`
 * que ya emite `generateMetadata` en `[locale]/layout.tsx`.
 *
 * Cuando aparezcan casos de estudio profundos como sub-rutas (e.g.
 * `/casos/[slug]` / `/en/cases/[slug]`) o un blog, mapearlos acá
 * siguiendo el mismo patrón.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  /* Construye el path por locale respetando `localePrefix: "as-needed"`:
   *   · default locale (es) → "/"
   *   · resto → `/<locale>` */
  const pathFor = (locale: string) =>
    locale === routing.defaultLocale ? "/" : `/${locale}`;

  /* Languages object compartido por todas las entries — Google espera
   * que `alternates.languages` esté presente en TODAS las páginas
   * traducidas, no sólo en una. */
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, `${base}${pathFor(locale)}`]),
  );

  return routing.locales.map((locale) => ({
    url: `${base}${pathFor(locale)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: locale === routing.defaultLocale ? 1 : 0.9,
    alternates: { languages },
  }));
}

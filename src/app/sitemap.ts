import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

/**
 * Sitemap data-driven.
 *
 * El sitio es one-page real: TODO vive bajo `/`. Las secciones
 * (#sobre-mi, #experiencia, #portafolio, #contacto) no se listan
 * como URLs separadas — los buscadores las descubren e indexan por
 * fragment desde el HTML del home cuando relevan.
 *
 * Cuando aparezcan casos de estudio profundos como sub-rutas (e.g.
 * `/casos/[slug]`) o un blog, mapearlos acá siguiendo el patrón del
 * playbook §7 ("dynamicPages").
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}

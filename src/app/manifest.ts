import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

/**
 * PWA manifest. Los iconos los agregaremos cuando preparemos los
 * favicons cuadrados ≥ 48px (PLAYBOOK §7). Por ahora sólo el
 * shell — Next acepta un manifest sin icons declarados; el browser
 * usa el favicon implícito.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} · ${siteConfig.tagline}`,
    short_name: siteConfig.shortName,
    description: siteConfig.shortDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF8",
    theme_color: "#FAFAF8",
    icons: [],
  };
}

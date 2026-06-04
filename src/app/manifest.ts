import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

/**
 * PWA manifest. Los icons que declaramos acá son los que Android
 * usa cuando el user hace "Añadir a pantalla de inicio" — sirven
 * además como hint para Edge / Chrome para el shortcut bar.
 *
 * Sizes:
 *   · 32x32   — favicon estándar (downscaled de icon.png)
 *   · 192x192 — Android home screen MIN required
 *   · 256x256 — Android home screen recomended (lo que generamos)
 *   · 512x512 — splash screen y high-res Android. Generado vía
 *               downscaling automático por el browser desde 256
 *               cuando no hay 512 nativo — alternativa: regenerar
 *               icon.png a 512 si el shortcut se ve borroso.
 *
 * `purpose: "any maskable"` permite que Android haga su masking
 * (rounded square / squircle) sin recortar contenido — necesita
 * que el design tenga safe-area de ~10% en el borde. Nuestro
 * SVG ya tiene padding suficiente (jb centrado, dot lima alejado
 * de la esquina absoluta).
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
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "256x256",
        type: "image/png",
        purpose: "any",
      },
      {
        /* Misma fuente PNG registrada como `maskable` para Android.
         * El W3C spec permite `purpose="any maskable"` en un mismo
         * entry, pero Next's types sólo aceptan un valor por entry
         * → split en 2 entries idénticos en src + sizes pero
         * distintos en purpose. Resultado es el mismo: el browser
         * elige el que mejor encaja al contexto (mask vs no-mask). */
        src: "/icon.png",
        sizes: "256x256",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}

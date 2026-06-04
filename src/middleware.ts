/**
 * Middleware de Next.js — orquesta routing i18n con next-intl.
 *
 * Responsabilidades:
 *   1. Detección de locale (URL prefix > cookie > Accept-Language >
 *      defaultLocale) y rewrite interno de paths.
 *   2. Emisión de cookie `NEXT_LOCALE` para persistir la preferencia
 *      del visitante (sobrevive a clicks del LocaleSwitch).
 *   3. Redirect de paths con prefix del defaultLocale (`/es/...`)
 *      al path sin prefix (`/...`) — manda señales canónicas a Google.
 *
 * Matcher:
 *   Excluimos paths que NUNCA deben tocar el i18n routing:
 *   · /api/*       — endpoints (e.g. /api/contact) son locale-agnostic
 *   · /_next/*     — assets internos de Next
 *   · /_vercel/*   — assets internos de Vercel
 *   · paths con `.` — archivos estáticos servidos desde public/
 *                     (cv.pdf, robots.txt, sitemap.xml, fonts, etc.)
 *
 * Importante:
 *   · /opengraph-image, /icon.svg, /icon.png, /apple-icon.png viven
 *     en src/app/[locale]/ — el middleware SÍ procesa esas rutas
 *     porque NO tienen `.` en el path (Next.js las sirve dinámicamente).
 *     El matcher excluye solo archivos REALES en /public.
 */
import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};

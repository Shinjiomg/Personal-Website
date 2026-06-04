import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getLocale } from "next-intl/server";

import { siteConfig } from "@/lib/site-config";

import "./globals.css";

/**
 * Root layout · `app/layout.tsx`
 *
 * Responsabilidades (compartidas con TODOS los locales y con 404s
 * que caen fuera de un segmento `[locale]`):
 *   · Cargar fuentes globales (Satoshi local + Fraunces de Google)
 *     y exponerlas como CSS variables en `<html>`.
 *   · Importar `globals.css` (tokens, base styles, animations).
 *   · Montar `<html lang>` con el locale activo resuelto por
 *     `getLocale()` — i18n-aware sin necesidad de propagar el
 *     prop desde cada page.
 *   · Inyectar Vercel Analytics + Speed Insights (globales).
 *
 * Lo que NO vive acá (vive en `[locale]/layout.tsx`):
 *   · Nav, Footer, WhatsAppFab — necesitan strings traducidas
 *   · NextIntlClientProvider — solo aplica dentro de un locale
 *   · JSON-LD Person — `inLanguage` cambia por locale
 *   · `generateMetadata` con title/description/OG — locale-aware
 *
 * Por qué `getLocale()` y no `useLocale()`:
 *   Root layout corre en server. `useLocale()` es para client
 *   components. `getLocale()` también funciona FUERA del segmento
 *   `[locale]` (cae a defaultLocale del routing config) → el 404
 *   global de un path inválido todavía renderea `<html lang="es">`.
 *
 * Pareja tipográfica:
 *   · Body / UI · Satoshi (sans humanista geométrica), self-hosted
 *     en `public/fonts/satoshi/`. 4 pesos en .woff2 (~100 KB total).
 *   · Display · Fraunces (serif variable) vía `next/font/google`.
 *     Next 16 la self-hostea en build, sin request a Google en
 *     runtime — cumple GDPR sin tener que descargar .woff2 a mano.
 *     Axes activos: SOFT (rasgos amables) + opsz (tamaño óptico).
 */

const satoshi = localFont({
  variable: "--font-satoshi",
  display: "swap",
  src: [
    { path: "../../public/fonts/satoshi/Satoshi-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/satoshi/Satoshi-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/satoshi/Satoshi-700.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/satoshi/Satoshi-900.woff2", weight: "900", style: "normal" },
  ],
});

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "opsz"],
});

export const viewport: Viewport = {
  themeColor: "#FAFAF8",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/* Metadata global · solo lo que no varía por locale.
 * El `title`, `description`, `openGraph`, `twitter` y `alternates`
 * son emitidos por `generateMetadata` en `[locale]/layout.tsx`. */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: { telephone: false, email: false, address: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${satoshi.variable} ${fraunces.variable}`}
      // Next 16 quita `scroll-behavior: smooth` durante las route
      // transitions cuando este atributo está presente, evitando
      // animar el viewport completo en cada navegación interna.
      data-scroll-behavior="smooth"
    >
      <body className="bg-background font-sans text-foreground antialiased">
        {children}

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

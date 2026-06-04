import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { siteConfig } from "@/lib/site-config";

import "./globals.css";

/**
 * Pareja tipográfica:
 *  - Body / UI: Satoshi (sans humanista geométrica) self-hosted en
 *    `public/fonts/satoshi/`. 4 pesos en .woff2 (~100KB total).
 *  - Display: Fraunces (serif variable) servida vía `next/font/google`.
 *    Next 16 la self-hostea en build, sin request a Google en runtime
 *    — cumple GDPR sin tener que descargar las .woff2 a mano.
 *    Axes activos: SOFT (rasgos amables) + opsz (tamaño óptico).
 *
 * Ambas se exponen como variables CSS (`--font-satoshi`, `--font-fraunces`)
 * y se consumen desde `globals.css` (`--font-sans`, `--font-display`).
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

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} · ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  keywords: [
    "Jhonatan Becerra",
    "desarrollador frontend",
    "Next.js",
    "Angular",
    "TypeScript",
    "React",
    "frontend Colombia",
    "frontend Bogotá",
    "portafolio frontend",
  ],
  formatDetection: { telephone: false, email: false, address: false },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: siteConfig.url,
    title: `${siteConfig.name} · ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} · ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
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

/**
 * JSON-LD Person — vive inline en el layout (no en `lib/schema`)
 * porque por ahora es el único schema del sitio. Cuando aparezcan
 * Article (insights) o CreativeWork (casos del portafolio),
 * extraer a `lib/schema.tsx` siguiendo el patrón del playbook §5.
 */
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.name,
  jobTitle: siteConfig.tagline,
  url: siteConfig.url,
  email: siteConfig.contact.email,
  telephone: siteConfig.contact.whatsapp,
  address: {
    "@type": "PostalAddress",
    addressCountry: "CO",
    addressLocality: "Bogotá",
  },
  sameAs: [siteConfig.social.github, siteConfig.social.linkedin],
  knowsAbout: [
    ...siteConfig.stack.primary,
    ...siteConfig.stack.styling,
    ...siteConfig.stack.runtime,
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={siteConfig.locale}
      className={`${satoshi.variable} ${fraunces.variable}`}
      // Next 16 quita `scroll-behavior: smooth` durante las route
      // transitions cuando este atributo está presente, evitando
      // animar el viewport completo en cada navegación interna.
      data-scroll-behavior="smooth"
    >
      <head>
        <script
          type="application/ld+json"
          // Pre-serializado: JSON.stringify es seguro acá, no hay
          // datos provenientes del usuario en `personSchema`.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body className="bg-background font-sans text-foreground antialiased">
        <a href="#contenido" className="skip-link skip-link-focus">
          Saltar al contenido
        </a>

        <Nav />
        <main id="contenido">{children}</main>
        <Footer />

        {/* FAB de WhatsApp — sticky bottom-right. Se auto-oculta
            cuando #contacto está en view o un Dialog/drawer abre el
            body-scroll-lock. Vive al final del DOM (no afecta el
            tab-order del header/main). */}
        <WhatsAppFab />

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

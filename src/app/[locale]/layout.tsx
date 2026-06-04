import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { HtmlLangSync } from "@/components/HtmlLangSync";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { routing, type Locale } from "@/i18n/routing";
import { siteConfig } from "@/lib/site-config";

/**
 * Locale layout · `app/[locale]/layout.tsx`
 *
 * Wrappea el contenido de cada locale con:
 *   · `NextIntlClientProvider` — expone messages a client components
 *   · `Nav`, `Footer`, `WhatsAppFab` — chrome del onepage
 *   · Skip-link i18n-aware
 *   · JSON-LD `Person` schema con `inLanguage`/`description` por locale
 *
 * Validación:
 *   Si la URL trae un locale fuera de `routing.locales` (e.g. `/fr`),
 *   `hasLocale` retorna false y disparamos `notFound()` para que el
 *   404 de [locale] renderee. Esto cumple el contrato del config —
 *   los locales soportados están definidos en un único lugar.
 *
 * `setRequestLocale(locale)`:
 *   Habilita static rendering para este segmento. Sin esto, next-intl
 *   asume dynamic rendering y los componentes que usen `getTranslations`
 *   o `useTranslations` server-side opt-out de prerender. Con esto,
 *   las páginas se buildean estáticas a build time.
 *
 * `generateStaticParams`:
 *   Le dice a Next qué locales prerenderear estáticamente. Sin esto,
 *   el primer request a cada locale dispara un render dinámico
 *   on-demand y queda cacheado. Con esto, ambas versiones (es y en)
 *   se buildean ahead-of-time → first-paint instantáneo en producción.
 */

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/* Mapping de locale ISO → OG locale code. Open Graph espera el
 * formato `xx_YY` con territorio (es_CO, en_US). */
const OG_LOCALE_MAP: Record<Locale, string> = {
  es: "es_CO",
  en: "en_US",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }
  const t = await getTranslations({ locale, namespace: "Metadata" });

  /* Paths canónicos por locale.
   * Con `localePrefix: "as-needed"`, el default español vive en `/`
   * sin prefix y el inglés en `/en`. La generación del `canonical`
   * debe respetar esa convención para no confundir a Google. */
  const canonicalPath = locale === routing.defaultLocale ? "/" : `/${locale}`;

  return {
    title: {
      default: t("title.default"),
      template: t("title.template"),
    },
    description: t("description"),
    keywords: t("keywords").split("|").map((k) => k.trim()),
    alternates: {
      canonical: canonicalPath,
      languages: {
        es: "/",
        en: "/en",
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALE_MAP[locale],
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => OG_LOCALE_MAP[l]),
      url: canonicalPath,
      title: t("og.title"),
      description: t("og.description"),
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: t("og.title"),
      description: t("og.description"),
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Layout" });

  /* JSON-LD Person · locale-aware.
   * `description` y `jobTitle` se traducen, `inLanguage` se setea
   * con BCP-47 (`es-CO` para español Colombia, `en-US` para
   * inglés US — matchea el `OG_LOCALE_MAP`). */
  const inLanguage = locale === "es" ? "es-CO" : "en-US";
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    jobTitle: t("schema.jobTitle"),
    description: t("schema.description"),
    inLanguage,
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

  return (
    <NextIntlClientProvider>
      {/* Sincroniza <html lang> con el locale activo cuando el user
          cambia de idioma sin recargar la página (soft-nav). */}
      <HtmlLangSync />

      <script
        type="application/ld+json"
        // JSON.stringify de un objeto que controlamos por completo —
        // sin datos de usuario — el dangerouslySetInnerHTML es seguro.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <a href="#contenido" className="skip-link skip-link-focus">
        {t("skipToContent")}
      </a>

      <Nav />
      <main id="contenido">{children}</main>
      <Footer />

      {/* FAB de WhatsApp — sticky bottom-right. Se auto-oculta
          cuando #contacto está en view o un Dialog/drawer abre el
          body-scroll-lock. Vive al final del DOM (no afecta el
          tab-order del header/main). */}
      <WhatsAppFab />
    </NextIntlClientProvider>
  );
}

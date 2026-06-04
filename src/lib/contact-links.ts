import { useTranslations } from "next-intl";

import { siteConfig } from "./site-config";

/**
 * Pre-built `mailto:` and `wa.me` URLs derived from `siteConfig` + i18n.
 *
 * Centralizado para que el subject + el cuerpo pre-rellenado de email,
 * y el mensaje pre-rellenado de WhatsApp, sean idénticos en todos los
 * lugares (header CTA, footer, hero CTA, página de contacto). Cambiar
 * el copy en un solo lugar (acá + en `messages/{locale}.json`).
 *
 * i18n note:
 *   Antes los strings de subject/body/prefill vivían en `siteConfig`.
 *   Ahora viven en `messages/*.json` bajo `ContactLinks.*` para que
 *   el visitante en inglés reciba un mailto en inglés. Esto requiere
 *   un hook (`useContactLinks`) en lugar de un objeto exportado.
 *
 * Patrones de uso:
 *   ```tsx
 *   // Client Component
 *   const links = useContactLinks();
 *   <Link href={links.whatsapp}>...</Link>
 *
 *   // Server Component (también funciona — useTranslations es
 *   // RSC-compatible en next-intl 4+)
 *   const links = useContactLinks();
 *   <a href={links.email}>...</a>
 *   ```
 *
 * Helper interno `buildContactLinks` está exportado para uso desde
 * routes/API (donde `useTranslations` no funciona) — recibe strings
 * pre-resueltos por el caller via `getTranslations({ locale })`.
 */

export type ContactLinks = {
  email: string;
  whatsapp: string;
  github: string;
  linkedin: string;
};

type LocalizedContactStrings = {
  emailSubject: string;
  emailBody: string;
  whatsappPrefill: string;
};

export function buildContactLinks(
  strings: LocalizedContactStrings,
): ContactLinks {
  const { email } = siteConfig.contact;
  const params = new URLSearchParams({
    subject: strings.emailSubject,
    body: strings.emailBody,
  });

  const number = siteConfig.contact.whatsapp.replace(/[^\d]/g, "");
  const text = encodeURIComponent(strings.whatsappPrefill);

  return {
    email: `mailto:${email}?${params.toString()}`,
    whatsapp: `https://wa.me/${number}?text=${text}`,
    github: siteConfig.social.github,
    linkedin: siteConfig.social.linkedin,
  };
}

export function useContactLinks(): ContactLinks {
  const t = useTranslations("ContactLinks");
  return buildContactLinks({
    emailSubject: t("emailSubject"),
    emailBody: t("emailBody"),
    whatsappPrefill: t("whatsappPrefill"),
  });
}

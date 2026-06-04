import { siteConfig } from "./site-config";

/**
 * Pre-built `mailto:` and `wa.me` URLs derived from `siteConfig`.
 *
 * Centralizado para que el subject + el cuerpo pre-rellenado de email,
 * y el mensaje pre-rellenado de WhatsApp, sean idénticos en todos los
 * lugares (header CTA, footer, hero CTA, página de contacto). Cambiar
 * el copy en un solo lugar.
 */
function buildMailto() {
  const { email, emailSubject, emailBody } = siteConfig.contact;
  const params = new URLSearchParams({
    subject: emailSubject,
    body: emailBody,
  });
  return `mailto:${email}?${params.toString()}`;
}

function buildWhatsApp() {
  const number = siteConfig.contact.whatsapp.replace(/[^\d]/g, "");
  const text = encodeURIComponent(siteConfig.contact.whatsappPrefill);
  return `https://wa.me/${number}?text=${text}`;
}

export const contactLinks = {
  email: buildMailto(),
  whatsapp: buildWhatsApp(),
  github: siteConfig.social.github,
  linkedin: siteConfig.social.linkedin,
} as const;

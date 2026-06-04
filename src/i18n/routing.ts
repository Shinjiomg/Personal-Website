/**
 * Configuración de routing de next-intl — single source of truth
 * para qué locales soporta el portafolio y cómo se reflejan en URL.
 *
 * Decisiones (sesión de implementación):
 *   · 2 locales: `es` (default, Colombia) y `en` (mercado USA / remoto)
 *   · localePrefix `as-needed` — el español default vive en `/` sin
 *     prefijo (las URLs canónicas pre-i18n siguen funcionando), y el
 *     inglés vive en `/en`. Esto preserva el SEO previo de la home
 *     y evita un wave de redirects de `/` → `/es` después de deploy.
 *   · localeDetection = true (default) → next-intl resuelve por
 *     prioridad: 1) prefix de URL, 2) cookie, 3) Accept-Language
 *     header, 4) defaultLocale. Reclutadores US con browser en
 *     inglés van a recibir `/en` automáticamente en su primera visita.
 *
 * Para agregar un tercer locale en el futuro (pt-BR, etc.):
 *   1. Agregar el code acá en `locales`
 *   2. Crear `messages/<code>.json`
 *   3. Update sitemap.ts y metadata alternates
 *   4. (Opcional) traducir copy de `data/*.ts` que esté hardcoded
 */
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"] as const,
  defaultLocale: "es",
  /* `as-needed` = sin prefix para el default, con prefix para el resto.
   * Alternativas si en algún momento queremos URLs simétricas:
   *   - "always" → `/es` y `/en` (redirect de `/` → `/es`)
   *   - "never"  → ambos en `/` (perdés SEO multi-idioma — NO recomendado) */
  localePrefix: "as-needed",
});

/* Tipo derivado para autocomplete en componentes que reciben locale
 * como prop (e.g. metadata generators, locale switch component). */
export type Locale = (typeof routing.locales)[number];

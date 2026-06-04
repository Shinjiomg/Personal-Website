"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

/**
 * HtmlLangSync — mantiene `<html lang>` y `<html data-locale>` en sync
 * con el locale activo cuando el usuario cambia de idioma vía
 * `<LocaleSwitch>` sin recargar la página.
 *
 * Problema que resuelve:
 *   El `<html>` se renderea en `app/layout.tsx` (root, fuera del
 *   segmento `[locale]`) usando `getLocale()` server-side. Cuando el
 *   user hace soft-nav de `/` a `/en` con `next-intl/Link`, el
 *   segmento `[locale]/layout.tsx` se remountea con el nuevo locale,
 *   pero `<html>` queda mountado del SSR inicial → `lang="es"` se
 *   queda pegado mientras el contenido ya está en inglés.
 *
 *   A11y impact: screen readers leen con la fonética del idioma
 *   declarado en `<html lang>`. Si decimos `lang="es"` y el contenido
 *   es inglés, JAWS/NVDA pronuncian las palabras inglesas con
 *   fonemas españoles.
 *
 *   SEO impact: Google ignora `<html lang>` cuando construye su
 *   index (usa otras señales), pero Bing y motores menores sí lo
 *   honran, y el atributo es referenciado por crawlers de
 *   accesibilidad y por reading-mode de browsers.
 *
 * Solución:
 *   Componente client que escucha `useLocale()` y sincroniza el
 *   atributo `lang` (y `data-locale` para CSS hooks) en cada cambio.
 *   Vive dentro de `[locale]/layout.tsx`, debajo de
 *   `NextIntlClientProvider`. Cero output visual.
 */
export function HtmlLangSync() {
  const locale = useLocale();

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.documentElement.lang !== locale) {
      document.documentElement.lang = locale;
    }
    document.documentElement.dataset.locale = locale;
  }, [locale]);

  return null;
}

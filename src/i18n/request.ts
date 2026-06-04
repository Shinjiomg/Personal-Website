/**
 * Configuración por-request de next-intl. Server-only.
 *
 * Esta función corre en cada request y devuelve:
 *   · `locale` — el locale resuelto (de URL, cookie o header)
 *   · `messages` — el JSON de strings traducidas para ese locale
 *   · `timeZone` — para formato de fechas server-side consistente
 *   · `now` — para que SSR y CSR usen el mismo timestamp en hidratación
 *
 * Conectado al runtime de next-intl vía el plugin de Next.js que
 * importa este archivo automáticamente (configurado en `next.config.ts`).
 */
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "@/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  /* `requestLocale` viene del middleware. Si el match falla (URL
   * con locale inválido, e.g. `/fr`), caemos a defaultLocale para
   * que el render no explote — el `notFound()` en `[locale]/layout`
   * captura el caso y sirve el 404 correcto. */
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    /* Import dinámico — webpack code-splits cada JSON por locale,
     * el bundle solo descarga el que corresponde al request. */
    messages: (await import(`../../messages/${locale}.json`)).default,
    /* Bogotá fija — el portafolio es de un dev colombiano y los
     * timestamps editoriales (e.g. "Disponible UTC-5") tienen
     * sentido desde esa zona. Si en el futuro el sitio expone
     * contenido time-sensitive del visitante, override por header. */
    timeZone: "America/Bogota",
  };
});

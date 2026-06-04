"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * LocaleSwitch — `ES | EN` toggle editorial.
 *
 * Decisiones de diseño:
 *   · **Pair toggle, no dropdown**: dos locales = no necesitamos un
 *     `<select>` ni un popover. Toggle inline mantiene la voz mono
 *     uppercase del header (alineado con el wordmark `jb·` y los
 *     eyebrows de cada sección).
 *   · **Sin íconos de bandera**: las banderas son ambiguas (¿inglés
 *     UK o US? ¿español ES o CO?) y rompen el lenguaje tipográfico.
 *     Códigos ISO 2-letter son inequívocos y caben en 2 chars.
 *   · **Active state**: dot lima accent del lado del locale activo,
 *     mismo treatment que el scroll-spy del nav. Consistencia visual.
 *   · **Hover state**: el opuesto al activo levanta opacity con el
 *     mismo timing que los NavItems.
 *
 * Routing:
 *   Usa el `<Link>` wrapper de `@/i18n/navigation` que respeta el
 *   pathname actual y solo cambia el locale prefix. El `usePathname`
 *   wrapper devuelve el path SIN prefix de locale (e.g. en `/en/casos`
 *   devuelve `/casos`), entonces el href se construye igual para
 *   ambos targets — next-intl agrega el prefix automáticamente.
 *
 * Persistencia:
 *   El middleware de next-intl persiste el locale en cookie
 *   `NEXT_LOCALE` al hacer el redirect, sin necesidad de manejo
 *   client-side acá. Cuando el user vuelve al site, su preferencia
 *   sobrevive (sin overrider Accept-Language).
 *
 * A11y:
 *   `aria-current="true"` en el item activo, `aria-label` en el
 *   contenedor con el idioma actual hablado en full ("Idioma actual:
 *   Español"), focus-visible ring sobre cada item, hit area cómodo
 *   (~36px de alto) sin estorbar al chrome compacto.
 */
type Props = {
  className?: string;
};

export function LocaleSwitch({ className }: Props) {
  const t = useTranslations("LocaleSwitch");
  const activeLocale = useLocale() as Locale;
  const pathname = usePathname();

  return (
    <div
      role="group"
      aria-label={t("currentLabel", { language: t(`${activeLocale}Full`) })}
      className={cn(
        "inline-flex items-center gap-0 rounded-full border border-foreground/12 bg-background/50 px-0.5 py-0.5 backdrop-blur-sm",
        className,
      )}
    >
      {routing.locales.map((locale) => {
        const isActive = locale === activeLocale;
        return (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            hrefLang={locale}
            aria-current={isActive ? "true" : undefined}
            aria-label={t(`${locale}Full`)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-background",
              isActive
                ? "text-foreground"
                : "text-foreground/55 hover:text-foreground",
            )}
          >
            {t(locale)}
            {/* Dot lima sobre el activo — mismo lenguaje que NavItem.
             *  En el inactivo queda hidden, no se anima a hover (sería
             *  ruido para algo que es un toggle binario, no un menu). */}
            <span
              aria-hidden
              className={cn(
                "size-1.5 rounded-full bg-[var(--accent)] transition-opacity duration-200",
                isActive ? "opacity-100" : "opacity-0",
              )}
            />
          </Link>
        );
      })}
    </div>
  );
}

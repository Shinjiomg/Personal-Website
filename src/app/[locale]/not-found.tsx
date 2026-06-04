import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Eyebrow } from "@/components/ui/eyebrow";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 404 dentro de un locale válido (e.g. `/en/algo-roto`).
 *
 * Para 404s FUERA de un locale (e.g. `/_unknown-stuff` con un path
 * que el middleware no matchea), Next.js cae al root `not-found.tsx`
 * que vive en `src/app/not-found.tsx` — versión mínima sin
 * traducciones porque ahí no hay locale context.
 *
 * El `<Link href="/">` usa el wrapper i18n-aware de `@/i18n/navigation`
 * para que el "Volver al inicio" respete el locale activo (en `/en`
 * apunta a `/en`, en `/` apunta a `/`).
 */
export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <section className="container-site flex min-h-[60vh] flex-col items-start justify-center py-20">
      <Eyebrow>{t("eyebrow")}</Eyebrow>
      <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,4rem)] leading-[1.05] tracking-[-0.03em] text-foreground-strong">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-md text-[16px] text-muted-foreground">
        {t("description")}
      </p>
      <Link
        href="/"
        className={cn(buttonVariants({ variant: "ink", size: "lg" }), "mt-8")}
      >
        <ArrowLeft aria-hidden />
        {t("backHome")}
      </Link>
    </section>
  );
}

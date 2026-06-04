import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Eyebrow } from "@/components/ui/eyebrow";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Root not-found · catch-all final.
 *
 * Solo se renderea para 404s que caen FUERA del segmento `[locale]`
 * — por ejemplo, paths del matcher del middleware excluidos (`/api/...`
 * que no existen, archivos no encontrados en `/_static/...`, etc.).
 *
 * Casos 99% del tiempo: el 404 lo sirve `[locale]/not-found.tsx`
 * que sí tiene traducciones. Por eso este file usa español hardcoded
 * (la mejor apuesta para un visitante random sin locale context) y
 * un `<Link>` plano de Next sin wrapper i18n.
 *
 * Si el portafolio sumara un tercer locale dominante en el futuro,
 * convendría detectar `Accept-Language` acá también — por ahora,
 * Spanish-by-default refleja la audiencia primaria.
 */
export default function RootNotFound() {
  return (
    <section className="container-site flex min-h-[60vh] flex-col items-start justify-center py-20">
      <Eyebrow>Error 404</Eyebrow>
      <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,4rem)] leading-[1.05] tracking-[-0.03em] text-foreground-strong">
        Esta página no existe.
      </h1>
      <p className="mt-4 max-w-md text-[16px] text-muted-foreground">
        Puede que el enlace esté viejo o haya cambiado de lugar. Volvamos a tierra firme.
      </p>
      <Link
        href="/"
        className={cn(buttonVariants({ variant: "ink", size: "lg" }), "mt-8")}
      >
        <ArrowLeft aria-hidden />
        Volver al inicio
      </Link>
    </section>
  );
}

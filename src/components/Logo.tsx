import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

type LogoProps = {
  /** Apunta a `/` por default. Cambiar sólo si el logo vive dentro
   * de un drawer/modal donde el click debe cerrarlo en vez de
   * navegar. */
  href?: string;
  /** Compact muestra sólo iniciales "jb." — para header scrolled
   * y mobile drawer header. Default es la firma editorial completa. */
  variant?: "full" | "compact";
  className?: string;
  /** Optional click handler — útil cuando vive dentro del drawer
   * mobile y queremos cerrarlo al navegar. */
  onClick?: () => void;
};

/**
 * Wordmark del portafolio — puramente tipográfico (Fraunces), sin
 * imagen ni icon-box. Diferencia clave vs el header anterior: cero
 * blur ni glow ni recuadro azul — la identidad es la tipografía.
 *
 * El punto lima final es la única marca visual: opera como la
 * "firma" del autor, igual que el `<brand-dot>` que llevan los
 * eyebrows. Aparece en hover en `variant="full"` y siempre en
 * `variant="compact"` (porque ahí reemplaza visualmente al texto).
 *
 * Layout:
 *   full     → "Jhonatan Becerra·" (lima dot)
 *   compact  → "jb·"               (lowercase iniciales + dot)
 */
export function Logo({
  href = "/",
  variant = "full",
  className,
  onClick,
}: LogoProps) {
  const label = `${siteConfig.name} — Inicio`;

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={label}
      className={cn(
        "group inline-flex items-baseline gap-[0.18em] font-display leading-none tracking-[-0.022em] text-foreground transition-opacity hover:opacity-90",
        className,
      )}
    >
      {variant === "full" ? (
        <span className="text-[18px] font-medium sm:text-[19px]">
          {siteConfig.wordmark}
        </span>
      ) : (
        <span className="text-[18px] font-medium sm:text-[19px] lowercase">
          {/* Iniciales compactas — derivadas del nombre para que cambien
              automático si actualizamos `siteConfig.name` mañana. */}
          {siteConfig.shortName[0]}
          {siteConfig.name.split(" ")[1]?.[0] ?? ""}
        </span>
      )}
      <span
        aria-hidden
        className="inline-block size-[7px] translate-y-[1px] rounded-full bg-[var(--accent)] transition-transform duration-300 ease-out group-hover:scale-110"
      />
    </Link>
  );
}

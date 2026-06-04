import { cva, type VariantProps } from "class-variance-authority";

/**
 * Button variants for the portfolio.
 *
 * Same `cva`-as-class-generator pattern used in jarvlabs/pagetook —
 * exported as a class string so it composes with `<Link>` from
 * next/link without needing a React wrapper:
 *
 *   <Link className={buttonVariants({ variant: "ink", size: "lg" })}>
 *     Ver portafolio
 *   </Link>
 *
 * Variantes:
 *  - `ink`     → CTA primaria (fondo near-black, texto off-white).
 *                Es la opuesta a la convención "accent solid": el
 *                lima es demasiado punzante para llenar un botón
 *                grande, queda mejor como underline/dot/borde.
 *  - `accent`  → CTA secundaria con el lima como background. Para
 *                acciones celebrativas (Descargar CV, Ver más). Texto
 *                ink encima del lima para conservar contraste.
 *  - `outline` → CTA terciaria, borde ink hairline.
 *  - `ghost`   → para iconos, paginación, etc.
 */
export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-sans font-medium transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        ink: "rounded-full bg-foreground text-background hover:bg-foreground-strong active:scale-[0.98] focus-visible:ring-foreground/40 [&>svg:last-child]:transition-transform [&>svg:last-child]:duration-200 hover:[&>svg:last-child]:translate-x-0.5",
        accent:
          "rounded-full bg-[var(--accent)] text-[var(--accent-on)] font-semibold hover:bg-[var(--accent-strong)] active:scale-[0.98] focus-visible:ring-[var(--accent)] [&>svg:last-child]:transition-transform [&>svg:last-child]:duration-200 hover:[&>svg:last-child]:translate-x-0.5",
        outline:
          "rounded-full border border-foreground/25 bg-transparent text-foreground hover:border-foreground hover:bg-foreground/[0.04] active:scale-[0.98] focus-visible:ring-foreground/30 [&>svg:last-child]:transition-transform [&>svg:last-child]:duration-200 hover:[&>svg:last-child]:translate-x-0.5",
        ghost:
          "rounded-full text-foreground/70 hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-foreground/20",
      },
      size: {
        sm: "h-9 px-3.5 text-[13px]",
        md: "h-10 px-4 text-[14px]",
        lg: "h-11 px-5 text-[14.5px]",
        xl: "h-12 px-6 text-[15px] font-semibold",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "ink",
      size: "md",
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

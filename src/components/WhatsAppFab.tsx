"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { contactLinks } from "@/lib/contact-links";
import { cn } from "@/lib/utils";

/**
 * WhatsAppFab — Floating Action Button persistente para abrir un chat
 * directo de WhatsApp con el prefill de `lib/contact-links`.
 *
 * Decisiones:
 *   · **Brand-aligned, no WhatsApp-verde**. Usamos ink (fondo
 *     `--foreground`, texto `--background`) + dot lima para señalizar
 *     "vivo / disponible". El verde nativo de WhatsApp choca con
 *     la paleta off-white/lima del site y baja el feel editorial al
 *     de un widget comercial genérico. El icono SVG ya transmite la
 *     marca WhatsApp sin necesidad del color.
 *
 *   · **Pill que adapta al viewport**:
 *     - mobile: circle compacto (solo icon + lima dot). Maximiza el
 *       área tap-friendly (44×44 + padding) sin invadir contenido.
 *     - sm+: pill con icon + "WhatsApp" + dot. El texto desambigüa
 *       (no es un floating "?" genérico) y casa con los buttons
 *       editoriales del header/CTAs.
 *
 *   · **Visibilidad inteligente** — el FAB NO debe aparecer cuando
 *     sería redundante o intrusivo:
 *       1. `#contacto` en viewport → ya están las 3 formas de
 *          contacto + el form. Mostrar el FAB ahí compite con la
 *          jerarquía propia de la sección. Hide.
 *       2. Body scroll-lockeado → significa que un Dialog o el
 *          mobile drawer está abierto. El FAB quedaría
 *          flotando sobre el overlay (Dialog está en z-[100]; lo
 *          tapa visualmente pero el botón seguiría en el tab-order).
 *          Hide para limpiar focus + DOM.
 *
 *   · **Mobile drawer** comparte el mismo body-lock que el Dialog
 *     → el segundo check cubre ambos casos sin un check extra.
 *
 *   · **z-40** mismo plane que el header sticky. Top y bottom
 *     nunca se overlappean. Dialog (z-[100]) y drawer (z-50)
 *     quedan por encima.
 *
 * A11y:
 *   · `aria-label` describe la acción para SR (el icono solo no es
 *     accesible aunque sea reconocible visualmente).
 *   · `target="_blank"` + `rel="noopener noreferrer"` por seguridad
 *     (open in nueva tab, no `window.opener` leak).
 *   · `focus-visible:ring-[var(--accent)]` consistente con el
 *     resto de focus states del site.
 *   · `useReducedMotion()` desactiva las animaciones de entrada/
 *     salida para usuarios con esa pref.
 */
export function WhatsAppFab() {
  const prefersReduced = useReducedMotion();
  const [contactInView, setContactInView] = useState(false);
  const [bodyLocked, setBodyLocked] = useState(false);

  /* ── Hide cuando #contacto entra al viewport ────────────────────
   * `rootMargin: 0px 0px -100px 0px` → consideramos "in view"
   * cuando la sección está ya bien dentro (no apenas asomando).
   * Sin el negativo bottom, el FAB se ocultaba demasiado pronto
   * (cuando contacto recién aparecía 1px abajo). */
  useEffect(() => {
    const contact = document.getElementById("contacto");
    if (!contact) return;

    const observer = new IntersectionObserver(
      ([entry]) => setContactInView(entry?.isIntersecting ?? false),
      { rootMargin: "0px 0px -100px 0px", threshold: 0.05 },
    );
    observer.observe(contact);
    return () => observer.disconnect();
  }, []);

  /* ── Hide cuando el body está scroll-lockeado ────────────────── *
   *
   * Tanto el Dialog como el mobile drawer setean
   * `document.body.style.overflow = "hidden"` para evitar scroll
   * de fondo durante overlays. Lo usamos como señal universal
   * de "hay un overlay abierto, no hacer nada que compita".
   *
   * `MutationObserver` sobre el style attribute → callback cuando
   * cambia (sin polling). Snapshot inicial por si el FAB monta
   * después de que ya esté lockeado (caso raro, pero deterministic). */
  useEffect(() => {
    const check = () => {
      setBodyLocked(document.body.style.overflow === "hidden");
    };
    check();

    const observer = new MutationObserver(check);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });
    return () => observer.disconnect();
  }, []);

  const visible = !contactInView && !bodyLocked;

  /* ── Animation tokens ────────────────────────────────────────── */
  const enter = prefersReduced
    ? { opacity: 1, scale: 1, y: 0 }
    : { opacity: 1, scale: 1, y: 0 };
  const initialState = prefersReduced
    ? { opacity: 0, scale: 1, y: 0 }
    : { opacity: 0, scale: 0.85, y: 12 };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="wa-fab"
          initial={initialState}
          animate={enter}
          exit={initialState}
          transition={{
            duration: prefersReduced ? 0.15 : 0.28,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="fixed bottom-5 right-5 z-40 sm:bottom-7 sm:right-7"
          style={{
            /* Safe area iOS — agregamos el inset sólo si existe
             * (en non-iOS env() resuelve a 0, no rompe nada). */
            bottom: "max(1.25rem, calc(env(safe-area-inset-bottom) + 0.5rem))",
            right: "max(1.25rem, calc(env(safe-area-inset-right) + 0.5rem))",
          }}
        >
          <Link
            href={contactLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Hablar conmigo por WhatsApp"
            className={cn(
              /* Base — pill ink con sombra de elevación. La sombra
               * usa tints del foreground (no negro puro) para no
               * contrastar tan fuerte sobre el off-white. */
              "group/fab relative inline-flex items-center gap-2.5",
              "rounded-full bg-foreground text-background",
              "px-3 py-3 sm:px-4 sm:py-3",
              "shadow-[0_10px_28px_-10px_rgba(10,11,15,0.45),0_2px_6px_-2px_rgba(10,11,15,0.18)]",
              "transition-[transform,box-shadow,background-color] duration-200 ease-out",
              /* Hover — leve scale + sombra más profunda. No tan
               * grande que invada el viewport. */
              "hover:scale-[1.03] hover:bg-foreground-strong",
              "hover:shadow-[0_16px_36px_-10px_rgba(10,11,15,0.55),0_4px_10px_-2px_rgba(10,11,15,0.22)]",
              /* Focus — ring lima accent, consistente con el resto
               * de los focus states del site. */
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "active:scale-[0.98]",
            )}
          >
            <WhatsAppIcon
              aria-hidden
              className="size-[20px] sm:size-[18px]"
            />

            {/* Label — sólo desktop/tablet. En mobile se ahorra
             * espacio y queda como circle puro. */}
            <span className="hidden text-[14px] font-medium leading-none sm:inline">
              WhatsApp
            </span>

            {/* Lima dot — top-right corner como notification badge.
             * Ring del color de la página para que se "separe" del
             * fondo ink del botón. Pulse sutil en hover para sumar
             * micro-interacción sin distraer. */}
            <span
              aria-hidden
              className={cn(
                "absolute -right-0.5 -top-0.5 size-2.5 rounded-full",
                "bg-[var(--accent)] ring-2 ring-background",
                "transition-transform duration-300 ease-out",
                "group-hover/fab:scale-[1.35]",
              )}
            />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type DialogProps = {
  /** Si el dialog está abierto. Controlled — el padre maneja estado. */
  open: boolean;
  /** Callback cuando el dialog quiere cerrarse (ESC, backdrop, botón X). */
  onClose: () => void;
  /**
   * Label accesible del dialog. Idealmente apunta al `id` del título
   * dentro del contenido (`aria-labelledby`). Si no, se usa como
   * `aria-label` textual.
   */
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  /** Clase aplicada al panel del dialog. */
  className?: string;
  children: ReactNode;
};

/**
 * Dialog primitivo del portafolio.
 *
 * Hecho a mano sobre `motion/react` + Portal en lugar de Radix
 * para mantener el bundle delgado y tener control total del
 * styling editorial (radius, shadow, hairlines coinciden con el
 * resto del sistema).
 *
 * Lo que cubre por accesibilidad:
 *
 *   · `role="dialog"` + `aria-modal="true"` → screen readers
 *     entienden que el resto de la página no es relevante mientras
 *     está abierto.
 *   · Focus al primer elemento focusable al abrir (típicamente el
 *     botón de cerrar, que ya está al inicio del flujo de lectura).
 *   · Restauración de foco al elemento que disparó la apertura al
 *     cerrar — preserva el contexto de navegación.
 *   · Trap de foco con sentinels: tabbing fuera del dialog rebota
 *     al primer/último elemento focusable interno. Implementación
 *     simple — dos divs `tabIndex={0}` invisibles que, cuando reciben
 *     foco, lo mueven al opuesto. Suficiente para un dialog editorial
 *     sin formularios complejos.
 *   · ESC cierra. Click en backdrop cierra. Botón X siempre presente.
 *   · `body { overflow: hidden }` mientras está abierto — sin scroll
 *     fantasma del fondo. Preservamos el padding-right para evitar
 *     el "jump" cuando desaparece la scrollbar.
 *
 * Animación:
 *   · Backdrop: fade simple, 250ms.
 *   · Panel: fade + scale 0.96→1 + y 12→0, 350ms con easing out-expo.
 *     Sutil. No es una entrada llamativa, es contextual — el dialog
 *     "se asienta" en lugar de aparecer abrupto.
 *   · `prefers-reduced-motion` → todo se vuelve instantáneo.
 *
 * Render: Portal a `document.body` para escapar de cualquier stacking
 * context que tenga la sección (z-index, transforms del padre). El
 * Portal sólo se monta del lado cliente — chequeo de `typeof window`
 * para evitar errores en SSR.
 */
export function Dialog({
  open,
  onClose,
  label,
  labelledBy,
  describedBy,
  className,
  children,
}: DialogProps) {
  const prefersReducedMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const fallbackTitleId = useId();

  /* ── Esc + body scroll lock + focus restore ─────────────────── */
  useEffect(() => {
    if (!open) return;

    /* Guardamos quién tenía el foco antes de abrir para devolverlo
     * al cerrar. Sin esto, el foco se pierde y el teclado queda
     * "huérfano" después de la interacción. */
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    /* Compensamos el ancho de la scrollbar para que el body no
     * "salte" 15px a la derecha cuando ocultamos el overflow. */
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;

      /* Devolvemos foco con un microtask para que React termine
       * de desmontar el dialog antes de mover el caret — evita
       * que el browser intente focusear un nodo recién removido. */
      queueMicrotask(() => {
        previousFocusRef.current?.focus?.();
      });
    };
  }, [open, onClose]);

  /* ── Focus inicial cuando abre ──────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    /* Esperamos un frame para que el panel termine de animar y el
     * primer elemento focusable exista en el DOM. */
    const id = requestAnimationFrame(() => {
      const first = getFirstFocusable(panelRef.current);
      first?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  const handleBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  /* Sentinels — Tab fuera del dialog → rebote al opuesto. */
  const handleSentinelStart = useCallback(() => {
    const last = getLastFocusable(panelRef.current);
    last?.focus({ preventScroll: true });
  }, []);

  const handleSentinelEnd = useCallback(() => {
    const first = getFirstFocusable(panelRef.current);
    first?.focus({ preventScroll: true });
  }, []);

  /* Portal sólo en el cliente. */
  if (typeof window === "undefined") return null;

  const motionTimings = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          aria-hidden={false}
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto overscroll-contain p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }}
          onMouseDown={handleBackdrop}
        >
          {/* Backdrop — separado del wrapper para que el blur viva
           *  acá y no afecte al panel. */}
          <div
            aria-hidden
            className="fixed inset-0 -z-10 bg-foreground/55 backdrop-blur-md"
          />

          {/* Sentinel start */}
          <div
            tabIndex={0}
            onFocus={handleSentinelStart}
            aria-hidden
            style={{ position: "fixed", width: 1, height: 1, opacity: 0 }}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={labelledBy ? undefined : label}
            aria-labelledby={labelledBy ?? (label ? undefined : fallbackTitleId)}
            aria-describedby={describedBy}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={motionTimings}
            className={cn(
              "relative my-auto w-full max-w-[1080px] overflow-hidden rounded-2xl border border-border bg-background shadow-[0_40px_80px_-20px_rgba(10,11,15,0.35),0_8px_24px_-8px_rgba(10,11,15,0.15)]",
              className,
            )}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>

          {/* Sentinel end */}
          <div
            tabIndex={0}
            onFocus={handleSentinelEnd}
            aria-hidden
            style={{ position: "fixed", width: 1, height: 1, opacity: 0 }}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ─────────────────────────────────────────────────────────────────
 * DialogCloseButton — botón X estándar para el corner del dialog.
 *
 * Sale como pieza separada porque a veces lo necesitamos en posiciones
 * distintas al default top-right (ej: overlay sobre una imagen hero).
 * ──────────────────────────────────────────────────────────────── */
export function DialogCloseButton({
  onClose,
  className,
  label = "Cerrar",
}: {
  onClose: () => void;
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={label}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full border border-border bg-background/90 text-foreground/80 shadow-sm backdrop-blur transition-colors hover:border-foreground/40 hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <X aria-hidden className="size-4" />
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * Helpers — descubrimiento de elementos focusables.
 *
 * Lista de selectores tomada de los patrones estándar (W3C ARIA
 * Authoring Practices). Filtramos por `tabIndex >= 0` y por nodos
 * efectivamente visibles (offsetParent !== null) para evitar
 * enfocar elementos con `display: none` u ocultos.
 * ──────────────────────────────────────────────────────────────── */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

function getFirstFocusable(root: HTMLElement | null): HTMLElement | null {
  if (!root) return null;
  const nodes = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return nodes.find(isVisible) ?? null;
}

function getLastFocusable(root: HTMLElement | null): HTMLElement | null {
  if (!root) return null;
  const nodes = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i];
    if (n && isVisible(n)) return n;
  }
  return null;
}

function isVisible(el: HTMLElement): boolean {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

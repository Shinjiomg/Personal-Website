"use client";

import { useEffect, useRef, useState } from "react";

import { sectionIds } from "@/data/navigation";

/**
 * useOnepageNavigation
 * ════════════════════
 *
 * Maneja toda la lógica onepage del site con UN solo punto de entrada
 * y delegación global de clicks. Pensado para vivir UNA vez (en `<Nav>`)
 * y cubrir a todo el árbol — no requiere wrappers ni handlers en cada
 * link que apunte a un anchor.
 *
 *  1. **Scroll-spy** (IntersectionObserver) — devuelve el `id` de la
 *     sección actualmente "leída". Lógica de ganador: la sección con
 *     `top` absoluto más cerca de 0 dentro del área activa gana
 *     (la sección "más anclada arriba"). Más estable que ratio-based
 *     cuando dos secciones intersecan a la vez.
 *
 *  2. **Delegación global de clicks** (document-level, capture phase):
 *     intercepta TODOS los clicks a `<a href="#...">` o `<a href="/#...">`
 *     del árbol — sin importar si vienen del Header, Footer, Hero o
 *     cualquier sección. En cada uno:
 *       - hace `scrollIntoView({ behavior: "smooth" })`
 *       - re-escribe la URL SIN el hash (`history.replaceState`),
 *         cumpliendo el requisito "que no salga el # en la URL"
 *       - actualiza `activeId` al instante (sin esperar al observer)
 *
 *     Capture phase + preventDefault → Next.js `<Link>` no ejecuta su
 *     navegación interna; React `onClick` en el bubble sigue corriendo
 *     normalmente (ej. cerrar el drawer mobile), porque preventDefault
 *     no detiene a otros listeners, sólo el default del browser.
 *
 *  3. **Cleanup inicial** — si la página carga con `#fragment` (alguien
 *     compartió un link viejo o pegó un anchor manual), hace scroll y
 *     limpia la URL en el primer frame disponible.
 *
 *  4. **prefers-reduced-motion** — respeta el pref del SO: con motion
 *     reducida hacemos jump directo, sin smooth.
 *
 * `scroll-padding-top: 6rem` ya vive en globals.css → `scrollIntoView`
 * respeta el offset del header sticky sin matemática manual acá.
 */
export function useOnepageNavigation() {
  const [activeId, setActiveId] = useState<string | null>(null);

  /**
   * Cuando el usuario hace click programáticamente, durante un breve
   * lapso silenciamos al IntersectionObserver para que no pelee con
   * `activeId` (las secciones intermedias se ven brevemente y
   * cambiarían el activo a mitad de animación).
   */
  const clickLockUntilRef = useRef<number>(0);

  /* ── Initial hash cleanup ───────────────────────────────────── */
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    /* requestAnimationFrame → asegura que el DOM ya pintó y los IDs
     * de las secciones existen antes de intentar el scroll. */
    requestAnimationFrame(() => {
      const target = document.getElementById(hash);
      if (target) {
        target.scrollIntoView({ behavior: "auto", block: "start" });
        setActiveId(hash);
      }
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    });
  }, []);

  /* ── Scroll-spy ─────────────────────────────────────────────── *
   *
   * Implementación con **registro persistente** de secciones
   * actualmente intersectando.
   *
   * Bug que se corrige:
   *   El IntersectionObserver SOLO dispara callbacks cuando una
   *   sección CAMBIA su estado de intersección o cruza un threshold.
   *   Si la lógica del ganador sólo mira al subset de `entries`
   *   del callback actual, hay un agujero:
   *
   *     1. Sobre-mí intersecta; activeId = "sobre-mi" ✓
   *     2. Experiencia entra al band → entries=[Exp@true].
   *        Sobre-mí también intersecta pero NO está en entries
   *        porque su estado no cambió → tendríamos visible=[Exp]
   *        OK acá, gana Experience. Pero — Sobre-mí gana por |top|
   *        si su entry también vino en este callback.
   *     3. Sobre-mí sale del band → entries=[Sobre@false].
   *        visible=[] → return → activeId queda en "sobre-mi". 😱
   *     4. Experiencia ya no cruza más thresholds (está en su pico
   *        de visibilidad), nunca vuelve a triggear callback.
   *        activeId stays "sobre-mi" mientras leemos toda Exp.
   *
   * Fix:
   *   Mantenemos un `Set` con los IDs actualmente intersectando.
   *   En cada callback updateamos el Set con todos los entries
   *   (add si intersecta, remove si no). Luego recalculamos el
   *   ganador llamando `getBoundingClientRect()` para cada miembro
   *   del Set — así el `top` siempre es fresh (no el cacheado en
   *   `entry.boundingClientRect` que puede ser stale si el callback
   *   no se disparó para esa sección recientemente).
   *
   *   Bonus: si después de updatear el Set queda vacío (estamos
   *   entre dos secciones, por ej. en el footer), NO limpiamos
   *   activeId — el último visto queda como activo para no
   *   apagar el indicator y volver a prenderlo al scroll arriba.
   *
   * rootMargin:
   *   -88px top → descuenta header sticky + breathing room.
   *   -40% bottom → activeId reacciona cuando la sección entra al
   *     60% superior del viewport. Antes era -50%, lo bajamos para
   *     que Contact (sección final) no caiga en el borde exacto
   *     del bottom margin cuando el scroll llega a su tope máximo
   *     (con `-50%` exacto, Contact.top quedaba == rootBottom y
   *     NO intersectaba — clásico off-by-one de IO).
   *
   * thresholds:
   *   21 valores (0, 0.05, ..., 1) → re-dispara seguido durante
   *   el scroll dentro de secciones largas. Pequeño costo de
   *   callbacks extra a cambio de tracking responsivo. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("IntersectionObserver" in window)) return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    /* Registro persistente de qué secciones intersectan AHORA.
     * Mutamos fuera del state porque no triggea re-render
     * (solo el setActiveId final lo hace). */
    const intersectingIds = new Set<string>();

    const pickWinner = (): string | null => {
      let winnerId: string | null = null;
      let winnerScore = Number.POSITIVE_INFINITY;

      intersectingIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        /* Score = distancia del top de la sección al "anchor line"
         * del lector (88px desde el top del viewport, justo debajo
         * del header sticky). El más cercano a esa línea gana.
         * Esto da continuidad natural: mientras scrolleamos, gana
         * la sección "más anclada arriba" del área de lectura. */
        const score = Math.abs(rect.top - 88);
        if (score < winnerScore) {
          winnerScore = score;
          winnerId = id;
        }
      });

      return winnerId;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < clickLockUntilRef.current) return;

        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            intersectingIds.add(id);
          } else {
            intersectingIds.delete(id);
          }
        }

        if (intersectingIds.size === 0) return;

        const next = pickWinner();
        if (next) setActiveId(next);
      },
      {
        rootMargin: "-88px 0px -40% 0px",
        threshold: Array.from({ length: 21 }, (_, i) => i / 20),
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ── Global click delegation ────────────────────────────────── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      /* Modificadores de "abrir en nueva pestaña" / middle-click /
       * etc. → respetar el comportamiento default. */
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const target = e.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;

      /* `target="_blank"` u otro target explícito → no es un onepage
       * scroll, dejá pasar. */
      if (link.target && link.target !== "" && link.target !== "_self") return;

      const href = link.getAttribute("href");
      if (!href) return;
      if (!href.startsWith("#") && !href.startsWith("/#")) return;

      const id = href.replace(/^\/?#/, "");
      if (!id) return;

      const section = document.getElementById(id);
      if (!section) return;

      e.preventDefault();

      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      section.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "start",
      });

      /* Lock al observer durante el viaje. 800ms cubre el smooth
       * scroll típico para distancias largas. */
      clickLockUntilRef.current = Date.now() + 800;
      setActiveId(id);

      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    };

    /* Capture phase para correr ANTES del handler interno de Next.js
     * `<Link>` y poder cancelar su navegación con preventDefault. */
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  return { activeId };
}

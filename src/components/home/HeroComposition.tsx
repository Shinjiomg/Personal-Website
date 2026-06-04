import { BrowserMockup } from "./BrowserMockup";
import { CodeMockup } from "./CodeMockup";
import { WebsiteSkeleton } from "./WebsiteSkeleton";

/**
 * Composición visual del Hero — dos mockups apilados:
 *
 *   ┌─ CodeMockup (dark, asoma detrás) ──┐
 *   │ ●●●  Hero.tsx                       │
 *   │  1  import { Hero } from "..."      │
 *   │  2                                  │
 *   │  3  export default function Page()  │
 *  ┌┴────────────────────────────────────────┐
 *  │ ●●●  app.cliente.dev                    │
 *  │ ──────────────────────────────────────  │   ← BrowserMockup
 *  │ [WebsiteSkeleton landscape]             │     (front, anchor right)
 *  │                                         │
 *  └─────────────────────────────────────────┘
 *
 * El code editor va POR DETRÁS (z=0) con offset top-left y rotación
 * leve, asomando ~12% del browser por arriba-izquierda. El browser
 * va en primer plano (z=10) anclado a la derecha del contenedor
 * para dejar el espacio del peek. El conjunto flota suavemente
 * (`float-soft`) — el movimiento aplica a los dos a la vez para
 * que el browser y el code editor se sientan parte de una sola
 * pieza, no dos elementos independientes derivando.
 *
 * Diseño narrativo:
 *   · Browser = "construyo product UIs"
 *   · CodeMockup = "lo hago escribiendo el código"
 *   · Halo lima = identidad de marca, lift del fondo
 *
 * El code editor es decorativo — aria-hidden para que ningún reader
 * intente leer el snippet línea por línea. La accesibilidad del
 * Hero descansa en el H1 + subhead + CTAs, no en el mockup.
 */
export function HeroComposition() {
  return (
    <div className="relative isolate mx-auto w-full max-w-[480px] lg:max-w-none">
      {/* Halo lima atenuado por detrás de todo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 translate-y-6 scale-105 rounded-[40px]"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 50%, color-mix(in oklch, var(--accent) 18%, transparent) 0%, transparent 70%)",
        }}
      />

      {/* Wrapper de animación común — los dos mockups flotan juntos */}
      <div className="relative motion-safe:animate-[float-soft_7s_ease-in-out_infinite]">
        {/* CODE EDITOR — atrás, top-left, levemente rotado.
            `pointer-events-none` para no robar clicks de algún
            futuro link superpuesto. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-[-3%] top-[-7%] z-0 w-[62%] -rotate-[3deg]"
        >
          <CodeMockup />
        </div>

        {/* BROWSER — primer plano, anclado a la derecha para
            dejar espacio al peek del code editor.  El skeleton
            ya viene en proporción landscape (~16:10) desde el
            propio WebsiteSkeleton. */}
        <div className="relative z-10 ml-auto w-[92%]">
          <BrowserMockup url="app.cliente.dev">
            <WebsiteSkeleton />
          </BrowserMockup>
        </div>
      </div>
    </div>
  );
}

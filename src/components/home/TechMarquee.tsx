import type { IconType } from "react-icons";

/**
 * Item del marquee — logo SVG + label. Mantener el tipo acá (en
 * lugar de en `data/`) porque sólo lo consume este componente y
 * no se reutiliza en otra parte del site.
 */
export type MarqueeItem = {
  readonly label: string;
  readonly Icon: IconType;
};

/**
 * Marquee infinito con las tecnologías del stack.
 *
 * Estética editorial: logo SVG + nombre en Fraunces italic
 * separados por dots lima. Los logos vienen de `react-icons/si`
 * (Simple Icons, CC0) — estándar de la industria para listings
 * de stack tecnológico, mismo trato que un "trusted by" con
 * logos de proveedores en una landing de consultoría.
 *
 * ── Por qué N=8 copias y no 2 ──
 * El loop usa `translateX(0) → translateX(-50%)` sobre el
 * container. Para que el wrap sea seamless el contenido tiene
 * que llenar al menos 2× el viewport — si una sola copia de la
 * fila es más angosta que el viewport (caso real con sólo 5
 * items), al llegar a -50% queda espacio en blanco a la derecha
 * antes de resetear, y se ve un "salto".
 *
 * 5 items × ~150px ≈ 750px por fila. 8 filas ≈ 6000px totales,
 * -50% ≈ 3000px de traslación efectiva — cubre cómodamente
 * desde 768px (tablet) hasta 2560px (ultrawide) sin gap visible.
 *
 * ── Velocidad ──
 * 60s para un ciclo completo. A esa velocidad el ojo lee cada
 * tech sin que se sienta apresurado pero tampoco aburrido; es
 * el tempo de un "trusted by" premium (linear.app, vercel.com,
 * etc., todos ~50-70s).
 *
 * El fade-out lateral usa `mask-image` para que el contenido
 * siga siendo seleccionable y no obstruya clicks (regla que
 * paga futuro si el marquee gana interactividad).
 */
export function TechMarquee({
  items,
}: {
  items: readonly MarqueeItem[];
}) {
  /** Cantidad de copias renderizadas. Ver doc-comment arriba. */
  const COPIES = 8;

  return (
    <div
      className="relative overflow-hidden py-7"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
    >
      <div className="flex w-max gap-12 motion-safe:animate-[marquee_60s_linear_infinite]">
        {Array.from({ length: COPIES }, (_, i) => (
          <MarqueeRow
            key={i}
            items={items}
            // Sólo la primera copia se lee a screen-readers; el resto
            // es ruido para tecnología asistiva.
            ariaHidden={i > 0}
          />
        ))}
      </div>
    </div>
  );
}

function MarqueeRow({
  items,
  ariaHidden = false,
}: {
  items: readonly MarqueeItem[];
  ariaHidden?: boolean;
}) {
  return (
    <ul
      role="list"
      aria-hidden={ariaHidden || undefined}
      className="flex shrink-0 items-center gap-12"
    >
      {items.map(({ label, Icon }) => (
        <li key={label} className="flex items-center gap-3">
          <Icon
            aria-hidden
            className="size-[20px] shrink-0 text-foreground/65 sm:size-[22px]"
          />
          <span className="font-display text-[22px] font-medium italic tracking-[-0.018em] text-foreground/75 sm:text-[26px]">
            {label}
          </span>
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-[var(--accent)]"
          />
        </li>
      ))}
    </ul>
  );
}

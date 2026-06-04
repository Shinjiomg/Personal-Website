import { cn } from "@/lib/utils";

type MarkerHighlightProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Inline text con un highlight estilo marcador lima detrás.
 *
 * `box-decoration-clone` hace que cuando el fragmento envuelto se
 * parte en varias líneas (típico en headings mobile largos), el
 * marcador se redibuje en cada línea — no como una barra única al
 * ancho del bounding box, que se ve roto.
 *
 * El fondo es un gradient sólido de 0.32em de altura posicionado
 * en el 92% vertical de la línea, simulando la pasada baja de un
 * resaltador físico que toca apenas la baseline.
 */
export function MarkerHighlight({ children, className }: MarkerHighlightProps) {
  return (
    <span
      className={cn(
        "inline box-decoration-clone",
        "[--marker:color-mix(in_oklch,var(--accent)_70%,transparent)]",
        "bg-[linear-gradient(var(--marker),var(--marker))] bg-no-repeat",
        "[background-size:100%_0.32em] [background-position:0_92%]",
        "px-[0.06em]",
        className,
      )}
    >
      {children}
    </span>
  );
}

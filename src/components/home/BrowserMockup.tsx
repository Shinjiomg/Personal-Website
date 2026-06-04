import { cn } from "@/lib/utils";

type BrowserMockupProps = {
  /** URL mostrada en la barra de dirección — fake, sólo decorativa. */
  url?: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * macOS-style browser frame, 100% CSS — sin screenshots.
 *
 * Reemplazado a propósito por un mockup en lugar de un screenshot:
 * cuando cambiamos tokens del sistema (accent, border, surface) el
 * preview se actualiza solo sin re-exportar imágenes.
 *
 * Los hex de los traffic-lights son los oficiales de macOS — son
 * "spec externa" por convención visual reconocible, así que se
 * mantienen literales (no tokens). Mismo trato que el favicon
 * theme_color del manifest (PLAYBOOK §14).
 */
export function BrowserMockup({
  url = "app.cliente.dev",
  className,
  children,
}: BrowserMockupProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_30px_60px_-30px_rgba(10,11,15,0.18),0_8px_24px_-8px_rgba(10,11,15,0.10)]",
        className,
      )}
    >
      <div className="relative flex items-center gap-2 border-b border-border bg-surface-elevated px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-full bg-[#FF5F57]" />
          <span aria-hidden className="size-2.5 rounded-full bg-[#FEBC2E]" />
          <span aria-hidden className="size-2.5 rounded-full bg-[#28C840]" />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground sm:flex"
        >
          <span className="size-1.5 rounded-full bg-[var(--accent)]" />
          {url}
        </div>
      </div>

      <div className="relative">{children}</div>
    </div>
  );
}

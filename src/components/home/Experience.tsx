"use client";

import { AnimatePresence, motion } from "motion/react";
import { FileText } from "lucide-react";
import Link from "next/link";
import { useState, type KeyboardEvent } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { MarkerHighlight } from "@/components/ui/marker-highlight";
import {
  educationCertifications,
  educationDegrees,
  type EducationEntry,
  type EducationFootnote,
} from "@/data/education";
import { experience, type ExperienceJob } from "@/data/experience";
import { cn } from "@/lib/utils";

/**
 * Sección "Experiencia" — magazine spread interactivo con
 * patrón master-detail (tab list).
 *
 *   ┌─ Header (eyebrow + manifesto) ─────────────────────────────┐
 *   │                                                              │
 *   ├─ DETAIL panel (selected job) ──┬─ SIDEBAR (selector) ──────┤
 *   │ 01 · AHORA   FEB 2026—PRES     │ ──── TRAYECTORIA            │
 *   │                                 │                              │
 *   │ Trillium                        │ ● 01  AHORA · FEB 26—PRES   │
 *   │ Digital Services                │   Trillium…                  │
 *   │                                 │ ───                          │
 *   │ FRONTEND DEVELOPER              │ ○ 02  ENE 25—MAR 26         │
 *   │ REACT · MICRO · APIS            │   DataScoring…               │
 *   │                                 │ … 03, 04, 05                 │
 *   │ Microfrontends con React…       │                              │
 *   │                                 │                              │
 *   │ ──── TIMELINE                   │                              │
 *   │ [Gantt-style bars 2022→2026]   │                              │
 *   └─────────────────────────────────┴──────────────────────────────┘
 *
 * Estado:
 *   `selectedIndex` (useState) — qué job está activo. Default 0 = el
 *   actual (Trillium). El click en el sidebar O en una barra de la
 *   timeline actualiza la selección. AnimatePresence con `mode="wait"`
 *   anima la transición del detail panel; la timeline queda fuera para
 *   que solo cambien las barras de color (no se re-renderice todo).
 *
 * A11y:
 *   `role="tablist"` en el sidebar, `role="tab"` con `aria-selected`
 *   en cada entry, `role="tabpanel"` en el detail. Keyboard nav con
 *   arrow keys (up/down/left/right) cicla entre tabs.
 *
 * Por qué timeline y no otro mockup:
 *   · Es data real ya en la fuente (fechas), no decoración inventada.
 *   · Agrega una dimensión nueva (cronología + solapes) — el sidebar
 *     ya cuenta el qué/dónde, la timeline cuenta el cuándo.
 *   · Doble función: visualización + selector secundario (gantt-style).
 *   · Diferente de los mockups de About (browser/tablet/mobile) — no
 *     repite el truco.
 */
export function Experience() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = experience[selectedIndex];
  if (!selected) return null;

  return (
    <section id="experiencia" className="relative isolate scroll-mt-24">
      <div className="container-site py-10 sm:py-14 lg:py-16">
        <Header />

        <div className="mt-12 grid grid-cols-1 gap-y-14 sm:mt-16 md:grid-cols-[3fr_2fr] md:items-start md:gap-x-12 md:gap-y-0 lg:mt-20 lg:gap-x-16">
          <FeaturedPanel
            job={selected}
            index={selectedIndex + 1}
            isCurrent={selectedIndex === 0}
            jobs={experience}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />

          <Sidebar
            jobs={experience}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />
        </div>

        {/* Formación — strip compacta que cierra el bloque "trayectoria".
         *  Vive dentro de la sección Experiencia (no como sección
         *  propia) porque narrativamente extiende la misma idea:
         *  primero el trabajo, después el cartón que respalda. */}
        <EducationStrip />

        {/* Resume CTA — cierre de la sección con la acción de mayor
         *  fricción reducida para reclutadores: bajar el PDF completo
         *  sin pasar por el form. El CTA va DESPUÉS de formación
         *  intencionalmente — quien llegó hasta acá ya leyó toda la
         *  trayectoria y formación; este botón le da el next step
         *  natural ("tengo todo lo que necesito ver, dame el PDF"). */}
        <ResumeCTA />
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════
 * Header — eyebrow + manifesto editorial
 * ════════════════════════════════════════════════════════════════ */
function Header() {
  return (
    <div className="mx-auto max-w-2xl text-center md:mx-0 md:max-w-3xl md:text-left">
      <RevealUp>
        <Eyebrow>Experiencia</Eyebrow>
      </RevealUp>

      <RevealUp delay={0.05}>
        <h2 className="mt-5 font-display text-[clamp(1.875rem,5vw,3.5rem)] leading-[1.06] tracking-[-0.028em] text-foreground-strong text-balance">
          De freelance a{" "}
          <MarkerHighlight>frontend lead</MarkerHighlight> — sin bajar el
          standard.
        </h2>
      </RevealUp>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * RevealUp — fade-up al entrar al viewport (helper local).
 * ──────────────────────────────────────────────────────────────── */
function RevealUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═════════════════════════════════════════════════════════════════
 * FeaturedPanel — detail panel del job seleccionado + timeline al pie
 * ════════════════════════════════════════════════════════════════ */
function FeaturedPanel({
  job,
  index,
  isCurrent,
  jobs,
  selectedIndex,
  onSelect,
}: {
  job: ExperienceJob;
  index: number;
  isCurrent: boolean;
  jobs: readonly ExperienceJob[];
  selectedIndex: number;
  onSelect: (i: number) => void;
}) {
  const indexLabel = String(index).padStart(2, "0");

  return (
    <div
      id="experiencia-panel"
      role="tabpanel"
      aria-labelledby={`experiencia-tab-${selectedIndex}`}
    >
      <RevealUp>
        {/* Detail content — anim por selectedIndex via AnimatePresence */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={selectedIndex}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Top meta */}
            <div className="flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-subtle-foreground">
              <span className="flex items-center gap-3">
                <span
                  aria-hidden
                  className={cn(
                    "size-1.5 rounded-full bg-[var(--accent)]",
                    isCurrent && "motion-safe:animate-pulse",
                  )}
                />
                <span className="flex items-baseline gap-2.5">
                  <span className="font-bold text-foreground-strong">
                    {indexLabel}
                  </span>
                  {isCurrent && (
                    <>
                      <span aria-hidden className="h-px w-3 bg-foreground/25" />
                      <span className="font-semibold text-foreground">
                        Ahora
                      </span>
                    </>
                  )}
                </span>
              </span>
              <span className="tabular-nums">
                {job.start} — {job.end}
              </span>
            </div>

            {/* Empresa XXL */}
            <h3 className="mt-7 font-display text-[clamp(2.5rem,8vw,5.5rem)] font-bold leading-[0.92] tracking-[-0.035em] text-foreground-strong text-balance">
              {job.company}
            </h3>

            {/* Rol */}
            <p className="mt-5 font-mono text-[12.5px] font-semibold uppercase tracking-[0.2em] text-foreground">
              {job.role}
            </p>

            {/* Stack chips inline */}
            <ul className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              {job.stack.map((tech, i) => (
                <li key={tech} className="flex items-center gap-3">
                  {i > 0 && (
                    <span
                      aria-hidden
                      className="size-0.5 rounded-full bg-foreground/30"
                    />
                  )}
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground-strong">
                    {tech}
                  </span>
                </li>
              ))}
            </ul>

            {/* Summary */}
            <p className="mt-7 max-w-prose text-[15px] leading-[1.7] text-muted-foreground sm:text-[15.5px]">
              {job.summary}
            </p>

            {/* Destacados — metric strip per job. Pulls headline
             * keywords/numbers que el summary expande. Vive dentro
             * del AnimatePresence para transicionar con el resto. */}
            {job.highlights && job.highlights.length > 0 && (
              <HighlightsStrip highlights={job.highlights} />
            )}
          </motion.article>
        </AnimatePresence>
      </RevealUp>

      {/* Timeline — fuera del AnimatePresence para que solo cambien
       * las barras de color, no se anime todo el bloque */}
      <RevealUp delay={0.15} className="mt-12 sm:mt-14 lg:mt-16">
        <CareerTimeline
          jobs={jobs}
          selectedIndex={selectedIndex}
          onSelect={onSelect}
        />
      </RevealUp>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * HighlightsStrip — 3-cell metric strip por job.
 *
 * `value` en display semibold (puede ser número "+90%" o keyword
 * corto "Lead"). `label` en mono uppercase pequeño con contexto.
 * Divididos por hairlines verticales (`border-l`) para densidad
 * editorial sin cards.
 *
 * Layout:
 *   · mobile (<sm): **oculto** — en pantallas chicas la pila de 3
 *     destacados verticales repetía info del summary y empujaba el
 *     timeline muy abajo. La señal/ruido no compensaba.
 *   · sm+: 3 cols horizontal con divisor vertical
 * ──────────────────────────────────────────────────────────────── */
function HighlightsStrip({
  highlights,
}: {
  highlights: readonly { value: string; label: string }[];
}) {
  return (
    <div className="mt-10 hidden sm:mt-12 sm:block">
      <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-subtle-foreground">
        <span aria-hidden className="h-px w-6 bg-foreground/25" />
        <span className="font-semibold">Destacados</span>
      </div>

      <ul className="mt-5 grid grid-cols-1 gap-y-5 sm:mt-6 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-0 lg:gap-x-7">
        {highlights.map((h, i) => (
          <li
            key={`${h.value}-${i}`}
            className={cn(
              "min-w-0",
              /* Hairlines: en mobile top entre cells, en sm+ left.
               * Primera cell sin border para no cargar el inicio. */
              "border-t border-foreground/10 pt-5 first:border-t-0 first:pt-0",
              "sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0 sm:first:border-l-0 sm:first:pl-0 lg:pl-5 lg:first:pl-0",
            )}
          >
            <p className="font-display text-[clamp(1.5rem,3.6vw,2.25rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-foreground-strong text-balance">
              {h.value}
            </p>
            <p className="mt-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-subtle-foreground sm:text-[10.5px]">
              {h.label}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
 * Sidebar — lista de jobs como tab list (selector)
 * ════════════════════════════════════════════════════════════════ */
function Sidebar({
  jobs,
  selectedIndex,
  onSelect,
}: {
  jobs: readonly ExperienceJob[];
  selectedIndex: number;
  onSelect: (i: number) => void;
}) {
  const handleKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = jobs.length - 1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      onSelect(i === last ? 0 : i + 1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      onSelect(i === 0 ? last : i - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      onSelect(0);
    } else if (e.key === "End") {
      e.preventDefault();
      onSelect(last);
    }
  };

  return (
    <div className="md:border-l md:border-foreground/10 md:pl-10 lg:pl-14">
      <RevealUp delay={0.1}>
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-subtle-foreground">
          <span aria-hidden className="h-px w-6 bg-foreground/25" />
          <span className="font-semibold">Trayectoria</span>
        </div>
      </RevealUp>

      <ol
        role="tablist"
        aria-orientation="vertical"
        aria-label="Lista de experiencias profesionales"
        className="mt-5 divide-y divide-foreground/10 border-y border-foreground/10"
      >
        {jobs.map((job, i) => (
          <SidebarRow
            key={`${job.company}-${i}`}
            job={job}
            index={i + 1}
            isCurrent={i === 0}
            isSelected={i === selectedIndex}
            staggerIndex={i}
            onSelect={() => onSelect(i)}
            onKeyDown={(e) => handleKey(e, i)}
          />
        ))}
      </ol>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * SidebarRow — tab clickeable. Marca el job actual con badge AHORA
 * y el seleccionado con accent border-left animado (layoutId).
 * ──────────────────────────────────────────────────────────────── */
function SidebarRow({
  job,
  index,
  isCurrent,
  isSelected,
  staggerIndex,
  onSelect,
  onKeyDown,
}: {
  job: ExperienceJob;
  index: number;
  isCurrent: boolean;
  isSelected: boolean;
  staggerIndex: number;
  onSelect: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
}) {
  const indexLabel = String(index).padStart(2, "0");

  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{
        duration: 0.55,
        delay: staggerIndex * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative"
    >
      {/* Accent border-left animado entre selecciones via layoutId */}
      {isSelected && (
        <motion.span
          layoutId="experiencia-active-marker"
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-10 h-full w-[2px] bg-[var(--accent)]"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}

      <button
        type="button"
        role="tab"
        id={`experiencia-tab-${index - 1}`}
        aria-selected={isSelected}
        aria-controls="experiencia-panel"
        tabIndex={isSelected ? 0 : -1}
        onClick={onSelect}
        onKeyDown={onKeyDown}
        className={cn(
          "group/job block w-full cursor-pointer py-5 pl-4 pr-1 text-left transition-colors duration-300 sm:py-6 sm:pl-5",
          "focus:outline-none focus-visible:bg-foreground/[0.02]",
          isSelected ? "bg-foreground/[0.02]" : "hover:bg-foreground/[0.012]",
        )}
      >
        {/* Meta — index izq, AHORA + periodo der */}
        <div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-subtle-foreground sm:text-[10.5px]">
          <span className="flex items-center gap-2.5">
            <span
              aria-hidden
              className={cn(
                "size-1 rounded-full transition-all duration-300",
                isCurrent
                  ? "bg-[var(--accent)]"
                  : isSelected
                    ? "bg-[var(--accent)]"
                    : "bg-foreground/25 group-hover/job:bg-foreground/45",
              )}
            />
            <span
              className={cn(
                "font-bold transition-colors duration-300",
                isSelected
                  ? "text-foreground-strong"
                  : "text-foreground-strong/85",
              )}
            >
              {indexLabel}
            </span>
          </span>
          <span className="flex items-center gap-2 tabular-nums">
            {isCurrent && (
              <>
                <span className="font-semibold text-foreground">Ahora</span>
                <span aria-hidden className="h-px w-2 bg-foreground/25" />
              </>
            )}
            <span>
              {job.start} — {job.end}
            </span>
          </span>
        </div>

        {/* Empresa */}
        <h4
          className={cn(
            "mt-2.5 font-display text-[clamp(1.25rem,2.8vw,1.625rem)] font-bold leading-[1.05] tracking-[-0.02em] text-balance transition-colors duration-300",
            isSelected
              ? "text-foreground-strong"
              : "text-foreground-strong/85 group-hover/job:text-foreground-strong",
          )}
        >
          {job.company}
        </h4>

        {/* Rol */}
        <p className="mt-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em] text-foreground">
          {job.role}
        </p>

        {/* Stack inline, compacto */}
        <p
          className={cn(
            "mt-2 font-mono text-[9.5px] uppercase tracking-[0.22em] transition-colors duration-300",
            isSelected
              ? "text-foreground"
              : "text-subtle-foreground group-hover/job:text-foreground",
          )}
        >
          {job.stack.join(" · ")}
        </p>
      </button>
    </motion.li>
  );
}

/* ═════════════════════════════════════════════════════════════════
 * CareerTimeline — gantt-style chronology, clickeable
 *
 * Cada job es una barra horizontal: left = start, width = duration.
 * El job seleccionado va en lima, otros en gris claro. Hover de los
 * inactivos los aclara y muestra tooltip con company. Las years como
 * tick marks arriba del eje.
 * ════════════════════════════════════════════════════════════════ */
function CareerTimeline({
  jobs,
  selectedIndex,
  onSelect,
}: {
  jobs: readonly ExperienceJob[];
  selectedIndex: number;
  onSelect: (i: number) => void;
}) {
  /* Parse dates a fracciones de año (Feb 2026 → 2026.083).
   * "Presente" usa la fecha actual del browser. */
  const ranges = jobs.map((job) => ({
    start: parseSpanishDate(job.start),
    end: parseSpanishDate(job.end),
  }));

  const minDate = Math.min(...ranges.map((r) => r.start));
  const maxDate = Math.max(...ranges.map((r) => r.end));

  /* Ticks de año enteros dentro del rango. */
  const minYear = Math.floor(minDate);
  const maxYear = Math.ceil(maxDate);
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i,
  );
  const totalRange = maxYear - minYear;

  const yearToPercent = (y: number) => ((y - minYear) / totalRange) * 100;

  return (
    <div>
      {/* Label */}
      <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-subtle-foreground">
        <span aria-hidden className="h-px w-6 bg-foreground/25" />
        <span className="font-semibold">Timeline</span>
      </div>

      <div className="mt-5">
        {/* Year ticks (row arriba) */}
        <div className="relative h-4">
          {years.map((year, idx) => {
            const pos = yearToPercent(year);
            const isLast = idx === years.length - 1;
            return (
              <span
                key={year}
                style={{
                  left: `${pos}%`,
                  transform: isLast
                    ? "translateX(-100%)"
                    : idx === 0
                      ? "translateX(0)"
                      : "translateX(-50%)",
                }}
                className="absolute top-0 font-mono text-[10px] font-semibold uppercase tabular-nums tracking-[0.18em] text-subtle-foreground"
              >
                {year}
              </span>
            );
          })}
        </div>

        {/* Eje (hairline) */}
        <div
          aria-hidden
          className="relative mt-1.5 h-px bg-foreground/15"
        >
          {/* Vertical tick marks por año */}
          {years.map((year) => (
            <span
              key={year}
              style={{ left: `${yearToPercent(year)}%` }}
              className="absolute top-0 h-1.5 w-px -translate-x-1/2 bg-foreground/20"
            />
          ))}
        </div>

        {/* Job bars */}
        <ul className="mt-3 space-y-1.5">
          {jobs.map((job, i) => {
            const range = ranges[i];
            if (!range) return null;

            const left = ((range.start - minYear) / totalRange) * 100;
            const width = ((range.end - range.start) / totalRange) * 100;
            const isSelected = i === selectedIndex;
            const isCurrent = i === 0;

            return (
              <li key={`${job.company}-${i}`} className="relative">
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  aria-label={`Ver detalle de ${job.company} (${job.start} — ${job.end})`}
                  className="group/bar relative block h-5 w-full cursor-pointer focus:outline-none"
                >
                  {/* Bar */}
                  <span
                    style={{
                      left: `${left}%`,
                      width: `${Math.max(width, 1.2)}%`,
                    }}
                    className={cn(
                      "absolute top-1/2 h-[6px] -translate-y-1/2 rounded-full transition-all duration-300",
                      isSelected
                        ? "bg-[var(--accent)] shadow-[0_0_0_3px_color-mix(in_oklch,var(--accent)_22%,transparent)]"
                        : "bg-foreground/15 group-hover/bar:bg-foreground/30 group-focus-visible/bar:bg-foreground/30",
                    )}
                  />

                  {/* "Ahora" dot pulsando al final de la barra del job actual */}
                  {isCurrent && (
                    <span
                      aria-hidden
                      style={{ left: `${left + Math.max(width, 1.2)}%` }}
                      className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] motion-safe:animate-pulse"
                    />
                  )}

                  {/* Tooltip — company en hover (no-selected) */}
                  {!isSelected && (
                    <span
                      style={{
                        left: `${left + Math.max(width, 1.2) / 2}%`,
                      }}
                      className="pointer-events-none absolute -top-6 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground-strong px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-background opacity-0 transition-opacity duration-200 group-hover/bar:opacity-100 group-focus-visible/bar:opacity-100"
                    >
                      {job.company}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Label de selección — empresa del job seleccionado */}
        <div className="mt-4 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-subtle-foreground sm:text-[10.5px]">
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-1 rounded-full bg-[var(--accent)]"
            />
            <span className="font-semibold text-foreground-strong">
              {jobs[selectedIndex]?.company}
            </span>
          </span>
          <span>Click una barra o entrada del sidebar</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * parseSpanishDate — "Feb 2026" / "Presente" → fracción de año.
 *
 * Ene 2025 → 2025.000
 * Feb 2026 → 2026.083
 * Presente → fecha actual del browser
 * ──────────────────────────────────────────────────────────────── */
const SPANISH_MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const;

function parseSpanishDate(dateStr: string): number {
  const normalized = dateStr.trim().toLowerCase();
  if (normalized === "presente") {
    const now = new Date();
    return now.getFullYear() + now.getMonth() / 12;
  }
  const parts = normalized.split(/\s+/);
  if (parts.length !== 2) return new Date().getFullYear();
  const [month, year] = parts as [string, string];
  const monthIndex = SPANISH_MONTHS.indexOf(
    month as (typeof SPANISH_MONTHS)[number],
  );
  if (monthIndex === -1) return parseInt(year, 10);
  return parseInt(year, 10) + monthIndex / 12;
}

/* ═════════════════════════════════════════════════════════════════
 * EducationStrip — formación al pie de la sección
 *
 * Layout:
 *   ─── Formación (divider editorial con label centrado) ─────
 *   ┌── degree 1 ──┬── degree 2 ──┬── degree 3 ──┐
 *   │ AGO 2024 HOY │ AGO 2018 ... │ FEB 2016 ... │
 *   │ Ingeniería   │ Tecnólogo    │ Técnico      │
 *   │ Software     │ Software     │ Programming  │
 *   │ IBEROAMERIC. │ U. CUNDI...  │ SENA         │
 *   └──────────────┴──────────────┴──────────────┘
 *   — + Cert · UX/UI y Prototipado Digital · Udemy · 2022
 *   — + Cert · Git y GitHub Completo De Cero · Udemy · 2022
 *   — + Cert · Fundamentos de Programación · Udemy · 2022
 *
 * Hairlines verticales entre cells en sm+, horizontales en mobile.
 * El degree `current: true` lleva un punto lima pulsando — matchea
 * el patrón del "Ahora" en el sidebar de Experience.
 *
 * Las certificaciones viven abajo en tipografía mono uppercase
 * compacta — un solo pattern (FootnoteRow) los maneja a todos.
 * Para sumar más certs (o un curso futuro) basta extender el array
 * en `data/education.ts`. El strip se mantiene tightly scaled
 * gracias al `gap-y-1.5` interno (no bloques separados).
 * ════════════════════════════════════════════════════════════════ */
function EducationStrip() {
  return (
    <RevealUp delay={0.1} className="mt-12 sm:mt-14 lg:mt-16">
      {/* Divider editorial con label centrado al medio */}
      <div className="rule-editorial">
        <span aria-hidden className="rule-editorial-line" />
        <span className="mx-4 inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-subtle-foreground">
          <span aria-hidden className="size-1 rounded-full bg-[var(--accent)]" />
          Formación
        </span>
        <span aria-hidden className="rule-editorial-line" />
      </div>

      {/* Degrees — grid de 3 cells con hairlines.
       *  mobile: 1 col stacked (hairlines horizontales).
       *  sm+: 3 cols (hairlines verticales). */}
      <ul className="mt-10 grid grid-cols-1 gap-y-7 sm:mt-12 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-0 lg:gap-x-10">
        {educationDegrees.map((entry, i) => (
          <DegreeCell key={`${entry.degree}-${i}`} entry={entry} />
        ))}
      </ul>

      {/* Footnotes · certificaciones Udemy.
       *  Mismo pattern visual para todas — separadas sólo por
       *  gap-y modesto para que se lean como cluster coherente,
       *  no como bloques distintos. */}
      <ul className="mt-9 flex flex-col gap-y-2 sm:mt-10 sm:gap-y-1.5">
        {educationCertifications.map((entry, i) => (
          <FootnoteRow
            key={`${entry.label}-${entry.degree}-${i}`}
            entry={entry}
          />
        ))}
      </ul>
    </RevealUp>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * FootnoteRow — línea individual de curso o certificación.
 *
 * Pattern: hairline leading (24px) + `+ <label>` bold + sequence de
 * chunks `<separator>·<text>` que terminan en el period tabular-nums.
 * Mono uppercase 10.5px — deliberadamente subtle frente al display
 * type de los degrees arriba.
 *
 * `items-start` en mobile (hairline alinea con la primera línea del
 * wrap cuando el texto wrappea) y `items-center` en sm+ (donde
 * típicamente todo entra en una sola línea).
 * ──────────────────────────────────────────────────────────────── */
function FootnoteRow({ entry }: { entry: EducationFootnote }) {
  return (
    <li className="flex items-start gap-3 sm:items-center">
      <span
        aria-hidden
        className="mt-2 h-px w-6 shrink-0 bg-foreground/15 sm:mt-0"
      />
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.18em] text-subtle-foreground sm:text-[11px]">
        <span className="font-bold text-foreground-strong">
          + {entry.label}
        </span>
        <span aria-hidden className="text-foreground/25">
          ·
        </span>
        <span className="text-foreground/85">{entry.degree}</span>
        <span aria-hidden className="text-foreground/25">
          ·
        </span>
        <span>{entry.institution}</span>
        <span aria-hidden className="text-foreground/25">
          ·
        </span>
        <span className="tabular-nums">{entry.period}</span>
      </p>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * DegreeCell — cell individual de la grid de Formación.
 *
 * `current` agrega un dot lima pulsando junto al period.
 * Hairlines: top-border en mobile (excepto la primera),
 * left-border en sm+ (excepto la primera).
 * ──────────────────────────────────────────────────────────────── */
function DegreeCell({ entry }: { entry: EducationEntry }) {
  return (
    <li
      className={cn(
        "min-w-0",
        "border-t border-foreground/10 pt-6 first:border-t-0 first:pt-0",
        "sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0 sm:first:border-l-0 sm:first:pl-0 lg:pl-7",
      )}
    >
      <p className="flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tabular-nums tracking-[0.2em] text-subtle-foreground">
        {entry.current && (
          <span
            aria-hidden
            className="size-1 rounded-full bg-[var(--accent)] motion-safe:animate-pulse"
          />
        )}
        {entry.period}
      </p>

      <h4 className="mt-3 font-display text-[clamp(1.125rem,2vw,1.375rem)] font-semibold leading-[1.15] tracking-[-0.018em] text-foreground-strong text-balance">
        {entry.degree}
      </h4>

      <p className="mt-2.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-foreground/70">
        {entry.institution}
      </p>
    </li>
  );
}

/* ═════════════════════════════════════════════════════════════════
 * ResumeCTA — descarga del PDF al cierre de la sección.
 *
 * Layout:
 *   ───────────────────────────────────────────────────
 *               [↓ Descargar CV completo]
 *              PDF · ENGLISH · ACTUALIZADO 2026
 *   ───────────────────────────────────────────────────
 *
 * Tratamiento:
 *   · Hairlines top/bottom · genera "band" full-width que cierra la
 *     sección. Mismo lenguaje que las rule-editorial usadas como
 *     dividers en otras secciones.
 *   · Botón ink primario (alto contraste) — la acción que queremos
 *     que el reclutador apriete sin pensar. No competimos con el
 *     "Hablemos" del header porque está en otra sección visual.
 *   · Meta-text mono uppercase debajo · señaliza idioma + freshness
 *     ANTES del click. Reclutadores valoran no descargar PDFs viejos
 *     o en idioma equivocado por error.
 *
 * `download` HTML attribute fuerza la descarga (en lugar de abrir el
 * PDF inline en una pestaña nueva). En móvil algunos browsers ignoran
 * el attr y abren igual el PDF — comportamiento aceptable, el archivo
 * sigue siendo descargable manualmente desde la vista del browser.
 * ════════════════════════════════════════════════════════════════ */
function ResumeCTA() {
  return (
    <RevealUp delay={0.15} className="mt-14 sm:mt-16 lg:mt-20">
      <div className="border-y border-foreground/10 py-9 sm:py-10">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <Link
            href="/cv.pdf"
            download="Jhonatan-Becerra-Resume.pdf"
            target="_blank"
            rel="noopener"
            className={cn(
              buttonVariants({ variant: "ink", size: "lg" }),
              "min-w-[220px]",
            )}
          >
            <FileText aria-hidden className="size-4" strokeWidth={2} />
            Descargar CV completo
          </Link>

          <p
            className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.2em] text-subtle-foreground sm:text-[11px]"
            aria-label="Metadata del archivo"
          >
            <span>PDF</span>
            <span aria-hidden className="text-foreground/25">
              ·
            </span>
            <span>English</span>
            <span aria-hidden className="text-foreground/25">
              ·
            </span>
            <span>Actualizado 2026</span>
          </p>
        </div>
      </div>
    </RevealUp>
  );
}

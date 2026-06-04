"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";

import { Dialog, DialogCloseButton } from "@/components/ui/dialog";
import { Eyebrow } from "@/components/ui/eyebrow";
import { buttonVariants } from "@/components/ui/button";
import type { Project } from "@/data/portfolio";
import { useProjects } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";

/**
 * Sección "Portafolio" — grid editorial inspirado en Pagetook.
 *
 * Cada proyecto es una card "browser-framed" con screenshot real
 * arriba + meta + título + summary corto + CTA. Click en la card
 * abre el dialog con el caso de estudio extendido (long desc,
 * stack completo, highlights, link al sitio en vivo).
 *
 * Por qué dialog en lugar de página dedicada:
 *   - El site es onepage por contrato (header onepage nav,
 *     URL sin hashes). Una página `/portafolio/[slug]` rompería
 *     el flujo y obligaría a navegar fuera.
 *   - Los proyectos son 6 — un dialog por slug carga rápido y
 *     mantiene el contexto del scroll. El usuario cierra y vuelve
 *     exactamente donde estaba.
 *   - Para SEO de proyectos individuales, en el futuro se podría
 *     agregar `/casos/[slug]` que linkée al deep-link del dialog,
 *     pero por ahora la conversación es: portafolio → contacto.
 *
 * Por qué screenshots reales (no mockups CSS como en Hero/About):
 *   - Pagetook hace exactamente eso — la prueba de que algo está
 *     en producción es ver el producto en producción.
 *   - Los mockups CSS funcionan para conceptos abstractos
 *     ("interfaces que envejecen bien") pero acá la promesa es
 *     "estos sitios existen y funcionan", y la única forma de
 *     mostrarlo es enseñarlos.
 *   - Los screenshots se capturan con `scripts/capture-portfolio.mjs`
 *     (Playwright + Chromium @ 1440×900 retina) — reproducibles
 *     en cualquier máquina, sin trabajo manual.
 *
 * Grid:
 *   - mobile (<md):  1 col, gap-y generoso para que cada card
 *                    respire (son densas: imagen + 4-5 líneas de
 *                    contenido).
 *   - md+:           2 cols. 3 sería denso al ancho del container
 *                    (cada card pierde detalle). 2 da cards de
 *                    ~480px de ancho → imagen ~480×300, legible.
 *
 * State: un solo `activeProject` controla el dialog. Cerrar nullifica
 * el state — el dialog se desmonta con animación de salida.
 */
export function Portfolio() {
  const t = useTranslations("Portfolio");
  const tCommon = useTranslations("Common");
  const projects = useProjects();
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const handleClose = useCallback(() => setActiveProject(null), []);

  return (
    <section
      id="portafolio"
      className="relative isolate scroll-mt-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid opacity-50"
      />

      <div className="container-site py-10 sm:py-14 lg:py-16">
        {/* ─── Header de la sección ───────────────────────────── */}
        <RevealUp className="max-w-3xl">
          <Eyebrow>{t("eyebrow")}</Eyebrow>

          <h2 className="mt-6 font-display text-[clamp(2.25rem,5.5vw,4rem)] leading-[1.04] tracking-[-0.028em] text-foreground-strong text-balance">
            {t("headlineLead")}{" "}
            <em className="italic font-normal text-foreground/75">
              {t("headlineHighlight")}
            </em>{" "}
            {t("headlineTrail")}
          </h2>

          <p className="mt-7 max-w-2xl text-[16.5px] leading-relaxed text-muted-foreground sm:text-[17.5px]">
            {t("intro")}
          </p>
        </RevealUp>

        {/* ─── Grid de proyectos ──────────────────────────────── *
         * 3 cols en md+ y lg+ (tablet + desktop). Mobile sigue
         * apilado. `auto-rows-fr` + `h-full` en cada card hace que
         * todas las cards de una misma fila tengan exactamente la
         * misma altura — la card con más copy gana, el resto se
         * estira. Sin esto se ven dientudas cuando las descripciones
         * tienen long counts diferentes.
         *
         * gap-x más estrecho en md (cards de ~230px en tablet 768)
         * y se abre a gap-x-8 en lg+ cuando las cards llegan a
         * ~340px. La asimetría es intencional — más respiro cuando
         * sobra ancho. */}
        <ul
          className="mt-12 grid grid-cols-1 auto-rows-fr gap-y-12 sm:mt-14 md:mt-16 md:grid-cols-3 md:gap-x-6 md:gap-y-14 lg:gap-x-8 lg:gap-y-16"
          role="list"
        >
          {projects.map((project, i) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={i}
              onOpen={setActiveProject}
            />
          ))}
        </ul>

        {/* ─── Cierre · CTA editorial ─────────────────────────── */}
        <RevealUp delay={0.1} className="mt-16 sm:mt-20">
          <div className="rule-editorial">
            <span aria-hidden className="rule-editorial-line" />
            <span className="mx-4 inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-subtle-foreground">
              <Sparkles aria-hidden className="size-3" />
              {t("closingDividerLabel")}
            </span>
            <span aria-hidden className="rule-editorial-line" />
          </div>

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-[15.5px] leading-relaxed text-muted-foreground sm:text-[16.5px]">
              {t("closingCopy")}
            </p>

            <Link
              href="#contacto"
              className={cn(buttonVariants({ variant: "ink", size: "xl" }))}
            >
              {tCommon("ctaTalk")}
              <ArrowUpRight aria-hidden />
            </Link>
          </div>
        </RevealUp>
      </div>

      {/* ─── Dialog · caso de estudio completo ──────────────── */}
      <Dialog
        open={activeProject !== null}
        onClose={handleClose}
        labelledBy={
          activeProject ? `project-dialog-title-${activeProject.slug}` : undefined
        }
      >
        {activeProject && (
          <ProjectDialogContent
            project={activeProject}
            onClose={handleClose}
          />
        )}
      </Dialog>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════
 * RevealUp — fade-up al entrar al viewport.
 *
 * Mismo patrón que About/Experience — `once: true` para no
 * re-animar al hacer scroll up, easing out-expo modificado para
 * sensación de "asentamiento".
 * ════════════════════════════════════════════════════════════════ */
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
 * ProjectCard — preview clickeable de un proyecto.
 *
 * Decisiones:
 *  - **Toda la card es un button** (no sólo el "Ver caso") — patrón
 *    "card-as-trigger" estándar en e-commerce/portafolios. Más
 *    permisivo en mobile (tap-target completo) y reduce el visual
 *    noise (no dos affordances peleando).
 *  - **Browser frame around the image** — replica visual del header
 *    de un browser (traffic lights + URL bar). Da contexto inmediato:
 *    "esto es un sitio web real, click para ver más".
 *  - **Hover effects sutiles**:
 *      · Image: scale 1.025 + brillo leve (brightness).
 *      · Card border: hairline → accent al hover.
 *      · "Ver caso" arrow: translate-x.
 *    Suficiente para señalar interactividad sin saturar.
 *  - **Lazy load por default** — el portafolio está después de hero,
 *    about y experience; nunca above-the-fold. `loading="lazy"` viene
 *    automático con next/image.
 *  - **stagger por index** — cada card entra con un delay incremental
 *    (90ms entre cards), efecto cascada al hacer scroll a la sección.
 * ════════════════════════════════════════════════════════════════ */
function ProjectCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: (p: Project) => void;
}) {
  const t = useTranslations("Portfolio");
  const titleId = `project-card-title-${project.slug}`;

  return (
    <motion.li
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.7,
        delay: index * 0.09,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="h-full"
    >
      <button
        type="button"
        onClick={() => onOpen(project)}
        aria-labelledby={titleId}
        aria-haspopup="dialog"
        className={cn(
          "group/card flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-surface text-left",
          "transition-all duration-300 ease-out",
          "hover:border-foreground/30 hover:shadow-[0_24px_56px_-20px_rgba(10,11,15,0.15),0_8px_16px_-8px_rgba(10,11,15,0.08)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        {/* Browser bar — chrome del frame. Mismo lenguaje visual
         *  que BrowserMockup (Hero, About) pero acá envuelve un
         *  screenshot real, no CSS art.
         *
         *  En tablet 3-col las cards quedan a ~230px y el chip
         *  centrado con la URL queda muy apretado entre los traffic
         *  lights y el borde. Por eso el chip centrado sólo aparece
         *  en lg+ (ancho cómodo); en mobile y tablet la URL va a la
         *  derecha en mono pequeño. */}
        <div className="flex items-center gap-2 border-b border-border bg-surface-elevated px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span aria-hidden className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span aria-hidden className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <div
            aria-hidden
            className="ml-2 hidden flex-1 items-center justify-center lg:flex"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 font-mono text-[10.5px] font-medium text-muted-foreground">
              <span className="size-1 rounded-full bg-[var(--accent)]" />
              {project.urlDisplay}
            </span>
          </div>
          {/* URL a la derecha en mono compacto · mobile + tablet (cuando
           *  el chip centrado lg+ no aplica). truncate para evitar
           *  que un dominio largo empuje el layout. */}
          <div
            aria-hidden
            className="ml-auto min-w-0 flex items-center gap-1.5 lg:hidden"
          >
            <span className="truncate font-mono text-[10px] text-subtle-foreground">
              {project.urlDisplay}
            </span>
          </div>
        </div>

        {/* Screenshot — aspect-[16/10] match al viewport de captura
         *  (1440×900). next/image con `sizes` precisos para 3-col en
         *  md+ (33vw aprox) y full-width en mobile. */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-elevated">
          <Image
            src={`/portfolio/${project.slug}.jpg`}
            alt={t("cardImageAlt", {
              name: project.name,
              description: project.shortDesc,
            })}
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 768px) 33vw, 100vw"
            className="object-cover object-top transition-transform duration-700 ease-out group-hover/card:scale-[1.025]"
          />
          {/* Overlay sutil que aparece al hover — refuerza la
           *  affordance "click para ver más". */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover/card:bg-foreground/[0.04]"
          />
        </div>

        {/* Body — meta minimal + título + CTA.
         *
         * Simplificado: sin type-chip y sin shortDesc. La idea es
         * que el screenshot haga el trabajo visual y el body sea
         * sólo metadatos esenciales (ubicación + año), nombre, y
         * el affordance de "Ver caso". Todo lo demás vive en el
         * dialog del caso de estudio.
         *
         * `flex flex-1 flex-col` toma toda la altura sobrante de la
         * card. El CTA usa `mt-auto` para anclarse al fondo —
         * importante porque algunos nombres ocupan 1 línea
         * ("Citook") y otros 2 ("Daniel Galindo · Demo Reel"), pero
         * el "Ver caso" siempre queda a la misma altura visual
         * entre cards de la misma fila. */}
        <div className="flex flex-1 flex-col px-5 pb-6 pt-5 lg:px-6 lg:pb-7 lg:pt-6">
          {/* Meta line — location + period.
           *
           * Sin separadores `·`: el `gap-x-3` ya separa visualmente
           * y evita orfans en flex-wrap. `tabular-nums` en el año
           * para que dígitos alineen entre cards. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-subtle-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin aria-hidden className="size-3 text-foreground/40" />
              {project.location}
            </span>
            <span className="tabular-nums text-foreground/55">
              {project.period}
            </span>
          </div>

          <h3
            id={titleId}
            className="mt-4 font-display text-[clamp(1.5rem,2.2vw,1.875rem)] font-semibold leading-[1.1] tracking-[-0.022em] text-foreground-strong text-balance"
          >
            {project.name}
          </h3>

          {/* CTA · visual cue (toda la card es el trigger).
           *  `mt-auto pt-6` empuja al fondo de la columna flex con
           *  separación generosa del título arriba. */}
          <div className="mt-auto inline-flex items-center gap-1.5 pt-6 font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-foreground/80">
            {t("viewCase")}
            <ArrowRight
              aria-hidden
              className="size-3.5 transition-transform duration-300 ease-out group-hover/card:translate-x-1"
            />
          </div>
        </div>
      </button>
    </motion.li>
  );
}

/* ═════════════════════════════════════════════════════════════════
 * ProjectDialogContent — payload del dialog: caso de estudio.
 *
 * Layout:
 *  ┌─────────────────────────────────────────────────┐ ← close btn
 *  │ [hero image — full width, 16:10]                │   absolute top-right
 *  │                                                 │
 *  ├─────────────────────────────────────────────────┤
 *  │ ● TIPO · UBICACIÓN · PERÍODO                    │
 *  │                                                 │
 *  │ Project Name (display, big)                     │
 *  │ urlDisplay (mono, muted)                        │
 *  │                                                 │
 *  │ [3 párrafos de long description]                │
 *  │                                                 │
 *  │ ── HIGHLIGHTS ──                                │
 *  │ · bullet 1                                      │
 *  │ · bullet 2                                      │
 *  │ · bullet 3                                      │
 *  │                                                 │
 *  │ ── STACK ──                                     │
 *  │ [chip] [chip] [chip] [chip]                    │
 *  │                                                 │
 *  │ ── ROL ──                                       │
 *  │ Texto rol                                       │
 *  │                                                 │
 *  ├─────────────────────────────────────────────────┤
 *  │ [Ver sitio en vivo ↗] [Cerrar]                  │
 *  └─────────────────────────────────────────────────┘
 *
 * Mobile: imagen full-width, paddings reducidos, CTAs apilados.
 * Desktop: paddings generosos (px-10), CTAs en fila.
 * ════════════════════════════════════════════════════════════════ */
function ProjectDialogContent({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const t = useTranslations("Portfolio");
  const titleId = `project-dialog-title-${project.slug}`;

  return (
    <div className="relative max-h-[92vh] overflow-y-auto">
      {/* Close button — flotante sobre la imagen hero */}
      <DialogCloseButton
        onClose={onClose}
        className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6"
      />

      {/* Hero image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-elevated">
        <Image
          src={`/portfolio/${project.slug}.jpg`}
          alt={t("dialogImageAlt", { name: project.name })}
          fill
          sizes="(min-width: 1024px) 1080px, 100vw"
          className="object-cover object-top"
          priority
        />
        {/* Gradient inferior para legibilidad si overlapping text en el futuro */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/40 to-transparent"
        />
      </div>

      <div className="px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
        {/* Meta line */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em] text-subtle-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-surface-elevated px-2.5 py-1 text-foreground/80">
            <span className="size-1 rounded-full bg-[var(--accent)]" />
            {project.type}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin aria-hidden className="size-3 text-foreground/40" />
            {project.location}
          </span>
          <span aria-hidden className="text-foreground/25">·</span>
          <span className="tabular-nums">{project.period}</span>
          <span aria-hidden className="text-foreground/25">·</span>
          <span>{project.category}</span>
        </div>

        {/* Title + URL */}
        <h3
          id={titleId}
          className="mt-5 font-display text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.05] tracking-[-0.028em] text-foreground-strong text-balance"
        >
          {project.name}
        </h3>

        <Link
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 font-mono text-[12.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {project.urlDisplay}
          <ExternalLink aria-hidden className="size-3.5" />
        </Link>

        {/* Long description */}
        <div className="mt-7 space-y-4 text-[15px] leading-[1.7] text-muted-foreground sm:text-[16px]">
          {project.longDesc.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* Highlights */}
        <DetailBlock label={t("dialog.highlightsLabel")} className="mt-10">
          <ul className="space-y-2.5">
            {project.highlights.map((h, i) => (
              <li
                key={i}
                className="flex gap-3 text-[14.5px] leading-relaxed text-foreground/85 sm:text-[15px]"
              >
                <span
                  aria-hidden
                  className="mt-2 size-1 shrink-0 rounded-full bg-[var(--accent)]"
                />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </DetailBlock>

        {/* Stack */}
        <DetailBlock label={t("dialog.stackLabel")} className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="inline-flex items-center rounded-full border border-foreground/12 bg-surface px-3 py-1.5 font-mono text-[11.5px] font-medium text-foreground/80"
              >
                {tech}
              </li>
            ))}
          </ul>
        </DetailBlock>

        {/* Role */}
        <DetailBlock label={t("dialog.roleLabel")} className="mt-8">
          <p className="text-[15px] leading-relaxed text-foreground/85 sm:text-[15.5px]">
            {project.role}
          </p>
        </DetailBlock>

        {/* CTAs */}
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle-foreground">
            {t("dialog.caseStudyMeta", { slug: project.slug })}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full sm:w-auto",
              )}
            >
              {t("dialog.close")}
            </button>
            <Link
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "ink", size: "lg" }),
                "w-full sm:w-auto",
              )}
            >
              {t("dialog.viewLive")}
              <ArrowUpRight aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
 * DetailBlock — label en mono uppercase + contenido.
 *
 * Patrón editorial reutilizable dentro del dialog. La hairline a la
 * izquierda del label le da peso visual al "campo" sin tener que
 * usar headings (h4/h5) que romperían la jerarquía global (sólo
 * hay un h3 por dialog: el nombre del proyecto).
 * ════════════════════════════════════════════════════════════════ */
function DetailBlock({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="flex items-center gap-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.22em] text-subtle-foreground">
        <span aria-hidden className="h-px w-6 bg-foreground/25" />
        {label}
      </p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

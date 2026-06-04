"use client";

import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  SiAngular,
  SiNextdotjs,
  SiReact,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";
import type { IconType } from "react-icons";
import { useTranslations } from "next-intl";

import { BrowserMockup } from "@/components/home/BrowserMockup";
import { Eyebrow } from "@/components/ui/eyebrow";
import { MarkerHighlight } from "@/components/ui/marker-highlight";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * Sección "Sobre mí" — patrón zigzag editorial en grid único de 4
 * celdas (sin rule separadora entre filas — el gap-y del grid hace
 * todo el trabajo de respiración).
 *
 *   ┌─── Bio + manifesto ───────┬─── BrowserMockup landing ──┐
 *   │ ●  SOBRE MÍ                │       ░ halo lima ░         │
 *   │ Construyo interfaces que   │  ┌─────────────────────┐   │
 *   │ [envejecen bien].          │  │ ● ● ●  studio…      │   │
 *   │                            │  │  Landing skeleton   │   │
 *   │ Bio párrafo corto.         │  └─────────────────────┘   │
 *   │ Bio párrafo corto 2.       │  · Landings & marketing    │   ← caption
 *   ├────────────────────────────┼────────────────────────────┤
 *   │   ░ halo lima ░            │  TypeScript      100%      │
 *   │  ┌──────────────┐          │  ████████████████          │
 *   │  │   TABLET     │          │  Angular          90%      │
 *   │  └──────────────┘          │  ███████████████           │
 *   │   ┌───┐                    │  Tailwind CSS     85%      │
 *   │   │MO │                    │  ██████████████            │
 *   │   │BI │                    │  Next.js          70%      │
 *   │   └───┘                    │  ███████████               │
 *   │   · Componentes responsive  │  React            55%      │
 *   │                            │  █████████                 │
 *   │                            │                            │
 *   │                            │  ●  ¿Te suena? Hablemos →   │   ← CTA
 *   └────────────────────────────┴────────────────────────────┘
 *
 * Mejoras de esta iteración:
 *   1. **Captions mono debajo de cada mockup** — dan contexto narrativo
 *      al visual ("qué muestra cada mockup"), conectan con el lado
 *      opuesto y refuerzan el stack mencionado en la bio.
 *   2. **Mini-CTA editorial al cierre** — anchor a #contacto, le da
 *      salida intencional a la sección en vez de morir en las bars.
 *   3. **Scroll-reveal con motion/react** — bio, mockups, bars y CTA
 *      hacen fade-up al entrar al viewport (whileInView, once:true).
 *      Polish sin tocar layout.
 *
 * Breakpoints del grid:
 *   · mobile (<md):  1 col — flow bio → desktop → stats → devices,
 *                    alternancia texto/visual evita 2 mockups en fila.
 *   · md+ (tablet):  2 cols — row 1 bio | desktop, row 2 devices | bars.
 *                    Antes era lg+; bajado a md+ porque las bars se
 *                    redimensionan sin problema y el desktop mockup
 *                    también aguanta cols de ~350px.
 *   · lg+:           mismas 2 cols pero con más gap y items-center
 *                    para el "magazine spread" pleno.
 *
 * Mobile-first detalles:
 *   · `gap-y` mobile = 14 — bloques cerca, menos scroll fatigue.
 *   · `py` mobile = 20 — la sección no arranca tan lejos del cue anterior.
 *   · Mockups con `max-w` chico (380/340px) + `mx-auto` — centrados.
 *   · Bio/StatsBlock/captions con `mx-auto max-w-xl text-center
 *     md:text-left md:mx-0` — centrados en phone, alineados al col
 *     en tablet+ para respetar el grid.
 */
export function About() {
  return (
    <section id="sobre-mi" className="relative isolate scroll-mt-24">
      <div className="container-site py-10 sm:py-14 lg:py-16">
        {/* Grid único — 4 celdas con order classes para flow mobile-vs-md+.
         *   mobile: bio → desktop → stats → devices (alternancia
         *           texto/visual evita 2 mockups consecutivos)
         *   md+:    row 1 = bio · desktop
         *           row 2 = devices · stats
         *
         * Se bajó el 2-col de `lg:` a `md:` para que en tablet las bars
         * compartan fila con el devices mockup (el user lo pidió: las
         * bars se redimensionan sin problema). En `lg+` el grid usa
         * gap-x/gap-y más generosos para el spread editorial completo. */}
        <div className="grid grid-cols-1 gap-x-12 gap-y-14 sm:gap-y-16 md:grid-cols-2 md:items-center md:gap-x-10 md:gap-y-20 lg:gap-x-16 lg:gap-y-24 xl:gap-x-20">
          <div className="order-1">
            <AboutContent />
          </div>
          <div className="order-2">
            <DesktopMockupBlock />
          </div>
          <div className="order-4 md:order-3">
            <DevicesMockupBlock />
          </div>
          <div className="order-3 md:order-4">
            <StatsBlock />
          </div>
        </div>

        {/* ─── Cierre de sección ─ mini-CTA editorial full-width ──
         * Vive afuera del grid para no competir por espacio con
         * ninguna celda (en mobile estaba colando overlap con el
         * DevicesMockupBlock que iba justo abajo del StatsBlock).
         * Ahora es el "exit" intencional de la sección, centrado,
         * con hairlines a los costados.       */}
        <SectionExitCTA />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * RevealUp — helper para fade-up al entrar al viewport.
 *
 * `whileInView` con `once: true` y `amount: 0.2` (20% visible para
 * disparar) — evita re-animaciones al hacer scroll up. La curva
 * `[0.22, 1, 0.36, 1]` es out-expo modificada: rápido al inicio,
 * suave al final — sensación de "asentamiento".
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
 * ROW 1 · LEFT — Bio + manifesto editorial
 * ════════════════════════════════════════════════════════════════ */
function AboutContent() {
  const t = useTranslations("About");
  return (
    <div className="mx-auto max-w-xl text-center md:mx-0 md:max-w-none md:text-left">
      <RevealUp>
        <Eyebrow>{t("eyebrow")}</Eyebrow>
      </RevealUp>

      <RevealUp delay={0.05}>
        <h2 className="mt-5 font-display text-[clamp(1.875rem,5vw,3.5rem)] leading-[1.06] tracking-[-0.028em] text-foreground-strong text-balance">
          {t("headlineLead")}{" "}
          <MarkerHighlight>{t("headlineHighlight")}</MarkerHighlight>.
        </h2>
      </RevealUp>

      <RevealUp delay={0.12}>
        <div className="mx-auto mt-7 max-w-xl space-y-4 text-[15.5px] leading-[1.7] text-muted-foreground sm:text-[16.5px] md:mx-0">
          <p>
            {t.rich("bioParagraph1", {
              years: siteConfig.yearsOfExperience,
              location: siteConfig.location,
              s: (chunks) => (
                <strong className="font-semibold text-foreground">
                  {chunks}
                </strong>
              ),
            })}
          </p>
          <p>{t("bioParagraph2")}</p>
        </div>
      </RevealUp>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
 * ROW 1 · RIGHT — Browser desktop con landing page mockup
 * ════════════════════════════════════════════════════════════════ */
function DesktopMockupBlock() {
  const t = useTranslations("About.captions");
  return (
    <RevealUp delay={0.1}>
      <div className="relative isolate mx-auto w-full max-w-[380px] sm:max-w-[460px] md:max-w-none">
        {/* Halo lima radial */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20 translate-y-6 scale-110 rounded-[44px]"
          style={{
            background:
              "radial-gradient(58% 55% at 50% 50%, color-mix(in oklch, var(--accent) 22%, transparent) 0%, transparent 70%)",
          }}
        />

        <div className="relative motion-safe:animate-[float-soft_8s_ease-in-out_infinite]">
          <BrowserMockup url="studio.cliente.dev">
            <LandingPageMockup />
          </BrowserMockup>
        </div>

        <MockupCaption className="mt-7 sm:mt-9">{t("desktop")}</MockupCaption>
      </div>
    </RevealUp>
  );
}

/* ═════════════════════════════════════════════════════════════════
 * ROW 2 · LEFT — Tablet + Mobile composition
 * ════════════════════════════════════════════════════════════════ */
function DevicesMockupBlock() {
  const t = useTranslations("About.captions");
  return (
    <RevealUp delay={0.1}>
      <div className="relative isolate mx-auto w-full max-w-[340px] sm:max-w-[440px] md:max-w-none">
        {/* Halo lima */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20 translate-y-8 scale-110 rounded-[44px]"
          style={{
            background:
              "radial-gradient(58% 55% at 50% 50%, color-mix(in oklch, var(--accent) 22%, transparent) 0%, transparent 70%)",
          }}
        />

        <div className="relative motion-safe:animate-[float-soft_9s_ease-in-out_infinite]">
          {/* Tablet — pieza principal, anclada a la derecha */}
          <div className="relative z-10 ml-auto w-[86%]">
            <TabletMockup />
          </div>

          {/* Mobile — peek bottom-left, recto */}
          <div className="absolute -bottom-6 left-0 z-20 w-[24%] sm:-bottom-10 sm:w-[22%]">
            <MobileMockup />
          </div>
        </div>

        {/* Caption — mt extra para clear el peek del mobile */}
        <MockupCaption className="mt-12 sm:mt-16">{t("devices")}</MockupCaption>
      </div>
    </RevealUp>
  );
}

/* ═════════════════════════════════════════════════════════════════
 * ROW 2 · RIGHT — Skill bars (el CTA vive afuera, ver SectionExitCTA)
 * ════════════════════════════════════════════════════════════════ */
function StatsBlock() {
  return (
    <div className="mx-auto max-w-xl md:mx-0 md:max-w-none">
      <RevealUp>
        <ul className="space-y-5 sm:space-y-6">
          {SKILLS.map((skill, i) => (
            <SkillBarRow key={skill.name} {...skill} delay={i * 0.07} />
          ))}
        </ul>
      </RevealUp>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
 * SectionExitCTA — cierre de toda la sección, full-width, centrado.
 *
 * Vivía dentro del StatsBlock (col derecha en lg, 3ra en mobile) y
 * en mobile colaba visualmente sobre el DevicesMockupBlock que iba
 * justo abajo. Subido al nivel de la sección queda como remate real:
 *   · centrado en ambos breakpoints
 *   · hairlines a los costados (separadores editoriales)
 *   · mt generoso para despegar del grid
 * ════════════════════════════════════════════════════════════════ */
function SectionExitCTA() {
  const t = useTranslations("About.exitCta");
  const tCommon = useTranslations("Common");
  return (
    <RevealUp delay={0.2} className="mt-12 sm:mt-14 lg:mt-16">
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        <span
          aria-hidden
          className="h-px w-10 bg-foreground/15 sm:w-16 lg:w-24"
        />
        <a
          href="#contacto"
          className="group inline-flex items-center gap-2.5 text-[14.5px] font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground-strong sm:text-[15.5px]"
        >
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-[var(--accent)]"
          />
          {t("lead")}{" "}
          <span className="font-display italic font-semibold text-foreground-strong decoration-[var(--accent)] decoration-2 underline-offset-[5px] group-hover:underline">
            {tCommon("ctaTalk")}
          </span>
          <ArrowRight
            aria-hidden
            className="size-4 text-foreground/55 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-foreground"
            strokeWidth={2}
          />
        </a>
        <span
          aria-hidden
          className="h-px w-10 bg-foreground/15 sm:w-16 lg:w-24"
        />
      </div>
    </RevealUp>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * MockupCaption — micro-leyenda mono debajo de cada mockup.
 * Centrada en mobile, alineada al lado del mockup en lg+.
 * Prefijo dot lima para mantener consistencia con los Eyebrows.
 * ──────────────────────────────────────────────────────────────── */
function MockupCaption({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center justify-center gap-2 text-center font-mono text-[10.5px] uppercase tracking-[0.22em] text-subtle-foreground md:justify-start md:text-left",
        className,
      )}
    >
      <span
        aria-hidden
        className="inline-block size-1 shrink-0 rounded-full bg-[var(--accent)]"
      />
      <span>{children}</span>
    </p>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * SkillBars — 5 tech rows animadas al entrar en viewport.
 * ──────────────────────────────────────────────────────────────── */
type Skill = {
  readonly name: string;
  readonly Icon: IconType;
  readonly value: number;
};

const SKILLS: readonly Skill[] = [
  { name: "TypeScript", Icon: SiTypescript, value: 100 },
  { name: "Angular", Icon: SiAngular, value: 90 },
  { name: "Tailwind CSS", Icon: SiTailwindcss, value: 85 },
  { name: "Next.js", Icon: SiNextdotjs, value: 70 },
  { name: "React", Icon: SiReact, value: 55 },
];

function SkillBarRow({
  name,
  Icon,
  value,
  delay,
}: Skill & { delay: number }) {
  return (
    <li className="group/skill">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Icon
            aria-hidden
            className="size-[18px] shrink-0 text-foreground/55 transition-colors duration-300 group-hover/skill:text-foreground"
          />
          <span className="font-display text-[15.5px] font-semibold leading-none tracking-[-0.005em] text-foreground sm:text-[16px]">
            {name}
          </span>
        </div>
        <span className="font-mono text-[12px] font-semibold tabular-nums text-foreground-strong">
          {value}
          <span className="ml-px text-subtle-foreground">%</span>
        </span>
      </div>

      <div className="relative h-[8px] overflow-hidden rounded-full bg-foreground/[0.06]">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent)]"
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 1,
            delay,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </div>
    </li>
  );
}

/* ═════════════════════════════════════════════════════════════════
 * MOCKUPS — CSS-only, sin imágenes
 * ════════════════════════════════════════════════════════════════ */

/**
 * LandingPageMockup — skeleton de landing page DESKTOP.
 * Distinto del dashboard del hero: este vende la idea de "landing",
 * con nav editorial, eyebrow lima pill, H1 multi-línea con la 3ra
 * en lima, subline, CTAs primary + ghost, y un row de 3 stats al pie.
 */
function LandingPageMockup() {
  return (
    <div className="bg-surface text-foreground">
      {/* Nav */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-3.5 py-2.5 sm:px-4">
        <div className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-2.5 rounded-full bg-[var(--accent)]"
          />
          <span className="h-1.5 w-9 rounded-full bg-foreground/70" />
        </div>
        <div className="hidden items-center gap-3.5 sm:flex">
          <span className="h-1 w-6 rounded-full bg-foreground/25" />
          <span className="h-1 w-7 rounded-full bg-foreground/25" />
          <span className="h-1 w-5 rounded-full bg-foreground/25" />
        </div>
        <div className="h-4 w-12 rounded-full bg-foreground sm:w-14" />
      </div>

      {/* Hero */}
      <div className="px-3.5 py-5 sm:px-5 sm:py-7">
        <div className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_oklch,var(--accent)_22%,transparent)] px-1.5 py-0.5">
          <Sparkles
            aria-hidden
            className="size-2 text-[color-mix(in_oklch,var(--accent)_50%,var(--foreground))]"
            strokeWidth={2.5}
          />
          <span className="font-mono text-[7px] font-bold uppercase tracking-[0.18em] text-[color-mix(in_oklch,var(--accent)_45%,var(--foreground))]">
            New · v3.0
          </span>
        </div>

        <div className="mt-2.5 space-y-1.5">
          <div className="h-3 w-[78%] rounded-md bg-foreground/85" />
          <div className="h-3 w-[58%] rounded-md bg-foreground/85" />
          <div className="h-3 w-[68%] rounded-md bg-[var(--accent)]" />
        </div>

        <div className="mt-3 space-y-1">
          <div className="h-1.5 w-[88%] rounded-full bg-foreground/20" />
          <div className="h-1.5 w-[72%] rounded-full bg-foreground/20" />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1.5">
            <span className="h-1 w-6 rounded-full bg-background sm:w-7" />
            <ArrowRight
              aria-hidden
              className="size-2 text-[var(--accent)]"
              strokeWidth={2.5}
            />
          </div>
          <div className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5">
            <span className="h-1 w-6 rounded-full bg-foreground/55 sm:w-7" />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-surface-elevated/50">
        <StatCellMini big="03" small="años" />
        <StatCellMini big="48" small="proy" accent />
        <StatCellMini big="11" small="stack" />
      </div>
    </div>
  );
}

function StatCellMini({
  big,
  small,
  accent,
}: {
  big: string;
  small: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-center gap-1 px-2 py-2.5">
      <span
        className={cn(
          "font-display text-[14px] font-semibold leading-none tracking-[-0.02em] text-foreground-strong",
          accent && "italic",
        )}
      >
        {big}
      </span>
      <span className="font-mono text-[7.5px] uppercase tracking-[0.18em] text-subtle-foreground">
        {small}
      </span>
    </div>
  );
}

/**
 * TabletMockup — frame landscape (~4:3) con article/case-study preview.
 *
 * Layout interno: 2-col grid — image placeholder (gradient lima) a la
 * izquierda, header + body + meta a la derecha. Diferente del landing
 * desktop (que vende una idea) y del dashboard del hero (que muestra
 * data) — esto vende contenido editorial.
 */
function TabletMockup() {
  return (
    <div className="relative overflow-hidden rounded-[18px] border-[5px] border-foreground-strong bg-surface shadow-[0_30px_60px_-30px_rgba(10,11,15,0.22),0_8px_20px_-8px_rgba(10,11,15,0.10)]">
      {/* Tablet status bar */}
      <div className="flex items-center justify-between border-b border-border bg-surface-elevated px-3 py-1.5">
        <span className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-subtle-foreground">
          9:41
        </span>
        <div className="flex items-center gap-1">
          <span
            aria-hidden
            className="h-1 w-3 rounded-full bg-foreground/40"
          />
          <span
            aria-hidden
            className="h-1 w-3 rounded-full bg-foreground/40"
          />
          <span
            aria-hidden
            className="h-1 w-3 rounded-full bg-[var(--accent)]"
          />
        </div>
      </div>

      {/* Content — case study preview */}
      <div className="grid grid-cols-[1fr_1.15fr] gap-3 p-3 sm:gap-4 sm:p-4">
        {/* Image placeholder con gradient lima */}
        <div
          aria-hidden
          className="aspect-[4/5] rounded-md"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklch, var(--accent) 30%, transparent), color-mix(in oklch, var(--accent) 8%, transparent))",
          }}
        />

        <div className="flex flex-col justify-center gap-2 sm:gap-2.5">
          <span className="font-mono text-[7.5px] font-bold uppercase tracking-[0.18em] text-[color-mix(in_oklch,var(--accent)_50%,var(--foreground))]">
            Case study · 01
          </span>

          <div className="space-y-1.5">
            <div className="h-2 w-[88%] rounded-full bg-foreground/85" />
            <div className="h-2 w-[62%] rounded-full bg-foreground/85" />
          </div>

          <div className="mt-1 space-y-1">
            <div className="h-1 w-[92%] rounded-full bg-foreground/20" />
            <div className="h-1 w-[80%] rounded-full bg-foreground/20" />
            <div className="h-1 w-[68%] rounded-full bg-foreground/20" />
          </div>

          <div className="mt-1 flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-1 rounded-full bg-[var(--accent)]"
            />
            <span className="font-mono text-[7px] uppercase tracking-[0.18em] text-subtle-foreground">
              Read · 3 min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * MobileMockup — phone frame vertical realista, estilo iPhone moderno.
 *
 * Anatomía (forma de teléfono real):
 *   · Bezel exterior `bg-foreground-strong` con `p-1` y radio `[34px]`
 *     — el frame negro grueso es lo que lee como "teléfono" vs widget.
 *   · Screen interno `rounded-[28px] bg-surface` con aspect ~9:19.
 *   · Dynamic island arriba — pill negra centrada que sale del bezel.
 *   · Status bar con "9:41" + dots de señal/batería.
 *   · Contenido: 1 header + 1 botón + 1 input (simplificado vs antes
 *     — los teléfonos no muestran tantas cosas a la vez).
 *   · Home indicator abajo — barrita horizontal al pie de la pantalla.
 */
function MobileMockup() {
  return (
    <div className="relative rounded-[34px] bg-foreground-strong p-1 shadow-[0_20px_40px_-20px_rgba(10,11,15,0.35),0_4px_12px_-4px_rgba(10,11,15,0.20)]">
      {/* Screen */}
      <div className="relative aspect-[9/19] overflow-hidden rounded-[28px] bg-surface">
        {/* Dynamic island — pill negra centrada arriba */}
        <span
          aria-hidden
          className="absolute left-1/2 top-1.5 z-10 h-3 w-12 -translate-x-1/2 rounded-full bg-foreground-strong sm:top-2 sm:h-3.5 sm:w-14"
        />

        {/* Status bar */}
        <div className="flex items-center justify-between px-3 pt-6 sm:pt-7">
          <span className="font-mono text-[7.5px] font-bold tabular-nums text-subtle-foreground">
            9:41
          </span>
          <div className="flex items-center gap-0.5">
            <span
              aria-hidden
              className="size-1 rounded-full bg-foreground/40"
            />
            <span
              aria-hidden
              className="size-1 rounded-full bg-foreground/40"
            />
            <span
              aria-hidden
              className="size-1 rounded-full bg-[var(--accent)]"
            />
          </div>
        </div>

        {/* Body */}
        <div className="mt-3 space-y-2.5 px-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-foreground/85">
              Comps
            </span>
            <span
              aria-hidden
              className="size-1 rounded-full bg-[var(--accent)]"
            />
          </div>

          <div className="space-y-1">
            <span
              aria-hidden
              className="block h-1.5 w-[80%] rounded-full bg-foreground/85"
            />
            <span
              aria-hidden
              className="block h-1.5 w-[55%] rounded-full bg-foreground/85"
            />
          </div>

          <div className="flex items-center justify-center rounded-md bg-foreground py-1.5">
            <span
              aria-hidden
              className="h-0.5 w-6 rounded-full bg-[var(--accent)]"
            />
          </div>

          <div className="flex items-center rounded-md border border-border bg-surface-elevated px-1.5 py-1.5">
            <span
              aria-hidden
              className="size-1 rounded-full bg-[var(--accent)]"
            />
            <span
              aria-hidden
              className="ml-1 h-0.5 w-7 rounded-full bg-foreground/30"
            />
          </div>
        </div>

        {/* Home indicator */}
        <span
          aria-hidden
          className="absolute bottom-1.5 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-foreground-strong/45"
        />
      </div>
    </div>
  );
}

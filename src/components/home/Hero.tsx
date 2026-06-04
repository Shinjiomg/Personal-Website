import Link from "next/link";
import { ArrowUpRight, ChevronDown, FolderOpen, Mail } from "lucide-react";
import {
  SiAngular,
  SiNextdotjs,
  SiReact,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";

import { Eyebrow } from "@/components/ui/eyebrow";
import { MarkerHighlight } from "@/components/ui/marker-highlight";
import { buttonVariants } from "@/components/ui/button";
import { HeroComposition } from "@/components/home/HeroComposition";
import {
  TechMarquee,
  type MarqueeItem,
} from "@/components/home/TechMarquee";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { LinkedInIcon } from "@/components/icons/LinkedInIcon";
import { siteConfig } from "@/lib/site-config";
import { contactLinks } from "@/lib/contact-links";
import { cn } from "@/lib/utils";

/**
 * Hero del home — asimétrico en desktop, centrado en tablet/mobile.
 *
 * Layout desktop (lg+):
 *   ┌── COPY ───────────┐ ┌─── MOCKUP ───┐
 *   │ Eyebrow           │ │   Browser    │
 *   │ H1 (Fraunces)     │ │      +       │
 *   │ Subhead           │ │   Dashboard  │
 *   │ CTAs              │ │   skeleton   │
 *   │ Channels row      │ │              │
 *   └───────────────────┘ └──────────────┘
 *      ─── Scroll cue (centered) ──────────────
 *      ─── Stack marquee (cross full-width) ───
 *
 * Layout mobile/tablet (<lg):
 *   ┌─── COPY centrado ───┐
 *   │       Eyebrow       │
 *   │        H1           │
 *   │      Subhead        │
 *   │       CTAs          │
 *   │    Channels row     │
 *   ├──── Scroll cue ─────┤  (mockup oculto: ver nota abajo)
 *   ├──── Marquee ────────┤
 *
 * Nota visibilidad mockup: solo se renderiza en lg+. En mobile y
 * tablet el browser se ocultaría debajo del copy, sin la columna
 * de copy al lado, leyendo como elemento huérfano. Mejor descansar
 * el hero en copy + CTAs a esos anchos.
 *
 * La pieza visual del lado derecho es un browser con un dashboard
 * skeleton dentro (sidebar + topbar + stats + chart + table). Ver
 * el doc-comment de `<WebsiteSkeleton>` para por qué skeleton en
 * lugar de un screenshot o un meta-mockup del sitio.
 *
 * Notas:
 *   · El subhead NO repite "Desarrollador Frontend" porque ya está
 *     en el H1 inmediatamente arriba; abre directo con el valor que
 *     entrego ("aplicaciones escalables y de alto rendimiento") y
 *     aterriza en el stack + el cómo (arquitectura, APIs, migración).
 *   · Sin "X años de experiencia" en el hero — los stats numéricos
 *     viven en Sobre mí. Acá la seniority se prueba con el peso del
 *     vocabulario ("escalables", "alto rendimiento", "migración de
 *     plataformas"), no con un número que compite con el H1.
 *   · El stack del marquee se limita a las 5 tecnologías que uso
 *     hoy (no a herramientas de infra como Vercel/Vite/Git que no
 *     son lenguajes ni frameworks que el cliente compre).
 */
export function Hero() {
  // Stack del marquee — sólo las tecnologías que el cliente
  // efectivamente está contratando. Vercel/Git/Vite son
  // herramientas de mi flujo, no del entregable, y diluyen.
  // Los iconos vienen de react-icons/si (Simple Icons, CC0).
  const marqueeStack: readonly MarqueeItem[] = [
    { label: "Next.js", Icon: SiNextdotjs },
    { label: "Angular", Icon: SiAngular },
    { label: "TypeScript", Icon: SiTypescript },
    { label: "React", Icon: SiReact },
    { label: "Tailwind", Icon: SiTailwindcss },
  ];

  const directChannels = [
    {
      label: "WhatsApp",
      href: contactLinks.whatsapp,
      icon: WhatsAppIcon,
      external: true,
    },
    {
      label: "Email",
      href: contactLinks.email,
      icon: Mail,
      external: false,
    },
    {
      label: "LinkedIn",
      href: contactLinks.linkedin,
      icon: LinkedInIcon,
      external: true,
    },
  ];

  return (
    <section
      id="inicio"
      className="relative isolate overflow-hidden pt-10 pb-6 sm:pt-12 sm:pb-10 lg:pt-16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid opacity-70"
      />

      <div className="container-site">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
          {/* COPY column — centrado en mobile/tablet, asimétrico
              alineado a la izquierda desde lg+. El switch va por
              text-align en el bloque + justify-content en los flex
              hijos (eyebrow + CTAs + channels). */}
          <div className="text-center lg:col-span-7 lg:text-left">
            <div className="flex justify-center lg:justify-start">
              <Eyebrow>
                {siteConfig.location}
                {siteConfig.available && (
                  <>
                    <span
                      aria-hidden
                      className="mx-1 inline-block h-[10px] w-px bg-foreground/20 align-middle"
                    />
                    <span className="text-foreground/85">Disponible</span>
                  </>
                )}
              </Eyebrow>
            </div>

            <h1 className="mt-6 font-display text-[clamp(2.6rem,7vw,5rem)] leading-[1.02] tracking-[-0.035em] text-foreground-strong">
              Hola, soy{" "}
              <em className="italic font-normal text-foreground/85">
                {siteConfig.shortName}
              </em>
              .
              <br />
              Desarrollador{" "}
              <MarkerHighlight>Frontend</MarkerHighlight>.
            </h1>

            <p className="mx-auto mt-7 max-w-xl text-[17px] leading-relaxed text-muted-foreground sm:text-[18px] lg:mx-0">
              Aplicaciones web escalables y de alto rendimiento en{" "}
              <strong className="font-semibold text-foreground">Angular</strong>,{" "}
              <strong className="font-semibold text-foreground">TypeScript</strong>,{" "}
              <strong className="font-semibold text-foreground">Next.js</strong> y{" "}
              <strong className="font-semibold text-foreground">Tailwind</strong>.
              Arquitectura modular, integración con APIs y migración de
              plataformas — colaborando con equipos remotos en US.
            </p>

            {/* CTAs principales */}
            <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
              <Link
                href="#contacto"
                className={cn(buttonVariants({ variant: "ink", size: "xl" }))}
              >
                Hablemos
                <ArrowUpRight aria-hidden />
              </Link>
              <Link
                href="#portafolio"
                className={cn(buttonVariants({ variant: "outline", size: "xl" }))}
              >
                <FolderOpen aria-hidden />
                Ver portafolio
              </Link>
            </div>

            {/* Canales directos — fila editorial que ancla los CTAs.
                Centrada en mobile/tablet, alineada a la izquierda en
                desktop. El separador y el hint de respuesta se
                ocultan en mobile (gana ruido) y aparecen desde sm+. */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 text-[13.5px] text-muted-foreground lg:justify-start">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle-foreground">
                O directo en
              </span>
              {directChannels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <a
                    key={channel.label}
                    href={channel.href}
                    target={channel.external ? "_blank" : undefined}
                    rel={channel.external ? "noopener noreferrer" : undefined}
                    className="group inline-flex items-center gap-1.5 text-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
                  >
                    <Icon
                      aria-hidden
                      className="size-3.5 text-foreground/55 transition-colors group-hover:text-foreground"
                    />
                    <span className="underline-offset-4 group-hover:underline">
                      {channel.label}
                    </span>
                  </a>
                );
              })}
              <span
                aria-hidden
                className="hidden h-3 w-px bg-foreground/15 sm:inline-block"
              />
              <span className="hidden text-[12px] italic text-subtle-foreground sm:inline">
                respondo en menos de 24 h hábiles
              </span>
            </div>
          </div>

          {/* MOCKUP column — sólo desktop (lg+).
              En mobile/tablet la ocultamos: cuando el mockup queda
              "solo, abajo, centrado" sin la copy al lado, se siente
              desconectado y mete altura sin aportar narrativa. El
              hero a esos anchos descansa en el copy + CTAs, que es
              suficiente para el primer impacto. */}
          <div className="hidden lg:col-span-5 lg:block">
            <HeroComposition />
          </div>
        </div>
      </div>

      {/* Scroll cue — link al ancla siguiente. Va ENTRE el bloque
          principal y el marquee porque visualmente cierra el hero
          ("hay más abajo, seguí") antes de que aparezca la banda
          decorativa del stack. Si fuera después del marquee, el
          marquee se sentiría como "final" y la cue como un PS
          tardío. */}
      <div className="container-site mt-10 flex justify-center sm:mt-14">
        <a
          href="#sobre-mi"
          aria-label="Continuar a Sobre mí"
          className="group inline-flex flex-col items-center gap-2 text-subtle-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
        >
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em]">
            seguir
          </span>
          <ChevronDown
            aria-hidden
            className="size-4 text-foreground/55 transition-colors motion-safe:animate-[bounce-cue_1.8s_ease-in-out_infinite] group-hover:text-foreground"
          />
        </a>
      </div>

      {/* Marquee de stack — banda full-bleed que cierra el hero
          visualmente. Va por fuera del `container-site` a propósito
          para que el fade lateral del mask-image se sienta correcto
          full-bleed. */}
      <div className="mt-12 sm:mt-14">
        <div className="border-y border-border bg-surface-elevated/60">
          <TechMarquee items={marqueeStack} />
        </div>
      </div>
    </section>
  );
}

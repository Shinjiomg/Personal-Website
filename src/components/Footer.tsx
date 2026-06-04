import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";

import { GitHubIcon } from "@/components/icons/GitHubIcon";
import { LinkedInIcon } from "@/components/icons/LinkedInIcon";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { siteConfig } from "@/lib/site-config";
import { contactLinks } from "@/lib/contact-links";
import { footerSections } from "@/data/navigation";

/**
 * Footer editorial de 2 capas — versión "calma" del patrón Orinoco
 * (PLAYBOOK §13), sin la capa CTA full-bleed que iba arriba:
 *
 *   1. Grid informativo (off-white) en 3 columnas:
 *        · Marca (portrait + logo + manifesto + meta)
 *        · Explora (nav onepage — todos anchors interceptados por
 *          la delegación del `useOnepageNavigation` en `<Nav>`)
 *        · Conectar (email · WhatsApp · GitHub · LinkedIn)
 *      Breakpoints:
 *        - mobile: 1 col (todo apilado)
 *        - sm/md (tablet): Marca a ancho completo arriba, Explora +
 *          Conectar 50/50 abajo. Evita que Conectar quede huérfano
 *          en una segunda fila con la mitad derecha vacía.
 *        - lg+ (desktop): 3 cols desbalanceadas 5/3/4 sobre 12 — la
 *          marca toma más respiro.
 *   2. Legal line en bg-surface-elevated/60 — sólo copyright + meta.
 *      SIN "Built with Next.js · Vercel".
 *
 * Decisiones intencionales:
 *   · **Portrait en la columna marca** (square rounded-2xl, top-of-col)
 *     — acto "sign-off" editorial: el portafolio es de una persona,
 *     no de una agencia. El retrato pega arriba del wordmark (no
 *     inline) para no competir con el lockup tipográfico y darle
 *     peso de "byline".
 *   · Sin sección "Visita" (no es un local físico con dirección).
 *   · Sin capa CTA dark a tope — se retiró deliberadamente.
 *   · Sin "Sitio diseñado por X" — el portafolio ES la pieza.
 *
 * Footer queda como Server Component — no necesita estado ni onClick
 * propio. El `<Nav>` monta una vez `useOnepageNavigation` que aplica
 * delegación global de clicks sobre `document`, capturando también los
 * anchors de este footer. Bajo coste de re-renders.
 */
export function Footer() {
  const year = new Date().getFullYear();
  const navSection = footerSections.find((s) => s.title === "Navegación");

  return (
    <footer className="border-t border-border bg-background">
      {/* ─── Capa 1: grid informativo (off-white) ─────────────────── */}
      <div className="container-site grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 sm:gap-12 lg:grid-cols-12 lg:gap-10 lg:py-16">
        {/* Marca — col más ancha. Layout horizontal: portrait a la
            izquierda, wordmark + manifesto + chip a la derecha. El
            portrait fijo (`shrink-0`) no se deforma cuando el copy
            crece. `items-start` alinea por baseline tipográfica del
            wordmark, no por centro de la imagen — más editorial. */}
        <div className="flex items-start gap-5 sm:col-span-2 sm:gap-6 lg:col-span-5">
          {/* Portrait — square rounded para tono editorial (vs. el
              circle típico de social-avatar). Ring sutil para
              separarlo del fondo off-white sin tirar shadow.
              `shrink-0` impide que se comprima al lado del texto. */}
          <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl ring-1 ring-foreground/10 sm:size-[88px]">
            <Image
              src="/team/jhonatan-becerra.webp"
              alt={`Retrato de ${siteConfig.name}`}
              fill
              sizes="88px"
              className="object-cover"
              priority={false}
            />
          </div>

          {/* Stack derecho — wordmark, manifesto, chip de meta.
              `min-w-0` permite que el manifesto haga wrap correcto
              al lado del portrait sin pelearse por ancho. */}
          <div className="min-w-0 flex-1">
            <Link
              href="#inicio"
              aria-label={`${siteConfig.name} — Inicio`}
              className="group inline-flex items-baseline gap-[0.22em] font-display text-[22px] font-medium leading-none tracking-[-0.022em] text-foreground-strong transition-opacity hover:opacity-90 sm:text-[26px]"
            >
              {siteConfig.wordmark}
              <span
                aria-hidden
                className="inline-block size-[7px] translate-y-[1px] rounded-full bg-[var(--accent)] transition-transform duration-300 ease-out group-hover:scale-110"
              />
            </Link>

            <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed text-muted-foreground">
              {siteConfig.shortDescription} Desde {siteConfig.location} para
              LATAM y remoto.
            </p>

            {/* Chip de meta — location + disponibilidad.
             *  mobile: stack vertical, separador oculto (cuando los
             *  items wrappean, el `|` quedaba huérfano al final de
             *  la línea de Bogotá).
             *  sm+: inline con separador, comportamiento original. */}
            <div className="mt-4 flex flex-col gap-1.5 text-[12px] text-subtle-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-1">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden className="brand-dot" />
                {siteConfig.location}
              </span>
              {siteConfig.available && (
                <>
                  <span
                    aria-hidden
                    className="hidden h-[10px] w-px bg-foreground/15 sm:inline-block"
                  />
                  <span>Disponible para nuevos proyectos</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Explora — nav del site (todos anchors onepage). */}
        {navSection && (
          <nav aria-labelledby="footer-explore" className="sm:col-span-1 lg:col-span-3">
            <h3
              id="footer-explore"
              className="flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-subtle-foreground"
            >
              <span aria-hidden className="h-px w-6 bg-foreground/25" />
              Explora
            </h3>
            <ul className="mt-5 flex flex-col gap-3 text-[14px]">
              {navSection.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group relative inline-block text-foreground/75 transition-colors hover:text-foreground"
                  >
                    {link.label}
                    <span
                      aria-hidden
                      className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 rounded-full bg-[var(--accent)] transition-transform duration-300 ease-out group-hover:scale-x-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Conectar — canales con icono + label.
            Email/WhatsApp llevan el dato útil; GitHub/LinkedIn el
            handle. Mismo patrón que Orinoco col "Contacto". */}
        <div className="sm:col-span-1 lg:col-span-4">
          <h3 className="flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-subtle-foreground">
            <span aria-hidden className="h-px w-6 bg-foreground/25" />
            Conectar
          </h3>
          <ul className="mt-5 flex flex-col gap-3 text-[14px]">
            <ConnectItem
              href={contactLinks.email}
              icon={Mail}
              label={siteConfig.contact.email}
              stroke
            />
            <ConnectItem
              href={contactLinks.whatsapp}
              icon={WhatsAppIcon}
              label={siteConfig.contact.whatsappDisplay}
              external
            />
            <ConnectItem
              href={contactLinks.github}
              icon={GitHubIcon}
              label={`GitHub · ${siteConfig.social.githubHandle}`}
              external
            />
            <ConnectItem
              href={contactLinks.linkedin}
              icon={LinkedInIcon}
              label={`LinkedIn · ${siteConfig.social.linkedinHandle}`}
              external
            />
          </ul>
        </div>
      </div>

      {/* ─── Capa 2: legal line (slight elevation) ─────────────────
          Sin "Built with X" ni hint de respuesta. Una sola row con
          copyright + meta. Centrada en mobile, alineada izquierda en
          sm+ para que el dato no quede flotando solo en el centro
          desperdiciando ancho. */}
      <div className="border-t border-border bg-surface-elevated/60">
        <div className="container-site py-5 text-center text-[12px] text-subtle-foreground sm:text-left">
          <p>
            © {year} {siteConfig.name}
            <span
              aria-hidden
              className="mx-2 inline-block size-1 rounded-full align-middle bg-[var(--accent)]"
            />
            {siteConfig.location}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * ConnectItem — fila de la columna "Conectar".
 *
 * `external` agrega target/rel para WhatsApp/GitHub/LinkedIn — los
 * mailto no necesitan target (abren cliente nativo, no pestaña).
 * `stroke` activa strokeWidth para iconos lucide (Mail) — los
 * custom icons (WhatsApp, GitHub, LinkedIn) usan fill y la prop
 * sería ignorada de todas formas, pero la mantengo opt-in para no
 * pasarla cuando no aplica.
 * ──────────────────────────────────────────────────────────────── */

function ConnectItem({
  href,
  label,
  icon: Icon,
  external = false,
  stroke = false,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  external?: boolean;
  stroke?: boolean;
}) {
  return (
    <li>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="group inline-flex items-center gap-2.5 text-foreground/80 transition-colors hover:text-foreground"
      >
        <Icon
          aria-hidden
          className="size-4 text-foreground/45 transition-colors group-hover:text-foreground"
          {...(stroke ? { strokeWidth: 1.75 } : {})}
        />
        <span className="relative">
          {label}
          <span
            aria-hidden
            className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 rounded-full bg-foreground transition-transform duration-300 ease-out group-hover:scale-x-100"
          />
        </span>
      </a>
    </li>
  );
}

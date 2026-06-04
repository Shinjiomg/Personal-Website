"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Logo } from "./Logo";
import { LocaleSwitch } from "./LocaleSwitch";
import { buttonVariants } from "@/components/ui/button";
import { navLinks, type NavLink } from "@/data/navigation";
import { useOnepageNavigation } from "@/hooks/useOnepageNavigation";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * Header del portafolio.
 *
 * Decisiones clave:
 *  - **Onepage real**. Todos los items del nav son anchors a secciones
 *    del home. El "activo" lo decide el scroll-spy del hook
 *    `useOnepageNavigation` (no el pathname).
 *  - **Clean URL**. El mismo hook intercepta TODOS los clicks a anchors
 *    del árbol (delegación global en document) y re-escribe la URL
 *    sin el `#`. Por eso ningún `<Link href="#...">` necesita onClick.
 *  - Logo tipográfico (Fraunces + lima dot). Apunta a `#inicio` (id del
 *    Hero), interceptado por la misma delegación → smooth scroll al
 *    tope sin agregar hash a la URL.
 *  - Indicador de activo = punto lima al lado del label (sin pills,
 *    sin underlines, sin gradientes).
 *  - **Estado scrolled**: hairline lima + backdrop blur fuerte + altura
 *    comprimida (72px → 56px) + logo colapsa a su variante compact.
 *  - Mobile: drawer right-side con AnimatePresence + body lock.
 */
export function Nav() {
  const t = useTranslations("Nav");
  const tCommon = useTranslations("Common");
  const pathname = usePathname();
  const { activeId } = useOnepageNavigation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close drawer on route change. React 19 "store-prev-during-render"
   * pattern — un setState menos que useEffect → setState. */
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    if (menuOpen) setMenuOpen(false);
  }

  /* Body scroll lock + esc handler — sólo cuando el drawer está abierto. */
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div className="sticky top-0 z-40">
      <header
        className={cn(
          "relative w-full transition-[background-color,border-color,backdrop-filter] duration-200",
          scrolled
            ? "border-b border-border bg-background/85 backdrop-blur-xl"
            : "border-b border-transparent bg-background/50 backdrop-blur-sm",
        )}
      >
        {/* Row con altura animada. Comprimimos ~16px al hacer scroll
            para liberar viewport sin perder legibilidad. */}
        <div
          className={cn(
            "container-site flex items-center justify-between gap-6 transition-[height] duration-200 ease-out",
            scrolled
              ? "h-[52px] sm:h-[56px]"
              : "h-[68px] sm:h-[72px]",
          )}
        >
          {/* Logo → #inicio (id del Hero). Capturado por la delegación
              del hook → smooth scroll al top sin agregar hash. */}
          <Logo href="#inicio" variant={scrolled ? "compact" : "full"} />

          {/* Desktop nav — texto suelto, sin pills. */}
          <nav
            aria-label={t("ariaLabel")}
            className="hidden lg:block"
          >
            <ul className="flex items-center gap-9">
              {navLinks.map((link) => (
                <NavItem
                  key={link.href}
                  link={link}
                  label={t(`items.${link.key}`)}
                  activeId={activeId}
                />
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Locale switch — `ES | EN`. Desktop only en este slot
                para no encimarlo con el CTA en mobile/tablet (donde el
                drawer tiene su propio switch en el footer interno). */}
            <LocaleSwitch className="hidden lg:inline-flex" />

            {/* CTA primaria — al anchor #contacto. Interceptada por
                la delegación. En scrolled bajamos a size="sm" para
                acompañar la compresión del row. */}
            <Link
              href="#contacto"
              className={cn(
                buttonVariants({ variant: "ink", size: scrolled ? "sm" : "md" }),
                "hidden sm:inline-flex",
              )}
            >
              {tCommon("ctaTalk")}
              <ArrowUpRight aria-hidden />
            </Link>

            {/* Mobile/tablet trigger — también se acompaña la compresión. */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? t("closeMenuLabel") : t("openMenuLabel")}
              aria-expanded={menuOpen}
              aria-controls="site-mobile-drawer"
              className={cn(
                "inline-flex items-center justify-center rounded-full border border-foreground/15 text-foreground transition-[background-color,border-color,height,width] duration-200 hover:border-foreground/40 hover:bg-foreground/[0.04] lg:hidden",
                scrolled ? "h-9 w-9" : "h-10 w-10",
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen ? (
                  <motion.span
                    key="x"
                    initial={{ rotate: -45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 45, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex"
                  >
                    <X className="h-4 w-4" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -45, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex"
                  >
                    <Menu className="h-4 w-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Hairline lima accent — fade-in al scrollear. Sustituye el
            border solid y agrega la firma de marca al chrome del nav. */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent transition-opacity duration-300",
            scrolled ? "opacity-100" : "opacity-0",
          )}
        />
      </header>

      {/* Mobile drawer — siempre right-side, body scroll locked. */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              key="drawer"
              id="site-mobile-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-0 z-50 flex h-dvh w-[min(360px,92vw)] flex-col border-l border-border bg-background shadow-2xl lg:hidden"
              aria-label={t("drawerAriaLabel")}
            >
              <div className="flex h-[68px] items-center justify-between border-b border-border px-5">
                {/* onClick acá sólo cierra el drawer — el scroll lo
                    hace la delegación. preventDefault del delegate no
                    bloquea a este handler (corre en bubble). */}
                <Logo
                  href="#inicio"
                  onClick={() => setMenuOpen(false)}
                />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label={t("closeMenuLabel")}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer body — links grandes en Fraunces. Más vibe
                  editorial que el patrón "lista compacta" típico. */}
              <nav
                aria-label={t("ariaLabel")}
                className="flex-1 overflow-y-auto px-5 py-6"
              >
                <ul className="flex flex-col gap-1">
                  {navLinks.map((link, i) => {
                    const isActive = activeId === link.href.slice(1);
                    return (
                      <li
                        key={link.href}
                        style={{ animationDelay: `${0.06 + i * 0.04}s` }}
                        className="opacity-0 animate-[fade-up_0.4s_ease-out_forwards]"
                      >
                        <Link
                          href={link.href}
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => setMenuOpen(false)}
                          className="group flex items-baseline justify-between gap-3 rounded-lg px-2 py-3 font-display text-[28px] font-medium leading-none tracking-[-0.02em] text-foreground transition-colors hover:text-foreground"
                        >
                          <span className="relative">
                            {t(`items.${link.key}`)}
                            <span
                              aria-hidden
                              className={cn(
                                "absolute -right-3 top-1 inline-block size-1.5 rounded-full bg-[var(--accent)] transition-opacity duration-200",
                                isActive
                                  ? "opacity-100"
                                  : "opacity-0 group-hover:opacity-100",
                              )}
                            />
                          </span>
                          <ArrowUpRight
                            aria-hidden
                            className="size-4 translate-y-[2px] text-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-foreground/70"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="space-y-3 border-t border-border p-5">
                <Link
                  href="#contacto"
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    buttonVariants({ variant: "ink", size: "xl" }),
                    "w-full",
                  )}
                >
                  {tCommon("ctaTalk")}
                  <ArrowUpRight aria-hidden />
                </Link>
                {/* Locale switch dentro del drawer — alineado con el
                    CTA y por encima del meta line, para que el cambio
                    de idioma esté siempre a 1 tap del bottom-right thumb. */}
                <div className="flex justify-center pt-1">
                  <LocaleSwitch />
                </div>
                <p className="text-center text-[11px] text-subtle-foreground">
                  {siteConfig.location}
                  <span aria-hidden className="mx-1.5 text-foreground/25">
                    ·
                  </span>
                  {tCommon("responseHint")}
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * NavItem — link individual del desktop nav.
 *
 * `activeId` viene del scroll-spy; comparamos contra el slug del href
 * (sin el `#`). El punto lima crece cuando está activo o en hover.
 * No usamos onClick — la delegación global del hook se encarga.
 */
function NavItem({
  link,
  label,
  activeId,
}: {
  link: NavLink;
  label: string;
  activeId: string | null;
}) {
  const active = activeId === link.href.slice(1);

  return (
    <li>
      <Link
        href={link.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative inline-flex items-center gap-1.5 py-1 font-sans text-[14px] font-medium transition-colors",
          active ? "text-foreground" : "text-foreground/65 hover:text-foreground",
        )}
      >
        {label}
        <span
          aria-hidden
          className={cn(
            "size-1.5 rounded-full bg-[var(--accent)] transition-all duration-200",
            active
              ? "opacity-100 scale-100"
              : "opacity-0 scale-50 group-hover:opacity-70 group-hover:scale-100",
          )}
        />
      </Link>
    </li>
  );
}

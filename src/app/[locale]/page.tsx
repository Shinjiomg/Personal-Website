import { setRequestLocale } from "next-intl/server";

import { About } from "@/components/home/About";
import { Contact } from "@/components/home/Contact";
import { Experience } from "@/components/home/Experience";
import { Hero } from "@/components/home/Hero";
import { Portfolio } from "@/components/home/Portfolio";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

/**
 * Home one-page. Cinco secciones, en orden narrativo:
 *
 *   #inicio (Hero) → #sobre-mi → #experiencia → #portafolio → #contacto
 *
 * El orden de IDs matchea `sectionIds` en `data/navigation.ts`, que
 * a su vez maneja el scroll-spy del header via `useOnepageNavigation`.
 * Cambiar el orden acá implica reordenar también en navigation.
 *
 * `setRequestLocale(locale)`:
 *   Habilita static rendering en componentes server-side. Sin este
 *   call, los componentes que invoquen `useTranslations` o
 *   `getTranslations` opt-out de prerender → cada visit dispara
 *   un render dinámico. Con este call, ambos locales (es y en) se
 *   prerendean a build time.
 */
type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <About />
      <Experience />
      <Portfolio />
      <Contact />
    </>
  );
}

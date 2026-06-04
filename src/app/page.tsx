import { About } from "@/components/home/About";
import { Contact } from "@/components/home/Contact";
import { Experience } from "@/components/home/Experience";
import { Hero } from "@/components/home/Hero";
import { Portfolio } from "@/components/home/Portfolio";

/**
 * Home one-page. Cinco secciones, en orden narrativo:
 *
 *   #inicio (Hero) → #sobre-mi → #experiencia → #portafolio → #contacto
 *
 * El orden de IDs matchea `sectionIds` en `data/navigation.ts`, que
 * a su vez maneja el scroll-spy del header via `useOnepageNavigation`.
 * Cambiar el orden acá implica reordenar también en navigation.
 */
export default function HomePage() {
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

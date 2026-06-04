/**
 * Navegación del portafolio.
 *
 * Onepage real: TODOS los items son anchors de secciones del home.
 * No hay `/portafolio` como ruta dedicada — el case-by-case del
 * portafolio vive dentro de la sección `#portafolio`, y los casos
 * profundos cuando existan irán como sub-secciones expandibles o
 * en una sub-ruta separada (e.g. `/casos/[slug]`). Mientras tanto,
 * mantener TODO bajo el home permite que el scroll-spy del Nav
 * funcione sin condicionales por `pathname`.
 *
 * `href` está tipado como `#${string}` para que el compiler bloquee
 * accidentalmente agregar una ruta absoluta acá.
 */
export type NavLink = {
  readonly href: `#${string}`;
  readonly label: string;
};

export const navLinks: readonly NavLink[] = [
  { href: "#sobre-mi", label: "Sobre mí" },
  { href: "#experiencia", label: "Experiencia" },
  { href: "#portafolio", label: "Portafolio" },
  { href: "#contacto", label: "Contacto" },
] as const;

/**
 * IDs de las secciones del home en orden de aparición. Se deriva de
 * `navLinks` para que un cambio en el nav se refleje automáticamente
 * en el scroll-spy. Nunca hardcodear esta lista en otro archivo.
 */
export const sectionIds: readonly string[] = navLinks.map((l) =>
  l.href.slice(1),
);

/**
 * Footer comparte la misma fuente de verdad. Usar los mismos hrefs
 * que `navLinks` asegura que el scroll-spy reaccione igual cuando
 * el usuario navega desde el footer.
 */
export const footerSections = [
  {
    title: "Navegación",
    links: navLinks.map((l) => ({ href: l.href, label: l.label })),
  },
] as const;

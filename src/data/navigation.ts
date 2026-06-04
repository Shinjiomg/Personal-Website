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
 * i18n note:
 *   Los IDs de sección (`#sobre-mi`, `#experiencia`, etc.) se
 *   mantienen en español para AMBOS locales. No aparecen en la
 *   URL (el `useOnepageNavigation` los strippea), funcionan solo
 *   como anchors internos. Mantenerlos en una sola convención
 *   evita tener que rehacer todo el scroll-spy + section IDs
 *   por cada locale extra. Cambia `label` por `key` que mapea al
 *   namespace `Nav.items.*` en `messages/*.json`.
 */
export type NavLinkKey = "about" | "experience" | "portfolio" | "contact";

export type NavLink = {
  readonly href: `#${string}`;
  readonly key: NavLinkKey;
};

export const navLinks: readonly NavLink[] = [
  { href: "#sobre-mi", key: "about" },
  { href: "#experiencia", key: "experience" },
  { href: "#portafolio", key: "portfolio" },
  { href: "#contacto", key: "contact" },
] as const;

/**
 * IDs de las secciones del home en orden de aparición. Se deriva de
 * `navLinks` para que un cambio en el nav se refleje automáticamente
 * en el scroll-spy. Nunca hardcodear esta lista en otro archivo.
 */
export const sectionIds: readonly string[] = navLinks.map((l) =>
  l.href.slice(1),
);

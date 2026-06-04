/**
 * Experiencia profesional — fuente única de verdad para la sección
 * `<Experience />`. Datos editables sin tocar el componente.
 *
 * Convenciones:
 *   · Orden: del más reciente al más antiguo, por fecha de inicio.
 *     Trillium queda #01 (ongoing). DataScoring antes que Janover
 *     porque comparten Ene 2025 de inicio pero DataScoring terminó
 *     más tarde.
 *   · `start` / `end`: formato "Mmm AAAA" en español ("Ene 2025",
 *     "Feb 2026"). `end: "Presente"` marca rol activo.
 *   · `stack`: ordenado por prominencia en el job (no alfabético) —
 *     el primero es la tech principal. Máx ~5 entradas para no
 *     romper el visual de los chips en la lista.
 *   · `summary`: 1–2 líneas, lede editorial. Mencionar impacto
 *     concreto (% mejora, # proyectos, etc.) cuando aplique.
 *   · `highlights`: 3 items (idealmente) que se renderizan como
 *     metric strip — `value` corto y headline (mono o número),
 *     `label` mono uppercase con el contexto. No los uses como
 *     resumen — son headlines que el summary expande.
 *   · `url`: opcional — si la empresa/producto tiene web pública
 *     el componente puede renderizar un link-out (no usado por
 *     defecto en esta iteración para mantener la lista limpia).
 */
export type ExperienceJob = {
  readonly company: string;
  readonly role: string;
  readonly start: string;
  readonly end: string;
  readonly stack: readonly string[];
  readonly summary: string;
  readonly url?: string;
  readonly highlights?: readonly {
    readonly value: string;
    readonly label: string;
  }[];
};

export const experience: readonly ExperienceJob[] = [
  {
    company: "Trillium Digital Services",
    role: "Frontend Developer",
    start: "Feb 2026",
    end: "Presente",
    stack: ["React", "Microfrontends", "REST APIs"],
    summary:
      "Microfrontends con React y consumo de APIs internas para features nuevos. Lidero al equipo frontend manteniendo código limpio y buenas prácticas en la UI interna.",
    highlights: [
      { value: "Lead", label: "Del frontend team" },
      { value: "React 19", label: "Stack principal" },
      { value: "Remote", label: "Equipo en US" },
    ],
  },
  {
    company: "DataScoring",
    role: "Angular Frontend Developer",
    start: "Ene 2025",
    end: "Mar 2026",
    stack: ["Angular", "TypeScript", "RxJS", "REST APIs"],
    summary:
      "Migración progresiva de una plataforma legacy a Angular — aporté +90% del trabajo de migración, mejorando significativamente page speed, UX y tiempo de mantenimiento.",
    highlights: [
      { value: "+90%", label: "De la migración" },
      { value: "Angular", label: "Legacy → moderno" },
      { value: "14m", label: "Duración total" },
    ],
  },
  {
    company: "Janover Ventures",
    role: "Web Developer · Technical SEO",
    start: "Ene 2025",
    end: "Ene 2026",
    stack: ["Vue", "Nuxt", "Astro", "Hygraph", "SEO"],
    summary:
      "Componentes Vue/Nuxt y landings en Astro con Hygraph (headless CMS). A/B testing con producto y SEO técnico — metadata estructurada, sitemaps dinámicos y robots.",
    highlights: [
      { value: "A/B", label: "Tests con producto" },
      { value: "SEO", label: "Técnico avanzado" },
      { value: "Multi", label: "Vue · Nuxt · Astro" },
    ],
  },
  {
    company: "VMO Central SAS",
    role: "Angular Web Developer",
    start: "May 2023",
    end: "Feb 2024",
    stack: ["Angular", "TypeScript", "SASS", "REST APIs"],
    summary:
      "Componentes reusables, integración de APIs REST y diseño responsive/accesible. Mejoré el rendimiento de la aplicación en ~20% optimizando código y recursos.",
    highlights: [
      { value: "+20%", label: "Performance mejorada" },
      { value: "Angular", label: "+ SASS + APIs" },
      { value: "10m", label: "Duración" },
    ],
  },
  {
    company: "Freelance",
    role: "Web Developer",
    start: "Feb 2022",
    end: "Jun 2024",
    stack: ["React", "Vue", "PHP", "HTML/CSS", "Unity"],
    summary:
      "Sitios a medida con React, Vue y PHP, más videojuegos 2D en Unity y GameMaker Studio 2. 5 proyectos web entregados con alta satisfacción de cliente.",
    highlights: [
      { value: "5+", label: "Proyectos web" },
      { value: "Multi", label: "React · Vue · PHP" },
      { value: "Juegos 2D", label: "Unity · GameMaker" },
    ],
  },
] as const;

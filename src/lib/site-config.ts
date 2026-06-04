/**
 * Single source of truth del portafolio de Jhonatan.
 *
 * Cualquier dato que cambia con la realidad (rol actual, email, número
 * de WhatsApp, copy del manifesto, lista de skills) vive acá — los
 * componentes lo importan y nunca hardcodean. Cuando el rol cambie,
 * acá se actualiza una sola vez.
 *
 * Excluimos deliberadamente la lista de proyectos del portafolio:
 * vive en `src/data/portfolio.ts` porque crece y se reordena con
 * frecuencia distinta a la del config global.
 */
export const siteConfig = {
  name: "Jhonatan Becerra",
  shortName: "Jhonatan",
  /** Wordmark usado en logo/header — separado para iterar el lockup
   * sin tocar el `name` que va en metadata y schema.org. */
  wordmark: "Jhonatan Becerra",
  tagline: "Desarrollador Frontend",
  longTagline: "Desarrollador Frontend · Next.js, Angular, TypeScript",
  description:
    "Desarrollador frontend con más de 3 años construyendo interfaces que se sienten bien y se mantienen mejor. Especializado en Next.js, Angular y TypeScript.",
  shortDescription:
    "Construyo interfaces que se sienten bien y se mantienen mejor.",
  url: "https://jhonatanbecerra.dev",
  locale: "es-CO",
  location: "Bogotá, Colombia",
  available: true,
  yearsOfExperience: 3,
  contact: {
    email: "yonkitas9@gmail.com",
    emailSubject: "Hola Jhonatan",
    emailBody:
      "Hola Jhonatan,\n\nTe escribo porque:\n\n— Sobre mí / empresa:\n— Lo que necesito:\n— Plazos:\n\nGracias.",
    whatsapp: "+573015703750",
    whatsappDisplay: "+57 301 570 3750",
    whatsappPrefill:
      "Hola Jhonatan, vi tu portafolio y quería contactarte sobre un proyecto.",
  },
  social: {
    github: "https://github.com/shinjiomg",
    githubHandle: "@shinjiomg",
    linkedin:
      "https://www.linkedin.com/in/jhonatandavidbecerradonado-frontend/",
    linkedinHandle: "Jhonatan Becerra",
  },
  /**
   * Stack actual — el orden refleja la realidad operativa de hoy,
   * no la nostalgia. Next.js arriba porque es lo que estoy usando
   * para todo lo nuevo; Angular se queda alto porque es el daily
   * driver en clientes y migraciones. Astro queda fuera del top
   * tier — la decisión del estudio (Pagetook playbook) es Next.js
   * para todo, y la herramienta del portafolio sigue el mismo
   * estándar.
   */
  stack: {
    primary: ["Next.js", "Angular", "TypeScript", "React"],
    styling: ["Tailwind CSS", "SASS"],
    runtime: ["Node.js", "Vercel"],
    tools: ["Git", "Vite"],
  },
} as const;

export type SiteConfig = typeof siteConfig;

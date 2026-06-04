/**
 * Experiencia profesional — metadata técnica (locale-independent).
 *
 * Esta fuente de verdad **NO contiene strings traducibles**. Los campos
 * traducibles (role, summary, highlights) viven en `messages/<locale>.json`
 * bajo el namespace `ExperienceData`, indexados por `id`. El hook
 * `useExperienceJobs()` los compone en runtime con la locale activa.
 *
 * Convenciones:
 *   · `id`: slug estable usado para indexar los messages (NO renombrar
 *     sin actualizar `messages/es.json` + `messages/en.json`).
 *   · `start` / `end`: ISO `YYYY-MM` (mes-año). `end: null` marca rol
 *     activo (el componente muestra "Presente" / "Present" según locale).
 *   · `stack`: nombres de tech — universales, no se traducen.
 *   · `company`: nombre propio — universal, no se traduce.
 *   · `url`: opcional, link a la empresa/producto.
 *
 * El orden del array define el orden visual (más reciente arriba).
 */
export type ExperienceJobMeta = {
  readonly id: string;
  readonly company: string;
  readonly start: string;
  readonly end: string | null;
  readonly stack: readonly string[];
  readonly url?: string;
};

export const experienceMeta: readonly ExperienceJobMeta[] = [
  {
    id: "trillium",
    company: "Trillium Digital Services",
    start: "2026-02",
    end: null,
    stack: ["React", "Microfrontends", "REST APIs"],
  },
  {
    id: "datascoring",
    company: "DataScoring",
    start: "2025-01",
    end: "2026-03",
    stack: ["Angular", "TypeScript", "RxJS", "REST APIs"],
  },
  {
    id: "janover",
    company: "Janover Ventures",
    start: "2025-01",
    end: "2026-01",
    stack: ["Vue", "Nuxt", "Astro", "Hygraph", "SEO"],
  },
  {
    id: "vmo",
    company: "VMO Central SAS",
    start: "2023-05",
    end: "2024-02",
    stack: ["Angular", "TypeScript", "SASS", "REST APIs"],
  },
  {
    id: "freelance",
    company: "Freelance",
    start: "2022-02",
    end: "2024-06",
    stack: ["React", "Vue", "PHP", "HTML/CSS", "Unity"],
  },
] as const;

/* Shape "rica" del job una vez compuesto con la locale activa.
 * Es lo que el componente <Experience /> consume y lo que el hook
 * `useExperienceJobs()` devuelve. */
export type ExperienceJob = {
  readonly id: string;
  readonly company: string;
  readonly role: string;
  /** Fecha de inicio formateada según locale (ej. "Ene 2025" / "Jan 2025"). */
  readonly start: string;
  /** Fecha de fin formateada o label "Presente" / "Present" si está activo. */
  readonly end: string;
  /** Inicio en años fraccionales (2025.0 para enero 2025) — para charts. */
  readonly startFraction: number;
  /** Fin en años fraccionales. `null` se resuelve a "ahora". */
  readonly endFraction: number;
  readonly stack: readonly string[];
  readonly summary: string;
  readonly url?: string;
  readonly highlights?: readonly {
    readonly value: string;
    readonly label: string;
  }[];
};

/**
 * Educación formal — metadata técnica (locale-independent).
 *
 * Strings traducibles (`degree`, `institution`, `period` con
 * "Hoy" / "Today") viven en `messages/<locale>.json` bajo el
 * namespace `EducationData`. El hook `useEducation()` los compone.
 *
 * Se renderiza como strip compacta al pie de la sección Experiencia
 * — NO como sección propia. Para un portafolio frontend con seniority,
 * la formación es complemento del bloque "trayectoria" (no compite por
 * aire con la experiencia laboral) y se evalúa por proyectos, no por
 * cartón.
 *
 * `educationDegreesMeta` son los títulos formales (degree, peso fuerte).
 * `educationCertificationsMeta` son cursos / certificaciones online que
 * viven abajo como footnotes muy compactas.
 *
 * `current: true` activa el indicador "Hoy" en la UI (degree en curso).
 *
 * Las instituciones se traducen sólo cuando aplica (Universidad de
 * Cundinamarca queda igual; "Iberoamericana" igual; SENA igual).
 */
export type EducationDegreeMeta = {
  readonly id: string;
  readonly current?: boolean;
};

export const educationDegreesMeta: readonly EducationDegreeMeta[] = [
  { id: "iberoamericana", current: true },
  { id: "cundinamarca" },
  { id: "sena" },
] as const;

export type EducationCertificationMeta = {
  readonly id: string;
};

export const educationCertificationsMeta: readonly EducationCertificationMeta[] = [
  { id: "uxui" },
  { id: "git" },
  { id: "fundamentals" },
] as const;

/* Shape "rica" usada por <Experience /> después de la traducción. */
export type EducationEntry = {
  readonly period: string;
  readonly degree: string;
  readonly institution: string;
  readonly current?: boolean;
};

export type EducationFootnote = {
  readonly label: string;
  readonly degree: string;
  readonly institution: string;
  readonly period: string;
};

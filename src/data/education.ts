/**
 * Educación formal de Jhonatan.
 *
 * Se renderiza como strip compacta al pie de la sección Experiencia
 * — NO como sección propia. Para un portafolio frontend con seniority,
 * la formación es complemento del bloque "trayectoria" (no compite por
 * aire con la experiencia laboral) y se evalúa por proyectos, no por
 * cartón.
 *
 * `educationDegrees` son los títulos formales (degree, peso fuerte).
 * `educationCertifications` son cursos / certificaciones online que
 * viven abajo como footnotes muy compactas — complementan sin diluir
 * el peso visual de los degrees.
 *
 * `current: true` activa el indicador "Hoy" en la UI (degree en curso).
 *
 * Las instituciones se guardan en su forma corta corporal — el contexto
 * colombiano hace que "Iberoamericana" o "Cundinamarca" no necesiten
 * el prefijo "Universidad" para reconocerse, y la lectura en mono
 * uppercase es más limpia. SENA queda como está.
 */
export type EducationEntry = {
  readonly period: string;
  readonly degree: string;
  readonly institution: string;
  readonly current?: boolean;
};

export const educationDegrees: readonly EducationEntry[] = [
  {
    period: "Ago 2024 — Hoy",
    degree: "Ingeniería de Software",
    institution: "Iberoamericana",
    current: true,
  },
  {
    period: "Ago 2018 — May 2022",
    degree: "Tecnólogo en Desarrollo de Software",
    institution: "Universidad de Cundinamarca",
  },
  {
    period: "Feb 2016 — Dic 2017",
    degree: "Técnico en Programación de Software",
    institution: "SENA",
  },
] as const;

/* Footnote shape para extras académicos — cursos y certificaciones
 * que complementan los degrees sin competir por peso visual.
 * Rendered como líneas mono compactas con prefijo `+ <label>`
 * (Curso, Cert) y separadores `·`. Genérico a propósito para que
 * agregar un curso nuevo en el futuro sea una entry más al array
 * sin tocar el tipo. */
export type EducationFootnote = {
  readonly label: string;
  readonly degree: string;
  readonly institution: string;
  readonly period: string;
};

/* Certificaciones · cursos cortos online que firman tracks
 * específicos. Se renderean al pie del strip como footnotes mono
 * uppercase muy compactas — un solo pattern visual (`FootnoteRow`
 * en `Experience.tsx`) los maneja a todos. Para agregar más en el
 * futuro, simplemente extender el array; el componente las mapea
 * automáticamente. Ordenar por fecha desc cuando crezca. */
export const educationCertifications: readonly EducationFootnote[] = [
  {
    label: "Cert",
    degree: "UX/UI y Prototipado Digital",
    institution: "Udemy",
    period: "2022",
  },
  {
    label: "Cert",
    degree: "Git y GitHub Completo De Cero",
    institution: "Udemy",
    period: "2022",
  },
  {
    label: "Cert",
    degree: "Fundamentos de Programación",
    institution: "Udemy",
    period: "2022",
  },
] as const;

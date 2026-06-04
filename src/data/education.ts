/**
 * Educación formal de Jhonatan.
 *
 * Se renderiza como strip compacta al pie de la sección Experiencia
 * — NO como sección propia. Para un portafolio frontend con seniority,
 * la formación es complemento del bloque "trayectoria" (no compite por
 * aire con la experiencia laboral) y se evalúa por proyectos, no por
 * cartón.
 *
 * Los 3 primeros entries son títulos formales (degree). El extra
 * (`educationExtra`, IONIC en UNal) es un curso/proyecto extra-curricular
 * — se renderiza aparte como footnote para no diluir el peso visual de
 * los degrees.
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

/** Curso / proyecto extra-curricular — rendered como footnote, no
 *  como degree para no diluir el peso de los títulos formales arriba. */
export const educationExtra = {
  label: "Curso",
  degree: "Desarrollo Móvil con IONIC",
  institution: "Universidad Nacional",
  period: "2020 — 2022",
} as const;

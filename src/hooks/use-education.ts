"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import {
  educationCertificationsMeta,
  educationDegreesMeta,
  type EducationEntry,
  type EducationFootnote,
} from "@/data/education";

/* ─────────────────────────────────────────────────────────────────
 * useEducation — devuelve degrees + certificaciones traducidos
 * según locale activa.
 *
 * Combina la metadata técnica (`current` flag por degree) con los
 * strings de `EducationData.<id>` en messages.
 * ──────────────────────────────────────────────────────────────── */
export function useEducation(): {
  readonly degrees: readonly EducationEntry[];
  readonly certifications: readonly EducationFootnote[];
} {
  const t = useTranslations("EducationData");

  return useMemo(() => {
    const degrees: readonly EducationEntry[] = educationDegreesMeta.map(
      (meta): EducationEntry => ({
        period: t(`degrees.${meta.id}.period`),
        degree: t(`degrees.${meta.id}.degree`),
        institution: t(`degrees.${meta.id}.institution`),
        current: meta.current,
      }),
    );

    const certifications: readonly EducationFootnote[] =
      educationCertificationsMeta.map(
        (meta): EducationFootnote => ({
          label: t(`certifications.${meta.id}.label`),
          degree: t(`certifications.${meta.id}.degree`),
          institution: t(`certifications.${meta.id}.institution`),
          period: t(`certifications.${meta.id}.period`),
        }),
      );

    return { degrees, certifications };
  }, [t]);
}

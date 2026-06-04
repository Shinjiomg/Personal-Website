"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { projectsMeta, type Project } from "@/data/portfolio";

/* ─────────────────────────────────────────────────────────────────
 * useProjects — devuelve la lista de proyectos para render,
 * combinando metadata técnica + strings traducibles según locale.
 *
 * Memoriza por la función `t` (que cambia al cambiar de idioma)
 * para no recalcular en cada render del componente.
 * ──────────────────────────────────────────────────────────────── */
export function useProjects(): readonly Project[] {
  const t = useTranslations("PortfolioData");

  return useMemo(() => {
    return projectsMeta.map((meta): Project => {
      return {
        slug: meta.slug,
        url: meta.url,
        urlDisplay: meta.urlDisplay,
        period: meta.period,
        stack: meta.stack,
        name: t(`${meta.slug}.name`),
        type: t(`${meta.slug}.type`),
        category: t(`${meta.slug}.category`),
        location: t(`${meta.slug}.location`),
        role: t(`${meta.slug}.role`),
        shortDesc: t(`${meta.slug}.shortDesc`),
        longDesc: readStringArray(t, `${meta.slug}.longDesc`),
        highlights: readStringArray(t, `${meta.slug}.highlights`),
      };
    });
  }, [t]);
}

/**
 * Lee un array de strings de messages usando `t.raw()`. Si el shape
 * no es válido (typo en el JSON), retorna array vacío para no romper
 * el render — el componente se ve limpio aunque sin contenido.
 */
function readStringArray(
  t: ReturnType<typeof useTranslations>,
  key: string,
): readonly string[] {
  try {
    const raw = t.raw(key);
    if (!Array.isArray(raw)) return [];
    return raw.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

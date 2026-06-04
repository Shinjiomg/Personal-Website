"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import {
  experienceMeta,
  type ExperienceJob,
  type ExperienceJobMeta,
} from "@/data/experience";

/* ─────────────────────────────────────────────────────────────────
 * useExperienceJobs — devuelve la lista de jobs lista para render,
 * formateada y traducida para la locale activa.
 *
 * Combina:
 *   · Metadata técnica (`experienceMeta` — slugs, dates ISO, stack)
 *   · Strings traducibles (namespace `ExperienceData` en messages)
 *   · Fechas formateadas con `Intl.DateTimeFormat` según locale
 *   · Fracciones de año para el timeline chart (sin parsing manual)
 *
 * El hook memoriza el resultado por `locale` — el array sólo se
 * recalcula al cambiar de idioma, no en cada render del componente.
 * ──────────────────────────────────────────────────────────────── */
export function useExperienceJobs(): readonly ExperienceJob[] {
  const t = useTranslations("ExperienceData");
  const tSection = useTranslations("Experience");
  const locale = useLocale();

  return useMemo(() => {
    const currentLabel = tSection("currentLabel");

    return experienceMeta.map((meta): ExperienceJob => {
      const start = formatJobDate(meta.start, locale);
      const end = meta.end ? formatJobDate(meta.end, locale) : currentLabel;

      const startFraction = isoToFraction(meta.start);
      const endFraction = meta.end ? isoToFraction(meta.end) : nowFraction();

      const highlights = readHighlights(t, meta.id);

      return {
        id: meta.id,
        company: meta.company,
        url: meta.url,
        role: t(`${meta.id}.role`),
        summary: t(`${meta.id}.summary`),
        start,
        end,
        startFraction,
        endFraction,
        stack: meta.stack,
        highlights,
      };
    });
  }, [locale, t, tSection]);
}

/* ─────────────────────────────────────────────────────────────────
 * Helpers — formato de fechas y conversión a fracciones para charts.
 * ──────────────────────────────────────────────────────────────── */

/**
 * Convierte ISO `YYYY-MM` a string display localizado.
 *
 * Ejemplos:
 *   · "2025-01" + "es" → "ene 2025" → "Ene 2025" (capitalized)
 *   · "2025-01" + "en" → "Jan 2025"
 *
 * Usamos `Intl.DateTimeFormat` con `month: "short"` y capitalizamos
 * la primera letra manualmente porque algunos locales (es-ES, fr-FR)
 * devuelven el mes en lowercase.
 */
function formatJobDate(iso: string, locale: string): string {
  const [yearStr, monthStr] = iso.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr) - 1;
  const d = new Date(year, month, 1);
  const formatted = new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
  }).format(d);
  return capitalize(stripTrailingDot(formatted));
}

/** "ene." → "ene" — algunos navegadores agregan punto al mes corto en es. */
function stripTrailingDot(value: string): string {
  return value.replace(/\.(?=\s|$)/g, "");
}

function capitalize(value: string): string {
  if (!value) return value;
  return value[0]!.toUpperCase() + value.slice(1);
}

/**
 * Convierte ISO `YYYY-MM` a fracción de año para el chart de timeline.
 *
 *   "2025-01" → 2025.0
 *   "2026-02" → 2026.083
 */
function isoToFraction(iso: string): number {
  const [yearStr, monthStr] = iso.split("-");
  const year = Number(yearStr);
  const monthIdx = Number(monthStr) - 1;
  return year + monthIdx / 12;
}

function nowFraction(): number {
  const now = new Date();
  return now.getFullYear() + now.getMonth() / 12;
}

/**
 * `t.raw()` devuelve `unknown`. Validamos defensivamente que la entrada
 * en messages sea un array de `{value, label}` antes de retornarla.
 * Si está mal formada (typo en el JSON), retornamos `undefined` para
 * que el componente caiga al fallback de "sin highlights".
 */
type HighlightItem = { value: string; label: string };

function readHighlights(
  t: ReturnType<typeof useTranslations>,
  id: string,
): readonly HighlightItem[] | undefined {
  try {
    const raw = t.raw(`${id}.highlights`);
    if (!Array.isArray(raw)) return undefined;
    const validated = raw.filter(
      (item): item is HighlightItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Record<string, unknown>).value === "string" &&
        typeof (item as Record<string, unknown>).label === "string",
    );
    return validated.length > 0 ? validated : undefined;
  } catch {
    return undefined;
  }
}

export type { ExperienceJobMeta };

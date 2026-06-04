/**
 * src/data/portfolio.ts
 * ─────────────────────────────────────────────────────────────
 * Metadata técnica de los proyectos del portafolio — fuente única
 * de verdad para datos **locale-independent** (slugs, URLs, stack,
 * periodos).
 *
 * Los campos traducibles (`name`, `type`, `category`, `location`,
 * `role`, `shortDesc`, `longDesc`, `highlights`) viven en
 * `messages/<locale>.json` bajo el namespace `PortfolioData`,
 * indexados por `slug`. El hook `useProjects()` los compone en
 * runtime con la locale activa.
 *
 * Convenciones:
 *   · `slug`: kebab-case, debe matchear `public/portfolio/<slug>.jpg`.
 *     El script `scripts/capture-portfolio.mjs` consume el mismo
 *     slug — cualquier rename obliga a re-correr el script.
 *   · `period`: string display-friendly tipo "2026" o "2024-2025".
 *     Números universales — no se traduce.
 *   · `stack`: nombres de tech, universales.
 *   · `url` / `urlDisplay`: técnicos, no se traducen.
 *
 * El orden del array define el orden visual (peso editorial:
 * productos del studio primero, luego casos de cliente).
 */

export type ProjectMeta = {
  /** Slug url-safe — debe matchear `public/portfolio/<slug>.jpg`. */
  readonly slug: string;
  /** URL completa con protocolo, para abrir en nueva pestaña. */
  readonly url: string;
  /** URL display-friendly (sin https://, sin trailing slash). */
  readonly urlDisplay: string;
  /** Período de entrega visible — "2026" o "2024-2025". */
  readonly period: string;
  /** Stack visible en el dialog (chips). Universal — no se traduce. */
  readonly stack: readonly string[];
};

export const projectsMeta: readonly ProjectMeta[] = [
  {
    slug: "jarvlabs",
    url: "https://www.jarvlabs.online/",
    urlDisplay: "jarvlabs.online",
    period: "2026",
    stack: ["Next.js 16", "TypeScript", "Tailwind CSS v4", "Motion", "Vercel"],
  },
  {
    slug: "pagetook",
    url: "https://pagetook.jarvlabs.online/",
    urlDisplay: "pagetook.jarvlabs.online",
    period: "2026",
    stack: ["Next.js 16", "TypeScript", "Tailwind CSS v4", "Motion", "Vercel"],
  },
  {
    slug: "citook",
    url: "https://citook.jarvlabs.online/",
    urlDisplay: "citook.jarvlabs.online",
    period: "2026",
    stack: ["Next.js 16", "TypeScript", "Tailwind CSS v4", "Motion", "Vercel"],
  },
  {
    slug: "toolstacksuite",
    url: "https://www.toolstacksuite.com/",
    urlDisplay: "toolstacksuite.com",
    period: "2026",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "i18n (es/en)", "Vercel"],
  },
  {
    slug: "orinoco",
    url: "https://orinocosanducheria.vercel.app/",
    urlDisplay: "orinocosanducheria.vercel.app",
    period: "2026",
    stack: ["Astro", "TypeScript", "Tailwind CSS", "Motion", "Vercel"],
  },
  {
    slug: "caribevan",
    url: "https://caribevan.vercel.app/",
    urlDisplay: "caribevan.vercel.app",
    period: "2026",
    stack: ["Astro", "TypeScript", "Tailwind CSS", "Motion", "Vercel"],
  },
  {
    slug: "daniel-demo-reel",
    url: "https://daniel-demo-reel.vercel.app/",
    urlDisplay: "daniel-demo-reel.vercel.app",
    period: "2026",
    stack: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Vimeo",
      "i18n (es/en)",
      "Vercel",
    ],
  },
  {
    slug: "koaladevs",
    url: "https://koaladevs.pages.dev/",
    urlDisplay: "koaladevs.pages.dev",
    period: "2024",
    stack: ["HTML", "Tailwind CSS", "JavaScript", "Cloudflare Pages"],
  },
] as const;

/* Shape "rica" del proyecto una vez compuesto con la locale activa.
 * Es lo que <Portfolio /> consume y lo que `useProjects()` devuelve. */
export type Project = {
  readonly slug: string;
  readonly url: string;
  readonly urlDisplay: string;
  readonly period: string;
  readonly stack: readonly string[];
  readonly name: string;
  readonly type: string;
  readonly category: string;
  readonly location: string;
  readonly role: string;
  readonly shortDesc: string;
  readonly longDesc: readonly string[];
  readonly highlights: readonly string[];
};

import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

/**
 * Allowlist explícito de crawlers de IA. Patrón del playbook §7 —
 * permitimos a los principales bots de IA porque queremos aparecer
 * en respuestas de ChatGPT, Claude, Perplexity, etc. cuando alguien
 * pregunta por "desarrollador frontend Bogotá / Colombia".
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}

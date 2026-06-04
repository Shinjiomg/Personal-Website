import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

/* ═════════════════════════════════════════════════════════════════
 * Open Graph image · /opengraph-image
 *
 *   1200 x 630 — el size canónico que respetan WhatsApp, LinkedIn,
 *   Slack, X/Twitter, Discord, Facebook. Otras platforms hacen
 *   crop centered desde acá; el design respeta safe-area central.
 *
 *   ┌────────────────────────────┬──────────────────┐
 *   │ 720 px text col            │ 480 px photo col │
 *   │                            │                  │
 *   │ ● PORTAFOLIO ─             │                  │
 *   │                            │   [retrato       │
 *   │ Jhonatan                   │    full-bleed    │
 *   │ Becerra ●                  │    cubre toda    │
 *   │                            │    la columna]   │
 *   │ Desarrollador Frontend.    │                  │
 *   │                            │   · dot lima en  │
 *   │ ────────────────────       │     esquina sup  │
 *   │ Next.js · Angular   url    │                  │
 *   └────────────────────────────┴──────────────────┘
 *
 * Decisiones visuales:
 *   · **Foto full-bleed der** — al borde del frame, sin marco. Da
 *     identidad humana al preview sin caer en el "card style" que
 *     se siente templated. La columna izq queda 60% del width =
 *     ~720px, con padding cómodo para que la tipografía respire.
 *   · **Dot lima top-right de la foto** — eco visual del wordmark
 *     `jb·` del header, ata el retrato a la identidad del site.
 *     Glow lima 18% alrededor (mismo treatment que el FAB y los
 *     eyebrow dots).
 *   · **Bg dot-grid solo en la col de texto** — el patrón vive
 *     "detrás" del texto, no del retrato. Refuerza la sensación
 *     de canvas editorial.
 *
 * Generación on-demand vía `ImageResponse` (satori → PNG). Output
 * cacheado por defecto en Vercel CDN — solo se genera al primer
 * request post-deploy.
 *
 * Asset loading:
 *   El retrato se lee desde `./og-portrait.jpg` (co-localizado con
 *   este file) usando `new URL(..., import.meta.url)` — el pattern
 *   oficial de Next 16 para loadear assets en routes edge. Pre-
 *   procesado a 720x945 con `scripts/process-og-portrait.mjs` para
 *   mantener el bundle de la edge fn delgado (~53 KB vs 1.28 MB
 *   del .webp original).
 *
 * Fonts:
 *   System sans default — satori no soporta woff2 (formato de las
 *   Satoshi del site). El diseño se compensa con sizing, layout y
 *   composición editorial — no depende de la voz tipográfica
 *   exacta. Para agregar Fraunces real en el futuro: fetchear el
 *   TTF de Google Fonts con UA de Safari viejo y pasarlo a
 *   ImageResponse via `fonts: [...]`.
 *
 * Runtime:
 *   `edge` por default cuando hay ImageResponse. No necesitamos
 *   fs/Node APIs porque el portrait se loadea con import.meta.url.
 * ════════════════════════════════════════════════════════════════ */

export const runtime = "edge";
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLORS = {
  background: "#FAFAF8",
  foreground: "#0A0B0F",
  muted: "#5C5F6C",
  hairline: "rgba(10, 11, 15, 0.12)",
  accent: "#C4FF00",
};

export default async function OpenGraphImage() {
  /* Load co-located portrait. `new URL(..., import.meta.url)`
   * resuelve al asset bundled junto a este file, no fetchea por
   * HTTP — funciona en edge runtime y en build time del bundler. */
  const portraitBuffer = await fetch(
    new URL("./og-portrait.jpg", import.meta.url),
  ).then((res) => res.arrayBuffer());
  const portraitSrc = `data:image/jpeg;base64,${Buffer.from(portraitBuffer).toString("base64")}`;

  /* Display host derivado del siteConfig — nunca hardcodeamos la URL
   * en el JSX. Cuando migremos a un custom domain (ej. .dev), la
   * OG image se actualiza sin tocar este file. */
  const displayHost = new URL(siteConfig.url).host;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          backgroundColor: COLORS.background,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* ═══ Text column · 720px ═══════════════════════════ */}
        <div
          style={{
            width: 720,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "64px 56px 56px 72px",
            /* Dot-grid bg pattern (igual al `--bg-dot-grid` del site).
             * Vive sólo en esta columna — la foto a la derecha no
             * necesita patrón de fondo. */
            backgroundImage: `radial-gradient(${COLORS.hairline} 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        >
          {/* ─── Eyebrow · "PORTAFOLIO" con dot lima ─── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 20,
              fontWeight: 600,
              color: COLORS.muted,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 9999,
                backgroundColor: COLORS.accent,
                boxShadow: `0 0 0 5px rgba(196, 255, 0, 0.18)`,
              }}
            />
            <span>Portafolio</span>
            <div
              style={{
                width: 48,
                height: 1,
                backgroundColor: COLORS.hairline,
                marginLeft: 6,
              }}
            />
          </div>

          {/* ─── Center · Headline ─── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
              marginTop: 32,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 104,
                fontWeight: 700,
                color: COLORS.foreground,
                lineHeight: 0.96,
                letterSpacing: "-0.04em",
              }}
            >
              Jhonatan
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                fontSize: 104,
                fontWeight: 400,
                fontStyle: "italic",
                color: COLORS.foreground,
                lineHeight: 0.96,
                letterSpacing: "-0.04em",
                marginTop: 8,
              }}
            >
              <span>Becerra</span>
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 9999,
                  backgroundColor: COLORS.accent,
                  marginLeft: 12,
                  marginBottom: 14,
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 34,
                fontWeight: 500,
                color: COLORS.foreground,
                marginTop: 32,
                letterSpacing: "-0.018em",
              }}
            >
              Desarrollador Frontend.
            </div>
          </div>

          {/* ─── Bottom block · Stack + URL stacked ─────────── *
           * Vertical en vez de horizontal porque el host de Vercel
           * (jhonatanbecerra-portfolio.vercel.app, 38 chars) no
           * cabe en horizontal junto a la stack list en 592px
           * disponibles. Stack arriba (más jerarquía), URL debajo
           * en mono como "deployment signature". */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              borderTop: `1px solid ${COLORS.hairline}`,
              paddingTop: 22,
              marginTop: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 18,
                color: COLORS.muted,
                fontWeight: 500,
              }}
            >
              <span style={{ color: COLORS.foreground, fontWeight: 600 }}>
                Next.js
              </span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span style={{ color: COLORS.foreground, fontWeight: 600 }}>
                Angular
              </span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span style={{ color: COLORS.foreground, fontWeight: 600 }}>
                TypeScript
              </span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span style={{ color: COLORS.foreground, fontWeight: 600 }}>
                React
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 17,
                fontWeight: 500,
                color: COLORS.muted,
                letterSpacing: "0.02em",
                fontFamily: "ui-monospace, 'Cascadia Mono', 'SF Mono', monospace",
              }}
            >
              <span style={{ opacity: 0.55 }}>→</span>
              <span>{displayHost}</span>
            </div>
          </div>
        </div>

        {/* ═══ Photo column · 480px full-bleed ════════════════ */}
        <div
          style={{
            width: 480,
            height: "100%",
            display: "flex",
            position: "relative",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portraitSrc}
            alt=""
            width={480}
            height={630}
            style={{
              width: 480,
              height: 630,
              objectFit: "cover",
              objectPosition: "center top",
            }}
          />

          {/* Dot lima accent · esquina superior derecha del retrato.
           * Eco del `brand-dot` del site — anclado al borde superior
           * con margen suficiente para no chocar con el frame.
           * Glow 18% alrededor (mismo treatment que el FAB y los
           * eyebrow dots) ata el retrato a la identidad. */}
          <div
            style={{
              position: "absolute",
              top: 28,
              right: 28,
              display: "flex",
              width: 18,
              height: 18,
              borderRadius: 9999,
              backgroundColor: COLORS.accent,
              boxShadow: `0 0 0 7px rgba(196, 255, 0, 0.22)`,
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

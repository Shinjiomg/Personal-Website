/**
 * Template del email que recibís en tu inbox cuando alguien llena
 * el form de contacto del portafolio.
 *
 * Renderea con React Email — los `<Section>`, `<Heading>`, `<Text>`
 * son componentes específicos del SDK que generan HTML compatible
 * con clientes legacy (Outlook 2007+, Gmail, Apple Mail, etc.)
 * usando tables y inline styles. Tailwind NO va acá; los styles
 * son JS literals porque React Email hace inline injection.
 *
 * Layout — magazine-style minimal, alineado al tono del site:
 *   ┌──────────────────────────────┐
 *   │   ▍ jb·                       │
 *   │     CONTACTO  · 12:34 PM      │
 *   ├──────────────────────────────┤
 *   │                              │
 *   │   Nuevo mensaje               │
 *   │   ─ de Juan Pérez             │
 *   │                              │
 *   │   ─ Email ─                   │
 *   │   juan@ejemplo.com  →         │
 *   │                              │
 *   │   ─ Mensaje ─                 │
 *   │   "Hola, vi tu portafolio    │
 *   │    y me gustaría hablar      │
 *   │    sobre una colaboración…"  │
 *   │                              │
 *   ├──────────────────────────────┤
 *   │  Enviado desde el form de    │
 *   │  jhonatanbecerra-portfolio…  │
 *   └──────────────────────────────┘
 *
 * Por qué no usar template del dashboard Resend:
 *   · Versionado en git (review en PRs)
 *   · Tipado de props
 *   · Preview local con `react-email dev` si lo querés extender
 *   · Cero round-trip al dashboard para cambios
 */
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { siteConfig } from "@/lib/site-config";

/* Tokens visuales — mirror del site (OKLCH no funciona en email
 * clients legacy, los traducimos a hex aproximado). Mantenerlos
 * en sync manualmente si rotás la paleta del site. */
const colors = {
  ink: "#0A0B0F",
  background: "#FAFAF8",
  surface: "#F4F4F0",
  muted: "#5B5B57",
  subtle: "#8B8B85",
  hairline: "#E2E2DD",
  accent: "#C4FF00",
} as const;

export type ContactNotificationProps = {
  /** Nombre del remitente — del campo `name` del form. */
  name: string;
  /** Email del remitente — del campo `email` del form. */
  email: string;
  /** Cuerpo del mensaje — del campo `message` del form. */
  message: string;
  /** Timestamp de cuándo se envió. Default = `new Date()`. */
  sentAt?: Date;
};

export default function ContactNotification({
  name,
  email,
  message,
  sentAt = new Date(),
}: ContactNotificationProps) {
  /* Preview text = línea snippet que se muestra en el inbox antes
   * de abrir el email. La armamos con nombre + primeros chars del
   * mensaje para que sea reconocible sin abrir. */
  const previewSnippet =
    message.length > 80 ? `${message.slice(0, 80)}…` : message;

  const timeLabel = formatTime(sentAt);
  const dateLabel = formatDate(sentAt);
  const host = new URL(siteConfig.url).host;

  return (
    <Html>
      <Head />
      <Preview>{`${name} · ${previewSnippet}`}</Preview>
      <Tailwind>
        <Body
          style={{
            backgroundColor: colors.background,
            margin: 0,
            padding: "32px 16px",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          }}
        >
          <Container
            style={{
              maxWidth: 560,
              margin: "0 auto",
              backgroundColor: colors.background,
            }}
          >
            {/* ─── Header band · jb wordmark + meta ────────────── */}
            <Section
              style={{
                paddingTop: 24,
                paddingBottom: 24,
                borderBottom: `1px solid ${colors.hairline}`,
              }}
            >
              <table width="100%" cellPadding={0} cellSpacing={0}>
                <tbody>
                  <tr>
                    <td>
                      <Text
                        style={{
                          margin: 0,
                          fontSize: 22,
                          fontWeight: 600,
                          color: colors.ink,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        jb
                        <span
                          style={{
                            display: "inline-block",
                            width: 6,
                            height: 6,
                            marginLeft: 4,
                            borderRadius: 9999,
                            backgroundColor: colors.accent,
                            verticalAlign: "middle",
                          }}
                        />
                      </Text>
                    </td>
                    <td align="right">
                      <Text
                        style={{
                          margin: 0,
                          fontFamily:
                            "ui-monospace, 'Cascadia Mono', 'SF Mono', monospace",
                          fontSize: 11,
                          color: colors.subtle,
                          textTransform: "uppercase",
                          letterSpacing: "0.18em",
                        }}
                      >
                        {dateLabel} · {timeLabel}
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* ─── Main · headline + sender ────────────────────── */}
            <Section style={{ paddingTop: 36, paddingBottom: 12 }}>
              <Text
                style={{
                  margin: 0,
                  fontFamily:
                    "ui-monospace, 'Cascadia Mono', 'SF Mono', monospace",
                  fontSize: 11,
                  fontWeight: 600,
                  color: colors.subtle,
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                }}
              >
                ── Nuevo mensaje del portafolio
              </Text>

              <Heading
                as="h1"
                style={{
                  margin: "16px 0 0 0",
                  fontSize: 30,
                  fontWeight: 600,
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  color: colors.ink,
                }}
              >
                De{" "}
                <span style={{ fontStyle: "italic", fontWeight: 400 }}>
                  {name}
                </span>
              </Heading>
            </Section>

            {/* ─── Email row ──────────────────────────────────── */}
            <Section style={{ paddingTop: 32 }}>
              <Text
                style={{
                  margin: 0,
                  fontFamily:
                    "ui-monospace, 'Cascadia Mono', 'SF Mono', monospace",
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: colors.subtle,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                }}
              >
                — Email
              </Text>
              <Link
                href={`mailto:${email}?subject=Re%3A%20Tu%20mensaje%20en%20mi%20portafolio`}
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  fontSize: 17,
                  color: colors.ink,
                  textDecoration: "underline",
                  textDecorationColor: colors.hairline,
                  textUnderlineOffset: 4,
                }}
              >
                {email} →
              </Link>
            </Section>

            {/* ─── Message body ───────────────────────────────── */}
            <Section style={{ paddingTop: 28 }}>
              <Text
                style={{
                  margin: 0,
                  fontFamily:
                    "ui-monospace, 'Cascadia Mono', 'SF Mono', monospace",
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: colors.subtle,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                }}
              >
                — Mensaje
              </Text>
              <div
                style={{
                  marginTop: 12,
                  padding: "18px 20px",
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.hairline}`,
                  borderRadius: 12,
                }}
              >
                {/* Preservamos linebreaks del usuario. `white-space:
                 *  pre-wrap` se respeta en clients modernos; Outlook
                 *  legacy ignora pre-wrap pero igual respeta `<br>`
                 *  embebidos — splittear por \n y renderear con <br>
                 *  cubre ambos. */}
                {message.split("\n").map((line, i, arr) => (
                  <Text
                    key={i}
                    style={{
                      margin: 0,
                      paddingBottom: i < arr.length - 1 ? 8 : 0,
                      fontSize: 15.5,
                      lineHeight: 1.55,
                      color: colors.ink,
                    }}
                  >
                    {line || "\u00A0"}
                  </Text>
                ))}
              </div>
            </Section>

            {/* ─── Footer ──────────────────────────────────────── */}
            <Hr
              style={{
                marginTop: 40,
                marginBottom: 16,
                borderColor: colors.hairline,
              }}
            />
            <Section>
              <Text
                style={{
                  margin: 0,
                  fontFamily:
                    "ui-monospace, 'Cascadia Mono', 'SF Mono', monospace",
                  fontSize: 11,
                  color: colors.subtle,
                  letterSpacing: "0.12em",
                }}
              >
                Enviado desde{" "}
                <Link
                  href={siteConfig.url}
                  style={{
                    color: colors.muted,
                    textDecoration: "underline",
                    textDecorationColor: colors.hairline,
                  }}
                >
                  {host}
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

/* ─── helpers de formato ───────────────────────────────────────── */

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Bogota",
  })
    .format(d)
    .toUpperCase()
    .replace(".", "");
}

function formatTime(d: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Bogota",
  })
    .format(d)
    .toUpperCase();
}

/* Props default para preview con `react-email dev` (si lo
 * agregás como dev script en el futuro). */
ContactNotification.PreviewProps = {
  name: "Daniela Martínez",
  email: "daniela@ejemplocompany.com",
  message:
    "Hola Jhonatan, vi tu portafolio y me encantó el detalle editorial.\n\nEstoy buscando un dev frontend senior para un proyecto de migración Angular → Next.js con onboarding remoto desde USA. Empieza en 3 semanas, duración estimada 4-6 meses.\n\n¿Tendrías 30 min esta semana para una llamada exploratoria?",
  sentAt: new Date("2026-06-04T17:34:00Z"),
} satisfies ContactNotificationProps;

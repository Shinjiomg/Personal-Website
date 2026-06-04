/**
 * POST /api/contact — backend del form de contacto.
 *
 * Flow:
 *   1. Parse body (JSON)
 *   2. Honeypot — si `_botField` viene con valor, descartar silenciosamente
 *      (los bots auto-llenan todos los inputs incluidos los hidden)
 *   3. Validate con Zod — name, email, message, lengths, formato
 *   4. Rate-limit por IP (Upstash sliding window, 3/10min)
 *   5. Render template React Email → HTML
 *   6. Resend `emails.send()` con idempotency key
 *   7. Return JSON con status/error legible
 *
 * Security:
 *   · API key Resend NO sale del server (server-only env var)
 *   · CORS no se setea — solo same-origin (Next.js bloquea cross-origin
 *     POST por default sin CORS headers)
 *   · IP nunca se loggea ni se persiste — solo se hashea internamente
 *     en Upstash para el rate-limit key
 *   · Honeypot field name "_botField" — los bots no saben distinguirlo
 *     de un campo normal
 *
 * Por qué Node runtime (default) y NO Edge:
 *   · React Email render usa APIs que en Edge a veces fallan
 *   · Resend SDK funciona en ambos pero más probado en Node
 *   · No necesitamos cold-start < 50ms aquí (form de contacto, baja
 *     frecuencia); Node serverless con 200-400ms cold-start está OK
 */
import { render } from "@react-email/render";
import { Resend } from "resend";
import { z } from "zod";

import ContactNotification from "@/emails/ContactNotification";
import { getClientIp, getRateLimiter } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site-config";

/* ─── Config ──────────────────────────────────────────────────── */

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/* Destinatario del form — defaultea al email público del site config
 * pero se puede override con env var para casos como staging que
 * mande a otro inbox. */
const CONTACT_RECIPIENT =
  process.env.CONTACT_RECIPIENT_EMAIL ?? siteConfig.contact.email;

/* From address — durante sandbox queda `onboarding@resend.dev` (único
 * permitido sin verificar dominio). Cuando verifiquen un dominio
 * (ej. `hola@jhonatanbecerra.dev`), sobreescriben con `CONTACT_FROM`. */
const CONTACT_FROM =
  process.env.CONTACT_FROM_EMAIL ??
  "Portafolio jb <onboarding@resend.dev>";

/* ─── Schema ─────────────────────────────────────────────────── */

/* Zod schema espejo del form en `Contact.tsx`. Si cambiás los
 * required/max ahí, sincronizar acá. La validación corre acá
 * también porque NUNCA confiar en validación client-side — los
 * scripts saltan el form HTML directamente. */
const ContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre es muy corto")
    .max(100, "El nombre es muy largo"),
  email: z.email("Email inválido").max(254),
  message: z
    .string()
    .trim()
    .min(10, "El mensaje es muy corto")
    .max(2000, "El mensaje es muy largo"),
  /* Honeypot — debe venir VACÍO (humanos no ven el input).
   * Si trae cualquier cosa, es bot. */
  _botField: z.string().max(0).optional(),
});

type ContactPayload = z.infer<typeof ContactSchema>;

/* ─── Handler ────────────────────────────────────────────────── */

export async function POST(request: Request) {
  /* Guard #1 · API key configurada.
   * Si falta, el endpoint responde 503 con mensaje accionable
   * para que el dev lo arregle. NUNCA exponemos detalles de la key. */
  if (!RESEND_API_KEY) {
    return Response.json(
      {
        ok: false,
        error: "El servicio de email no está configurado",
      },
      { status: 503 },
    );
  }

  /* Guard #2 · Parse JSON body.
   * Body inválido → 400. Genérico para no dar señal a bots fuzzing. */
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: "Body inválido" },
      { status: 400 },
    );
  }

  /* Guard #3 · Schema validation.
   * Zod devuelve los primeros errores; expongo solo el primer
   * mensaje legible al cliente para feedback inline sin filtrar
   * la estructura del schema. */
  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return Response.json(
      {
        ok: false,
        error: firstIssue?.message ?? "Datos inválidos",
      },
      { status: 422 },
    );
  }

  const { name, email, message, _botField } = parsed.data;

  /* Guard #4 · Honeypot.
   * El bot llenó el campo invisible → fingimos éxito (200) para
   * que NO sepa que fue detectado y NO ajuste su estrategia.
   * NO mandamos email. */
  if (_botField && _botField.length > 0) {
    return Response.json({ ok: true }, { status: 200 });
  }

  /* Guard #5 · Rate limit por IP.
   * Si Upstash no está configurado, `limiter` será null → fail-open
   * (el form sigue funcionando sin protección). En prod loggeamos
   * para alertar al dev. */
  const ip = getClientIp(request);
  const limiter = getRateLimiter();

  if (limiter) {
    const { success, reset, limit, remaining } = await limiter.limit(ip);
    if (!success) {
      const retryAfterSec = Math.ceil((reset - Date.now()) / 1000);
      return Response.json(
        {
          ok: false,
          error:
            "Demasiados intentos. Probá de nuevo en unos minutos o escribime al email directo.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSec),
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
          },
        },
      );
    }
  } else if (process.env.NODE_ENV === "production") {
    // eslint-disable-next-line no-console
    console.warn(
      "[contact-api] Upstash rate-limit no configurado — fail-open.",
    );
  }

  /* Step 6 · Render template a HTML.
   * `render()` puede ser sync o async según el component tree;
   * la firma actual de @react-email/render devuelve Promise. */
  const html = await render(
    ContactNotification({ name, email, message }),
  );
  const text = await render(
    ContactNotification({ name, email, message }),
    { plainText: true },
  );

  /* Step 7 · Send con Resend.
   *
   * Idempotency key — protege contra:
   *   · doble-click del usuario en submit (mismo payload → mismo key
   *     → Resend devuelve el response original sin mandar de nuevo)
   *   · retry del cliente por timeout (browser reintenta el fetch)
   *
   * Format: `contact-form/<hash(email+message)>` para que retries
   * del MISMO payload colisionen y los retries de payloads DISTINTOS
   * (mismo email mandando 2 mensajes legit) generen keys distintos. */
  const resend = new Resend(RESEND_API_KEY);
  const idempotencyKey = `contact-form/${await hashPayload({ name, email, message })}`;

  const { data, error } = await resend.emails.send(
    {
      from: CONTACT_FROM,
      to: [CONTACT_RECIPIENT],
      /* Reply-To = email del remitente → cuando le respondo desde
       * mi inbox, el reply va directo al remitente original sin
       * tener que copiar/pegar la dirección. */
      replyTo: email,
      subject: `Portafolio · ${name}`,
      html,
      text,
    },
    { idempotencyKey },
  );

  /* IMPORTANT: SDK Node NO throws en errores de API — devuelve
   * `{ data: null, error: { ... } }`. Hay que chequearlo explícito.
   * (gotcha #5 del skill de Resend) */
  if (error) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[contact-api] Resend error:", error);
    }
    /* Mensaje genérico al cliente — no exponer detalles del
     * provider que puedan dar info útil a un atacante. */
    return Response.json(
      {
        ok: false,
        error: "No pude enviar el mensaje. Probá de nuevo en un momento.",
      },
      { status: 502 },
    );
  }

  return Response.json({ ok: true, id: data?.id }, { status: 200 });
}

/* ─── Reject other methods ───────────────────────────────────── */
/* Por seguridad explicitamos un GET que devuelve 405 — algunos
 * scanners hacen GET primero para confirmar que el endpoint existe.
 * Devolver 405 (no 404) es honesto y bien-formado. */
export function GET() {
  return new Response("Method Not Allowed", {
    status: 405,
    headers: { Allow: "POST" },
  });
}

/* ─── helpers ────────────────────────────────────────────────── */

/* Hash determinístico del payload para idempotency key.
 * Usamos SubtleCrypto (Web Crypto API) que está disponible en
 * Node 18+ runtimes de Vercel. SHA-256 truncado a 16 hex chars
 * es suficiente para entropía y bajo el límite de 256 chars
 * que impone Resend. */
async function hashPayload(payload: ContactPayload): Promise<string> {
  const data = new TextEncoder().encode(
    `${payload.name}::${payload.email}::${payload.message}`,
  );
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

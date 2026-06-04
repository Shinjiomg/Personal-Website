"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Send,
} from "lucide-react";
import {
  useCallback,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useTranslations } from "next-intl";
import { LinkedInIcon } from "@/components/icons/LinkedInIcon";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { buttonVariants } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useContactLinks } from "@/lib/contact-links";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/* ═════════════════════════════════════════════════════════════════
 * Contact — cierre editorial del onepage con form real.
 *
 *   ┌─── LEFT col (lg:7/12) ─────────┬─── RIGHT col (lg:5/12) ─────┐
 *   │ ●  CONTACTO                    │  ┌──────────────────────┐   │
 *   │                                │  │ ─ ESCRÍBEME          │   │
 *   │ Hablemos de tu                 │  │                      │   │
 *   │ próximo proyecto.              │  │ Nombre  [_________]  │   │
 *   │                                │  │ Correo  [_________]  │   │
 *   │ [paragraph]                    │  │ Mensaje [_________]  │   │
 *   │                                │  │         [_________]  │   │
 *   │ ─ CANALES DIRECTOS             │  │         [_________]  │   │
 *   │ [icon] EMAIL    hola@…  ↗     │  │                      │   │
 *   │ ────────────                   │  │ [Enviar mensaje ↗]   │   │
 *   │ [icon] WHATSAPP +57…    ↗     │  │ ─ Privacy hint       │   │
 *   │ ────────────                   │  └──────────────────────┘   │
 *   │ [icon] LINKEDIN Jhonatan ↗    │                              │
 *   └────────────────────────────────┴──────────────────────────────┘
 *
 *   ─── DÓNDE ESTOY ───────────────────────────────────────────────
 *   UBICACIÓN          DISPONIBILIDAD          MODALIDAD
 *   Bogotá, Colombia   ● Abierto               Remoto
 *   UTC−5              A PROYECTOS             LATAM Y USA
 *
 *   ─── HASTA PRONTO ───
 *
 * Decisiones de layout:
 *   · **2 cols equilibradas** — antes el status strip vivía en la
 *     col izq y la hacía ~150px más alta que el form. Resultado:
 *     hueco visual feo a la derecha del card. Ahora el status sale
 *     del grid y se vuelve un BAND full-width abajo. Semánticamente
 *     queda mejor — info operativa (location/availability/modalidad)
 *     aplica a toda la sección, no sólo a una col.
 *   · **2 cols asimétricas en lg (7/5)** — left contiene contexto
 *     + alternativas, right ancla el form como centro de gravedad
 *     visual del CTA primario.
 *   · **md tablet (50/50)** — split simétrico cuando los cols son
 *     ~364px. Asimetría 7/5 sólo en lg+ donde sobra ancho.
 *   · **mobile single-col** — orden controlado por `order`: header
 *     → form → channels → status → cierre. El form va segundo
 *     (después del header) para no enterrar el primary action.
 *   · **Form bumped** — rows=6 (era 5) + privacy fine-print debajo
 *     del submit. Suma ~75px que matchean el alto de Header+Channels
 *     en la col izq, eliminando el desbalance visual.
 *
 * Decisiones funcionales:
 *   · **Form como primary action** — pipeline server-side con
 *     Resend (`/api/contact` route handler). El client postea JSON,
 *     el server valida con Zod, rate-limitea con Upstash Redis,
 *     renderea el template React Email y dispara el send.
 *   · **Canales unificados** — Email + WhatsApp + LinkedIn en una
 *     SOLA lista editorial con mismo pattern: icon container +
 *     label/value stack + arrow.
 *   · **Sin "respondo en 24h"** — promesa fuera por decisión del
 *     user; sin chip de availability falsa.
 *   · **API key Resend NUNCA en cliente** — vive solo como env var
 *     server-side (`RESEND_API_KEY` sin prefijo NEXT_PUBLIC_).
 *     Migración desde EmailJS donde la public key vivía en cliente
 *     y dependíamos de origin allowlist del dashboard.
 *
 * Lengua:
 *   · Español neutro, SIN voseo argentino. Imperativos en `tú`
 *     (escríbeme, cuéntame, prueba). Audiencia LATAM + España +
 *     USA — `tú` es la elección de menor fricción.
 * ════════════════════════════════════════════════════════════════ */
export function Contact() {
  const t = useTranslations("Contact");
  return (
    <section
      id="contacto"
      className="relative isolate scroll-mt-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid opacity-40"
      />

      <div className="container-site py-10 sm:py-14 lg:py-20">
        {/* ─── Grid 2-col equilibrado ──────────────────────────── *
         *
         * Estrategia: 3 bloques flat (Header, Form, Channels) con
         * `order` controlando el flow en mobile y `row-start` +
         * `col-start` controlando la posición en md+.
         *
         * Mobile (single col, controlado por order):
         *   1. Header → 2. Form → 3. Channels
         *   (Status va luego, FUERA del grid, full-width.)
         *
         * md/lg (12-col grid, 2 rows):
         *   ┌── row 1: Header (cols 1-7) │ Form (cols 8-12, span 2 rows)
         *   └── row 2: Channels (cols 1-7) │ (Form continúa)
         *
         *   Form: `md:row-span-2 md:self-start` — grid cell stretches
         *   verticalmente para alcanzar el bottom de Channels;
         *   contenido pinneado top via `self-start`. El form en sí
         *   no se estira; el dot-grid bg cubre cualquier gap si lo
         *   hubiera (con rows=6 + privacy hint, la diff es ≤20px).
         *
         * md (tablet 768-1024): 50/50 simétrico (6/6 split).
         * lg+: 7/5 asimétrico (más respiro para headline). */}
        <div className="grid grid-cols-1 gap-y-10 md:grid-cols-12 md:items-start md:gap-x-10 md:gap-y-0 lg:gap-x-16">
          {/* ── Block 1 · Header ── */}
          <RevealUp className="order-1 md:col-span-6 md:row-start-1 lg:col-span-7">
            <Eyebrow>{t("eyebrow")}</Eyebrow>

            <h2 className="mt-6 font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.04] tracking-[-0.028em] text-foreground-strong text-balance">
              {t("headlineLead")}{" "}
              <em className="italic font-normal text-foreground/75">
                {t("headlineHighlight")}
              </em>{" "}
              {t("headlineTrail")}
            </h2>

            <p className="mt-7 max-w-xl text-[16.5px] leading-relaxed text-muted-foreground sm:text-[17.5px]">
              {t.rich("intro", {
                s: (chunks) => (
                  <span className="text-foreground/80">{chunks}</span>
                ),
              })}
            </p>
          </RevealUp>

          {/* ── Block 2 · Form (right col, span 2 rows en md+) ── */}
          <RevealUp
            delay={0.05}
            className="order-2 md:col-span-6 md:col-start-7 md:row-span-2 md:row-start-1 md:self-start lg:col-span-5 lg:col-start-8"
          >
            <ContactForm />
          </RevealUp>

          {/* ── Block 3 · Canales directos (Email + WP + LinkedIn) ── */}
          <RevealUp
            delay={0.1}
            className="order-3 mt-2 md:col-span-6 md:col-start-1 md:row-start-2 md:mt-10 lg:col-span-7"
          >
            <ContactChannels />
          </RevealUp>
        </div>

        {/* ─── Status strip · full-width band debajo del grid ──── *
         * Tratamiento de "section divider" — eyebrow centrado con
         * hairlines a los lados, 3 cells horizontales con divisores
         * verticales. Anclar visualmente el cierre de la sección
         * antes del closing rule "HASTA PRONTO". */}
        <RevealUp delay={0.2} className="mt-16 sm:mt-20">
          <StatusStrip />
        </RevealUp>

        {/* ─── Closing rule editorial · full-width ─────────────── */}
        <RevealUp delay={0.28} className="mt-14 sm:mt-16">
          <div className="rule-editorial">
            <span aria-hidden className="rule-editorial-line" />
            <span className="mx-4 inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-subtle-foreground">
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-[var(--accent)]"
              />
              {t("closingLabel")}
            </span>
            <span aria-hidden className="rule-editorial-line" />
          </div>
        </RevealUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * RevealUp — fade-up al entrar al viewport. Mismo patrón usado
 * en About/Portfolio.
 * ──────────────────────────────────────────────────────────────── */
function RevealUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═════════════════════════════════════════════════════════════════
 * ContactForm — el corazón funcional de la sección.
 *
 * Stack:
 *   · POST `/api/contact` — route handler server-side que valida
 *     con Zod, rate-limitea con Upstash Redis (sliding window 3/10min)
 *     y manda el email vía Resend SDK con template React Email.
 *   · `<form>` con `onSubmit` — serializamos `FormData` a JSON
 *     plano `{ name, email, message, _botField }` y hacemos
 *     `fetch()` al endpoint. El backend devuelve `{ ok: boolean,
 *     error?: string, id?: string }`.
 *   · Estado local con `useState` — `idle | sending | success | error`.
 *
 * Anti-spam (defense in depth):
 *   1. **Honeypot client + server** — input `name="_botField"`
 *      invisible (display: none + tabindex -1 + autocomplete off).
 *      Server-side el schema Zod exige `_botField` vacío; si trae
 *      valor el server fingirá éxito (200 OK) sin mandar email
 *      para que el bot no detecte que fue bloqueado.
 *   2. **Throttle client-side** — `sessionStorage` con 30s entre
 *      submits del mismo browser. Capa cosmética anti double-click.
 *   3. **Rate-limit server-side** — Upstash Ratelimit por IP
 *      (3 req / 10 min, sliding window). Esta es la capa real
 *      anti-abuse; el throttle del cliente solo mejora UX.
 *   4. **Validación HTML5 + Zod** — required, type=email, minLength
 *      del lado del browser, espejados en el schema Zod del server.
 *
 * Por qué `fetch` en lugar de Server Action:
 *   · Pattern más portable (cualquier framework podría consumir
 *     `/api/contact`).
 *   · Permite tipar response como JSON directamente.
 *   · Cero progressive enhancement perdido — el form igual requiere
 *     JS para honeypot+throttle, así que SA no aporta ventaja real
 *     en este caso puntual.
 *
 * A11y:
 *   · Labels asociados con `htmlFor`/`id`.
 *   · `aria-live="polite"` en el bloque de estado del submit para
 *     que screen readers anuncien success/error sin interrumpir.
 *   · `aria-describedby` linkea botón al status region.
 *   · Botón disabled durante envío + cambio visual del label.
 * ════════════════════════════════════════════════════════════════ */

type SubmitState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "success" }
  | { status: "error"; message: string };

/* Throttle: 30s entre submits del mismo browser. Suficiente para
 * frenar double-clicks accidentales. El rate-limit real vive
 * server-side (Upstash) y es defense-in-depth. */
const SUBMIT_COOLDOWN_MS = 30_000;
const COOLDOWN_KEY = "contact-last-submit";

/* Shape de la respuesta del route handler. Mirror del JSON que
 * devuelve `/api/contact/route.ts` — mantener en sync. */
type ContactApiResponse =
  | { ok: true; id?: string }
  | { ok: false; error: string };

function ContactForm() {
  const t = useTranslations("Contact.form");
  const tErrors = useTranslations("Contact.form.errors");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  /* IDs únicos para asociar label ↔ input. Usar `useId` evita
   * colisiones si el form se monta más de una vez en la página
   * (no es nuestro caso, pero buena práctica). */
  const nameId = useId();
  const emailId = useId();
  const messageId = useId();
  const honeypotId = useId();
  const statusId = useId();

  /* Reset del estado de éxito/error si el usuario empieza a tipear
   * de nuevo (para que la "success card" no se quede pegada
   * mientras prepara un segundo mensaje). */
  const handleFocusReset = useCallback(() => {
    setState((prev) => {
      if (prev.status === "success" || prev.status === "error") {
        return { status: "idle" };
      }
      return prev;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!formRef.current) return;

      /* Throttle — leemos timestamp del último submit, comparamos
       * con `now`. `try/catch` por si sessionStorage está bloqueado
       * (modo incógnito en algunos browsers). Esta es la capa
       * cosmética; el rate-limit server-side es lo que realmente
       * protege contra abuse. */
      try {
        const lastRaw = sessionStorage.getItem(COOLDOWN_KEY);
        if (lastRaw) {
          const elapsed = Date.now() - Number(lastRaw);
          if (elapsed < SUBMIT_COOLDOWN_MS) {
            const remainingSec = Math.ceil(
              (SUBMIT_COOLDOWN_MS - elapsed) / 1000,
            );
            setState({
              status: "error",
              message: tErrors("cooldown", { seconds: remainingSec }),
            });
            return;
          }
        }
      } catch {
        /* sessionStorage no disponible — seguimos sin throttle. */
      }

      setState({ status: "sending" });

      /* Serializamos FormData a un objeto plano. Esto nos da:
       *   · Body JSON-encoded, fácil de tipar en el handler
       *   · Cero dependencia del shape de FormData en el server
       *     (server runtime puede leer el JSON directo con req.json())
       *   · El honeypot field viaja en el mismo payload */
      const fd = new FormData(formRef.current);
      const payload = {
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        message: String(fd.get("message") ?? ""),
        _botField: String(fd.get("_botField") ?? ""),
      };

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          /* `same-origin` para que no se manden cookies/credentials
           * a third-parties si el endpoint en algún momento redirige.
           * El form es same-origin por definición; explicitarlo
           * deja la intención clara y es defense-in-depth. */
          credentials: "same-origin",
        });

        /* Parseo defensivo: si el server devolvió HTML por algún
         * error de routing (404 stale build, etc.), `.json()`
         * tira. Lo capturamos como error genérico. */
        let body: ContactApiResponse;
        try {
          body = (await res.json()) as ContactApiResponse;
        } catch {
          throw new Error(
            tErrors("invalidResponse", { status: res.status }),
          );
        }

        if (!res.ok || !body.ok) {
          /* `body.error` es siempre string si `!ok`; fallback
           * defensivo por si el server cambia el contrato. */
          const message =
            body.ok === false && body.error
              ? body.error
              : tErrors("serverFallback");
          throw new Error(message);
        }

        setState({ status: "success" });
        formRef.current.reset();

        try {
          sessionStorage.setItem(COOLDOWN_KEY, String(Date.now()));
        } catch {
          /* noop */
        }
      } catch (err) {
        /* En dev imprimimos el error completo para debug. En prod
         * solo mostramos el mensaje genérico ya capturado en `state`. */
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.error("[contact-form] submit failed:", err);
        }
        setState({
          status: "error",
          message:
            err instanceof Error
              ? err.message
              : tErrors("networkFallback"),
        });
      }
    },
    [tErrors],
  );

  const isSending = state.status === "sending";
  const isSuccess = state.status === "success";
  const isError = state.status === "error";

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate={false}
      className="relative overflow-hidden rounded-2xl border border-border bg-surface px-6 py-7 shadow-[0_20px_48px_-24px_rgba(10,11,15,0.12)] sm:px-8 sm:py-9"
    >
      {/* Eyebrow del card */}
      <p className="flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-subtle-foreground">
        <span aria-hidden className="h-px w-6 bg-foreground/25" />
        {t("eyebrow")}
      </p>

      {/* Honeypot — invisible para humanos (display none + tabindex
       *  -1 + autocomplete off). Los bots scrapean inputs y los
       *  rellenan; usamos eso para detectarlos.
       *
       *  El name `_botField` es deliberadamente abstracto — un name
       *  como `website` o `phone` podría confundir a un usuario con
       *  password manager agresivo. El underscore + nombre interno
       *  señala "campo de sistema, no llenar" para autofill heurístico
       *  y para humanos que inspeccionen el DOM. */}
      <div aria-hidden className="hidden">
        <label htmlFor={honeypotId}>{t("honeypotLabel")}</label>
        <input
          id={honeypotId}
          type="text"
          name="_botField"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Campos visibles */}
      <div className="mt-6 grid gap-5">
        <FieldGroup>
          <FieldLabel htmlFor={nameId}>{t("nameLabel")}</FieldLabel>
          <FieldInput
            id={nameId}
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder={t("namePlaceholder")}
            disabled={isSending}
            onFocus={handleFocusReset}
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor={emailId}>{t("emailLabel")}</FieldLabel>
          <FieldInput
            id={emailId}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            disabled={isSending}
            onFocus={handleFocusReset}
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor={messageId}>{t("messageLabel")}</FieldLabel>
          <textarea
            id={messageId}
            name="message"
            required
            minLength={10}
            rows={6}
            placeholder={t("messagePlaceholder")}
            disabled={isSending}
            onFocus={handleFocusReset}
            className={cn(
              /* `resize-none` — bloqueamos el handle del browser para
               * que el card no rompa el layout 2-col al estirarlo.
               * 6 rows da espacio cómodo para mensajes razonables y
               * además ayuda a balancear el alto del form vs el de
               * la col izq (Header + Channels). Mensajes largos
               * siguen siendo enviables — no hay límite, sólo el
               * área visible es fija con scroll interno si hace
               * falta. */
              "w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-[14.5px] leading-relaxed text-foreground transition-colors",
              "placeholder:text-foreground/35",
              "hover:border-foreground/25",
              "focus-visible:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          />
        </FieldGroup>
      </div>

      {/* Submit + status feedback inline */}
      <div className="mt-6 flex flex-col gap-4">
        <button
          type="submit"
          disabled={isSending}
          aria-describedby={statusId}
          className={cn(
            buttonVariants({ variant: "ink", size: "lg" }),
            "w-full",
            isSending && "cursor-wait",
          )}
        >
          {isSending ? (
            <>
              <Loader2 aria-hidden className="size-4 animate-spin" />
              {t("submitPending")}
            </>
          ) : (
            <>
              <Send aria-hidden className="size-4" />
              {t("submit")}
              <ArrowUpRight aria-hidden />
            </>
          )}
        </button>

        {/* Status region — siempre montada para que aria-live anuncie
         *  cambios. Sin estado visible cuando idle/sending. */}
        <div
          id={statusId}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="min-h-0"
        >
          {isSuccess && (
            <FeedbackBlock
              tone="success"
              icon={CheckCircle2}
              title={t("success.title")}
              body={t("success.body")}
            />
          )}
          {isError && (
            <FeedbackBlock
              tone="error"
              icon={AlertCircle}
              title={tErrors("title")}
              body={state.message}
            />
          )}
        </div>
      </div>

      {/* Privacy hint · fine-print bajo el form ────────────────── *
       * Cumple dos roles:
       *   1. Trust signal — "no es un funnel automatizado, no vas
       *      a entrar a ninguna lista". Bajo el submit es donde
       *      el ojo busca confirmación antes de mandar.
       *   2. Balance vertical — agrega ~40px que ayudan a matchear
       *      el alto del form con el de Header + Channels en la
       *      col izq.
       *
       * Hairline sobre el texto separa visualmente la "zona del
       * submit" de la "zona del fine-print" sin meter otro card. */}
      <div className="mt-5 border-t border-foreground/8 pt-4">
        <p className="flex items-center gap-2 text-[12.5px] leading-relaxed text-subtle-foreground">
          <Lock aria-hidden className="size-3.5 shrink-0 text-foreground/40" strokeWidth={2} />
          <span>{t("privacyHint")}</span>
        </p>
      </div>
    </form>
  );
}

/* Helpers de layout — separados para que el form principal lea más
 * limpio. No exportados; sólo viven acá. */

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-2">{children}</div>;
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-subtle-foreground"
    >
      {children}
    </label>
  );
}

function FieldInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-lg border border-border bg-background px-4 py-3 text-[14.5px] leading-tight text-foreground transition-colors",
        "placeholder:text-foreground/35",
        "hover:border-foreground/25",
        "focus-visible:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    />
  );
}

function FeedbackBlock({
  tone,
  icon: Icon,
  title,
  body,
}: {
  tone: "success" | "error";
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  body: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3.5",
        tone === "success" &&
          "border-[var(--accent)]/30 bg-[var(--accent)]/8",
        tone === "error" && "border-foreground/15 bg-surface-elevated",
      )}
    >
      <Icon
        aria-hidden
        className={cn(
          "mt-0.5 size-4 shrink-0",
          tone === "success" && "text-[var(--accent-strong,var(--accent))]",
          tone === "error" && "text-foreground/70",
        )}
        strokeWidth={2}
      />
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-foreground-strong">
          {title}
        </p>
        <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * ContactChannels — Email + WhatsApp + LinkedIn como lista editorial.
 *
 * Por qué lista unificada (no 1 link inline + 2 buttons):
 *   La versión anterior tenía 3 tratamientos visualmente distintos
 *   para el mismo tipo de affordance (canal directo) — el email
 *   como link subrayado en un párrafo, WP/LinkedIn como buttons
 *   outline. Inconsistente, jerarquía mezclada, layout disperso.
 *
 *   Ahora los 3 comparten el mismo pattern row:
 *     [icon container]  LABEL          ↗
 *                       value
 *     ──────────────────────────────
 *
 *   Beneficios:
 *     · Scanneable — el eye salta por columnas alineadas (icon,
 *       label, value, arrow) en vez de re-parsear cada bloque.
 *     · Equilibrio visual — los 3 canales tienen el mismo peso
 *       en pantalla; ninguno se "esconde" como link de párrafo.
 *     · Touch-friendly — toda la row es clickable (~64px de alto),
 *       no sólo el text del link.
 *     · Editorial — divisores hairline entre rows + iconos en
 *       contenedor sutil casan con el resto del site.
 *
 * Channel data:
 *   Centralizada en el array `channels` — agregar/quitar uno es
 *   1 línea. Mailto/wa.me URLs construidas en `lib/contact-links`.
 *   GitHub se mantiene FUERA porque vive en footer y no es canal
 *   de outreach comercial.
 * ──────────────────────────────────────────────────────────────── */
function ContactChannels() {
  const t = useTranslations("Contact");
  const tChannels = useTranslations("Channels");
  const contactLinks = useContactLinks();
  const channels = [
    {
      id: "email",
      label: tChannels("email"),
      value: siteConfig.contact.email,
      href: contactLinks.email,
      icon: Mail,
      external: false,
    },
    {
      id: "whatsapp",
      label: tChannels("whatsapp"),
      value: siteConfig.contact.whatsappDisplay,
      href: contactLinks.whatsapp,
      icon: WhatsAppIcon,
      external: true,
    },
    {
      id: "linkedin",
      label: tChannels("linkedin"),
      value: siteConfig.social.linkedinHandle,
      href: contactLinks.linkedin,
      icon: LinkedInIcon,
      external: true,
    },
  ] as const;

  return (
    <div>
      <p className="flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-subtle-foreground">
        <span aria-hidden className="h-px w-6 bg-foreground/25" />
        {t("channelsLabel")}
      </p>

      <ul className="mt-5 divide-y divide-foreground/10">
        {channels.map((ch) => {
          const Icon = ch.icon;
          return (
            <li key={ch.id}>
              <Link
                href={ch.href}
                {...(ch.external && {
                  target: "_blank",
                  rel: "noopener noreferrer",
                })}
                className={cn(
                  "group/channel -mx-2 flex items-center gap-4 rounded-lg px-2 py-3.5 transition-colors",
                  "hover:bg-foreground/[0.025]",
                  "focus-visible:bg-foreground/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
              >
                {/* Icon container — square con border sutil. Hover
                 *  oscurece el border y el icon para señalar
                 *  affordance sin gritar. */}
                <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-foreground/12 bg-surface text-foreground/70 transition-all duration-200 group-hover/channel:border-foreground/30 group-hover/channel:text-foreground">
                  <Icon aria-hidden className="size-[18px]" />
                </span>

                {/* Label + value stack. `min-w-0 flex-1` permite que
                 *  el value truncate cuando el container es chico
                 *  (md tablet con col-6 = ~360px) sin desbordar. */}
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-subtle-foreground">
                    {ch.label}
                  </span>
                  <span className="mt-0.5 block truncate font-display text-[15.5px] font-medium leading-tight tracking-[-0.008em] text-foreground-strong sm:text-[16px]">
                    {ch.value}
                  </span>
                </span>

                <ArrowUpRight
                  aria-hidden
                  className="size-4 shrink-0 text-foreground/35 transition-all duration-200 group-hover/channel:-translate-y-0.5 group-hover/channel:translate-x-0.5 group-hover/channel:text-foreground/80"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * StatusStrip — info operativa como section divider band full-width.
 *
 * Diseño:
 *   ─── DÓNDE ESTOY ───────────────────────────────────────────
 *   UBICACIÓN          DISPONIBILIDAD          MODALIDAD
 *   Bogotá, Colombia   ● Abierto               Remoto
 *   UTC−5              A PROYECTOS             LATAM Y USA
 *
 *   · **Header centrado con hairlines a los lados** — tratamiento
 *     editorial tipo "section title" en revista. Acentúa la natura
 *     full-width del strip y lo distingue del eyebrow estándar
 *     de izquierda + hairline-leading.
 *   · **md+ goes 3-col horizontal** — antes era lg+ porque el
 *     strip vivía en una col de 620px. Ahora full-width tiene
 *     ~720-1180px → 3 cells horizontal ya respiran desde tablet.
 *   · **Hairlines verticales entre cells (md+)** — divisores de
 *     marca, no boxes. Mantiene el feel editorial vs cards.
 *
 * Cada cell tiene **value + meta**:
 *   · value = primary metric (display medium 16-17px)
 *   · meta  = secondary annotation (mono uppercase, 10.5px subtle)
 *   Evita orphan wraps que dejaban "UTC−5" sola en línea 2 con
 *   un · colgando. Split intencional: dato principal arriba,
 *   contexto abajo, jerarquía clara.
 * ──────────────────────────────────────────────────────────────── */
function StatusStrip() {
  const t = useTranslations("Contact.status");
  return (
    <div>
      {/* Header centrado tipo section-divider · hairlines a los
       *  lados. Distinto del eyebrow estándar (hairline solo
       *  leading), señaliza que el strip que viene es un
       *  band horizontal, no parte de una columna. */}
      <div className="flex items-center justify-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-subtle-foreground">
        <span aria-hidden className="h-px flex-1 max-w-[120px] bg-foreground/15" />
        <span>{t("heading")}</span>
        <span aria-hidden className="h-px flex-1 max-w-[120px] bg-foreground/15" />
      </div>

      <ul className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-y-6 sm:mt-10 md:grid-cols-3 md:gap-x-8 md:gap-y-0 lg:gap-x-12">
        <StatusCell
          label={t("location.label")}
          meta={t("location.meta")}
          first
          icon={MapPin}
        >
          {siteConfig.location}
        </StatusCell>

        <StatusCell
          label={t("availability.label")}
          meta={t("availability.meta")}
          withDot
        >
          {t("availability.value")}
        </StatusCell>

        <StatusCell
          label={t("modality.label")}
          meta={t("modality.meta")}
        >
          {t("modality.value")}
        </StatusCell>
      </ul>
    </div>
  );
}

function StatusCell({
  label,
  meta,
  first = false,
  withDot = false,
  icon: Icon,
  children,
}: {
  label: string;
  meta?: string;
  first?: boolean;
  withDot?: boolean;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
}) {
  return (
    <li
      className={cn(
        "min-w-0",
        /* Mobile: hairline top entre cells (skip first). */
        !first && "border-t border-foreground/10 pt-6",
        first && "border-t-0 pt-0",
        /* md+: hairline vertical en vez de horizontal (skip first
         * para no abrir la fila). */
        "md:border-t-0 md:pt-0",
        !first && "md:border-l md:pl-8 lg:pl-12",
        first && "md:border-l-0 md:pl-0",
        /* Centrado en mobile (sin hairlines verticales), left
         * en md+ (con hairlines como divisores). */
        "text-center md:text-left",
      )}
    >
      <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.22em] text-subtle-foreground">
        {label}
      </p>
      <p className="mt-2.5 inline-flex items-center gap-1.5 font-display text-[16.5px] font-medium leading-tight tracking-[-0.012em] text-foreground-strong sm:text-[17.5px]">
        {Icon && (
          <Icon
            aria-hidden
            className="size-4 text-foreground/45"
            strokeWidth={1.75}
          />
        )}
        {withDot && <span aria-hidden className="brand-dot" />}
        {children}
      </p>
      {meta && (
        <p className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-subtle-foreground">
          {meta}
        </p>
      )}
    </li>
  );
}

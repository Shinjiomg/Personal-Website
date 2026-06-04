/**
 * Rate-limiting server-side usando Upstash Redis.
 *
 * Para el form de contacto necesitamos un límite que sea:
 *   · Distribuido — Vercel escala a múltiples regiones / instancias
 *     serverless. In-memory Map se resetea por instancia. Upstash
 *     (key-value REST) comparte estado entre todas las funciones.
 *   · Burst-tolerant — un humano legit puede mandar 1 mensaje y
 *     darse cuenta que escribió mal el email → mandar otro. NO debe
 *     bloquear al segundo intento legit.
 *   · Anti-bot — un script que dispara 100 req/s al endpoint debe
 *     cortarse al 4°.
 *
 * Algoritmo elegido: sliding window
 *   - 3 requests per 10 minutes per IP
 *   - Si pasa de 3 → 429 con Retry-After header
 *
 * Por qué sliding y no fixed:
 *   · Fixed window tiene burst en el límite (n requests a las 23:59
 *     + n requests a las 00:00 = 2n en 1 segundo). Sliding suaviza.
 *
 * Key naming:
 *   `contact-form:<ip>` — namespace explícito para que si en el
 *   futuro agregamos otros rate limits (api keys, login, etc.)
 *   no colisionen.
 *
 * Graceful degradation:
 *   Si Upstash NO está configurado (missing env vars), `getRateLimiter()`
 *   retorna `null` → la route handler debe interpretar null como
 *   "rate limit no disponible, fail-open". En prod siempre debe estar
 *   configurado; en local podés desarrollar sin Upstash y el form
 *   sigue funcionando (pero sin protección).
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/* Singleton — Upstash REST client es stateless pero el Ratelimit
 * tiene caching interno. Re-crearlo por request es caro. */
let cachedLimiter: Ratelimit | null | undefined;

/**
 * Devuelve un Ratelimit configurado, o `null` si las env vars de
 * Upstash no están presentes (= rate limit deshabilitado).
 *
 * El caller debe decidir qué hacer con `null`:
 *   · En producción: log warning + fail-open (mejor un form
 *     funcional con spam que un form roto sin spam)
 *   · En dev: ignorar silenciosamente
 *
 * Las env vars `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`
 * son auto-populadas por Vercel cuando agregás un Marketplace
 * Upstash Redis storage al proyecto (Storage → Add → Upstash).
 */
export function getRateLimiter(): Ratelimit | null {
  if (cachedLimiter !== undefined) return cachedLimiter;

  /* Vercel auto-popula nombres legacy `KV_REST_API_URL` y
   * `KV_REST_API_TOKEN` cuando provisionás Upstash desde el
   * Marketplace (carry-over del antiguo producto Vercel KV).
   *
   * Si lo conectaste desde Upstash directo (sin Vercel), las
   * vars vienen con prefijo `UPSTASH_REDIS_REST_*` que es lo
   * que sugiere su docs.
   *
   * Soportamos ambos para que el setup funcione en cualquier
   * combinación sin que el user tenga que renombrar nada. */
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    cachedLimiter = null;
    return null;
  }

  cachedLimiter = new Ratelimit({
    redis: new Redis({ url, token }),
    /* 3 requests / 10 min · sliding window.
     *
     * Por qué 3 y no 1:
     *   - alguien legit puede tipear mal el email y reintentar
     *   - dev en local probando 2-3 veces no se bloquea
     *
     * Por qué 10 min y no 1 hora:
     *   - reclutador legit que llena form, le rebota su email, lo
     *     corrige y reintenta — debe tener una segunda chance
     *     dentro del mismo session sin esperar 1h.
     *
     * Bot legit-looking (1 req cada 4 min, 24/7) escapa este
     * filtro — pero el form tiene honeypot + Resend automatic
     * suppression. Defense-in-depth. */
    limiter: Ratelimit.slidingWindow(3, "10 m"),
    /* Analytics enabled — visible en Upstash dashboard.
     * Útil para ver si efectivamente recibís spam. */
    analytics: true,
    /* Prefix para que las keys queden namespaceadas en Redis.
     * Si agregás otro rate limit en el futuro, usar otro prefix. */
    prefix: "contact-form",
  });

  return cachedLimiter;
}

/**
 * Extrae la IP del request — Vercel inyecta varios headers, todos
 * potencialmente spoofeables si NO viene del proxy de Vercel. En
 * Vercel runtime estos headers SÍ son confiables porque solo el
 * load balancer los setea (el cliente NO puede inyectarlos).
 *
 * Orden de preferencia:
 *   1. `x-forwarded-for` (RFC 7239, primer IP es el cliente real)
 *   2. `x-real-ip` (fallback que algunos proxies usan)
 *   3. `cf-connecting-ip` (si en algún momento meten Cloudflare)
 *   4. `127.0.0.1` (local dev sin proxy)
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    /* x-forwarded-for puede ser una chain: "client, proxy1, proxy2".
     * El primer item es el origen real. */
    return forwardedFor.split(",")[0]!.trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}

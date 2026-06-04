/**
 * src/data/portfolio.ts
 * ─────────────────────────────────────────────────────────────
 * Single source of truth de los proyectos del portafolio.
 *
 * Estructura inspirada en el portafolio de Pagetook — cada item
 * tiene metadata mínima para la card (URL, tipo, ubicación,
 * período, summary corto) + payload extendido para el dialog
 * (long description, stack completo, role, highlights).
 *
 * Convención de slugs: kebab-case, debe matchear el filename del
 * screenshot en `public/portfolio/<slug>.jpg`. El script de
 * captura (`scripts/capture-portfolio.mjs`) usa el mismo slug —
 * cualquier rename acá obliga a re-correr el script.
 *
 * Orden = peso editorial. Los proyectos del studio (JarvLabs +
 * sub-brands) van primero porque son los más relevantes en mi
 * stack actual y muestran end-to-end ownership; los casos de
 * cliente cierran el grid mostrando ejecución real para
 * negocios reales.
 */

export type ProjectType =
  | "Estudio digital"
  | "Producto SaaS"
  | "Plataforma · herramientas"
  | "Agencia de páginas web"
  | "One-page"
  | "Multi-página"
  | "Portafolio creativo";

export type Project = {
  /** Slug url-safe — debe matchear `public/portfolio/<slug>.jpg`. */
  readonly slug: string;
  readonly name: string;
  /** URL completa con protocolo, para abrir en nueva pestaña. */
  readonly url: string;
  /** URL display-friendly (sin https://, sin trailing slash). */
  readonly urlDisplay: string;
  readonly type: ProjectType;
  /** Industria/categoría — chip secundario en la card. */
  readonly category: string;
  readonly location: string;
  /** Período de entrega visible — "2026" o "2024-2025". */
  readonly period: string;
  /** Rol en el proyecto — "Lead frontend", "Diseño + desarrollo", etc. */
  readonly role: string;
  /** Una línea para la card — máx ~140 chars. */
  readonly shortDesc: string;
  /** Párrafos para el dialog. Cada item es un párrafo. */
  readonly longDesc: readonly string[];
  /** Stack visible en el dialog (chips). */
  readonly stack: readonly string[];
  /** 3-4 bullets de contexto/contribución. */
  readonly highlights: readonly string[];
};

export const projects: readonly Project[] = [
  {
    slug: "jarvlabs",
    name: "JarvLabs",
    url: "https://www.jarvlabs.online/",
    urlDisplay: "jarvlabs.online",
    type: "Estudio digital",
    category: "Estudio · productos propios",
    location: "Bogotá, Colombia",
    period: "2026",
    role: "Diseño + desarrollo",
    shortDesc:
      "Estudio digital independiente que construye productos propios desde Colombia para LATAM.",
    longDesc: [
      "Sitio raíz del estudio — la casa donde viven los productos (Citook, Pagetook) y la conversación con clientes potenciales. Pensado como una declaración: pocos productos, bien hechos, con criterio.",
      "Layout editorial mobile-first, sin catálogo de servicios, sin pricing prematuro. El recorrido lleva al lector de la promesa (productos digitales con criterio) a la prueba (cada producto del estudio resuelve un problema concreto) y de ahí al manifiesto y al contacto.",
      "Decisiones técnicas: Next.js 16 con App Router, Tailwind v4 con tokens OKLCH, motion/react para reveals editoriales, light/dark blocked en light por ahora. Cero gradientes baratos; el peso visual se carga con tipografía y un accent lima usado con escasez.",
    ],
    stack: [
      "Next.js 16",
      "TypeScript",
      "Tailwind CSS v4",
      "Motion",
      "Vercel",
    ],
    highlights: [
      "Sistema de tipografía custom (Fraunces display + Satoshi body) self-hosted con next/font.",
      "Tokens OKLCH — accent lima eléctrico estable en mezclas (color-mix in oklch).",
      "Onepage con scroll-spy + cleanup de hash en URL para SEO y deep links limpios.",
      "Performance: Lighthouse 96+, sin librerías de UI pesadas, mockups CSS-only.",
    ],
  },
  {
    slug: "pagetook",
    name: "Pagetook",
    url: "https://pagetook.jarvlabs.online/",
    urlDisplay: "pagetook.jarvlabs.online",
    type: "Agencia de páginas web",
    category: "Agencia · páginas web con IA",
    location: "LATAM",
    period: "2026",
    role: "Diseño + desarrollo end-to-end",
    shortDesc:
      "Marca de agencia para construir páginas web con IA en días — no en meses — para emprendedores y empresas en LATAM.",
    longDesc: [
      "Marca consumer del studio enfocada en cerrar el gap entre 'quiero una página web' y 'ya está en línea'. Posicionamiento agresivo contra la agencia tradicional: en días, no meses, sin precios de carro.",
      "Estructura multipage profunda: home con value-prop fuerte, página de servicios, portafolio de casos reales, planes con pricing transparente, manifesto y formulario de cotización. Cada sección está construida con motion editorial y micro-mockups CSS que muestran 'antes vs después' de trabajar con la marca.",
      "Reto principal: comunicar velocidad sin sonar barato. Se resolvió con copy directo, casos reales en producción y un sistema visual que se ve premium (mockups detallados, tipografía gigante, animaciones suaves) sin caer en clichés de agencia.",
    ],
    stack: [
      "Next.js 16",
      "TypeScript",
      "Tailwind CSS v4",
      "Motion",
      "Vercel",
    ],
    highlights: [
      "Comparativa 'agencia tradicional vs Pagetook' con mockups CSS animados.",
      "Sección de portafolio con preview cards por proyecto entregado.",
      "FAQ acordeón con copy honesto sobre proceso, precio y tiempos.",
      "Formulario de cotización con clasificación automática por tipo de proyecto.",
    ],
  },
  {
    slug: "citook",
    name: "Citook",
    url: "https://citook.jarvlabs.online/",
    urlDisplay: "citook.jarvlabs.online",
    type: "Producto SaaS",
    category: "SaaS · agenda automática por WhatsApp",
    location: "LATAM",
    period: "2026",
    role: "Diseño + desarrollo del marketing site",
    shortDesc:
      "Producto SaaS B2B: la conversación de WhatsApp que llena la agenda de clínicas, peluquerías y centros estéticos.",
    longDesc: [
      "Landing del producto SaaS del studio. Se vende un cambio de comportamiento (no más perseguir clientes por teléfono) usando una narrativa de 'antes/después' construida sobre mockups de WhatsApp y panel de admin reales.",
      "Cada sección tiene un mockup específico que muestra el beneficio en concreto: la conversación que confirma una cita, el panel del dashboard de la mañana, la recuperación automática de cancelaciones, el reporte semanal que llega al inbox del dueño.",
      "Reto: mostrar valor sin demo en vivo. Se resolvió con mockups de WhatsApp animados (cada mensaje aparece secuencialmente con timing realista) y skeleton del dashboard con datos verosímiles. El usuario 've cómo funciona' sin tener que solicitar acceso.",
    ],
    stack: [
      "Next.js 16",
      "TypeScript",
      "Tailwind CSS v4",
      "Motion",
      "Vercel",
    ],
    highlights: [
      "Mockup de conversación WhatsApp animada (mensajes secuenciales con typing indicators).",
      "Dashboard skeleton CSS-only con métricas y agenda del día.",
      "Vista semanal Gantt-style mostrando recuperación de cancelaciones.",
      "Reporte semanal mock que simula el email real que recibe el cliente.",
    ],
  },
  {
    slug: "toolstacksuite",
    name: "ToolStackSuite",
    url: "https://www.toolstacksuite.com/",
    urlDisplay: "toolstacksuite.com",
    type: "Plataforma · herramientas",
    category: "Plataforma · utilities para devs",
    location: "LATAM",
    period: "2026",
    role: "Diseño + desarrollo end-to-end",
    shortDesc:
      "Suite de utilities gratuitas para devs y creators: generador QR, contraseñas, JSON, UUID, Base64, JWT, hashes, UTM builder. Sin registro, todo en el navegador.",
    longDesc: [
      "Plataforma SaaS de utilities — el tipo de herramientas que un dev usa una vez al mes y termina en cualquier site sketchy lleno de anuncios. La propuesta es la opuesta: una sola suite limpia, bilingüe, sin tracking, sin login, sin cap de uso.",
      "Catálogo actual: generador de QR personalizables, generador de contraseñas con control fino, formateador/minificador/validador JSON, generador UUID v4, codificador Base64, codificador URL, decoder JWT con visualización de header + payload, generador de hashes (SHA-1/256/384/512) y un UTM link builder para campañas. Cada herramienta es una página propia con copy de soporte (FAQ inline, casos de uso, exportación).",
      "Decisión técnica clave: todo procesa en el navegador (zero-trust del backend). Las herramientas que tocan datos sensibles — contraseñas, JWT, hashes, JSON — nunca envían el input a un servidor. Eso es feature, no detalle: el usuario sabe que su dato nunca sale del tab.",
    ],
    stack: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "i18n (es/en)",
      "Vercel",
    ],
    highlights: [
      "9+ herramientas online, todas client-side (cero envío de datos al servidor).",
      "Bilingüe desde el día 1 (ES/EN) con switch instantáneo.",
      "SEO técnico: cada tool con su propia ruta, meta tags y FAQ schema.org.",
      "Cero anuncios, cero registro, cero tracking de inputs — privacidad como feature.",
    ],
  },
  {
    slug: "orinoco",
    name: "Orinoco Sanduchería",
    url: "https://orinocosanducheria.vercel.app/",
    urlDisplay: "orinocosanducheria.vercel.app",
    type: "One-page",
    category: "Restaurante · sanduchería artesanal",
    location: "Yopal, Colombia",
    period: "2026",
    role: "Desarrollo · cliente de Pagetook",
    shortDesc:
      "Sanduchería artesanal en Yopal con pan horneado a diario. One-page editorial con menú fotográfico, story y pedidos por WhatsApp.",
    longDesc: [
      "Caso de cliente entregado bajo la marca Pagetook. Una sanduchería artesanal en Yopal que necesitaba presencia digital seria pero no quería una app: pedidos por WhatsApp, historia detrás de la marca y menú con producto-héroe en cada slot.",
      "Decisiones de diseño: tipografía display con personalidad (Fraunces para los titulares), paleta cálida que refleja el sabor del producto, fotografía generosa del pan y los sándwiches, micro-animaciones de scroll que dan ritmo sin distraer.",
      "El sitio empezó a generar pedidos por WhatsApp desde la primera semana en línea — la conversión sucede directamente en el chat, sin formulario intermedio. Cero fricción.",
    ],
    stack: [
      "Astro",
      "TypeScript",
      "Tailwind CSS",
      "Motion",
      "Vercel",
    ],
    highlights: [
      "One-page editorial con menú, story del proceso y ubicación.",
      "Mapa interactivo del local con ruta directa a Google Maps.",
      "CTA principal hace deep-link a WhatsApp con mensaje pre-rellenado.",
      "Hero con fotografía del producto a tamaño completo y lockup tipográfico.",
    ],
  },
  {
    slug: "caribevan",
    name: "CaribeVan",
    url: "https://caribevan.vercel.app/",
    urlDisplay: "caribevan.vercel.app",
    type: "One-page",
    category: "Transporte · paseos familiares",
    location: "Barranquilla, Colombia",
    period: "2026",
    role: "Desarrollo · cliente de Pagetook",
    shortDesc:
      "Van privada con conductor para paseos familiares al Caribe colombiano. Reserva directa por WhatsApp, sin formularios.",
    longDesc: [
      "Caso de cliente entregado bajo la marca Pagetook. Una operación familiar de transporte turístico en el Caribe colombiano que necesitaba transmitir confianza (van segura, conductor que conoce la región) en menos de 30 segundos.",
      "Estructura one-page con tres bloques claros: destinos (con coordenadas geográficas reales como detalle editorial), postales de viajes anteriores (testimonios estilizados como tickets de viaje) y especificaciones del vehículo (formato 'hoja de ruta' con números pequeños y tipografía técnica).",
      "Reto: equilibrar el imaginario caribeño (color, calor, alegría) con la seriedad de una decisión de viaje familiar. Se resolvió con paleta azul profundo + amarillo solar como acento, fotografía documental y micro-detalles editoriales (cards firmadas por el conductor, números de ruta tipo aerolínea).",
    ],
    stack: [
      "Astro",
      "TypeScript",
      "Tailwind CSS",
      "Motion",
      "Vercel",
    ],
    highlights: [
      "Sección de destinos con coordenadas geográficas como detalle editorial.",
      "Postales-testimonio estilizadas como tickets de viaje firmados.",
      "Hoja de ruta del vehículo con specs numerados estilo aerolínea.",
      "CTA único: reserva por WhatsApp, sin formulario.",
    ],
  },
  {
    slug: "daniel-demo-reel",
    name: "Daniel G. · Demo Reel",
    url: "https://daniel-demo-reel.vercel.app/",
    urlDisplay: "daniel-demo-reel.vercel.app",
    type: "Portafolio creativo",
    category: "Portafolio · animador 2D",
    location: "Cliente personal",
    period: "2026",
    role: "Diseño + desarrollo del sitio",
    shortDesc:
      "Demo reel y portafolio para Daniel Galindo, animador 2D especializado en Toon Boom Harmony. One-page editorial con video reel integrado, proyectos y bio.",
    longDesc: [
      "Caso de portafolio para un animador 2D. El reto: que el sitio se sintiera tan cuidado como el trabajo que muestra — un demo reel es la primera impresión profesional, no podía pelearle protagonismo al video pero tampoco quedar invisible.",
      "Layout one-page con jerarquía narrativa clara: hero con video reel embebido + specs editoriales tipo ficha técnica (duración, resolución, framerate), sección de proyectos individuales, bio y contacto. La tipografía display con stroke pesado da identidad sin competir con el color del reel.",
      "Detalles técnicos: toggle EN/ES + light/dark del lado del cliente, video integrado con Vimeo (mejor para showreels que YouTube por privacidad y branding), micro-animaciones de scroll que dan ritmo entre secciones. Deploy en Vercel — rápido y sin fricción para iterar copy según feedback del cliente.",
    ],
    stack: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Vimeo",
      "i18n (es/en)",
      "Vercel",
    ],
    highlights: [
      "Hero con video reel embebido y ficha técnica editorial (duración, resolución, fps).",
      "Toggle bilingüe ES/EN + light/dark con preferencias persistentes.",
      "Sección de proyectos individuales con thumbnails y contexto del rol.",
      "Tipografía display con personalidad — identidad sin robarle protagonismo al reel.",
    ],
  },
  {
    slug: "koaladevs",
    name: "KoalaDevs",
    url: "https://koaladevs.pages.dev/",
    urlDisplay: "koaladevs.pages.dev",
    type: "Multi-página",
    category: "Estudio web · servicios de desarrollo",
    location: "Bogotá, Colombia",
    period: "2024",
    role: "Diseño + desarrollo end-to-end",
    shortDesc:
      "Estudio de diseño y desarrollo web en Bogotá. Sitio corporativo con servicios, proceso, planes y FAQ.",
    longDesc: [
      "Iteración anterior — el sitio donde aprendí lo que después se volvió la base del studio actual. Estructura corporativa clásica (servicios, proceso, beneficios, planes, FAQ) pero ya con el patrón de mascota de marca y paleta consistente.",
      "Lo dejo en el portafolio porque es la versión honesta del recorrido: no todo lo que construyo es Next.js 16 con tokens OKLCH. KoalaDevs fue donde se probaron por primera vez muchas decisiones (sección de planes editorial, FAQ acordeón, formulario de contacto integrado) que después se refinaron en Pagetook.",
      "Stack más liviano (HTML + Tailwind, deploy en Cloudflare Pages) — fit-for-purpose para una landing de servicios sin login ni dashboard. La velocidad del sitio sigue siendo excelente.",
    ],
    stack: [
      "HTML",
      "Tailwind CSS",
      "JavaScript",
      "Cloudflare Pages",
    ],
    highlights: [
      "Sistema de planes con cards comparables y CTA por nivel.",
      "Proceso de trabajo en 4 pasos con micro-explicaciones contextuales.",
      "FAQ con acordeón accesible y copy directo.",
      "Mascota de marca consistente en toda la experiencia.",
    ],
  },
] as const;

/**
 * Dashboard skeleton renderizado dentro del `<BrowserMockup>` del Hero.
 *
 * Por qué skeleton y no copy real:
 *   · Un screenshot de proyecto compite con el portafolio en sí.
 *   · Un mockup con copy real (CaribeVan, Orinoco, etc.) atribuye
 *     trabajo concreto sin contexto y hace ruido.
 *   · Un skeleton dice "construyo product UIs" en lenguaje
 *     abstracto, sin claims específicos.
 *
 * Layout landscape (proporción ~16:10):
 *   El layout anterior apilaba stats + chart + table verticalmente
 *   y el resultado terminaba cuadrado dentro del browser, que se
 *   leía más "tarjeta de app" que "página web". Esta versión:
 *
 *   ┌────────┬──────────────────────────────────────────────────┐
 *   │ ●  ▬   │ ▬▬▬▬▬▬                          ▬▬  ◯           │  topbar
 *   │   ▬▬   ├──────────────────────────────────────────────────┤
 *   │ ▮ ▬▬▬▬ │ ┌──────┐ ┌──────┐ ┌──────┐                       │  stats slim
 *   │   ▬▬   │ │ ▬▬▬▬ │ │ ▬▬▬▬ │ │ ▬▬▬▬ │                       │
 *   │   ▬▬   │ └──────┘ └──────┘ └──────┘                       │
 *   │   ▬▬   │ ┌────────────────────┐ ┌─────────────────────┐   │  body 2-col
 *   │        │ │ ▬▬▬▬    ● · ·      │ │ ◯ ▬▬▬▬▬▬▬   ▬▬       │  │   chart (60%)
 *   │        │ │ ▌▌  ▌▌▌  ▌ ▌▌▌  ▌  │ │ ◯ ▬▬▬▬▬▬▬   ▬▬       │  │   list (40%)
 *   │        │ │ ▌▌▌ ▌ ▌  ▌▌  ▌  ▌▌ │ │ ◯ ▬▬▬▬▬▬▬   ▬▬       │  │
 *   │        │ └────────────────────┘ └─────────────────────┘   │
 *   └────────┴──────────────────────────────────────────────────┘
 *
 *   Apilar Chart + List horizontal en lugar de vertical es lo que
 *   gana el landscape — un dashboard real con esta cantidad de
 *   módulos también acomodaría así en desktop.
 *
 * Notas sobre los skeleton "bars":
 *   · Color base `bg-foreground/10` — visible en off-white sin
 *     parecer un error de carga real.
 *   · Un único item activo en lima — ancla la identidad de marca
 *     dentro del mockup. Mismo rol que el dot lima en eyebrows
 *     y nav active states.
 *   · Sin `animate-pulse`: la pulsación obvia hace ver el mockup
 *     como "página rota cargando". El skeleton estático se lee
 *     como "wireframe de producto".
 */
export function WebsiteSkeleton() {
  return (
    <div className="flex bg-surface text-foreground">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <TopBar />
        <div className="space-y-2.5 p-3 sm:space-y-3 sm:p-3.5">
          <StatsRow />
          <BodyGrid />
        </div>
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * Building blocks
 * ──────────────────────────────────────────────────────────────── */

function Sidebar() {
  // Anchos disparejos para que parezca "datos reales". Item activo
  // (index 1) con fondo + dot lima.
  const navWidths = [60, 76, 52, 68, 58];
  const activeIndex = 1;

  return (
    <aside className="hidden w-[88px] shrink-0 border-r border-border bg-surface-elevated/70 px-3 py-3.5 sm:block">
      {/* Brand bar */}
      <div className="mb-5 flex items-center gap-2">
        <span aria-hidden className="size-2 rounded-full bg-[var(--accent)]" />
        <Bar w={32} h={5} />
      </div>

      <nav className="space-y-1">
        {navWidths.map((w, i) => {
          const active = i === activeIndex;
          return (
            <div
              key={i}
              className={
                "flex items-center gap-2 rounded-md px-2 py-1.5 " +
                (active ? "bg-foreground/[0.07]" : "")
              }
            >
              <span
                aria-hidden
                className={
                  "size-2 rounded-sm " +
                  (active ? "bg-[var(--accent)]" : "bg-foreground/15")
                }
              />
              <Bar w={w} h={4} />
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

function TopBar() {
  return (
    <div className="flex items-center justify-between border-b border-border px-3 py-2.5 sm:px-3.5">
      <div className="space-y-1">
        <Bar w={86} h={6} />
        <Bar w={48} h={3} muted />
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden h-6 w-[110px] rounded-full border border-border bg-background sm:block" />
        <span
          aria-hidden
          className="size-6 shrink-0 rounded-full bg-foreground/12"
        />
      </div>
    </div>
  );
}

function StatsRow() {
  // 3 cards más compactas que en la v anterior — el peso visual
  // del dashboard ahora vive en el ChartCard + ListCard, no acá.
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-md border border-border bg-background px-2.5 py-2"
        >
          <Bar w={32} h={3} muted />
          <div className="mt-1 flex items-baseline gap-1.5">
            <Bar w={i === 1 ? 38 : 28} h={9} />
            <Bar w={12} h={4} muted />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Grid principal del body: chart card + list card lado a lado.
 * En mobile el sidebar se oculta, así que el grid igual respira
 * (no se ve apretado contra el border).
 */
function BodyGrid() {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-5 sm:gap-3">
      <div className="sm:col-span-3">
        <ChartCard />
      </div>
      <div className="sm:col-span-2">
        <ListCard />
      </div>
    </div>
  );
}

function ChartCard() {
  // Heights del bar chart en %, pseudo-aleatorias pero estables —
  // hardcoded para evitar layout shift entre renders y SSR mismatch.
  const heights = [40, 58, 32, 70, 48, 80, 55, 38, 65, 50];
  // Una barra en lima — el data point "destacado", anclando la
  // identidad de marca dentro del chart.
  const accentIndex = 5;

  return (
    <div className="h-full rounded-md border border-border bg-background p-2.5 sm:p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="space-y-1">
          <Bar w={60} h={5} />
          <Bar w={38} h={3} muted />
        </div>
        <div className="flex items-center gap-1">
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-foreground/15"
          />
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-[var(--accent)]"
          />
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-foreground/15"
          />
        </div>
      </div>

      <div className="flex h-[64px] items-end gap-[5px] sm:h-[72px]">
        {heights.map((h, i) => (
          <span
            key={i}
            aria-hidden
            className={
              "flex-1 rounded-sm " +
              (i === accentIndex ? "bg-[var(--accent)]" : "bg-foreground/10")
            }
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function ListCard() {
  // 3 rows compactos — avatar + 2 bars + status pill.
  return (
    <div className="h-full overflow-hidden rounded-md border border-border bg-background">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={
            "flex items-center gap-2.5 px-2.5 py-2 sm:px-3 " +
            (i < 2 ? "border-b border-border" : "")
          }
        >
          <span
            aria-hidden
            className="size-5 shrink-0 rounded-full bg-foreground/12"
          />
          <div className="flex-1 space-y-1">
            <Bar w={i === 0 ? 70 : i === 1 ? 86 : 60} h={4} />
            <Bar w={i === 0 ? 48 : 40} h={3} muted />
          </div>
          <span
            aria-hidden
            className={
              "inline-block h-2.5 w-[28px] rounded-full " +
              (i === 0 ? "bg-[var(--accent)]/45" : "bg-foreground/10")
            }
          />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * Bar — primitiva única del skeleton. `muted` para secundarios
 * (labels, captions) para crear jerarquía sin repetir clases.
 * ──────────────────────────────────────────────────────────────── */

function Bar({
  w,
  h,
  muted = false,
}: {
  w: number;
  h: number;
  muted?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={
        "inline-block rounded-full " +
        (muted ? "bg-foreground/[0.06]" : "bg-foreground/[0.10]")
      }
      style={{ width: `${w}px`, height: `${h}px` }}
    />
  );
}

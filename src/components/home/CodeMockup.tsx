import { cn } from "@/lib/utils";

type CodeMockupProps = {
  className?: string;
};

/**
 * Code editor mockup — VS Code-style dark con un snippet JSX.
 *
 * Pareja del `BrowserMockup` en el Hero: el browser dice "construyo
 * UIs", el code editor dice "y lo hago escribiendo el código yo
 * mismo". Es la pieza que va ATRÁS, asomando detrás del browser
 * con offset + rotación leve — funciona como textura narrativa,
 * no como contenido legible end-to-end.
 *
 * Colores hex literales — mismo argumento que los traffic-lights
 * del browser y el theme-color del manifest (PLAYBOOK §14): los
 * tokens de un IDE oscuro son "spec externa" por convención
 * visual reconocible (GitHub Dark / VS Code Dark+). No deben
 * mapear a los tokens del sistema light-mode del portafolio.
 *
 * Composición:
 *   ┌────────────────────────────────────┐
 *   │ ●●●   ● Hero.tsx                   │  title bar
 *   ├──┬─────────────────────────────────┤
 *   │1 │  import { Hero } from "..."     │
 *   │2 │                                 │
 *   │3 │  export default function...     │
 *   │..│  ...                            │
 *   │10│  }▮                             │  cursor lima parpadea
 *   └──┴─────────────────────────────────┘
 *
 * Nota: el componente es decorativo. `aria-hidden` se aplica desde
 * el padre (`HeroComposition`) para que ningún lector de pantalla
 * lo lea como contenido — la accesibilidad del Hero descansa en
 * el H1 + subhead + CTAs, no en las piezas visuales.
 */
export function CodeMockup({ className }: CodeMockupProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[#1f242b] bg-[#0d1117] font-mono text-[11.5px] leading-[1.55] text-[#c9d1d9] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45),0_8px_24px_-8px_rgba(0,0,0,0.25)]",
        className,
      )}
    >
      {/* Title bar — traffic lights + file tab activo */}
      <div className="flex items-center gap-2 border-b border-[#1f242b] bg-[#161b22] px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-full bg-[#FF5F57]" />
          <span aria-hidden className="size-2.5 rounded-full bg-[#FEBC2E]" />
          <span aria-hidden className="size-2.5 rounded-full bg-[#28C840]" />
        </div>
        <div className="ml-2 inline-flex items-center gap-2 rounded-md bg-[#0d1117] px-2.5 py-1 text-[11px] text-white/75">
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-[var(--accent)]"
          />
          Hero.tsx
        </div>
      </div>

      {/* Editor body: gutter de números + código */}
      <div className="flex">
        <div
          aria-hidden
          className="select-none border-r border-[#1f242b] bg-[#161b22] py-3 pl-2.5 pr-2 text-right text-[#484f58]"
        >
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i + 1}>{i + 1}</div>
          ))}
        </div>

        <div className="min-w-0 flex-1 overflow-hidden whitespace-pre py-3 pl-3 pr-3">
          <Line>
            <K>import</K> <Br>{`{`}</Br> Hero <Br>{`}`}</Br> <K>from</K>{" "}
            <S>{`"@/components"`}</S>;
          </Line>
          <Line>{"\u00A0"}</Line>
          <Line>
            <K>export default function</K> <F>Page</F>() <Br>{`{`}</Br>
          </Line>
          <Line>
            {"\u00A0\u00A0"}
            <K>return</K> (
          </Line>
          <Line>
            {"\u00A0\u00A0\u00A0\u00A0"}
            <T>{"<Hero"}</T>
          </Line>
          <Line>
            {"\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}
            <A>name</A>=<S>{`"Jhonatan"`}</S>
          </Line>
          <Line>
            {"\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}
            <A>role</A>=<S>{`"Frontend"`}</S>
          </Line>
          <Line>
            {"\u00A0\u00A0\u00A0\u00A0"}
            <T>{"/>"}</T>
          </Line>
          <Line>
            {"\u00A0\u00A0"});
          </Line>
          <Line>
            <Br>{`}`}</Br>
            <span
              aria-hidden
              className="ml-0.5 inline-block h-3 w-1.5 translate-y-[2px] bg-[var(--accent)] motion-safe:animate-[blink_1.1s_steps(2,end)_infinite]"
            />
          </Line>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * Tokens de syntax highlighting — paleta GitHub Dark, hex literal.
 * Cada componente es un alias semántico: cuando el snippet cambie,
 * el call-site sigue siendo legible (no es `<span color="#ff7b72">`).
 * ──────────────────────────────────────────────────────────────── */

function Line({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

// Keyword: import, export, function, return, default, const
function K({ children }: { children: React.ReactNode }) {
  return <span className="text-[#ff7b72]">{children}</span>;
}

// String literal
function S({ children }: { children: React.ReactNode }) {
  return <span className="text-[#a5d6ff]">{children}</span>;
}

// JSX tag (<Hero, />)
function T({ children }: { children: React.ReactNode }) {
  return <span className="text-[#7ee787]">{children}</span>;
}

// JSX attribute name (name=, role=)
function A({ children }: { children: React.ReactNode }) {
  return <span className="text-[#d2a8ff]">{children}</span>;
}

// Function name (Page)
function F({ children }: { children: React.ReactNode }) {
  return <span className="text-[#dcbdfb]">{children}</span>;
}

// Brackets / punctuation — atenuados
function Br({ children }: { children: React.ReactNode }) {
  return <span className="text-white/55">{children}</span>;
}

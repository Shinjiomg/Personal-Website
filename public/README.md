# `/public` — assets estáticos servidos en root

Archivos acá son servidos por Next desde la raíz del site
(`/cv.pdf`, `/team/jhonatan-becerra.webp`, etc.) — referenciados
con paths absolutos en código (`src="/cv.pdf"`, no `import`).

## Pendiente · subir CV

El sitio referencia `/cv.pdf` en **dos lugares**:

1. **Botón al pie de la sección Experiencia** — descarga directa con
   nombre sugerido `Jhonatan-Becerra-Resume.pdf`
   (ver `src/components/home/Experience.tsx` · `ResumeCTA`).
2. **Item en la columna "Conectar" del Footer** — link estándar
   (ver `src/components/Footer.tsx`).

Mientras no exista `public/cv.pdf`, ambos enlaces devuelven 404.

### Cómo subirlo

```powershell
# Desde la raíz del repo, copiá tu PDF como cv.pdf en public/:
Copy-Item "C:\ruta\al\Jhonatan-Becerra-Resume.pdf" "public\cv.pdf"
```

Recomendaciones para el PDF:
- **Idioma:** inglés (es la decisión activa; UI lo señaliza explícitamente).
- **Tamaño:** ≤ 200 KB ideal, ≤ 500 KB máximo. Comprimir con
  [SmallPDF](https://smallpdf.com/compress-pdf) o equivalente.
- **Páginas:** 1–2 idealmente; reclutadores escanean, no leen.
- **Mantener actualizado:** el meta del botón dice
  *"Actualizado 2026"* — si cambiás de año, ajustá la string en
  `Experience.tsx` (`ResumeCTA`).

## Convenciones de carpetas

| Path                   | Para qué                                         |
| ---------------------- | ------------------------------------------------ |
| `/cv.pdf`              | Currículo descargable (este pendiente)           |
| `/team/`               | Retratos (servidos vía `next/image`)             |
| `/icons/` y root icons | Favicon variants, generados desde `src/app/`     |
| `/llms.txt`            | Resumen del site para crawlers LLM (SEO ML-era)  |

No agregar binarios pesados (videos, archivos > 1 MB) sin antes
considerar Vercel Blob o un CDN externo.

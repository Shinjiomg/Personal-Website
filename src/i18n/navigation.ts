/**
 * Wrappers locale-aware de las APIs de navegación de Next.js.
 *
 * En lugar de importar `Link` de `next/link` y `redirect`/`usePathname`
 * de `next/navigation`, los componentes importan desde acá. Los
 * wrappers de next-intl agregan automáticamente el prefijo de locale
 * activo a los hrefs (`/proyectos` → `/en/proyectos` cuando el user
 * está en `/en`), evitando hardcodear locales en cada Link.
 *
 * Ejemplo:
 *   ```tsx
 *   import {Link, usePathname} from "@/i18n/navigation";
 *
 *   <Link href="/contacto">Contacto</Link>
 *   // En `/` renderea href="/contacto"
 *   // En `/en` renderea href="/en/contacto"
 *   ```
 *
 * Para anchors internos (hash navigation del onepage, `#experiencia`),
 * seguir usando `next/link` o un `<a>` normal — next-intl no procesa
 * hashes y agregarles prefix los rompería.
 */
import { createNavigation } from "next-intl/navigation";

import { routing } from "@/i18n/routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

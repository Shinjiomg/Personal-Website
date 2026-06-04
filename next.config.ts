import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/* next-intl plugin · conecta el runtime de i18n a Next.js.
 * Por default busca el config en `./src/i18n/request.ts` (que es
 * donde lo tenemos), así que no necesita argumentos. Si en algún
 * momento movemos request.ts a otra ubicación, pasamos el path acá. */
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Default Next 16 / Turbopack config. No custom workspace root needed
  // ahora que el proyecto vive directo en la raíz del repo.
};

export default withNextIntl(nextConfig);

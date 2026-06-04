import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Class-merging helper used across the UI primitives. Combines `clsx`
 * (conditional class composition) with `tailwind-merge` (resolves
 * conflicting Tailwind utilities by keeping only the last one) so
 * variant-driven components don't ship duplicate `p-2 p-4` pairs.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

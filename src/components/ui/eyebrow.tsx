import { cn } from "@/lib/utils";

type EyebrowProps = {
  children: React.ReactNode;
  className?: string;
  /** When false, omits the leading lime dot — useful inside dense
   * layouts where the dot would compete with adjacent visual marks. */
  withDot?: boolean;
};

/**
 * Section eyebrow — small uppercase tag with optional lime dot.
 * Used to anchor every major section header so the visual rhythm
 * is consistent across the home and sub-pages.
 */
export function Eyebrow({ children, className, withDot = true }: EyebrowProps) {
  return (
    <p className={cn("eyebrow", className)}>
      {withDot && <span className="brand-dot" aria-hidden />}
      {children}
    </p>
  );
}

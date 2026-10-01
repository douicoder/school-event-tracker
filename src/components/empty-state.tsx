import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** Icon rendered inside the illustration slot (e.g. a Heroicons outline icon). */
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  /**
   * Compact one-liner layout with a small icon, for placeholders
   * shown inside lists or day cards.
   */
  compact?: boolean;
  /** Render the title as an `h1` (for page-level empty states). */
  titleAs?: "h1" | "p";
  /** Optional action buttons/links rendered under the description. */
  children?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  compact,
  titleAs = "p",
  children,
  className,
}: EmptyStateProps) {
  const TitleTag = titleAs;

  if (compact) {
    return (
      <div
        className={cn(
          "animate-fade-in-up flex items-center justify-center gap-2.5 rounded-xl border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <span className="font-medium text-foreground">{title}</span>
          {description ? <span> &middot; {description}</span> : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "animate-fade-in-up flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-4 py-14 text-center sm:py-20",
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
      </div>
      <TitleTag className="mt-4 text-xl font-semibold">{title}</TitleTag>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

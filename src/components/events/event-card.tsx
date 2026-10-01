import type { EventInfo } from "@/domain";
import { COLOR_VARIANTS } from "@/lib/colors";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: EventInfo;
  onOpen: (event: EventInfo) => void;
}

export function EventCard({ event, onOpen }: EventCardProps) {
  const variant = COLOR_VARIANTS[event.color];

  return (
    <button
      type="button"
      onClick={() => onOpen(event)}
      className={cn(
        "w-full rounded-xl border-l-4 px-3 py-2 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:brightness-95 active:translate-y-0 dark:hover:brightness-125",
        variant.bg,
        variant.border,
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("h-2 w-2 shrink-0 rounded-full", variant.dot)} />
        <span className={cn("truncate text-sm font-medium", variant.text)}>
          {event.title}
        </span>
      </div>
      {event.createdByName ? (
        <p className="mt-1 text-right text-[11px] text-muted-foreground/80">
          by {event.createdByName}
        </p>
      ) : null}
    </button>
  );
}

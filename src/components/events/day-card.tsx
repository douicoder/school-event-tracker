import type { DaySchedule, EventInfo } from "@/domain";
import { SunIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { EventCard } from "./event-card";

interface DayCardProps {
  day: DaySchedule;
  onEventOpen: (event: EventInfo) => void;
  /** Position in the grid, used to stagger the entrance animation. */
  index?: number;
}

export function DayCard({ day, onEventOpen, index = 0 }: DayCardProps) {
  return (
    <section
      className={cn(
        "animate-fade-in-up flex flex-col rounded-2xl border border-border bg-card p-4",
        day.isToday && "ring-1 ring-primary",
      )}
      style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
    >
      <header className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{day.dayName}</h3>
        <span className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{day.dateLabel}</span>
          {day.isToday ? <Badge>Today</Badge> : null}
        </span>
      </header>

      <div className="mt-3 flex flex-1 flex-col gap-2">
        {day.events.length > 0 ? (
          day.events.map((event) => (
            <EventCard key={event.id} event={event} onOpen={onEventOpen} />
          ))
        ) : (
          <EmptyState
            compact
            icon={SunIcon}
            title="Enjoy the rest of your day."
            className="flex-1 py-6 text-xs"
          />
        )}
      </div>
    </section>
  );
}

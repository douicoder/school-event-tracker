import type { DaySchedule, EventInfo } from "@/domain";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EventCard } from "./event-card";

interface DayCardProps {
  day: DaySchedule;
  onEventOpen: (event: EventInfo) => void;
}

export function DayCard({ day, onEventOpen }: DayCardProps) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-2xl border border-border bg-card p-4",
        day.isToday && "ring-1 ring-primary",
      )}
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
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border py-6 text-xs text-muted-foreground">
            No events
          </div>
        )}
      </div>
    </section>
  );
}

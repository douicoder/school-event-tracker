import { format, parseISO } from "date-fns";
import type { DaySchedule, EventInfo } from "@/domain";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EventCard } from "./event-card";

interface DayCardProps {
  day: DaySchedule;
  nextEvent: EventInfo | null;
  onEventOpen: (event: EventInfo) => void;
}

function nextEventLabel(eventDate: string): string {
  return format(parseISO(eventDate), "EEEE");
}

export function DayCard({ day, nextEvent, onEventOpen }: DayCardProps) {
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
          <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
            {nextEvent ? (
              <>
                <span className="font-medium text-foreground">
                  {nextEvent.title}
                </span>
                <span>{nextEventLabel(nextEvent.eventDate)}</span>
              </>
            ) : (
              <span>No tests coming up. Enjoy your day…</span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

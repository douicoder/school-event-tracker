"use client";

import * as React from "react";
import { differenceInCalendarDays, format, startOfDay } from "date-fns";
import { ChevronDown, ChevronUp, Timer } from "lucide-react";
import type { EventInfo } from "@/domain";
import { COLOR_VARIANTS } from "@/lib/colors";
import { todayKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface CountdownCardProps {
  events: EventInfo[];
}

function toDate(dateKeyValue: string): Date {
  const [year, month, day] = dateKeyValue.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function daysUntil(dateKeyValue: string): number {
  return differenceInCalendarDays(
    startOfDay(toDate(dateKeyValue)),
    startOfDay(new Date()),
  );
}

function relativeLabel(dateKeyValue: string): string {
  const days = daysUntil(dateKeyValue);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `in ${days} days`;
}

export function CountdownCard({ events }: CountdownCardProps) {
  const [expanded, setExpanded] = React.useState(false);

  const upcoming = React.useMemo(() => {
    return events
      .filter((event) => event.eventDate >= todayKey())
      .sort(
        (a, b) =>
          a.eventDate.localeCompare(b.eventDate) ||
          a.title.localeCompare(b.title),
      );
  }, [events]);

  if (upcoming.length === 0) return null;

  const first = upcoming[0];
  const rest = upcoming.slice(1);
  const variant = COLOR_VARIANTS[first.color];
  const firstDate = toDate(first.eventDate);
  const firstDays = daysUntil(first.eventDate);
  const pill = firstDays === 0 ? "Today" : firstDays === 1 ? "Tomorrow" : `${firstDays} days`;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Timer className="h-3.5 w-3.5" />
          Next up
        </span>
        {rest.length > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            {expanded ? "Show less" : `Show ${rest.length} more`}
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        ) : null}
      </div>

      <div className="mt-2 flex items-center gap-3">
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-lg px-2.5 py-1.5 text-xs font-bold",
            variant.bg,
            variant.text,
          )}
        >
          {pill}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{first.title}</p>
          <p className="text-xs text-muted-foreground">
            {format(firstDate, "EEE, MMM d")}
          </p>
        </div>
      </div>

      {expanded && rest.length > 0 ? (
        <ul className="mt-3 space-y-2 border-t border-border pt-3">
          {rest.map((event) => {
            const itemVariant = COLOR_VARIANTS[event.color];
            return (
              <li key={event.id} className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2 text-sm">
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      itemVariant.dot,
                    )}
                  />
                  <span className="truncate">{event.title}</span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {relativeLabel(event.eventDate)} ·{" "}
                  {format(toDate(event.eventDate), "EEE, MMM d")}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

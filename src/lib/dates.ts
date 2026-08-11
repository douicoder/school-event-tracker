import { addDays, format, startOfDay } from "date-fns";
import type { DaySchedule, EventInfo } from "@/domain";

export function dateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function todayKey(): string {
  return dateKey(new Date());
}

export function buildWeek(anchor: Date, events: EventInfo[] = []): DaySchedule[] {
  const today = startOfDay(anchor);
  const todayDateKey = dateKey(new Date());

  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i);
    const key = dateKey(date);
    return {
      dateKey: key,
      dayName: key === todayDateKey ? "Today" : format(date, "EEEE"),
      dateLabel: format(date, "MMM d"),
      isToday: key === todayDateKey,
      events: events.filter((event) => event.eventDate === key),
    };
  });
}

export function formatEventDate(dateKeyValue: string): string {
  const [year, month, day] = dateKeyValue.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return format(date, "EEE, MMM d yyyy");
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy 'at' h:mm a");
}

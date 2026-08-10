"use client";

import * as React from "react";
import { addDays } from "date-fns";
import { CalendarPlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import type { EventInfo } from "@/domain";
import { buildWeek, dateKey, todayKey } from "@/lib/dates";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DayCard } from "./day-card";
import { EventModal } from "./event-modal";
import { EventDetailModal } from "./event-detail-modal";

interface ScheduleBoardProps {
  classId: string;
  canManage: boolean;
}

export function ScheduleBoard({ classId, canManage }: ScheduleBoardProps) {
  const [events, setEvents] = React.useState<EventInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [detailEvent, setDetailEvent] = React.useState<EventInfo | null>(null);
  const [editEvent, setEditEvent] = React.useState<EventInfo | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<EventInfo | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const from = todayKey();
  const to = dateKey(addDays(new Date(), 6));
  const days = buildWeek(new Date(), events);

  const loadEvents = React.useCallback(async () => {
    try {
      const data = await api.get<{ events: EventInfo[] }>(
        `/api/classes/${classId}/events?from=${from}&to=${to}`,
      );
      setEvents(data.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [classId, from, to]);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const data = await api.get<{ events: EventInfo[] }>(
          `/api/classes/${classId}/events?from=${from}&to=${to}`,
        );
        if (!cancelled) setEvents(data.events);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load events");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [classId, from, to]);

  function refresh() {
    setLoading(true);
    setError(null);
    loadEvents();
  }

  function handleSaved(event: EventInfo) {
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === event.id);
      if (!exists) return [...prev, event];
      return prev.map((e) => (e.id === event.id ? event : e));
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    api
      .delete(`/api/events/${deleteTarget.id}`)
      .then(() => {
        setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
        setDeleteTarget(null);
        setDetailEvent(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to delete event");
        setDeleteTarget(null);
      })
      .finally(() => setDeleting(false));
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">today</span> through{" "}
          <span className="font-medium text-foreground">{days[days.length - 1].dateLabel}</span>
        </p>
        <div className="flex items-center gap-2">
          {canManage ? (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <CalendarPlus className="h-4 w-4" />
              Add event
            </Button>
          ) : null}
          <Button size="sm" variant="outline" onClick={refresh} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-16 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading schedule…
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {days.map((day) => (
            <DayCard key={day.dateKey} day={day} onEventOpen={setDetailEvent} />
          ))}
        </div>
      )}

      <EventModal
        key={createOpen ? "create-open" : "create-closed"}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        classId={classId}
        event={null}
        defaultDate={from}
        onSaved={handleSaved}
      />

      <EventModal
        key={editEvent ? `edit-${editEvent.id}` : "edit-closed"}
        open={!!editEvent}
        onClose={() => setEditEvent(null)}
        classId={classId}
        event={editEvent}
        defaultDate={from}
        onSaved={handleSaved}
      />

      <EventDetailModal
        event={detailEvent}
        canManage={canManage}
        onClose={() => setDetailEvent(null)}
        onEdit={(event) => {
          setDetailEvent(null);
          setEditEvent(event);
        }}
        onDelete={setDeleteTarget}
      />

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete event"
        description="This action cannot be undone."
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-medium text-foreground">{deleteTarget?.title}</span>?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

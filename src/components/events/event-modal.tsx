"use client";

import * as React from "react";
import { Save, Loader2 } from "lucide-react";
import type { EventColor, EventInfo } from "@/domain";
import { COLOR_META, COLOR_VARIANTS, EVENT_COLOR_ORDER } from "@/lib/colors";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  classId: string;
  event: EventInfo | null;
  defaultDate: string;
  onSaved: (event: EventInfo) => void;
}

export function EventModal({
  open,
  onClose,
  classId,
  event,
  defaultDate,
  onSaved,
}: EventModalProps) {
  const [title, setTitle] = React.useState(event?.title ?? "");
  const [description, setDescription] = React.useState(event?.description ?? "");
  const [color, setColor] = React.useState<EventColor>(event?.color ?? "blue");
  const [eventDate, setEventDate] = React.useState(event?.eventDate ?? defaultDate);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(eventSubmit: React.FormEvent<HTMLFormElement>) {
    eventSubmit.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      color,
      eventDate,
    };

    try {
      const saved = event
        ? await api.patch<{ event: EventInfo }>(`/api/events/${event.id}`, payload)
        : await api.post<{ event: EventInfo }>("/api/events", {
            ...payload,
            classId,
          });
      onSaved(saved.event);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={event ? "Edit event" : "New event"}
      description={event ? "Update the details of this event." : "Add an event to the schedule."}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="event-title" className="mb-1 block text-sm font-medium">
            Title
          </label>
          <Input
            id="event-title"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Midterm exam"
          />
        </div>

        <div>
          <label
            htmlFor="event-description"
            className="mb-1 block text-sm font-medium"
          >
            Description <span className="text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="event-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Details students should know…"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="event-date" className="mb-1 block text-sm font-medium">
              Date
            </label>
            <Input
              id="event-date"
              type="date"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium">Color</span>
            <div className="flex h-9 items-center gap-2">
              {EVENT_COLOR_ORDER.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={COLOR_META[c].label}
                  aria-label={COLOR_META[c].label}
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-6 w-6 rounded-full transition",
                    COLOR_VARIANTS[c].swatch,
                    color === c
                      ? "ring-2 ring-ring ring-offset-2 ring-offset-card"
                      : "hover:scale-110",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {error ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {event ? "Save changes" : "Add event"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

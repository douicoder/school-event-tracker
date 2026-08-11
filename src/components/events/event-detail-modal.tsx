"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { EventInfo } from "@/domain";
import { COLOR_META, COLOR_VARIANTS } from "@/lib/colors";
import { formatDateTime, formatEventDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface EventDetailModalProps {
  event: EventInfo | null;
  canManage: boolean;
  onClose: () => void;
  onEdit: (event: EventInfo) => void;
  onDelete: (event: EventInfo) => void;
}

export function EventDetailModal({
  event,
  canManage,
  onClose,
  onEdit,
  onDelete,
}: EventDetailModalProps) {
  if (!event) return null;

  const variant = COLOR_VARIANTS[event.color];

  return (
    <Modal open={!!event} onClose={onClose} title={event.title}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={cn("border", variant.bg, variant.text, variant.border)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", variant.dot)} />
            {COLOR_META[event.color].label}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {formatEventDate(event.eventDate)}
          </span>
        </div>

        {event.description ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {event.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">No description provided.</p>
        )}

        <div className="border-t border-border pt-3 text-xs text-muted-foreground">
          <p>
            Added by <span className="font-medium text-foreground">{event.createdByName ?? "—"}</span>
            {event.createdAt ? (
              <> on <span className="font-medium text-foreground">{formatDateTime(event.createdAt)}</span></>
            ) : null}
          </p>
          {event.updatedAt ? (
            <p className="mt-1">
              Last edited by{" "}
              <span className="font-medium text-foreground">{event.updatedByName ?? "—"}</span>
              {" on "}
              <span className="font-medium text-foreground">{formatDateTime(event.updatedAt)}</span>
            </p>
          ) : null}
        </div>

        {canManage ? (
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onDelete(event)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <Button onClick={() => onEdit(event)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

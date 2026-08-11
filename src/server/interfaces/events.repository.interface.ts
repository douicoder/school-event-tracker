import type { EventRow, NewEvent, UserRow } from "@/db/schema";

export interface EventWithUsers extends EventRow {
  createdByUser: UserRow | null;
  updatedByUser: UserRow | null;
}

export type EventUpdateFields = Pick<
  EventRow,
  "title" | "description" | "color" | "eventDate" | "updatedBy" | "updatedAt"
>;

export interface IEventsRepository {
  findByDateRange(classId: string, from: string, to: string): Promise<EventWithUsers[]>;
  findById(id: string): Promise<EventWithUsers | null>;
  create(data: NewEvent): Promise<EventWithUsers>;
  update(id: string, data: Partial<EventUpdateFields>): Promise<EventWithUsers>;
  deleteById(id: string): Promise<void>;
}

import type { EventRow, NewEvent } from "@/db/schema";

export interface IEventsRepository {
  findByDateRange(classId: string, from: string, to: string): Promise<EventRow[]>;
  findById(id: string): Promise<EventRow | null>;
  create(data: NewEvent): Promise<EventRow>;
  update(
    id: string,
    data: Partial<Pick<EventRow, "title" | "description" | "color" | "eventDate">>,
  ): Promise<EventRow>;
  deleteById(id: string): Promise<void>;
}

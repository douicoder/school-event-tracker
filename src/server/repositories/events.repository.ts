import { and, desc, eq, gte, lte } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { EventRow, NewEvent } from "@/db/schema";
import { events } from "@/db/schema";
import type { IEventsRepository } from "@/server/interfaces/events.repository.interface";

type Database = NeonHttpDatabase<typeof import("@/db/schema")>;

export class EventsRepository implements IEventsRepository {
  constructor(private readonly db: Database) {}

  async findByDateRange(classId: string, from: string, to: string): Promise<EventRow[]> {
    return this.db
      .select()
      .from(events)
      .where(
        and(
          eq(events.classId, classId),
          gte(events.eventDate, from),
          lte(events.eventDate, to),
        ),
      )
      .orderBy(desc(events.createdAt));
  }

  async findById(id: string): Promise<EventRow | null> {
    const rows = await this.db.select().from(events).where(eq(events.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async create(data: NewEvent): Promise<EventRow> {
    const rows = await this.db.insert(events).values(data).returning();
    return rows[0];
  }

  async update(
    id: string,
    data: Partial<Pick<EventRow, "title" | "description" | "color" | "eventDate">>,
  ): Promise<EventRow> {
    const rows = await this.db.update(events).set(data).where(eq(events.id, id)).returning();
    return rows[0];
  }

  async deleteById(id: string): Promise<void> {
    await this.db.delete(events).where(eq(events.id, id));
  }
}

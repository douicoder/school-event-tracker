import { and, desc, eq, gte, lte } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { NewEvent } from "@/db/schema";
import { events } from "@/db/schema";
import type {
  EventUpdateFields,
  EventWithUsers,
  IEventsRepository,
} from "@/server/interfaces/events.repository.interface";

type Database = NeonHttpDatabase<typeof import("@/db/schema")>;

const withUsers = {
  createdByUser: true,
  updatedByUser: true,
} as const;

export class EventsRepository implements IEventsRepository {
  constructor(private readonly db: Database) {}

  async findByDateRange(classId: string, from: string, to: string): Promise<EventWithUsers[]> {
    return this.db.query.events.findMany({
      where: and(
        eq(events.classId, classId),
        gte(events.eventDate, from),
        lte(events.eventDate, to),
      ),
      with: withUsers,
      orderBy: desc(events.createdAt),
    });
  }

  async findById(id: string): Promise<EventWithUsers | null> {
    const row = await this.db.query.events.findFirst({
      where: eq(events.id, id),
      with: withUsers,
    });
    return row ?? null;
  }

  async create(data: NewEvent): Promise<EventWithUsers> {
    const rows = await this.db.insert(events).values(data).returning();
    const created = await this.findById(rows[0].id);
    if (!created) throw new Error("Failed to load created event");
    return created;
  }

  async update(id: string, data: Partial<EventUpdateFields>): Promise<EventWithUsers> {
    await this.db.update(events).set(data).where(eq(events.id, id));
    const updated = await this.findById(id);
    if (!updated) throw new Error("Failed to load updated event");
    return updated;
  }

  async deleteById(id: string): Promise<void> {
    await this.db.delete(events).where(eq(events.id, id));
  }
}

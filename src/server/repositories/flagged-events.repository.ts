import { desc, eq } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { NewFlaggedEvent, FlaggedEventRow } from "@/db/schema";
import { flaggedEvents } from "@/db/schema";
import type {
  FlaggedEventWithUser,
  IFlaggedEventsRepository,
} from "@/server/interfaces/flagged-events.repository.interface";

type Database = NeonHttpDatabase<typeof import("@/db/schema")>;

const withRelations = {
  submittedByUser: true,
  class: true,
} as const;

export class FlaggedEventsRepository implements IFlaggedEventsRepository {
  constructor(private readonly db: Database) {}

  async create(data: NewFlaggedEvent): Promise<FlaggedEventRow> {
    const rows = await this.db.insert(flaggedEvents).values(data).returning();
    return rows[0];
  }

  async findAll(): Promise<FlaggedEventWithUser[]> {
    return this.db.query.flaggedEvents.findMany({
      with: withRelations,
      orderBy: desc(flaggedEvents.submittedAt),
    });
  }

  async findById(id: string): Promise<FlaggedEventWithUser | null> {
    const row = await this.db.query.flaggedEvents.findFirst({
      where: eq(flaggedEvents.id, id),
      with: withRelations,
    });
    return row ?? null;
  }

  async markReviewed(id: string): Promise<FlaggedEventRow> {
    const rows = await this.db
      .update(flaggedEvents)
      .set({ isReviewed: true })
      .where(eq(flaggedEvents.id, id))
      .returning();
    return rows[0];
  }
}

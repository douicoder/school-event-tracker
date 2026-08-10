import { asc, eq } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { ClassRow, NewClass } from "@/db/schema";
import { classes } from "@/db/schema";
import type { IClassesRepository } from "@/server/interfaces/classes.repository.interface";

type Database = NeonHttpDatabase<typeof import("@/db/schema")>;

export class ClassesRepository implements IClassesRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<ClassRow | null> {
    const rows = await this.db.select().from(classes).where(eq(classes.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async findByName(name: string): Promise<ClassRow | null> {
    const rows = await this.db.select().from(classes).where(eq(classes.name, name)).limit(1);
    return rows[0] ?? null;
  }

  async listAll(): Promise<ClassRow[]> {
    return this.db.select().from(classes).orderBy(asc(classes.name));
  }

  async create(data: NewClass): Promise<ClassRow> {
    const rows = await this.db.insert(classes).values(data).returning();
    return rows[0];
  }

  async update(
    id: string,
    data: { name?: string; description?: string | null },
  ): Promise<ClassRow> {
    const rows = await this.db.update(classes).set(data).where(eq(classes.id, id)).returning();
    return rows[0];
  }

  async deleteById(id: string): Promise<void> {
    await this.db.delete(classes).where(eq(classes.id, id));
  }
}

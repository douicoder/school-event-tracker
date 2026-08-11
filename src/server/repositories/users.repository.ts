import { desc, eq } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { NewUser, UserRow } from "@/db/schema";
import { users } from "@/db/schema";
import type { IUsersRepository } from "@/server/interfaces/users.repository.interface";

type Database = NeonHttpDatabase<typeof import("@/db/schema")>;

export class UsersRepository implements IUsersRepository {
  constructor(private readonly db: Database) {}

  async findByEmail(email: string): Promise<UserRow | null> {
    const rows = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return rows[0] ?? null;
  }

  async findById(id: string): Promise<UserRow | null> {
    const rows = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async create(data: NewUser): Promise<UserRow> {
    const rows = await this.db.insert(users).values(data).returning();
    return rows[0];
  }

  async listAll(): Promise<UserRow[]> {
    return this.db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateName(id: string, name: string): Promise<UserRow> {
    const rows = await this.db.update(users).set({ name }).where(eq(users.id, id)).returning();
    return rows[0];
  }

  async updateRole(id: string, role: UserRow["role"]): Promise<UserRow> {
    const rows = await this.db.update(users).set({ role }).where(eq(users.id, id)).returning();
    return rows[0];
  }

  async updateAssignedClass(id: string, classId: string | null): Promise<UserRow> {
    const rows = await this.db
      .update(users)
      .set({ assignedClassId: classId })
      .where(eq(users.id, id))
      .returning();
    return rows[0];
  }

  async updatePassword(id: string, passwordHash: string): Promise<UserRow> {
    const rows = await this.db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, id))
      .returning();
    return rows[0];
  }

  async deleteById(id: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }
}

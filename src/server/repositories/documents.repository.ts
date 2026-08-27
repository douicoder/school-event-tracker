import { desc, eq } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { NewDocument } from "@/db/schema";
import { documents } from "@/db/schema";
import type {
  DocumentMeta,
  DocumentWithUploader,
  IDocumentsRepository,
} from "@/server/interfaces/documents.repository.interface";

type Database = NeonHttpDatabase<typeof import("@/db/schema")>;

export class DocumentsRepository implements IDocumentsRepository {
  constructor(private readonly db: Database) {}

  async findByClass(classId: string): Promise<DocumentMeta[]> {
    return this.db.query.documents.findMany({
      columns: { data: false },
      with: { uploadedByUser: true },
      where: eq(documents.classId, classId),
      orderBy: desc(documents.createdAt),
    });
  }

  async findById(id: string): Promise<DocumentWithUploader | null> {
    const row = await this.db.query.documents.findFirst({
      where: eq(documents.id, id),
      with: { uploadedByUser: true },
    });
    return row ?? null;
  }

  async create(data: NewDocument): Promise<DocumentWithUploader> {
    const rows = await this.db.insert(documents).values(data).returning();
    const created = await this.findById(rows[0].id);
    if (!created) throw new Error("Failed to load created document");
    return created;
  }

  async deleteById(id: string): Promise<void> {
    await this.db.delete(documents).where(eq(documents.id, id));
  }
}

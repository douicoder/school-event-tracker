import type { DocumentRow, NewDocument, UserRow } from "@/db/schema";

export interface DocumentWithUploader extends DocumentRow {
  uploadedByUser: UserRow | null;
}

export type DocumentMeta = Omit<DocumentRow, "data"> & {
  uploadedByUser: UserRow | null;
};

export type DocumentUpdateFields = Pick<
  DocumentRow,
  "title" | "fileName" | "mimeType" | "sizeBytes" | "data"
>;

export interface IDocumentsRepository {
  findByClass(classId: string): Promise<DocumentMeta[]>;
  findById(id: string): Promise<DocumentWithUploader | null>;
  create(data: NewDocument): Promise<DocumentWithUploader>;
  deleteById(id: string): Promise<void>;
}

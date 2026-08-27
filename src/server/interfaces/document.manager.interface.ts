import type {
  CreateDocumentInput,
  DocumentFile,
  DocumentInfo,
  UserSession,
} from "@/domain";

export interface IDocumentManager {
  listForClass(classId: string): Promise<DocumentInfo[]>;
  create(actor: UserSession, input: CreateDocumentInput, file: File): Promise<DocumentInfo>;
  serve(id: string): Promise<DocumentFile | null>;
  remove(actor: UserSession, id: string): Promise<void>;
}

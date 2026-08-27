import type { CreateDocumentInput, DocumentFile, DocumentInfo, UserSession } from "@/domain";
import {
  ALLOWED_MIME_TYPES,
  MAX_DOCUMENT_BYTES,
  isAllowedMimeType,
} from "@/server/validations/document.validation";
import { notFound, validationError } from "@/server/errors";
import { assertCanManageClass } from "@/server/guards";
import type { IClassesRepository } from "@/server/interfaces/classes.repository.interface";
import type { IDocumentManager } from "@/server/interfaces/document.manager.interface";
import type { IDocumentsRepository } from "@/server/interfaces/documents.repository.interface";
import { toDocumentInfo } from "@/server/mappers";

export class DocumentManager implements IDocumentManager {
  constructor(
    private readonly documentsRepository: IDocumentsRepository,
    private readonly classesRepository: IClassesRepository,
  ) {}

  async listForClass(classId: string): Promise<DocumentInfo[]> {
    const classExists = await this.classesRepository.findById(classId);
    if (!classExists) throw notFound("Class not found");

    const rows = await this.documentsRepository.findByClass(classId);
    return rows.map(toDocumentInfo);
  }

  async create(
    actor: UserSession,
    input: CreateDocumentInput,
    file: File,
  ): Promise<DocumentInfo> {
    const classExists = await this.classesRepository.findById(input.classId);
    if (!classExists) throw notFound("Class not found");

    assertCanManageClass(actor, input.classId);

    if (!isAllowedMimeType(file.type)) {
      throw validationError(
        `Unsupported file type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
      );
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      throw validationError(
        `File is too large. Maximum size is ${MAX_DOCUMENT_BYTES / (1024 * 1024)} MB`,
      );
    }
    if (file.size === 0) {
      throw validationError("File is empty");
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const row = await this.documentsRepository.create({
      classId: input.classId,
      title: input.title.trim(),
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      data: buffer,
      uploadedBy: actor.id,
    });
    return toDocumentInfo(row);
  }

  async remove(actor: UserSession, id: string): Promise<void> {
    const existing = await this.documentsRepository.findById(id);
    if (!existing) throw notFound("Document not found");

    assertCanManageClass(actor, existing.classId);

    await this.documentsRepository.deleteById(id);
  }

  async serve(id: string): Promise<DocumentFile | null> {
    const existing = await this.documentsRepository.findById(id);
    if (!existing) return null;

    return {
      data: existing.data,
      mimeType: existing.mimeType,
      fileName: existing.fileName,
    };
  }
}

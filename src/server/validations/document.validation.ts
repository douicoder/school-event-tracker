import { z } from "zod";

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

export const createDocumentSchema = z.object({
  classId: z.string().uuid("classId must be a valid UUID"),
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
});

export function isAllowedMimeType(mimeType: string): boolean {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

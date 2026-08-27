import type { ClassRow, UserRow } from "@/db/schema";
import type { ClassInfo, DocumentInfo, EventInfo, User, FlaggedEventInfo } from "@/domain";
import type { EventWithUsers } from "@/server/interfaces/events.repository.interface";
import type { FlaggedEventWithUser } from "@/server/interfaces/flagged-events.repository.interface";
import type { DocumentMeta } from "@/server/interfaces/documents.repository.interface";

export function toClassInfo(row: ClassRow): ClassInfo {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
  };
}

function displayName(user: { name: string | null; email: string } | null): string | null {
  if (!user) return null;
  return user.name ?? user.email;
}

export function toEventInfo(row: EventWithUsers): EventInfo {
  return {
    id: row.id,
    classId: row.classId,
    title: row.title,
    description: row.description,
    color: row.color,
    eventDate: row.eventDate,
    createdBy: row.createdBy,
    createdByName: displayName(row.createdByUser),
    createdAt: row.createdAt.toISOString(),
    updatedBy: row.updatedBy,
    updatedByName: displayName(row.updatedByUser),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
  };
}

export function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    assignedClassId: row.assignedClassId,
    isBanned: row.isBanned,
  };
}

export function toDocumentInfo(row: DocumentMeta): DocumentInfo {
  return {
    id: row.id,
    classId: row.classId,
    title: row.title,
    fileName: row.fileName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    uploadedBy: row.uploadedBy,
    uploadedByName: displayName(row.uploadedByUser),
    createdAt: row.createdAt.toISOString(),
  };
}

export function toFlaggedEventInfo(row: FlaggedEventWithUser): FlaggedEventInfo {
  return {
    id: row.id,
    classId: row.classId,
    className: row.class ? row.class.name : null,
    title: row.title,
    description: row.description,
    color: row.color,
    eventDate: row.eventDate,
    submittedBy: row.submittedBy,
    submittedByName: displayName(row.submittedByUser),
    submittedByEmail: row.submittedByUser ? row.submittedByUser.email : null,
    submittedAt: row.submittedAt.toISOString(),
    isReviewed: row.isReviewed,
  };
}

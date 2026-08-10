import type { ClassRow, EventRow, UserRow } from "@/db/schema";
import type { ClassInfo, EventInfo, User } from "@/domain";

export function toClassInfo(row: ClassRow): ClassInfo {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
  };
}

export function toEventInfo(row: EventRow): EventInfo {
  return {
    id: row.id,
    classId: row.classId,
    title: row.title,
    description: row.description,
    color: row.color,
    eventDate: row.eventDate,
  };
}

export function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    assignedClassId: row.assignedClassId,
  };
}

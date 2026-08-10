import type { UserSession } from "@/domain";
import { forbidden } from "@/server/errors";

export function assertAdmin(actor: UserSession): void {
  if (actor.role !== "admin") {
    throw forbidden("Only the system admin can perform this action");
  }
}

export function assertCanManageClass(actor: UserSession, classId: string): void {
  if (actor.role === "admin") return;
  if (actor.assignedClassId !== classId) {
    throw forbidden("You can only manage events for your assigned class");
  }
}

import { auth } from "@/auth";
import type { UserSession } from "@/domain";
import { forbidden, unauthorized } from "@/server/errors";

export async function getCurrentUser(): Promise<UserSession | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.email) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    assignedClassId: user.assignedClassId,
  };
}

export async function requireUser(): Promise<UserSession> {
  const user = await getCurrentUser();
  if (!user) throw unauthorized();
  return user;
}

export async function requireAdmin(): Promise<UserSession> {
  const user = await requireUser();
  if (user.role !== "admin") throw forbidden();
  return user;
}

export async function requireManager(): Promise<UserSession> {
  const user = await requireUser();
  if (user.role !== "class_manager") throw forbidden();
  return user;
}

export function canManageClass(user: UserSession, classId: string): boolean {
  return user.role === "admin" || user.assignedClassId === classId;
}

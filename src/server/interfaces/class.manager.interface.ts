import type { ClassInfo, CreateClassInput, UpdateClassInput, UserSession } from "@/domain";

export interface IClassManager {
  list(): Promise<ClassInfo[]>;
  create(actor: UserSession, input: CreateClassInput): Promise<ClassInfo>;
  update(actor: UserSession, id: string, input: UpdateClassInput): Promise<ClassInfo>;
  remove(actor: UserSession, id: string): Promise<void>;
}

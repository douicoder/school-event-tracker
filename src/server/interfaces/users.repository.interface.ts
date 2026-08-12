import type { NewUser, UserRow } from "@/db/schema";

export interface IUsersRepository {
  findByEmail(email: string): Promise<UserRow | null>;
  findById(id: string): Promise<UserRow | null>;
  create(data: NewUser): Promise<UserRow>;
  listAll(): Promise<UserRow[]>;
  updateName(id: string, name: string): Promise<UserRow>;
  updateRole(id: string, role: UserRow["role"]): Promise<UserRow>;
  updateAssignedClass(id: string, classId: string | null): Promise<UserRow>;
  updatePassword(id: string, passwordHash: string): Promise<UserRow>;
  banUser(id: string): Promise<UserRow>;
  unbanUser(id: string): Promise<UserRow>;
  deleteById(id: string): Promise<void>;
}

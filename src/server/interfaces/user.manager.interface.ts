import type { CreateUserInput, UpdateUserInput, User, UserSession } from "@/domain";

export interface IUserManager {
  list(actor: UserSession): Promise<User[]>;
  create(actor: UserSession, input: CreateUserInput): Promise<User>;
  update(actor: UserSession, id: string, input: UpdateUserInput): Promise<User>;
  remove(actor: UserSession, id: string): Promise<void>;
}

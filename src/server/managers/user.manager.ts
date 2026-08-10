import bcrypt from "bcryptjs";
import type { CreateUserInput, UpdateUserInput, User, UserSession } from "@/domain";
import { conflict, notFound, validationError } from "@/server/errors";
import { assertAdmin } from "@/server/guards";
import type { IUserManager } from "@/server/interfaces/user.manager.interface";
import type { IUsersRepository } from "@/server/interfaces/users.repository.interface";
import { toUser } from "@/server/mappers";

export class UserManager implements IUserManager {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async list(actor: UserSession): Promise<User[]> {
    assertAdmin(actor);
    const rows = await this.usersRepository.listAll();
    return rows.map(toUser);
  }

  async create(actor: UserSession, input: CreateUserInput): Promise<User> {
    assertAdmin(actor);

    const email = input.email.toLowerCase().trim();
    const existing = await this.usersRepository.findByEmail(email);
    if (existing) {
      throw conflict("A user with that email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const row = await this.usersRepository.create({
      email,
      passwordHash,
      role: input.role,
      assignedClassId: input.assignedClassId ?? null,
    });
    return toUser(row);
  }

  async update(actor: UserSession, id: string, input: UpdateUserInput): Promise<User> {
    assertAdmin(actor);

    if (id === actor.id) {
      throw validationError("You cannot modify your own account");
    }

    const existing = await this.usersRepository.findById(id);
    if (!existing) throw notFound("User not found");

    let row = existing;
    if (input.role) {
      row = await this.usersRepository.updateRole(id, input.role);
    }
    if (input.assignedClassId !== undefined) {
      row = await this.usersRepository.updateAssignedClass(id, input.assignedClassId);
    }
    if (input.password) {
      const passwordHash = await bcrypt.hash(input.password, 10);
      row = await this.usersRepository.updatePassword(id, passwordHash);
    }
    return toUser(row);
  }

  async remove(actor: UserSession, id: string): Promise<void> {
    assertAdmin(actor);

    if (id === actor.id) {
      throw validationError("You cannot delete your own account");
    }

    const existing = await this.usersRepository.findById(id);
    if (!existing) throw notFound("User not found");

    await this.usersRepository.deleteById(id);
  }
}

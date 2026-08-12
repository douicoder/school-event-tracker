import bcrypt from "bcryptjs";
import type { UserSession } from "@/domain";
import type { IAuthManager } from "@/server/interfaces/auth.manager.interface";
import type { IUsersRepository } from "@/server/interfaces/users.repository.interface";

export class AuthManager implements IAuthManager {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async validateCredentials(email: string, password: string): Promise<UserSession | null> {
    const user = await this.usersRepository.findByEmail(email.toLowerCase().trim());
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;

    if (user.isBanned) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      assignedClassId: user.assignedClassId,
      isBanned: user.isBanned,
    };
  }
}

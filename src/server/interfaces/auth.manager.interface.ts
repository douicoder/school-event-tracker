import type { UserSession } from "@/domain";

export interface IAuthManager {
  validateCredentials(email: string, password: string): Promise<UserSession | null>;
}

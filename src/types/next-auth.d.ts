import type { DefaultSession } from "@auth/core/types";
import type { UserRole } from "@/domain";

declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      assignedClassId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    name: string | null;
    role: UserRole;
    assignedClassId: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    name?: string | null;
    role?: UserRole;
    assignedClassId?: string | null;
  }
}

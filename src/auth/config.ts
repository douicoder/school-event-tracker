import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authManager } from "@/server/container";
import { credentialsSchema } from "@/server/validations/auth.validation";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await authManager.validateCredentials(
          parsed.data.email,
          parsed.data.password,
        );
        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          assignedClassId: user.assignedClassId,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.assignedClassId = user.assignedClassId;
        token.name = user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role ?? "class_manager";
        session.user.assignedClassId = token.assignedClassId ?? null;
        session.user.name = token.name ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

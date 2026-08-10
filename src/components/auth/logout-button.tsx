"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium transition hover:bg-muted"
    >
      Logout
    </button>
  );
}

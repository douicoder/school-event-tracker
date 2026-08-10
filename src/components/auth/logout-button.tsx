"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      {...({ autoComplete: "off" } as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium transition hover:bg-muted"
    >
      Logout
    </button>
  );
}

import Link from "next/link";
import { CalendarDays, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-semibold">
          <CalendarDays className="h-5 w-5 shrink-0 text-primary" />
          <span className="hidden truncate text-sm sm:inline sm:text-base">
            Class Event Tracker
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="hidden rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground sm:block"
          >
            Home
          </Link>

          {user?.role === "admin" ? (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          ) : null}

          <ThemeToggle />

          {user ? (
            <LogoutButton />
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

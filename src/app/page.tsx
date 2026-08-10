import type { Metadata } from "next";
import { FolderPlus } from "lucide-react";
import { getCurrentUser } from "@/auth/helpers";
import { classManager } from "@/server/container";
import { HomeSchedule } from "@/components/home-schedule";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Class Event Tracker",
  description: "A rolling 7-day view of class events for students, managers, and admins.",
};

export default async function HomePage() {
  const user = await getCurrentUser();
  const classes = await classManager.list();

  const initialClassId =
    (user?.assignedClassId &&
      classes.some((c) => c.id === user.assignedClassId) &&
      user.assignedClassId) ||
    classes[0]?.id ||
    "";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        {classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-4 py-14 text-center sm:py-20">
            <FolderPlus className="h-10 w-10 text-muted-foreground" />
            <h1 className="mt-4 text-xl font-semibold">No classes yet</h1>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              An administrator needs to create a class and assign a manager before events can be
              scheduled.
            </p>
            {!user ? (
              <a
                href="/login"
                className="mt-5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Sign in as administrator
              </a>
            ) : null}
          </div>
        ) : (
          <HomeSchedule
            classes={classes}
            initialClassId={initialClassId}
            role={user?.role ?? null}
            assignedClassId={user?.assignedClassId ?? null}
          />
        )}
      </main>
      <SiteFooter />
    </>
  );
}

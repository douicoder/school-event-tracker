import type { Metadata } from "next";
import { FolderPlusIcon } from "@heroicons/react/24/outline";
import { getCurrentUser } from "@/auth/helpers";
import { classManager } from "@/server/container";
import { EmptyState } from "@/components/empty-state";
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
          <EmptyState
            titleAs="h1"
            icon={FolderPlusIcon}
            title="No classes yet"
            description="An administrator needs to create a class and assign a manager before events can be scheduled."
          >
            {!user ? (
              <a
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Sign in as administrator
              </a>
            ) : null}
          </EmptyState>
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

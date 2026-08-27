import type { Metadata } from "next";
import { getCurrentUser } from "@/auth/helpers";
import { classManager } from "@/server/container";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DocumentsView } from "@/components/documents/documents-view";

export const metadata: Metadata = {
  title: "Class Documents",
  description: "View and manage documents for each class.",
};

export default async function DocumentsPage() {
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
            <h1 className="mt-4 text-xl font-semibold">No classes yet</h1>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              An administrator needs to create a class before documents can be uploaded.
            </p>
          </div>
        ) : (
          <DocumentsView
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

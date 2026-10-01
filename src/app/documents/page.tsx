import type { Metadata } from "next";
import { FolderPlusIcon } from "@heroicons/react/24/outline";
import { getCurrentUser } from "@/auth/helpers";
import { classManager } from "@/server/container";
import { EmptyState } from "@/components/empty-state";
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
          <EmptyState
            titleAs="h1"
            icon={FolderPlusIcon}
            title="No classes yet"
            description="An administrator needs to create a class before documents can be uploaded."
          />
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

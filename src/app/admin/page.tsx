import type { Metadata } from "next";
import { requireAdmin } from "@/auth/helpers";
import { classManager, userManager } from "@/server/container";
import { AdminPanel } from "@/components/admin/admin-panel";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Admin Panel | Class Event Tracker",
};

export default async function AdminPage() {
  const user = await requireAdmin();
  const [classes, users] = await Promise.all([
    classManager.list(),
    userManager.list(user),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage classes, users, and every class schedule from one place.
          </p>
        </div>

        <AdminPanel
          initialClasses={classes}
          initialUsers={users}
          currentUserId={user.id}
        />
      </main>
    </>
  );
}

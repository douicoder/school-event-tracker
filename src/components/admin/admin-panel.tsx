"use client";

import * as React from "react";
import { X } from "lucide-react";
import type { ClassInfo, User } from "@/domain";
import { ClassManagement } from "./class-management";
import { UserProvisioning } from "./user-provisioning";
import { AdminSchedule } from "./admin-schedule";

interface AdminPanelProps {
  initialClasses: ClassInfo[];
  initialUsers: User[];
  currentUserId: string;
}

export function AdminPanel({ initialClasses, initialUsers, currentUserId }: AdminPanelProps) {
  const [classes, setClasses] = React.useState<ClassInfo[]>(initialClasses);
  const [users, setUsers] = React.useState<User[]>(initialUsers);
  const [error, setError] = React.useState<string | null>(null);

  return (
    <div>
      {error ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            className="rounded p-1 hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ClassManagement classes={classes} onClassesChanged={setClasses} onError={setError} />
        <UserProvisioning
          users={users}
          classes={classes}
          currentUserId={currentUserId}
          onUsersChanged={setUsers}
          onError={setError}
        />
      </div>

      <div className="mt-6">
        <AdminSchedule classes={classes} />
      </div>
    </div>
  );
}

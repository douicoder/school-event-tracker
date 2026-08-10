"use client";

import * as React from "react";
import { BarChart3 } from "lucide-react";
import type { ClassInfo } from "@/domain";
import { Select } from "@/components/ui/select";
import { ScheduleBoard } from "@/components/events/schedule-board";
import { RoleSwitcher } from "./role-switcher";

interface AdminScheduleProps {
  classes: ClassInfo[];
}

export function AdminSchedule({ classes }: AdminScheduleProps) {
  const [selectedClassId, setSelectedClassId] = React.useState(classes[0]?.id ?? "");
  const [previewing, setPreviewing] = React.useState(false);

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Global Event Overview</h2>
            <p className="text-sm text-muted-foreground">
              View any class schedule with full admin edit rights.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full sm:w-56"
            aria-label="Select class to view"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <RoleSwitcher previewing={previewing} onChange={setPreviewing} />
        </div>
      </div>

      {selectedClass ? (
        <div className="mt-6">
          <ScheduleBoard
            key={selectedClass.id}
            classId={selectedClass.id}
            canManage={!previewing}
          />
        </div>
      ) : null}
    </section>
  );
}

"use client";

import * as React from "react";
import { GraduationCap, Lock } from "lucide-react";
import type { ClassInfo, UserRole } from "@/domain";
import { Select } from "@/components/ui/select";
import { ScheduleBoard } from "@/components/events/schedule-board";

interface HomeScheduleProps {
  classes: ClassInfo[];
  initialClassId: string;
  role: UserRole | null;
  assignedClassId: string | null;
}

export function HomeSchedule({ classes, initialClassId, role, assignedClassId }: HomeScheduleProps) {
  const [selectedClassId, setSelectedClassId] = React.useState(initialClassId);
  const selectedClass = classes.find((c) => c.id === selectedClassId) ?? classes[0];

  const canManage = role === "admin" || (role === "class_manager" && assignedClassId === selectedClassId);

  return (
    <div>
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">{selectedClass?.name}</h1>
              {selectedClass?.description ? (
                <p className="text-sm text-muted-foreground">{selectedClass.description}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            {classes.length > 1 ? (
              <Select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full sm:w-56"
                aria-label="Select class"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            ) : null}

            {canManage ? (
              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
                <Lock className="h-3 w-3" />
                Can manage
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6">
        {selectedClass ? (
          <ScheduleBoard
            key={selectedClass.id}
            classId={selectedClass.id}
            canManage={canManage}
          />
        ) : null}
      </div>
    </div>
  );
}

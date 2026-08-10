"use client";

import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RoleSwitcherProps {
  previewing: boolean;
  onChange: (previewing: boolean) => void;
}

export function RoleSwitcher({ previewing, onChange }: RoleSwitcherProps) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-card p-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "flex items-center gap-1.5",
          !previewing && "bg-secondary text-secondary-foreground",
        )}
        onClick={() => onChange(false)}
      >
        <Eye className="h-4 w-4" />
        Admin
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "flex items-center gap-1.5",
          previewing && "bg-secondary text-secondary-foreground",
        )}
        onClick={() => onChange(true)}
      >
        <EyeOff className="h-4 w-4" />
        Manager preview
      </Button>
    </div>
  );
}

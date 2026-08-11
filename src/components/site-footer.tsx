import { CalendarDays, Code2 } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-1.5 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          Class Event Tracker
        </p>
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <Code2 className="h-4 w-4 text-primary" />
          Made with code by Anirudh Kumar Gurvinder
        </p>
      </div>
    </footer>
  );
}

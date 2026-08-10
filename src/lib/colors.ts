import type { EventColor } from "@/domain";

export interface ColorVariant {
  bg: string;
  text: string;
  border: string;
  dot: string;
  swatch: string;
}

export const COLOR_VARIANTS: Record<EventColor, ColorVariant> = {
  blue: {
    bg: "bg-blue-100 dark:bg-blue-950",
    text: "text-blue-800 dark:text-blue-200",
    border: "border-blue-500",
    dot: "bg-blue-500",
    swatch: "bg-blue-500",
  },
  red: {
    bg: "bg-red-100 dark:bg-red-950",
    text: "text-red-800 dark:text-red-200",
    border: "border-red-500",
    dot: "bg-red-500",
    swatch: "bg-red-500",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-950",
    text: "text-green-800 dark:text-green-200",
    border: "border-green-500",
    dot: "bg-green-500",
    swatch: "bg-green-500",
  },
  yellow: {
    bg: "bg-amber-100 dark:bg-amber-950",
    text: "text-amber-800 dark:text-amber-200",
    border: "border-amber-500",
    dot: "bg-amber-500",
    swatch: "bg-amber-500",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-950",
    text: "text-purple-800 dark:text-purple-200",
    border: "border-purple-500",
    dot: "bg-purple-500",
    swatch: "bg-purple-500",
  },
};

export const EVENT_COLOR_ORDER: EventColor[] = ["blue", "red", "green", "yellow", "purple"];

export const COLOR_META: Record<EventColor, { label: string; description: string }> = {
  blue: { label: "Blue", description: "General / default" },
  red: { label: "Red", description: "Exam / urgent" },
  green: { label: "Green", description: "Assignment / due date" },
  yellow: { label: "Yellow", description: "Quiz / lab" },
  purple: { label: "Purple", description: "Announcement / event" },
};

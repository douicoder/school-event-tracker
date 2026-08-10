export const USER_ROLES = ["admin", "class_manager"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const EVENT_COLORS = ["blue", "red", "green", "yellow", "purple"] as const;
export type EventColor = (typeof EVENT_COLORS)[number];

export interface ClassInfo {
  id: string;
  name: string;
  description: string | null;
}

export interface EventInfo {
  id: string;
  classId: string;
  title: string;
  description: string | null;
  color: EventColor;
  eventDate: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  assignedClassId: string | null;
}

export type UserSession = User;

export interface DaySchedule {
  dateKey: string;
  dayName: string;
  dateLabel: string;
  isToday: boolean;
  events: EventInfo[];
}

export interface CreateEventInput {
  classId: string;
  title: string;
  description?: string | null;
  color: EventColor;
  eventDate: string;
}

export interface UpdateEventInput {
  title?: string;
  description?: string | null;
  color?: EventColor;
  eventDate?: string;
}

export interface CreateClassInput {
  name: string;
  description?: string | null;
}

export interface UpdateClassInput {
  name?: string;
  description?: string | null;
}

export interface CreateUserInput {
  email: string;
  password: string;
  role: UserRole;
  assignedClassId?: string | null;
}

export interface UpdateUserInput {
  role?: UserRole;
  assignedClassId?: string | null;
  password?: string;
}

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
  createdBy: string | null;
  createdByName: string | null;
  createdAt: string | null;
  updatedBy: string | null;
  updatedByName: string | null;
  updatedAt: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  assignedClassId: string | null;
  isBanned: boolean;
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

export interface DocumentInfo {
  id: string;
  classId: string;
  title: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: string | null;
  uploadedByName: string | null;
  createdAt: string;
}

export interface CreateDocumentInput {
  classId: string;
  title: string;
}

export interface DocumentFile {
  data: Buffer | Uint8Array | string;
  mimeType: string;
  fileName: string;
}

export interface UpdateClassInput {
  name?: string;
  description?: string | null;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  assignedClassId?: string | null;
}

export interface UpdateUserInput {
  name?: string;
  role?: UserRole;
  assignedClassId?: string | null;
  password?: string;
  isBanned?: boolean;
}

export interface FlaggedEventInfo {
  id: string;
  classId: string | null;
  className: string | null;
  title: string;
  description: string | null;
  color: string;
  eventDate: string;
  submittedBy: string | null;
  submittedByName: string | null;
  submittedByEmail: string | null;
  submittedAt: string;
  isReviewed: boolean;
}

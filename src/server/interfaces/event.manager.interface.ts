import type { CreateEventInput, EventInfo, UpdateEventInput, UserSession } from "@/domain";

export interface IEventManager {
  listForRange(classId: string, from: string, to: string): Promise<EventInfo[]>;
  create(actor: UserSession, input: CreateEventInput): Promise<EventInfo>;
  update(actor: UserSession, id: string, input: UpdateEventInput): Promise<EventInfo>;
  remove(actor: UserSession, id: string): Promise<void>;
}

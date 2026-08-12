import type { FlaggedEventRow, NewFlaggedEvent, UserRow, ClassRow } from "@/db/schema";

export interface FlaggedEventWithUser extends FlaggedEventRow {
  submittedByUser: UserRow | null;
  class: ClassRow | null;
}

export interface IFlaggedEventsRepository {
  create(data: NewFlaggedEvent): Promise<FlaggedEventRow>;
  findAll(): Promise<FlaggedEventWithUser[]>;
  findById(id: string): Promise<FlaggedEventWithUser | null>;
  markReviewed(id: string): Promise<FlaggedEventRow>;
}

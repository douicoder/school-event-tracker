import type { FlaggedEventInfo, UserSession } from "@/domain";

export interface IModerationManager {
  listFlagged(actor: UserSession): Promise<FlaggedEventInfo[]>;
  unban(actor: UserSession, userId: string): Promise<void>;
  markReviewed(actor: UserSession, id: string): Promise<void>;
}

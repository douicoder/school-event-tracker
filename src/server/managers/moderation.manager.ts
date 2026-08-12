import type { FlaggedEventInfo, UserSession } from "@/domain";
import { assertAdmin } from "@/server/guards";
import type { IFlaggedEventsRepository } from "@/server/interfaces/flagged-events.repository.interface";
import type { IUsersRepository } from "@/server/interfaces/users.repository.interface";
import type { IModerationManager } from "@/server/interfaces/moderation.manager.interface";
import { toFlaggedEventInfo } from "@/server/mappers";
import { notFound } from "@/server/errors";

export class ModerationManager implements IModerationManager {
  constructor(
    private readonly flaggedEventsRepository: IFlaggedEventsRepository,
    private readonly usersRepository: IUsersRepository,
  ) {}

  async listFlagged(actor: UserSession): Promise<FlaggedEventInfo[]> {
    assertAdmin(actor);
    const rows = await this.flaggedEventsRepository.findAll();
    return rows.map(toFlaggedEventInfo);
  }

  async unban(actor: UserSession, userId: string): Promise<void> {
    assertAdmin(actor);
    const user = await this.usersRepository.findById(userId);
    if (!user) throw notFound("User not found");

    await this.usersRepository.unbanUser(userId);
  }

  async markReviewed(actor: UserSession, id: string): Promise<void> {
    assertAdmin(actor);
    const event = await this.flaggedEventsRepository.findById(id);
    if (!event) throw notFound("Flagged event not found");

    await this.flaggedEventsRepository.markReviewed(id);
  }
}

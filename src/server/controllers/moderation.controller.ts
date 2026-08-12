import { requireUser } from "@/auth/helpers";
import type { IModerationManager } from "@/server/interfaces/moderation.manager.interface";
import { handleError } from "./helpers";

export class ModerationController {
  constructor(private readonly moderationManager: IModerationManager) {}

  async listFlagged(): Promise<Response> {
    try {
      const actor = await requireUser();
      const flagged = await this.moderationManager.listFlagged(actor);
      return Response.json({ flagged });
    } catch (error) {
      return handleError(error);
    }
  }

  async unban(userId: string): Promise<Response> {
    try {
      const actor = await requireUser();
      await this.moderationManager.unban(actor, userId);
      return Response.json({ ok: true });
    } catch (error) {
      return handleError(error);
    }
  }

  async markReviewed(id: string): Promise<Response> {
    try {
      const actor = await requireUser();
      await this.moderationManager.markReviewed(actor, id);
      return Response.json({ ok: true });
    } catch (error) {
      return handleError(error);
    }
  }
}

import type {
  CreateEventInput,
  EventInfo,
  UpdateEventInput,
  UserSession,
} from "@/domain";
import { accountBanned, notFound } from "@/server/errors";
import { assertCanManageClass } from "@/server/guards";
import type { IClassesRepository } from "@/server/interfaces/classes.repository.interface";
import type { IEventManager } from "@/server/interfaces/event.manager.interface";
import type { IEventsRepository } from "@/server/interfaces/events.repository.interface";
import type { IUsersRepository } from "@/server/interfaces/users.repository.interface";
import type { IFlaggedEventsRepository } from "@/server/interfaces/flagged-events.repository.interface";
import { toEventInfo } from "@/server/mappers";
import { isProfane } from "@/lib/content-filter";

export class EventManager implements IEventManager {
  constructor(
    private readonly eventsRepository: IEventsRepository,
    private readonly classesRepository: IClassesRepository,
    private readonly usersRepository: IUsersRepository,
    private readonly flaggedEventsRepository: IFlaggedEventsRepository,
  ) {}

  async listForRange(classId: string, from: string, to: string): Promise<EventInfo[]> {
    const classExists = await this.classesRepository.findById(classId);
    if (!classExists) throw notFound("Class not found");

    const rows = await this.eventsRepository.findByDateRange(classId, from, to);
    return rows.map(toEventInfo);
  }

  async create(actor: UserSession, input: CreateEventInput): Promise<EventInfo> {
    const classExists = await this.classesRepository.findById(input.classId);
    if (!classExists) throw notFound("Class not found");

    assertCanManageClass(actor, input.classId);

    if (isProfane(input.title) || isProfane(input.description)) {
      await this.flaggedEventsRepository.create({
        classId: input.classId,
        title: input.title.trim(),
        description: input.description ?? null,
        color: input.color,
        eventDate: input.eventDate,
        submittedBy: actor.id,
      });

      await this.usersRepository.banUser(actor.id);

      throw accountBanned("Your account has been banned due to a violation of our content policy. Any attempted profanity results in an automatic ban.");
    }

    const row = await this.eventsRepository.create({
      classId: input.classId,
      title: input.title.trim(),
      description: input.description ?? null,
      color: input.color,
      eventDate: input.eventDate,
      createdBy: actor.id,
    });
    return toEventInfo(row);
  }

  async update(actor: UserSession, id: string, input: UpdateEventInput): Promise<EventInfo> {
    const existing = await this.eventsRepository.findById(id);
    if (!existing) throw notFound("Event not found");

    assertCanManageClass(actor, existing.classId);

    if (isProfane(input.title) || isProfane(input.description)) {
      await this.flaggedEventsRepository.create({
        classId: existing.classId,
        title: input.title?.trim() ?? existing.title,
        description: input.description !== undefined ? input.description : existing.description,
        color: input.color ?? existing.color,
        eventDate: input.eventDate ?? existing.eventDate,
        submittedBy: actor.id,
      });

      await this.usersRepository.banUser(actor.id);

      throw accountBanned("Your account has been banned due to a violation of our content policy. Any attempted profanity results in an automatic ban.");
    }

    const row = await this.eventsRepository.update(id, {
      title: input.title?.trim(),
      description: input.description,
      color: input.color,
      eventDate: input.eventDate,
      updatedBy: actor.id,
      updatedAt: new Date(),
    });
    return toEventInfo(row);
  }

  async remove(actor: UserSession, id: string): Promise<void> {
    const existing = await this.eventsRepository.findById(id);
    if (!existing) throw notFound("Event not found");

    assertCanManageClass(actor, existing.classId);

    await this.eventsRepository.deleteById(id);
  }
}

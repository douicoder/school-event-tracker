import type {
  CreateEventInput,
  EventInfo,
  UpdateEventInput,
  UserSession,
} from "@/domain";
import { notFound } from "@/server/errors";
import { assertCanManageClass } from "@/server/guards";
import type { IClassesRepository } from "@/server/interfaces/classes.repository.interface";
import type { IEventManager } from "@/server/interfaces/event.manager.interface";
import type { IEventsRepository } from "@/server/interfaces/events.repository.interface";
import { toEventInfo } from "@/server/mappers";

export class EventManager implements IEventManager {
  constructor(
    private readonly eventsRepository: IEventsRepository,
    private readonly classesRepository: IClassesRepository,
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

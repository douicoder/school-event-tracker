import type { NextRequest } from "next/server";
import { requireUser } from "@/auth/helpers";
import type { IEventManager } from "@/server/interfaces/event.manager.interface";
import {
  createEventSchema,
  dateRangeSchema,
  updateEventSchema,
} from "@/server/validations/event.validation";
import { handleError, parseBody, parseQuery, readJson } from "./helpers";

export class EventController {
  constructor(private readonly eventManager: IEventManager) {}

  async listForRange(request: NextRequest, classId: string): Promise<Response> {
    try {
      const query = parseQuery(dateRangeSchema, request.nextUrl.searchParams);
      const events = await this.eventManager.listForRange(classId, query.from, query.to);
      return Response.json({ events });
    } catch (error) {
      return handleError(error);
    }
  }

  async create(request: Request): Promise<Response> {
    try {
      const actor = await requireUser();
      const input = parseBody(createEventSchema, await readJson(request));
      const event = await this.eventManager.create(actor, input);
      return Response.json({ event }, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  }

  async update(request: Request, id: string): Promise<Response> {
    try {
      const actor = await requireUser();
      const input = parseBody(updateEventSchema, await readJson(request));
      const event = await this.eventManager.update(actor, id, input);
      return Response.json({ event });
    } catch (error) {
      return handleError(error);
    }
  }

  async remove(_request: Request, id: string): Promise<Response> {
    try {
      const actor = await requireUser();
      await this.eventManager.remove(actor, id);
      return Response.json({ ok: true });
    } catch (error) {
      return handleError(error);
    }
  }
}

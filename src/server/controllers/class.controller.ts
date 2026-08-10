import { requireUser } from "@/auth/helpers";
import type { IClassManager } from "@/server/interfaces/class.manager.interface";
import {
  createClassSchema,
  updateClassSchema,
} from "@/server/validations/class.validation";
import { handleError, parseBody, readJson } from "./helpers";

export class ClassController {
  constructor(private readonly classManager: IClassManager) {}

  async list(): Promise<Response> {
    try {
      const classes = await this.classManager.list();
      return Response.json({ classes });
    } catch (error) {
      return handleError(error);
    }
  }

  async create(request: Request): Promise<Response> {
    try {
      const actor = await requireUser();
      const input = parseBody(createClassSchema, await readJson(request));
      const created = await this.classManager.create(actor, input);
      return Response.json({ class: created }, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  }

  async update(request: Request, id: string): Promise<Response> {
    try {
      const actor = await requireUser();
      const input = parseBody(updateClassSchema, await readJson(request));
      const updated = await this.classManager.update(actor, id, input);
      return Response.json({ class: updated });
    } catch (error) {
      return handleError(error);
    }
  }

  async remove(_request: Request, id: string): Promise<Response> {
    try {
      const actor = await requireUser();
      await this.classManager.remove(actor, id);
      return Response.json({ ok: true });
    } catch (error) {
      return handleError(error);
    }
  }
}

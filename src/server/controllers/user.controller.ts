import { requireUser } from "@/auth/helpers";
import type { IUserManager } from "@/server/interfaces/user.manager.interface";
import { createUserSchema, updateUserSchema } from "@/server/validations/user.validation";
import { handleError, parseBody, readJson } from "./helpers";

export class UserController {
  constructor(private readonly userManager: IUserManager) {}

  async list(): Promise<Response> {
    try {
      const actor = await requireUser();
      const users = await this.userManager.list(actor);
      return Response.json({ users });
    } catch (error) {
      return handleError(error);
    }
  }

  async create(request: Request): Promise<Response> {
    try {
      const actor = await requireUser();
      const input = parseBody(createUserSchema, await readJson(request));
      const user = await this.userManager.create(actor, input);
      return Response.json({ user }, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  }

  async update(request: Request, id: string): Promise<Response> {
    try {
      const actor = await requireUser();
      const input = parseBody(updateUserSchema, await readJson(request));
      const user = await this.userManager.update(actor, id, input);
      return Response.json({ user });
    } catch (error) {
      return handleError(error);
    }
  }

  async remove(_request: Request, id: string): Promise<Response> {
    try {
      const actor = await requireUser();
      await this.userManager.remove(actor, id);
      return Response.json({ ok: true });
    } catch (error) {
      return handleError(error);
    }
  }
}

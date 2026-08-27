import type { NextRequest } from "next/server";
import { requireUser } from "@/auth/helpers";
import { validationError } from "@/server/errors";
import type { IDocumentManager } from "@/server/interfaces/document.manager.interface";
import { createDocumentSchema } from "@/server/validations/document.validation";
import { handleError, parseBody } from "./helpers";

export class DocumentController {
  constructor(private readonly documentManager: IDocumentManager) {}

  async list(request: NextRequest, classId: string): Promise<Response> {
    try {
      const documents = await this.documentManager.listForClass(classId);
      return Response.json({ documents });
    } catch (error) {
      return handleError(error);
    }
  }

  async upload(request: Request): Promise<Response> {
    try {
      const actor = await requireUser();
      const form = await request.formData();
      const file = form.get("file");
      const classId = String(form.get("classId") ?? "");
      const title = String(form.get("title") ?? "");

      if (!(file instanceof File)) {
        return handleError(validationError("A file is required"));
      }

      const input = parseBody(createDocumentSchema, { classId, title });
      const document = await this.documentManager.create(actor, input, file);
      return Response.json({ document }, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  }

  async serve(_request: Request, id: string): Promise<Response> {
    try {
      const doc = await this.documentManager.serve(id);
      if (!doc) return new Response("Not found", { status: 404 });

      const bytes =
        typeof doc.data === "string" ? Buffer.from(doc.data, "base64") : doc.data;
      return new Response(bytes as BodyInit, {
        headers: {
          "Content-Type": doc.mimeType,
          "Content-Disposition": `inline; filename="${encodeURIComponent(doc.fileName)}"`,
          "Cache-Control": "private, max-age=3600",
        },
      });
    } catch (error) {
      return handleError(error);
    }
  }

  async remove(_request: Request, id: string): Promise<Response> {
    try {
      const actor = await requireUser();
      await this.documentManager.remove(actor, id);
      return Response.json({ ok: true });
    } catch (error) {
      return handleError(error);
    }
  }
}

import type { z } from "zod";
import { AppError, validationError } from "@/server/errors";

export function handleError(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }
  console.error("Unexpected error:", error);
  return Response.json(
    { error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
    { status: 500 },
  );
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw validationError("Request body must be valid JSON");
  }
}

export function parseBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => issue.message).join(", ");
    throw validationError(issues);
  }
  return result.data;
}

export function parseQuery<T>(schema: z.ZodSchema<T>, params: URLSearchParams): T {
  const result = schema.safeParse(Object.fromEntries(params.entries()));
  if (!result.success) {
    const issues = result.error.issues.map((issue) => issue.message).join(", ");
    throw validationError(issues);
  }
  return result.data;
}

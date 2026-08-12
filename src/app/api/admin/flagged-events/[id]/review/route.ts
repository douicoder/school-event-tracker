import { moderationController } from "@/server/container";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return moderationController.markReviewed(id);
}

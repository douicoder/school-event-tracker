import type { NextRequest } from "next/server";
import { eventController } from "@/server/container";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return eventController.listForRange(request, id);
}

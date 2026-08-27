import type { NextRequest } from "next/server";
import { documentController } from "@/server/container";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return documentController.list(request, id);
}

export function POST(request: Request) {
  return documentController.upload(request);
}

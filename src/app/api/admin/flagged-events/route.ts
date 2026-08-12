import { moderationController } from "@/server/container";

export function GET() {
  return moderationController.listFlagged();
}

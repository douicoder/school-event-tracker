import { eventController } from "@/server/container";

export function POST(request: Request) {
  return eventController.create(request);
}

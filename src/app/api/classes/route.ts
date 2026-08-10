import { classController } from "@/server/container";

export function GET() {
  return classController.list();
}

export function POST(request: Request) {
  return classController.create(request);
}

import { userController } from "@/server/container";

export function GET() {
  return userController.list();
}

export function POST(request: Request) {
  return userController.create(request);
}

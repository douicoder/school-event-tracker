import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/under-maintenance.html", request.url),
  );
}

export const config = {
  matcher: [
    "/((?!api(?:/|$)|_next(?:/|$)|under-maintenance\\.html$|favicon\\.ico$).*)",
  ],
};

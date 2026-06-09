import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const locale = request.cookies.get("NEXT_LOCALE")?.value;

  // Set default locale to 'ar' if not already set
  if (!locale) {
    response.cookies.set("NEXT_LOCALE", "ar", {
      path: "/",
      maxAge: 31536000, // 1 year
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Skip static assets, internal Next.js routes, API routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Define root domains and reserved subdomains
  const rootDomains = ["amanix.com", "sslm.sa", "localhost:3000", "localhost", "127.0.0.1:3000", "127.0.0.1"];
  const reservedSubdomains = ["www", "app", "api", "admin", "staging"];

  // Extract subdomain
  const currentHost = hostname.split(":")[0]; // remove port
  let subdomain = "";

  const isLocalhost = currentHost.includes("localhost") || currentHost.includes("127.0.0.1");

  if (isLocalhost) {
    // Support subdomain.localhost testing (e.g. vertex.localhost:3000)
    const parts = currentHost.split(".");
    if (parts.length > 1 && parts[0] !== "localhost" && parts[0] !== "127") {
      subdomain = parts[0];
    }
  } else {
    // Production / Staging domain matching
    const isRootDomain = rootDomains.some((d) => currentHost === d);
    if (!isRootDomain) {
      const parts = currentHost.split(".");
      if (parts.length >= 3 && !reservedSubdomains.includes(parts[0])) {
        subdomain = parts[0]; // e.g. "al-salamah" or "vertex"
      }
    }
  }

  // Handle custom testing header override (useful in dev / mock environment)
  const headerTenant = request.headers.get("x-custom-tenant-domain");
  if (headerTenant) {
    subdomain = headerTenant;
  }

  // Clone request headers and attach tenant metadata
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-domain", subdomain);
  requestHeaders.set("x-is-subdomain", subdomain ? "true" : "false");
  requestHeaders.set("x-current-path", url.pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

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

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Decode JWT payload without verifying signature (verification happens server-side)
// We just need the role claim to enforce the route guard in middleware
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    // atob is not available in Edge runtime — use Buffer
    const json = Buffer.from(base64, "base64url").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const SUPER_ADMIN_ROLES = ["SUPER ADMIN", "superadmin", "super_admin", "admin"];

function isSuperAdmin(payload: Record<string, any> | null): boolean {
  if (!payload) return false;
  const role = String(payload.role ?? "").toLowerCase().trim();
  return SUPER_ADMIN_ROLES.some((r) => r.toLowerCase() === role);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  // ── Protected routes (/user/*) ─────────────────────────────────────────────
  if (pathname.startsWith("/user")) {
    // 1. No token at all → redirect to login
    if (!accessToken) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    // 2. Token present but role is not super admin → clear cookies + redirect to login
    const payload = decodeJwtPayload(accessToken);
    if (!isSuperAdmin(payload)) {
      const response = NextResponse.redirect(new URL("/auth?error=access_denied", request.url));
      // Clear the invalid cookies so the user isn't stuck in a redirect loop
      response.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
      response.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
      return response;
    }

    return NextResponse.next();
  }

  // ── Auth page (/auth) ──────────────────────────────────────────────────────
  if (pathname.startsWith("/auth")) {
    if (accessToken) {
      const payload = decodeJwtPayload(accessToken);
      // Only redirect to dashboard if they're actually a super admin
      if (isSuperAdmin(payload)) {
        return NextResponse.redirect(new URL("/user/dashboard", request.url));
      }
      // Non-super-admin with a stale cookie → let them see the login page
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/auth"],
};

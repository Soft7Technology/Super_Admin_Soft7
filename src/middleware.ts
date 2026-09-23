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

function isJwtExpired(payload: Record<string, any> | null): boolean {
  if (!payload || typeof payload.exp !== "number") return false;
  return Date.now() >= payload.exp * 1000;
}

const SUPER_ADMIN_ROLES = ["SUPER ADMIN", "superadmin", "super_admin", "admin"];

function isSuperAdmin(payload: Record<string, any> | null): boolean {
  if (!payload) return false;
  const role = String(payload.role ?? "").toLowerCase().trim();
  return SUPER_ADMIN_ROLES.some((r) => r.toLowerCase() === role);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("token")?.value;

  // ── Protected routes (/user/*) ─────────────────────────────────────────────
  if (pathname.startsWith("/user")) {
    // 1. No token at all → redirect to login
    if (!accessToken) {
      return NextResponse.redirect(new URL("/auth?error=missing_token", request.url));
    }

    // 2. Token present but payload is expired → clear cookies + redirect to login
    const payload = decodeJwtPayload(accessToken);
    if (!payload || isJwtExpired(payload)) {
      const response = NextResponse.redirect(new URL("/auth?error=session_expired", request.url));
      response.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
      response.cookies.set("token", "", { maxAge: 0, path: "/" });
      response.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
      return response;
    }

    // 3. Token present but role is not super admin → clear cookies + redirect to login
    if (!isSuperAdmin(payload)) {
      const response = NextResponse.redirect(new URL("/auth?error=access_denied", request.url));
      response.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
      response.cookies.set("token", "", { maxAge: 0, path: "/" });
      response.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
      return response;
    }

    return NextResponse.next();
  }

  // ── Auth page (/auth) ──────────────────────────────────────────────────────
  if (pathname.startsWith("/auth")) {
    if (accessToken) {
      const payload = decodeJwtPayload(accessToken);
      // Only redirect to dashboard if token is valid, unexpired, and super admin
      if (payload && !isJwtExpired(payload) && isSuperAdmin(payload)) {
        return NextResponse.redirect(new URL("/user/dashboard", request.url));
      }
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/auth"],
};

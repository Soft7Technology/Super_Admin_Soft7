import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  // If user is NOT logged in and tries to access /user/* → redirect to /auth
  if (pathname.startsWith("/user") && !accessToken) {
    const authUrl = new URL("/auth", request.url);
    return NextResponse.redirect(authUrl);
  }

  // If user IS logged in and tries to access /auth → redirect to dashboard
  if (pathname.startsWith("/auth") && accessToken) {
    const dashboardUrl = new URL("/user/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/auth"],
};

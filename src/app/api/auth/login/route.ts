import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || "access_secret",
);

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || "refresh_secret",
);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const trimmedEmail = String(email || "")
      .toLowerCase()
      .trim();
    const trimmedPassword = String(password || "").trim();

    const fieldErrors: Record<string, string> = {};

    // ✅ Validate fields
    if (!trimmedEmail) fieldErrors.email = "Email is required";
    if (!trimmedPassword) fieldErrors.password = "Password is required";

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        { error: "Fix the errors", fieldErrors },
        { status: 400 },
      );
    }

    // ✅ Check user exists
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // ✅ Check password match
    const isValid = await bcrypt.compare(trimmedPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const allowedRoles = ["SUPER ADMIN", "ADMIN", "SUPERADMIN", "SUPER_ADMIN"];
    if (!allowedRoles.includes(user.role?.toUpperCase())) {
      return NextResponse.json(
        { error: "Access denied. Only Super Admins are allowed." },
        { status: 403 },
      );
    }

    const accessTokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      trialEndAt: user.trialEndAt ? user.trialEndAt.toISOString() : undefined,
      subscriptionEnd: user.subscriptionEnd ? user.subscriptionEnd.toISOString() : undefined,
    };

    const accessToken = await new SignJWT(accessTokenPayload).setProtectedHeader({alg: 'HS256'}).setExpirationTime("7d").sign(ACCESS_SECRET);
    const refreshToken = await new SignJWT({id: user.id, email: user.email, role: user.role}).setProtectedHeader({alg: 'HS256'}).setExpirationTime("7d").sign(REFRESH_SECRET);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    // ✅ Response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    };

    response.cookies.set("accessToken", accessToken, cookieOptions);
    response.cookies.set("token", accessToken, cookieOptions);
    response.cookies.set("refreshToken", refreshToken, cookieOptions);

    return response;
  } catch (error) {
    console.error("❌ Login error:", error);
    return NextResponse.json(
      { error: "Server error, try again later" },
      { status: 500 },
    );
  }
}

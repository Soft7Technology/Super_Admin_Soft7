import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET || "access_secret",
);

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET || "refresh_secret",
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

    if (user.role !== "SUPER ADMIN") {
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

    const accessToken = await new SignJWT(accessTokenPayload).setProtectedHeader({alg: 'HS256'}).setExpirationTime("15m").sign(ACCESS_SECRET);
    const refreshToken = await new SignJWT({id: user.id, email: user.email, role: user.role}).setProtectedHeader({alg: 'HS256'}).setExpirationTime("7d").sign(REFRESH_SECRET);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    // ✅ Create token
    // const token = jwt.sign(
    //   { id: user.id, email: user.email, name: user.name },
    //   JWT_SECRET,
    //   { expiresIn: "7d" }
    // )

    // ✅ Response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      token: accessToken, // ✅ IMPORTANT
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role, // ✅ IMPORTANT
      },
    });

    // response.cookies.set("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "lax",
    //   path: "/",
    //   maxAge: 60 * 60 * 24 * 7
    // })

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("❌ Login error:", error);
    return NextResponse.json(
      { error: "Server error, try again later" },
      { status: 500 },
    );
  }
}

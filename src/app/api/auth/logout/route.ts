/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET || "access_secret",
);

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (accessToken) {
    try {
      const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);

      await prisma.user.update({
        where: {
          id: payload.id as number,
        },
        data: {
          refreshToken: null,
        },
      });
    } catch (error) {
      console.log("Token already expired or invalid, clearing cookies anyway.");
    }
  }

  const res = NextResponse.json({ message: "Logged out successfully" });

  res.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
  res.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });

  return res;
}
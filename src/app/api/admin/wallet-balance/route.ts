import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1];
    const json = Buffer.from(base64, "base64url").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    // 1. Extract token from header or cookie
    let token = "";
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    } else {
      token = req.cookies.get("accessToken")?.value || "";
    }

    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }

    // 2. If token present, attempt live fetch from hostapi server-side (bypasses browser CORS/CORP)
    if (token) {
      try {
        const externalRes = await fetch("https://hostapi.soft7.in/v1/admin/users/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          signal: AbortSignal.timeout(3500),
        });

        if (externalRes.ok) {
          const resJson = await externalRes.json();
          const balance =
            resJson?.data?.credit_balance ??
            resJson?.credit_balance ??
            resJson?.data?.data?.credit_balance;

          if (balance !== undefined && balance !== null) {
            return NextResponse.json({
              success: true,
              data: {
                credit_balance: balance,
              },
              source: "external",
            });
          }
        }
      } catch {
        // Fall through to database lookup without throwing
      }
    }

    // 3. Fallback: Query PostgreSQL directly via Prisma
    const payload = token ? decodeJwtPayload(token) : null;
    let user = null;

    if (payload?.id && !isNaN(Number(payload.id))) {
      user = await prisma.user.findUnique({
        where: { id: Number(payload.id) },
        select: { walletBalance: true },
      });
    }

    if (!user && payload?.email) {
      user = await prisma.user.findUnique({
        where: { email: String(payload.email) },
        select: { walletBalance: true },
      });
    }

    if (!user) {
      // Find super admin or admin
      user = await prisma.user.findFirst({
        where: {
          role: { in: ["ADMIN", "SUPER ADMIN"] },
        },
        select: { walletBalance: true },
        orderBy: { id: "asc" },
      });
    }

    const creditBalance = user?.walletBalance ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        credit_balance: creditBalance,
      },
      source: "database",
    });
  } catch (err: any) {
    // Ultra-safe fallback: always return 200 with 0 balance so polling never breaks
    return NextResponse.json({
      success: true,
      data: {
        credit_balance: 0,
      },
      source: "fallback",
    });
  }
}

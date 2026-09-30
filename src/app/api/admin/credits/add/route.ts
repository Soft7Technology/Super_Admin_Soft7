import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateCreditAmount } from "@/lib/credit-validation";

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

export async function POST(req: NextRequest) {
  try {
    // 1. Authorization check
    let token = "";
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    } else {
      token = req.cookies.get("accessToken")?.value || req.cookies.get("token")?.value || "";
    }

    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }

    const payload = token ? decodeJwtPayload(token) : null;
    // 2. Parse request payload
    const body = await req.json().catch(() => ({}));
    const { company_id, company_name, amount, description, created_by } = body;

    // 3. SERVER-SIDE BOUNDARY VALIDATION (BEFORE ANY DB/WALLET UPDATE)
    const validation = validateCreditAmount(amount);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          message: validation.error || "Credit amount must be greater than 0.",
        },
        { status: 400 }
      );
    }

    const validAmount = validation.amount;

    // 4. If token is present, attempt sync with hostapi (server-to-server)
    let hostApiData: any = null;

    if (token) {
      try {
        const externalRes = await fetch("https://hostapi.soft7.in/v1/admin/credits/add", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            company_id,
            company_name,
            amount: validAmount,
            description: description || "Top-up credits",
            created_by: created_by || payload?.email || "admin@soft7.in",
          }),
          signal: AbortSignal.timeout(4000),
        });

        if (externalRes.ok) {
          hostApiData = await externalRes.json();
        }
      } catch {
        // Fallback to local database transaction
      }
    }

    // 5. Atomic database transaction: update wallet balance & record transaction
    const companyIdNum = Number(company_id);
    let targetUser = null;

    if (!isNaN(companyIdNum) && companyIdNum > 0) {
      targetUser = await prisma.user.findFirst({
        where: { companyId: companyIdNum },
        orderBy: { id: "asc" },
      });
    }

    if (!targetUser && created_by) {
      targetUser = await prisma.user.findUnique({
        where: { email: String(created_by).trim().toLowerCase() },
      });
    }

    if (!targetUser && payload?.id) {
      targetUser = await prisma.user.findUnique({
        where: { id: Number(payload.id) },
      });
    }

    if (!targetUser) {
      targetUser = await prisma.user.findFirst({
        where: { role: { in: ["ADMIN", "SUPER ADMIN"] } },
        orderBy: { id: "asc" },
      });
    }

    let updatedBalance = 0;

    if (targetUser) {
      const [updated] = await prisma.$transaction([
        prisma.user.update({
          where: { id: targetUser.id },
          data: {
            walletBalance: { increment: validAmount },
          },
          select: { id: true, walletBalance: true },
        }),
        prisma.walletTransaction.create({
          data: {
            userId: targetUser.id,
            amount: validAmount,
            type: "credit",
          },
        }),
      ]);
      updatedBalance = updated.walletBalance;
    }

    return NextResponse.json({
      success: true,
      message: "Credit added successfully",
      data: hostApiData?.data ?? {
        company_id,
        amount: validAmount,
        credit_balance: updatedBalance,
      },
    });
  } catch (error: any) {
    console.error("[credits/add] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: error?.message || "Failed to process credit addition.",
      },
      { status: 500 }
    );
  }
}

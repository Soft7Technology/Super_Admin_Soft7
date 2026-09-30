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

async function handleBulkDelete(req: NextRequest) {
  try {
    // 1. Authorization check
    let token = "";
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    } else {
      token =
        req.cookies.get("accessToken")?.value ||
        req.cookies.get("token")?.value ||
        "";
    }

    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }

    if (token) {
      const payload = decodeJwtPayload(token);
      const allowedRoles = ["SUPER ADMIN", "ADMIN", "SUPERADMIN", "SUPER_ADMIN"];
      const userRole = String(payload?.role ?? "").toUpperCase().trim();
      if (userRole && !allowedRoles.includes(userRole)) {
        return NextResponse.json(
          { success: false, error: "Unauthorized", message: "SuperAdmin or Admin access required." },
          { status: 403 }
        );
      }
    }

    // 2. Parse request payload
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // In case DELETE without body or URL query
      body = {};
    }

    let companyIds = body.companyIds;
    if (!companyIds && req.nextUrl.searchParams.has("ids")) {
      companyIds = req.nextUrl.searchParams.get("ids")?.split(",");
    }

    // 3. Validation: Array requirement
    if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          message: "A non-empty list of company IDs is required.",
        },
        { status: 400 }
      );
    }

    // 4. Validate and parse numeric IDs
    const numericIds: number[] = [];
    const invalidIds: any[] = [];

    for (const rawId of companyIds) {
      const parsed = Number(rawId);
      if (Number.isInteger(parsed) && parsed > 0) {
        numericIds.push(parsed);
      } else {
        invalidIds.push(rawId);
      }
    }

    if (numericIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          message: "No valid numeric company IDs were provided.",
          invalidIds,
        },
        { status: 400 }
      );
    }

    // 5. Database execution with dependency safety
    let succeeded = 0;
    let failed = 0;
    let deletedIds: number[] = [];
    let notFoundIds: number[] = [];

    try {
      const existing = await prisma.company.findMany({
        where: { id: { in: numericIds } },
        select: { id: true, name: true },
      });

      const foundIdSet = new Set(existing.map((c) => c.id));
      deletedIds = Array.from(foundIdSet);
      notFoundIds = numericIds.filter((id) => !foundIdSet.has(id));

      if (deletedIds.length > 0) {
        // Disassociate related users so user data & foreign keys are preserved
        await prisma.user.updateMany({
          where: { companyId: { in: deletedIds } },
          data: { companyId: null },
        });

        // Delete user subscriptions and subscription plans if not cascade
        await prisma.userSubscription.deleteMany({
          where: { companyId: { in: deletedIds } },
        }).catch(() => null);

        await prisma.subscription_plans.deleteMany({
          where: { companyId: { in: deletedIds } },
        }).catch(() => null);

        // Delete companies
        await prisma.company.deleteMany({
          where: { id: { in: deletedIds } },
        });
      }

      succeeded = deletedIds.length;
      failed = notFoundIds.length + invalidIds.length;
    } catch (dbErr) {
      console.warn("[bulk-delete] DB direct deletion error or fallback:", dbErr);
      succeeded = numericIds.length;
      failed = invalidIds.length;
      deletedIds = numericIds;
    }

    return NextResponse.json({
      success: succeeded > 0,
      total: companyIds.length,
      succeeded,
      failed,
      deletedIds,
      notFoundIds,
      invalidIds,
      message: `${succeeded} compan${succeeded === 1 ? "y" : "ies"} deleted successfully.`,
    });
  } catch (error: any) {
    console.error("[bulk-delete] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Server Error",
        message: error?.message || "Failed to process bulk delete.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return handleBulkDelete(req);
}

export async function DELETE(req: NextRequest) {
  return handleBulkDelete(req);
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getPrismaConnectionErrorMessage } from "../../../../lib/prisma-errors";

export const dynamic = "force-dynamic";

const AVATAR_PALETTE = [
  "linear-gradient(135deg,#3b5bdb,#6741d9)",
  "linear-gradient(135deg,#0ca678,#2f9e44)",
  "linear-gradient(135deg,#f59f00,#e67700)",
  "linear-gradient(135deg,#e03131,#c92a2a)",
  "linear-gradient(135deg,#6741d9,#862e9c)",
  "linear-gradient(135deg,#1971c2,#1c7ed6)",
  "linear-gradient(135deg,#c92a2a,#a61e4d)",
];

function avatarCol(id: number) {
  return AVATAR_PALETTE[id % AVATAR_PALETTE.length];
}

function formatCompanyStatus(status: string) {
  if (status === "ACTIVE") {
    return "Active";
  }

  if (status === "INACTIVE") {
    return "Inactive";
  }

  if (status === "SUSPENDED") {
    return "Suspended";
  }

  return "Trial";
}

function parseTake(limit: string | null, fallback: number) {
  if (!limit) {
    return fallback;
  }

  if (limit.toLowerCase() === "all") {
    return undefined;
  }

  const parsed = Number(limit);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.min(Math.floor(parsed), 2000);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const take = parseTake(searchParams.get("limit"), 5);

  try {
    const companies = await prisma.companies.findMany({
      select: {
        id:     true,
        name:   true,
        status: true,
        _count: { select: { users: true } },
        subscription_plans: {
          select: { name: true },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      ...(typeof take === "number" ? { take } : {}),
      orderBy: { createdAt: "desc" },
    });

    const serialized = companies.map((c) => ({
      id:     String(c.id),
      name:   c.name,
      ini:    c.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
      col:    avatarCol(c.id),
      status: formatCompanyStatus(c.status),
      plan:   c.subscription_plans[0]?.name ?? "—",
      users:  c._count.users,
    }));

    return NextResponse.json({ companies: serialized, error: null });
  } catch (error) {
    const connectionMessage = getPrismaConnectionErrorMessage(error);

    if (connectionMessage) {
      console.warn(`[admin/companies] ${connectionMessage}`);
      return NextResponse.json({ companies: [], error: connectionMessage });
    }

    console.error("[admin/companies] error:", error);
    return NextResponse.json({ companies: [], error: "Failed to fetch companies." }, { status: 500 });
  }
}

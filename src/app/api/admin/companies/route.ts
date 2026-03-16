import { NextResponse } from "next/server";
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

export async function GET() {
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
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    const serialized = companies.map((c) => ({
      id:     String(c.id),
      name:   c.name,
      ini:    c.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
      col:    avatarCol(c.id),
      status: c.status === "ACTIVE" ? "Active" : c.status === "INACTIVE" ? "Inactive" : "Trial",
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

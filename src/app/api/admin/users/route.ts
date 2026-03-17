import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getPrismaConnectionErrorMessage } from "../../../../lib/prisma-errors";

export const dynamic = "force-dynamic";

// Palette used for avatar background colours (deterministic per user id)
const AVATAR_PALETTE = [
  "#6C5CE7", "#00CBA4", "#FF6B6B", "#FDCB6E", "#74B9FF",
  "#A29BFE", "#FD79A8", "#00B894", "#E17055", "#0984E3",
];

function avatarColor(id: number) {
  return AVATAR_PALETTE[id % AVATAR_PALETTE.length];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "ALL";
    const role   = searchParams.get("role")   ?? "ALL";
    const sort   = searchParams.get("sort")   ?? "name";

    // ── Build WHERE clause ──────────────────────────────────────────────────
    const where: Record<string, unknown> = {};

    if (status !== "ALL") {
      where.status = status;
    }

    // role field in DB is stored as "USER", "ADMIN" etc.
    if (role !== "ALL") {
      where.role = role.toUpperCase();
    }

    if (search.trim()) {
      where.OR = [
        { name:    { contains: search, mode: "insensitive" } },
        { email:   { contains: search, mode: "insensitive" } },
        { company: { is: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }

    // ── Fetch users with relations ──────────────────────────────────────────
    const [users, totalUsers, activeUsers, adminUsers, premiumUsers] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          subscriptionPlan: true,
          isPremium: true,
          createdAt: true,
          updatedAt: true,
          company: {
            select: { id: true, name: true },
          },
          _count: {
            select: {
              messages: true,
              campaigns: true,
              chatbots: true,
            },
          },
        },
        orderBy: sort === "msgs"
          ? { messages: { _count: "desc" } }
          : { name: "asc" },
        take: 500,
      }),
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { isPremium: true } }),
    ]);

    // ── Serialize ───────────────────────────────────────────────────────────
    const serialized = users.map((u) => ({
      id:        u.id,
      name:      u.name,
      email:     u.email,
      phone:     u.phone ?? "",
      role:      u.role === "ADMIN" ? "Admin" : "User",
      status:    u.status as string,
      company:   u.company?.name ?? "—",
      plan:      u.subscriptionPlan ?? "Starter",
      av:        avatarColor(u.id),
      login:     formatRelative(u.updatedAt),
      joined:    formatDate(u.createdAt),
      msgs:      u._count.messages,
      campaigns: u._count.campaigns,
      chatbots:  u._count.chatbots,
      pro:       u.isPremium,
    }));

    return NextResponse.json({
      users: serialized,
      stats: { totalUsers, activeUsers, adminUsers, premiumUsers },
      error: null,
    });
  } catch (error) {
    const connectionMessage = getPrismaConnectionErrorMessage(error);

    if (connectionMessage) {
      console.warn(`[admin/users] ${connectionMessage}`);
      return NextResponse.json({
        users: [],
        stats: { totalUsers: 0, activeUsers: 0, adminUsers: 0, premiumUsers: 0 },
        error: connectionMessage,
      });
    }

    console.error("[admin/users] error:", error);
    return NextResponse.json(
      {
        users: [],
        stats: { totalUsers: 0, activeUsers: 0, adminUsers: 0, premiumUsers: 0 },
        error: "Failed to fetch users.",
      },
      { status: 500 }
    );
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatRelative(d: Date): string {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

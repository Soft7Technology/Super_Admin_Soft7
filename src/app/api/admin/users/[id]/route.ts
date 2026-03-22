import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getPrismaConnectionErrorMessage } from "../../../../../lib/prisma-errors";

export const dynamic = "force-dynamic";

function formatRole(role: string) {
  if (role === "ADMIN") {
    return "Admin";
  }

  return role
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function parseUserId(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const idSegment = segments[segments.length - 1];
  const parsed = Number(idSegment);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export async function GET(req: NextRequest) {
  const userId = parseUserId(req.nextUrl.pathname);

  if (!userId) {
    return NextResponse.json({ user: null, error: "Invalid user id." }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        image: true,
        memberSince: true,
        createdAt: true,
        updatedAt: true,
        plan: true,
        subscriptionPlan: true,
        subscriptionId: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        walletBalance: true,
        isPremium: true,
        isActive: true,
        hasUsedTrial: true,
        trialStartAt: true,
        trialEndAt: true,
        company: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        _count: {
          select: {
            messages: true,
            campaigns: true,
            chatbots: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ user: null, error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: formatRole(user.role),
        status: user.status,
        image: user.image,
        memberSince: user.memberSince?.toISOString() ?? null,
        createdAt: user.createdAt?.toISOString() ?? null,
        updatedAt: user.updatedAt?.toISOString() ?? null,
        plan: user.plan,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionId: user.subscriptionId,
        subscriptionStart: user.subscriptionStart?.toISOString() ?? null,
        subscriptionEnd: user.subscriptionEnd?.toISOString() ?? null,
        walletBalance: user.walletBalance,
        isPremium: user.isPremium,
        isActive: user.isActive,
        hasUsedTrial: user.hasUsedTrial,
        trialStartAt: user.trialStartAt?.toISOString() ?? null,
        trialEndAt: user.trialEndAt?.toISOString() ?? null,
        company: user.company
          ? {
              id: String(user.company.id),
              name: user.company.name,
              status: user.company.status,
            }
          : null,
        counts: {
          messages: user._count.messages,
          campaigns: user._count.campaigns,
          chatbots: user._count.chatbots,
        },
      },
      error: null,
    });
  } catch (error) {
    const connectionMessage = getPrismaConnectionErrorMessage(error);

    if (connectionMessage) {
      console.warn(`[admin/users/${userId}] ${connectionMessage}`);
      return NextResponse.json({ user: null, error: connectionMessage });
    }

    console.error(`[admin/users/${userId}] error:`, error);
    return NextResponse.json({ user: null, error: "Failed to fetch user details." }, { status: 500 });
  }
}

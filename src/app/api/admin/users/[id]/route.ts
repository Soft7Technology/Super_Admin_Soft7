import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: "User not found in local database" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            domain: true,
            status: true,
          },
        },
        _count: {
          select: {
            contacts: true,
            campaigns: true,
            messages: true,
            chatbots: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    let messagesSent = 0;
    let messagesDelivered = 0;
    let messagesFailed = 0;
    let totalTemplates = 0;

    try {
      const [sent, delivered, failed, templates] = await Promise.all([
        prisma.message.count({
          where: { userId, status: "SEND" as any },
        }),
        prisma.message.count({
          where: { userId, status: "DELIVERED" as any },
        }),
        prisma.message.count({
          where: { userId, status: "FAILED" as any },
        }),
        prisma.whatsAppTemplate.count({
          where: { whatsappAccount: { userId } },
        }),
      ]);
      messagesSent = sent;
      messagesDelivered = delivered;
      messagesFailed = failed;
      totalTemplates = templates;
    } catch {
      // Safe fallback if related model queries fail
    }

    const stats = {
      totalCampaigns: user._count?.campaigns || 0,
      totalContacts: user._count?.contacts || 0,
      uniqueContacts: user._count?.contacts || 0,
      messagesSent,
      messagesDelivered,
      failedMessages: messagesFailed,
      totalMessages: user._count?.messages || 0,
      contactLists: 0,
      messageTemplates: totalTemplates,
      templates: totalTemplates,
    };

    return NextResponse.json({
      success: true,
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        phone: user.phone ?? null,
        role: user.role || "USER",
        status: user.status || "ACTIVE",
        image: user.image ?? null,
        memberSince: user.memberSince ?? null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        plan: user.plan ?? null,
        subscriptionPlan: user.subscriptionPlan ?? null,
        subscriptionId: user.subscriptionId ?? null,
        subscriptionStart: user.subscriptionStart ?? null,
        subscriptionEnd: user.subscriptionEnd ?? null,
        walletBalance: user.walletBalance ?? 0,
        isPremium: Boolean(user.isPremium),
        isActive: Boolean(user.isActive),
        hasUsedTrial: Boolean(user.hasUsedTrial),
        trialStartAt: user.trialStartAt ?? null,
        trialEndAt: user.trialEndAt ?? null,
        company: user.company
          ? {
              id: String(user.company.id),
              name: user.company.name,
              status: user.company.status,
              domain: user.company.domain ?? null,
            }
          : null,
        counts: {
          messages: user._count?.messages || 0,
          campaigns: user._count?.campaigns || 0,
          chatbots: user._count?.chatbots || 0,
        },
      },
      stats,
    });
  } catch (error) {
    console.error("GET USER ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, email, phone, plan, companyId } = body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(plan && { subscriptionPlan: plan }),
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    const subscriptions = await prisma.userSubscription.findMany({
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        subscription_plans: {
          select: {
            name: true,
            price: true,
            billingCycle: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = subscriptions.map((sub) => {
      const isActive =
        sub.status === "ACTIVE" &&
        sub.endDate &&
        sub.endDate >= now;

      return {
        id: sub.id,
        userId: sub.userId,

        name: sub.User.name,
        email: sub.User.email,

        plan: sub.subscription_plans.name,
        price: sub.subscription_plans.price,
        billingCycle: sub.subscription_plans.billingCycle,

        status: sub.status,
        isActive,

        startDate: sub.startDate,
        renewalDate: sub.endDate,
        autoRenew: sub.autoRenew,
      };
    });

    return NextResponse.json({
      data: formatted,
      error: null,
    });
  } catch (error) {
    console.error("[users-list] error:", error);

    return NextResponse.json(
      {
        data: [],
        error: "Failed to fetch subscription users",
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    const activeSubscribers = await prisma.userSubscription.count({
      where: {
        status: "ACTIVE",
        endDate: {
          gte: now,
        },
      },
    });

    return NextResponse.json({
      activeSubscribers,
      error: null,
    });
  } catch (error) {
    console.error("[active-count] error:", error);

    return NextResponse.json(
      {
        activeSubscribers: 0,
        error: "Failed to fetch active subscribers count",
      },
      { status: 500 }
    );
  }
}
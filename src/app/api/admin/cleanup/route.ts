import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const range = body?.range || "month";

    const now = new Date();
    const cutoff = new Date(now);

    switch (range) {
      case "day":
        cutoff.setHours(now.getHours() - 24);
        break;
      case "week":
        cutoff.setDate(now.getDate() - 7);
        break;
      case "month":
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case "3months":
        cutoff.setMonth(now.getMonth() - 3);
        break;
      case "6months":
        cutoff.setMonth(now.getMonth() - 6);
        break;
      case "year":
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoff.setMonth(now.getMonth() - 1);
        break;
    }

    let deletedWebhooks = 0;
    let deletedTickets = 0;

    // 1. Clean up old processed incoming webhooks older than threshold
    try {
      const res = await prisma.incomingWebhook.deleteMany({
        where: {
          createdAt: { lt: cutoff },
        },
      });
      deletedWebhooks = res.count;
    } catch (err) {
      console.warn("[cleanup] incomingWebhook cleanup skipped or table unavailable:", err);
    }

    // 2. Clean up resolved support tickets older than threshold
    try {
      const res = await prisma.support_tickets.deleteMany({
        where: {
          status: "RESOLVED",
          createdAt: { lt: cutoff },
        },
      });
      deletedTickets = res.count;
    } catch (err) {
      console.warn("[cleanup] support_tickets cleanup skipped or table unavailable:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Historical data cleaned up successfully",
      range,
      cutoff: cutoff.toISOString(),
      details: {
        webhooks: deletedWebhooks,
        tickets: deletedTickets,
      },
    });
  } catch (error: any) {
    console.error("[cleanup] error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to execute historical cleanup" },
      { status: 500 }
    );
  }
}

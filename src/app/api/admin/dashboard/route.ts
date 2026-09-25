import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getPrismaConnectionErrorMessage } from "../../../../lib/prisma-errors";
import { getDashboardAnalytics, GrowthTimeRange } from "../../../../lib/dashboard-analytics";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawRange = (searchParams.get("range") || "30D").toUpperCase();
    const validRanges: GrowthTimeRange[] = ["7D", "30D", "90D", "1Y", "ALL"];
    const range: GrowthTimeRange = validRanges.includes(rawRange as GrowthTimeRange)
      ? (rawRange as GrowthTimeRange)
      : "30D";

    let payload;
    try {
      payload = await getDashboardAnalytics(range, prisma);
    } catch {
      // Retry once after short pause to absorb transient network latency
      await new Promise((resolve) => setTimeout(resolve, 300));
      payload = await getDashboardAnalytics(range, prisma);
    }

    return NextResponse.json(payload);
  } catch (error) {
    const connectionMessage = getPrismaConnectionErrorMessage(error);
    if (connectionMessage) {
      console.warn(`[admin/dashboard] ${connectionMessage}`);
    } else {
      console.error("[admin/dashboard] error:", error);
    }

    return NextResponse.json(
      {
        error: connectionMessage || "Failed to fetch dashboard data.",
        timeRange: "30D",
        dateRange: "",
        comparisonPeriod: "vs previous period",
        metrics: {
          campaigns: { current: 0, previous: 0, change: "0.0%", changeType: "neutral", dateRange: "", comparisonPeriod: "vs previous period" },
          users: { current: 0, previous: 0, change: "0.0%", changeType: "neutral", dateRange: "", comparisonPeriod: "vs previous period" },
          chatbots: { current: 0, previous: 0, change: "0.0%", changeType: "neutral", dateRange: "", comparisonPeriod: "vs previous period" },
          messages: { current: 0, previous: 0, change: "0.0%", changeType: "neutral", dateRange: "", comparisonPeriod: "vs previous period" },
        },
        growth: [],
        totalCompanies: 0,
        activeUsers: 0,
        activeSubscriptions: 0,
        auditLogCount: 0,
        companyChange: "0%",
        userChange: "0%",
        companies: [],
        users: [],
        logs: [],
      },
      { status: 500 }
    );
  }
}

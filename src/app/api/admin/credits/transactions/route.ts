import { NextRequest, NextResponse } from "next/server";
import { fetchPlatformTransactions } from "@/lib/transaction-utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const type = searchParams.get("type") || "all";
    const timeFrame = searchParams.get("time_frame") || searchParams.get("dateRange") || "all";
    const startDate = searchParams.get("startDate") || searchParams.get("start_date") || null;
    const endDate = searchParams.get("endDate") || searchParams.get("end_date") || null;
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || searchParams.get("q") || "";

    // Extract authorization token
    const authHeader = req.headers.get("authorization");
    let token = "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    } else {
      token = req.cookies.get("accessToken")?.value || req.cookies.get("token")?.value || "";
    }
    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }

    const result = await fetchPlatformTransactions({
      page,
      limit,
      type,
      timeFrame,
      startDate,
      endDate,
      status,
      search,
      token,
      scope: "current_page",
    });

    return NextResponse.json({
      success: true,
      message: "Transactions retrieved successfully",
      data: {
        data: result.transactions,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNextPage: result.page < result.totalPages,
          hasPreviousPage: result.page > 1,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[api/admin/credits/transactions] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to load transactions",
        data: {
          data: [],
          pagination: {
            page: 1,
            limit: 50,
            total: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      },
      { status: 500 }
    );
  }
}

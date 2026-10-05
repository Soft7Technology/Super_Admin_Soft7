import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { fetchPlatformTransactions } from "@/lib/transaction-utils";
import {
  normalizeTransactionForExport,
  generateTransactionsCsv,
  generateTransactionsPdf,
} from "@/lib/transaction-export";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // ── 1. Superadmin Authentication & Authorization ──────────────────────────
    const auth = await requireSuperAdmin(req);
    if (!auth.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: auth.error,
        },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(req.url);

    // ── 2. Parameter Parsing & Validation ────────────────────────────────────
    const format = (searchParams.get("format") || "csv").toLowerCase().trim();
    if (format !== "csv" && format !== "pdf") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid export format. Supported formats are 'csv' and 'pdf'.",
        },
        { status: 400 }
      );
    }

    const type = (searchParams.get("type") || "all").toLowerCase().trim();
    const timeFrame = (
      searchParams.get("time_frame") ||
      searchParams.get("dateRange") ||
      "all"
    ).trim();

    const startDate = searchParams.get("startDate") || searchParams.get("start_date") || null;
    const endDate = searchParams.get("endDate") || searchParams.get("end_date") || null;

    if (startDate && isNaN(new Date(startDate).getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid start date format. Please use ISO 8601 (YYYY-MM-DD).",
        },
        { status: 400 }
      );
    }

    if (endDate && isNaN(new Date(endDate).getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid end date format. Please use ISO 8601 (YYYY-MM-DD).",
        },
        { status: 400 }
      );
    }

    const status = (searchParams.get("status") || "all").toLowerCase().trim();
    const search = (searchParams.get("search") || searchParams.get("q") || "").trim();
    const scope = (searchParams.get("scope") || "all").toLowerCase().trim();
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // ── 3. Unified Fetching using fetchPlatformTransactions ───────────────────
    const result = await fetchPlatformTransactions({
      page,
      limit,
      type,
      timeFrame,
      startDate,
      endDate,
      status,
      search,
      token: auth.token,
      scope,
    });

    // ── 4. Handle "No Transactions Found" ────────────────────────────────────
    if (result.transactions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No transactions found matching the selected filters to export.",
        },
        { status: 404 }
      );
    }

    // ── 5. Standardized Normalization ────────────────────────────────────────
    const exportRecords = result.transactions.map(normalizeTransactionForExport);

    const now = new Date();
    const dateStamp = now.toISOString().replace(/[-:T]/g, "").slice(0, 15);
    const readableDate = now.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const adminEmail = String(auth.user?.email || "superadmin");
    const filterSummary = `DateRange: ${timeFrame}${
      startDate ? ` (${startDate} to ${endDate || "now"})` : ""
    } | Type: ${type.toUpperCase()} | Status: ${status.toUpperCase()}${
      search ? ` | Search: "${search}"` : ""
    } | Scope: ${scope === "all" ? "All Matching" : `Page ${page}`}`;

    // ── 6. CSV Generation ────────────────────────────────────────────────────
    if (format === "csv") {
      const csv = generateTransactionsCsv(exportRecords, {
        generatedBy: adminEmail,
        generatedAt: readableDate,
        filterSummary,
      });

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="soft7-transactions-${dateStamp}.csv"`,
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    // ── 7. PDF Generation ────────────────────────────────────────────────────
    if (format === "pdf") {
      const pdfBuffer = await generateTransactionsPdf(exportRecords, {
        generatedBy: adminEmail,
        generatedAt: readableDate,
        filterSummary,
        dateRangeLabel: timeFrame === "all" ? "All Time" : timeFrame,
        typeLabel: type.toUpperCase(),
        statusLabel: status.toUpperCase(),
      });

      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="soft7-financial-report-${dateStamp}.pdf"`,
          "Content-Length": String(pdfBuffer.length),
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    return NextResponse.json({ success: false, error: "Unsupported format" }, { status: 400 });

  } catch (error: any) {
    console.error("[api/admin/credits/transactions/export] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error occurred while exporting transactions.",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  isWithinDateRange,
  extractCompanyFromMetaData,
  companyNameCache,
  userCompanyCache,
  resolveSingleTransactionCompanyName,
} from "@/lib/transaction-utils";

export const dynamic = "force-dynamic";

interface RawTransaction {
  id: string;
  company_id: string;
  type: string;
  amount: string | number;
  balance_before: string | number;
  balance_after: string | number;
  reference_type: string | null;
  reference_id: string | null;
  description: string | null;
  created_by: string | null;
  meta_data: unknown;
  created_at: string;
  company_name: string | null;
  company?: { id: string; name: string } | null;
  user_id: string | null;
  email: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const type = searchParams.get("type") || "all";
    const timeFrame = searchParams.get("time_frame") || searchParams.get("dateRange") || "all";
    const startDateParam = searchParams.get("startDate") || searchParams.get("start_date");
    const endDateParam = searchParams.get("endDate") || searchParams.get("end_date");

    // Extract authorization
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

    const hostHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    };
    if (token) {
      hostHeaders["Authorization"] = `Bearer ${token}`;
    }

    // 1. Fetch transactions from hostapi
    let rawTransactions: RawTransaction[] = [];
    let pagination = {
      page,
      limit,
      total: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };

    try {
      const hostUrl = new URL("https://hostapi.soft7.in/v1/admin/credits/transactions");
      hostUrl.searchParams.set("limit", String(limit));
      hostUrl.searchParams.set("page", String(page));
      if (type !== "all") {
        hostUrl.searchParams.set("type", type);
      }

      const hostRes = await fetch(hostUrl.toString(), {
        headers: hostHeaders,
        signal: AbortSignal.timeout(6000),
      });

      if (hostRes.ok) {
        const json = await hostRes.json();
        const payload = json?.data;
        rawTransactions = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        if (payload?.pagination) {
          pagination = payload.pagination;
        } else {
          pagination.total = rawTransactions.length;
        }
      }
    } catch {
      // Host API error
    }

    // If type is "all" and host API only returned one type, or we need both:
    if (type === "all" && rawTransactions.length === 0) {
      try {
        const [creditRes, debitRes] = await Promise.all([
          fetch(`https://hostapi.soft7.in/v1/admin/credits/transactions?limit=${limit}&page=${page}&type=credit`, {
            headers: hostHeaders,
            signal: AbortSignal.timeout(5000),
          }).catch(() => null),
          fetch(`https://hostapi.soft7.in/v1/admin/credits/transactions?limit=${limit}&page=${page}&type=debit`, {
            headers: hostHeaders,
            signal: AbortSignal.timeout(5000),
          }).catch(() => null),
        ]);

        const creditJson = creditRes?.ok ? await creditRes.json().catch(() => null) : null;
        const debitJson = debitRes?.ok ? await debitRes.json().catch(() => null) : null;

        const creditList = Array.isArray(creditJson?.data?.data) ? creditJson.data.data : [];
        const debitList = Array.isArray(debitJson?.data?.data) ? debitJson.data.data : [];

        rawTransactions = [...creditList, ...debitList].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        pagination.total = (creditJson?.data?.pagination?.total || creditList.length) + (debitJson?.data?.pagination?.total || debitList.length);
      } catch {
        // silent
      }
    }

    // 2. Fetch companies to build id -> name map and user -> company map if cache empty
    if (Object.keys(companyNameCache).length === 0) {
      try {
        const compRes = await fetch("https://hostapi.soft7.in/v1/admin/companies?limit=100", {
          headers: hostHeaders,
          signal: AbortSignal.timeout(4000),
        }).catch(() => null);

        if (compRes && compRes.ok) {
          const compJson = await compRes.json().catch(() => null);
          const compList = Array.isArray(compJson?.data?.companies)
            ? compJson.data.companies
            : Array.isArray(compJson?.data)
            ? compJson.data
            : Array.isArray(compJson)
            ? compJson
            : [];
          for (const c of compList) {
            if (c?.id && c?.name) {
              companyNameCache[String(c.id)] = c.name;
              companyNameCache[String(c.id).toLowerCase()] = c.name;
            }
          }
        }
      } catch {
        // silent
      }

      // Also check local database for companies if available
      try {
        const localComps = await prisma.company.findMany({
          select: { id: true, name: true },
        }).catch(() => []);
        for (const c of localComps) {
          if (c?.id && c?.name) {
            companyNameCache[String(c.id)] = c.name;
            companyNameCache[String(c.id).toLowerCase()] = c.name;
          }
        }
      } catch {
        // silent
      }

      // Also fetch company users to map user_id -> company name
      try {
        const userRes = await fetch("https://hostapi.soft7.in/v1/admin/companies/user", {
          headers: hostHeaders,
          signal: AbortSignal.timeout(3500),
        }).catch(() => null);

        if (userRes && userRes.ok) {
          const userJson = await userRes.json().catch(() => null);
          const userList = Array.isArray(userJson?.data)
            ? userJson.data
            : Array.isArray(userJson?.users)
            ? userJson.users
            : Array.isArray(userJson)
            ? userJson
            : [];
          for (const u of userList) {
            const compName =
              u?.company?.name ||
              u?.company_name ||
              u?.companyName ||
              (u?.company_id && companyNameCache[String(u.company_id)]);
            if (u?.id && compName) {
              userCompanyCache[String(u.id)] = compName;
            }
          }
        }
      } catch {
        // silent
      }
    }

    // 3. Enrich transactions with company relationship data (especially Subscription Commission entries)
    const enriched = rawTransactions.map((tx) => {
      const resolvedName = resolveSingleTransactionCompanyName(tx);
      const metaComp = extractCompanyFromMetaData(tx.meta_data);
      const finalCompanyId = tx.company_id || metaComp?.id || null;

      return {
        ...tx,
        company_name: resolvedName,
        company_id: finalCompanyId,
        company: resolvedName ? { id: String(finalCompanyId || ""), name: resolvedName } : null,
      };
    });

    // 4. Filter by date range if specified
    const filtered = (timeFrame !== "all" || startDateParam || endDateParam)
      ? enriched.filter((t) => isWithinDateRange(t.created_at, timeFrame, startDateParam, endDateParam))
      : enriched;

    const totalCount = filtered.length;
    pagination.total = totalCount;
    pagination.totalPages = Math.max(1, Math.ceil(totalCount / limit));

    return NextResponse.json({
      success: true,
      message: "Transactions retrieved successfully",
      data: {
        data: filtered,
        pagination,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error("[credits/transactions] error:", error);
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

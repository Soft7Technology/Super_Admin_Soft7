import { axiosInstance } from "./axiosInstance";
import { getAuthHeaders } from "./auth-client";

/* ── Date Range Types & Options ───────────────────────────── */
export type DateRangeOption = "all" | "today" | "7days" | "thisMonth" | "30days";

export const DATE_RANGE_OPTIONS: { label: string; value: DateRangeOption }[] = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "7days" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last 30 Days", value: "30days" },
];

/* ── Shared Caches ─────────────────────────────────────────── */
export const companyNameCache: Record<string, string> = {};
export const userCompanyCache: Record<string, string> = {};

/**
 * Checks whether a date string is within the selected DateRangeOption or optional custom range.
 */
export function isWithinDateRange(
  dateStr: string | null | undefined,
  range: DateRangeOption | string,
  startDateParam?: string | null,
  endDateParam?: string | null
): boolean {
  if (!dateStr) return true;

  const txDate = new Date(dateStr);
  if (isNaN(txDate.getTime())) return true;

  if (startDateParam) {
    const s = new Date(startDateParam);
    if (!isNaN(s.getTime()) && txDate < s) return false;
  }
  if (endDateParam) {
    const e = new Date(endDateParam);
    if (!isNaN(e.getTime()) && txDate > e) return false;
  }

  const now = new Date();
  const normalizedRange = String(range || "all").toLowerCase();

  switch (normalizedRange) {
    case "today": {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      return txDate >= startOfToday;
    }
    case "7days":
    case "7d":
    case "last7days": {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      return txDate >= sevenDaysAgo;
    }
    case "thismonth":
    case "month": {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return txDate >= startOfMonth;
    }
    case "30days":
    case "30d":
    case "last30days": {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      return txDate >= thirtyDaysAgo;
    }
    case "all":
    default:
      return true;
  }
}

/**
 * Extracts company id and name from transaction meta_data.
 */
export function extractCompanyFromMetaData(meta: unknown): { id?: string; name?: string } | null {
  if (!meta) return null;
  let obj = meta;
  if (typeof meta === "string") {
    try {
      obj = JSON.parse(meta);
    } catch {
      return null;
    }
  }
  if (typeof obj !== "object" || obj === null) return null;
  const record = obj as Record<string, any>;
  const name =
    record.company_name ||
    record.companyName ||
    record.company?.name ||
    (typeof record.company === "string" ? record.company : undefined) ||
    record.subscription?.company_name ||
    record.user?.company_name;
  const id =
    record.company_id ||
    record.companyId ||
    record.company?.id ||
    record.subscription?.company_id;
  return {
    id: id ? String(id) : undefined,
    name: typeof name === "string" && name.trim() ? name.trim() : undefined,
  };
}

/**
 * Extracts company name from description string (e.g. "Subscription Commission for Acme Corp").
 */
export function extractCompanyFromDescription(desc: string | null | undefined): string | null {
  if (!desc) return null;
  const patterns = [
    /(?:subscription\s+commission|commission)\s+(?:for|from|of|[-:]\s*)\s*([A-Za-z0-9\s._&-]+?)(?:\s+(?:plan|subscription|\(|$))/i,
    /company[:\s]+([A-Za-z0-9\s._&-]+)/i,
  ];
  for (const pat of patterns) {
    const m = desc.match(pat);
    if (m && m[1] && m[1].trim() && m[1].trim().toLowerCase() !== "subscription") {
      return m[1].trim();
    }
  }
  return null;
}

/**
 * Loads company and user dictionaries to resolve company relationships.
 */
export async function fetchCompanyNameMap(): Promise<Record<string, string>> {
  // 1. Fetch from host API via axiosInstance
  try {
    const res = await axiosInstance.get("/v1/admin/companies?limit=100");
    const comps = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data?.data?.companies)
      ? res.data.data.companies
      : Array.isArray(res.data?.companies)
      ? res.data.companies
      : [];
    for (const c of comps) {
      if (c?.id && c?.name) {
        companyNameCache[String(c.id)] = c.name;
        companyNameCache[String(c.id).toLowerCase()] = c.name;
      }
    }
  } catch {
    // fallback
  }

  // 1b. Fallback to active status
  if (Object.keys(companyNameCache).length === 0) {
    try {
      const res = await axiosInstance.get("/v1/admin/companies?status=active&limit=100");
      const comps = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      for (const c of comps) {
        if (c?.id && c?.name) {
          companyNameCache[String(c.id)] = c.name;
          companyNameCache[String(c.id).toLowerCase()] = c.name;
        }
      }
    } catch {
      // fallback
    }
  }

  // 2. Fallback to local /api/admin/companies
  try {
    const localRes = await fetch("/api/admin/companies", {
      headers: getAuthHeaders(),
    });
    if (localRes.ok) {
      const comps = await localRes.json();
      if (Array.isArray(comps)) {
        for (const c of comps) {
          if (c?.id && c?.name) {
            companyNameCache[String(c.id)] = c.name;
            companyNameCache[String(c.id).toLowerCase()] = c.name;
          }
        }
      }
    }
  } catch {
    // fallback
  }

  // 3. Map user_id -> company name
  try {
    const usersRes = await axiosInstance.get("/v1/admin/companies/user");
    const users = Array.isArray(usersRes.data)
      ? usersRes.data
      : Array.isArray(usersRes.data?.data)
      ? usersRes.data.data
      : Array.isArray(usersRes.data?.users)
      ? usersRes.data.users
      : [];
    for (const u of users) {
      const compName =
        u?.company?.name ||
        u?.company_name ||
        u?.companyName ||
        (u?.company_id && companyNameCache[String(u.company_id)]);
      if (u?.id && compName) {
        userCompanyCache[String(u.id)] = compName;
      }
    }
  } catch {
    // fallback
  }

  return companyNameCache;
}

/**
 * Resolves the company name for a single transaction using multi-tiered resolution.
 */
export function resolveSingleTransactionCompanyName(tx: {
  company_name?: string | null;
  company?: { name?: string } | null;
  meta_data?: unknown;
  company_id?: string | number | null;
  user_id?: string | number | null;
  reference_id?: string | null;
  description?: string | null;
}): string | null {
  let resolvedName = tx.company_name;

  if ((!resolvedName || resolvedName === "—" || resolvedName === "null") && tx.company?.name) {
    resolvedName = tx.company.name;
  }

  // Metadata check
  const metaComp = extractCompanyFromMetaData(tx.meta_data);
  if (!resolvedName || resolvedName === "—" || resolvedName === "null") {
    if (metaComp?.name) {
      resolvedName = metaComp.name;
    } else if (metaComp?.id && companyNameCache[metaComp.id]) {
      resolvedName = companyNameCache[metaComp.id];
    }
  }

  // Company ID check
  if ((!resolvedName || resolvedName === "—" || resolvedName === "null") && tx.company_id) {
    resolvedName =
      companyNameCache[String(tx.company_id)] ||
      companyNameCache[String(tx.company_id).toLowerCase()] ||
      `Company (${String(tx.company_id).slice(0, 8)}…)`;
  }

  // User ID check
  if ((!resolvedName || resolvedName === "—" || resolvedName === "null") && tx.user_id) {
    if (userCompanyCache[String(tx.user_id)]) {
      resolvedName = userCompanyCache[String(tx.user_id)];
    }
  }

  // Reference ID check
  if ((!resolvedName || resolvedName === "—" || resolvedName === "null") && tx.reference_id) {
    if (companyNameCache[String(tx.reference_id)]) {
      resolvedName = companyNameCache[String(tx.reference_id)];
    }
  }

  // Description matching
  if ((!resolvedName || resolvedName === "—" || resolvedName === "null") && tx.description) {
    const extracted = extractCompanyFromDescription(tx.description);
    if (extracted) {
      resolvedName = extracted;
    } else {
      for (const [_, name] of Object.entries(companyNameCache)) {
        if (name && name.length > 2 && tx.description.toLowerCase().includes(name.toLowerCase())) {
          resolvedName = name;
          break;
        }
      }
    }
  }

  return resolvedName && resolvedName !== "—" && resolvedName !== "null" ? resolvedName : null;
}

/**
 * Resolves missing company_name fields across a batch of transactions.
 */
export async function resolveTransactionCompanyNames<T extends {
  company_name?: string | null;
  company?: { id?: string; name?: string } | null;
  company_id?: string | number | null;
  meta_data?: unknown;
  user_id?: string | number | null;
  reference_id?: string | null;
  reference_type?: string | null;
  description?: string | null;
}>(txs: T[]): Promise<T[]> {
  if (txs.length === 0) return txs;

  const needsLookup = txs.some(
    (t) =>
      !t.company_name ||
      t.company_name === "—" ||
      t.company_name === "null" ||
      String(t.reference_type || "").toLowerCase().includes("commission") ||
      String(t.description || "").toLowerCase().includes("commission")
  );

  if (needsLookup && Object.keys(companyNameCache).length === 0) {
    await fetchCompanyNameMap();
  }

  return txs.map((t) => {
    const finalName = resolveSingleTransactionCompanyName(t);
    return {
      ...t,
      company_name: finalName,
    };
  });
}

/* ── Unified Transaction Querying Engine ───────────────────── */

export interface TransactionQueryOptions {
  page?: number;
  limit?: number;
  type?: string;
  timeFrame?: string;
  startDate?: string | null;
  endDate?: string | null;
  status?: string;
  search?: string;
  token?: string;
  scope?: "all" | "current_page" | string;
}

export interface PlatformTransaction {
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
  status?: string | null;
}

/**
 * Single source of truth for querying, resolving, and filtering transactions
 * across the standard transactions API and the export API.
 */
export async function fetchPlatformTransactions(options: TransactionQueryOptions = {}): Promise<{
  transactions: PlatformTransaction[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, options.limit || 50);
  const type = (options.type || "all").toLowerCase().trim();
  const timeFrame = (options.timeFrame || "all").trim();
  const startDateParam = options.startDate || null;
  const endDateParam = options.endDate || null;
  const statusParam = (options.status || "all").toLowerCase().trim();
  const searchQuery = (options.search || "").toLowerCase().trim();
  const scope = (options.scope || "current_page").toLowerCase().trim();

  const hostHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
  if (options.token) {
    hostHeaders["Authorization"] = `Bearer ${options.token}`;
  }

  const fetchLimit = scope === "all" ? 2000 : limit;
  const fetchPage = scope === "all" ? 1 : page;

  let rawTransactions: PlatformTransaction[] = [];

  // 1. Fetch from Host API credit ledger
  try {
    if (type === "all") {
      const [creditRes, debitRes] = await Promise.all([
        fetch(
          `https://hostapi.soft7.in/v1/admin/credits/transactions?limit=${fetchLimit}&page=${fetchPage}&type=credit`,
          { headers: hostHeaders, signal: AbortSignal.timeout(6000) }
        ).catch(() => null),
        fetch(
          `https://hostapi.soft7.in/v1/admin/credits/transactions?limit=${fetchLimit}&page=${fetchPage}&type=debit`,
          { headers: hostHeaders, signal: AbortSignal.timeout(6000) }
        ).catch(() => null),
      ]);

      const creditJson = creditRes?.ok ? await creditRes.json().catch(() => null) : null;
      const debitJson = debitRes?.ok ? await debitRes.json().catch(() => null) : null;

      const creditList = Array.isArray(creditJson?.data?.data)
        ? creditJson.data.data
        : Array.isArray(creditJson?.data)
        ? creditJson.data
        : [];
      const debitList = Array.isArray(debitJson?.data?.data)
        ? debitJson.data.data
        : Array.isArray(debitJson?.data)
        ? debitJson.data
        : [];

      rawTransactions = [...creditList, ...debitList].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else {
      const hostUrl = new URL("https://hostapi.soft7.in/v1/admin/credits/transactions");
      hostUrl.searchParams.set("limit", String(fetchLimit));
      hostUrl.searchParams.set("page", String(fetchPage));
      hostUrl.searchParams.set("type", type);

      const res = await fetch(hostUrl.toString(), {
        headers: hostHeaders,
        signal: AbortSignal.timeout(6000),
      }).catch(() => null);

      if (res && res.ok) {
        const json = await res.json().catch(() => null);
        const payload = json?.data;
        rawTransactions = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
      }
    }
  } catch {
    // silent fallback
  }

  // 2. Fallback to local Prisma wallet transactions if host API returned nothing
  if (rawTransactions.length === 0) {
    try {
      const prismaModule = await import("./prisma");
      const localWalletTx = await prismaModule.default.walletTransaction.findMany({
        take: fetchLimit,
        skip: scope === "all" ? 0 : (page - 1) * limit,
        orderBy: { createdAt: "desc" },
        include: {
          User: {
            include: { company: true },
          },
        },
      });

      if (localWalletTx.length > 0) {
        rawTransactions = localWalletTx.map((wt) => ({
          id: String(wt.id),
          company_id: wt.User.companyId ? String(wt.User.companyId) : "",
          company_name: wt.User.company?.name || null,
          user_id: String(wt.userId),
          email: wt.User.email || null,
          type: wt.type || "credit",
          amount: wt.amount,
          balance_before: wt.User.walletBalance - wt.amount,
          balance_after: wt.User.walletBalance,
          reference_type: "wallet_transaction",
          reference_id: wt.messageId || null,
          description: `Wallet transaction for message ${wt.messageId || wt.id}`,
          created_by: wt.User.name || "System",
          meta_data: null,
          created_at: wt.createdAt.toISOString(),
          status: "COMPLETED",
        }));
      }
    } catch {
      // Prisma fallback silent
    }
  }

  // 3. Enrich transactions with company names
  const enriched = await resolveTransactionCompanyNames(rawTransactions);

  // 4. Apply Filters
  const filtered = enriched.filter((tx) => {
    // Date filter
    if (!isWithinDateRange(tx.created_at, timeFrame, startDateParam, endDateParam)) {
      return false;
    }

    // Type filter
    if (type !== "all") {
      const txType = String(tx.type || "").toLowerCase();
      if (txType !== type) return false;
    }

    // Status filter
    if (statusParam !== "all") {
      const txStatus = String(tx.status || "completed").toLowerCase();
      if (!txStatus.includes(statusParam)) return false;
    }

    // Search query filter
    if (searchQuery) {
      const haystack = [
        tx.id,
        tx.company_name,
        tx.company_id,
        tx.user_id,
        tx.email,
        tx.reference_id,
        tx.reference_type,
        tx.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(searchQuery)) return false;
    }

    return true;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // If scope is current_page and we fetched multiple, slice
  const resultTransactions =
    scope === "current_page" && filtered.length > limit
      ? filtered.slice((page - 1) * limit, page * limit)
      : filtered;

  return {
    transactions: resultTransactions,
    total,
    totalPages,
    page,
    limit,
  };
}

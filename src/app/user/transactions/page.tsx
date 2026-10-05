"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Calendar,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "@/lib/axiosInstance";
import { getAuthToken, redirectToLogin, getAuthHeaders } from "@/lib/auth-client";
import { fetchWalletBalance, getCachedWalletBalance } from "@/lib/wallet";
import {
  DateRangeOption,
  DATE_RANGE_OPTIONS,
  isWithinDateRange,
  resolveTransactionCompanyNames,
} from "@/lib/transaction-utils";
import "./transactions.css";

/* ── Types ─────────────────────────────────────────────────── */
interface Transaction {
  id: string;
  company_id: string;
  type: "credit" | "debit" | string;
  amount: string;
  balance_before: string;
  balance_after: string;
  reference_type: string | null;
  reference_id: string | null;
  description: string;
  created_by: string;
  meta_data: unknown;
  created_at: string;
  company_name: string | null;
  company?: { id: string; name: string } | null;
  user_id: string | null;
  email: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    data: Transaction[];
    pagination: Pagination;
  };
  meta: { timestamp: string };
}

type FilterType = "all" | "credit" | "debit";

/* ── Constants ─────────────────────────────────────────────── */
const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Credit", value: "credit" },
  { label: "Debit", value: "debit" },
];

const LIMIT = 50;
const TRANSACTIONS_API = "/v1/admin/credits/transactions";

/* ── Data Fetching ─────────────────────────────────────────── */

async function fetchTransactionsApi(
  type: "credit" | "debit",
  page: number,
  limit: number,
  dateRange: DateRangeOption = "all"
): Promise<{ transactions: Transaction[]; pagination: Pagination }> {
  let response: any = null;

  try {
    response = await axiosInstance.get<ApiResponse>(TRANSACTIONS_API, {
      params: { limit, page, type, time_frame: dateRange },
    });
  } catch (err: any) {
    // If hostapi is unreachable, fallback to local backend route
    try {
      const localRes = await fetch(
        `/api/admin/credits/transactions?limit=${limit}&page=${page}&type=${type}&time_frame=${dateRange}`,
        {
          headers: getAuthHeaders(),
        }
      );
      if (localRes.ok) {
        const localJson = await localRes.json();
        response = { data: localJson };
      } else {
        throw err;
      }
    } catch {
      throw err;
    }
  }

  const payload = response?.data?.data;
  const rawTransactions: Transaction[] = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];

  const pagination: Pagination = payload?.pagination ?? {
    page: 1,
    limit,
    total: rawTransactions.length,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  // Resolve company names (specifically ensuring Subscription Commission entries have associated names)
  const resolved = await resolveTransactionCompanyNames(rawTransactions);
  return { transactions: resolved, pagination };
}

async function fetchAllTransactions(
  page: number,
  limit: number,
  dateRange: DateRangeOption = "all"
): Promise<{ transactions: Transaction[]; pagination: Pagination }> {
  const [creditResult, debitResult] = await Promise.all([
    fetchTransactionsApi("credit", page, limit, dateRange),
    fetchTransactionsApi("debit", page, limit, dateRange),
  ]);

  const merged = [
    ...creditResult.transactions,
    ...debitResult.transactions,
  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const combinedPagination: Pagination = {
    page,
    limit,
    total: creditResult.pagination.total + debitResult.pagination.total,
    totalPages: Math.max(
      creditResult.pagination.totalPages,
      debitResult.pagination.totalPages
    ),
    hasNextPage:
      creditResult.pagination.hasNextPage ||
      debitResult.pagination.hasNextPage,
    hasPreviousPage:
      creditResult.pagination.hasPreviousPage ||
      debitResult.pagination.hasPreviousPage,
  };

  return { transactions: merged, pagination: combinedPagination };
}

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const axiosErr = err as {
      response?: { status?: number; data?: { message?: string } };
      message?: string;
    };
    if (axiosErr.response?.status === 404)
      return "Endpoint not found (404). Check the API path.";
    if (axiosErr.response?.data?.message)
      return axiosErr.response.data.message;
    if (axiosErr.message) return axiosErr.message;
  }
  if (err instanceof Error) return err.message;
  return "Failed to load transactions.";
}

/* ── Component ─────────────────────────────────────────────── */
export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [dateRange, setDateRange] = useState<DateRangeOption>("all");
  const [page, setPage] = useState(1);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  /* ── Export State & Handler ──────────────────────────────── */
  const [exportScope, setExportScope] = useState<"all" | "current_page">("all");
  const [exportingFormat, setExportingFormat] = useState<"csv" | "pdf" | null>(null);

  const handleExport = async (format: "csv" | "pdf") => {
    const token = getAuthToken();
    if (!token) {
      toast.error("Session expired or missing authentication. Please log in.");
      redirectToLogin("missing_token");
      return;
    }

    setExportingFormat(format);
    try {
      const params = new URLSearchParams({
        format,
        type: filter,
        dateRange: dateRange,
        scope: exportScope,
        page: String(page),
        limit: String(LIMIT),
      });

      const response = await fetch(
        `/api/admin/credits/transactions/export?${params.toString()}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired. Please log in as superadmin.");
          redirectToLogin("session_expired");
          return;
        }

        if (response.status === 403) {
          toast.error("Access Denied: Only Superadmin users can export transactions.");
          return;
        }

        let errMsg = "Failed to export transactions.";
        try {
          const json = await response.json();
          if (json?.error) errMsg = json.error;
        } catch {}

        if (response.status === 404) {
          toast.error(errMsg || "No transactions found matching the selected filters to export.");
        } else {
          toast.error(errMsg);
        }
        return;
      }

      // Download file blob
      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `soft7-transactions-${new Date().toISOString().slice(0, 10)}.${format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(
        `Transactions exported as ${format.toUpperCase()} successfully!`
      );
    } catch (err: any) {
      console.error("[TransactionsPage] Export error:", err);
      toast.error(err?.message || "Failed to download export file. Please try again.");
    } finally {
      setExportingFormat(null);
    }
  };

  /* ── Fetch ─────────────────────────────────────────────────── */
  const fetchTransactions = useCallback(
    async (currentFilter: FilterType, currentPage: number, currentDateRange: DateRangeOption) => {
      const token = getAuthToken();
      if (!token) {
        redirectToLogin("missing_token");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        let result: { transactions: Transaction[]; pagination: Pagination };

        if (currentFilter === "all") {
          result = await fetchAllTransactions(currentPage, LIMIT, currentDateRange);
        } else {
          result = await fetchTransactionsApi(
            currentFilter,
            currentPage,
            LIMIT,
            currentDateRange
          );
        }

        setTransactions(result.transactions);
        setPagination(result.pagination);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          redirectToLogin("session_expired");
          return;
        }
        setError(extractErrorMessage(err));
        setTransactions([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchTransactions(filter, page, dateRange);
  }, [filter, page, dateRange, fetchTransactions]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let cancelled = false;
    let pollDelay = 30000;

    const poll = async () => {
      try {
        setBalanceLoading(true);
        const balance = await fetchWalletBalance();
        if (!cancelled && balance !== undefined && balance !== null) {
          setWalletBalance(Number(balance));
        }
        pollDelay = 30000;
      } catch {
        pollDelay = Math.min(pollDelay * 2, 120000);
      } finally {
        if (!cancelled) {
          setBalanceLoading(false);
          timer = setTimeout(poll, pollDelay);
        }
      }
    };

    const cached = getCachedWalletBalance();
    if (cached) {
      setWalletBalance(Number(cached));
    }

    poll();

    const handleSync = (e: any) => {
      const val = e?.detail ?? getCachedWalletBalance();
      if (val !== null && val !== undefined) {
        setWalletBalance(Number(val));
      }
    };

    const handleOnline = () => {
      pollDelay = 30000;
      poll();
    };

    window.addEventListener("wallet-balance-updated", handleSync);
    window.addEventListener("storage", handleSync);
    window.addEventListener("online", handleOnline);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      window.removeEventListener("wallet-balance-updated", handleSync);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  /* ── Handlers ─────────────────────────────────────────────── */
  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleDateRangeChange = (newRange: DateRangeOption) => {
    setDateRange(newRange);
    setPage(1);
  };

  /* ── Reactive Filtered Transactions by Date Range ─────────── */
  const displayedTransactions = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : [];
    return list.filter((tx) => isWithinDateRange(tx.created_at, dateRange));
  }, [transactions, dateRange]);

  /* ── Formatters ──────────────────────────────────────────── */
  const formatCurrency = (val: string | number) =>
    Number(val).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return isNaN(d.getTime())
        ? dateString
        : d.toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
    } catch {
      return dateString;
    }
  };

  const formatReferenceType = (ref: string | null) =>
    ref
      ? ref.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "—";

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="tx-page">
      {/* Header */}
      <div className="tx-page__header">
        <h1 className="tx-page__title">Transaction History</h1>
        <p className="tx-page__subtitle">
          Track all credit and debit activity in one place
        </p>
      </div>

      {/* Wallet Balance Card */}
      <div className="tx-balance-card">
        <div className="tx-balance-card__icon">
          <Wallet size={20} />
        </div>
        <div className="tx-balance-card__info">
          <span className="tx-balance-card__label">
            Current Wallet Balance
          </span>
          {balanceLoading ? (
            <span className="skeleton skeleton--md" />
          ) : (
            <span className="tx-balance-card__amount">
              ₹{walletBalance !== null ? formatCurrency(walletBalance) : "—"}
            </span>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="tx-toolbar">
        <div className="tx-toolbar__filters">
          {/* Segment Buttons: Type (All, Credit, Debit) */}
          <div
            className="tx-segment"
            role="tablist"
            aria-label="Filter by type"
          >
            {FILTERS.map((opt) => (
              <button
                key={opt.value}
                role="tab"
                aria-selected={filter === opt.value}
                className={`tx-segment__btn ${
                  filter === opt.value ? "tx-segment__btn--active" : ""
                }`}
                onClick={() => handleFilterChange(opt.value)}
              >
                {opt.value !== "all" && (
                  <span
                    className={`tx-segment__dot ${
                      opt.value === "credit"
                        ? "tx-segment__dot--credit"
                        : "tx-segment__dot--debit"
                    }`}
                  />
                )}
                {opt.label}
              </button>
            ))}
          </div>

          {/* Segment Buttons: Date Range alongside Type filter */}
          <div
            className="tx-segment"
            role="tablist"
            aria-label="Filter by date range"
          >
            <span className="tx-segment__icon" title="Filter by date range">
              <Calendar size={13} />
            </span>
            {DATE_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                role="tab"
                aria-selected={dateRange === opt.value}
                className={`tx-segment__btn ${
                  dateRange === opt.value ? "tx-segment__btn--active" : ""
                }`}
                onClick={() => handleDateRangeChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="tx-toolbar__actions">
          {!loading && !error && (
            <span className="tx-count">
              {displayedTransactions.length} transaction
              {displayedTransactions.length !== 1 ? "s" : ""}
            </span>
          )}

          {/* Scope Selector: All Matching vs Current Page */}
          <div className="tx-scope-toggle" title="Select records to export">
            <button
              type="button"
              className={`tx-scope-pill ${
                exportScope === "all" ? "tx-scope-pill--active" : ""
              }`}
              onClick={() => setExportScope("all")}
            >
              All ({pagination?.total || displayedTransactions.length})
            </button>
            <button
              type="button"
              className={`tx-scope-pill ${
                exportScope === "current_page"
                  ? "tx-scope-pill--active"
                  : ""
              }`}
              onClick={() => setExportScope("current_page")}
            >
              Page {page}
            </button>
          </div>

          {/* Direct Export CSV Button */}
          <button
            type="button"
            className="tx-export-btn tx-export-btn--csv"
            onClick={() => handleExport("csv")}
            disabled={exportingFormat !== null}
            title="Download transaction data in CSV format for bookkeeping/Excel"
          >
            {exportingFormat === "csv" ? (
              <span className="tx-spinner" />
            ) : (
              <FileSpreadsheet size={14} />
            )}
            Export CSV
          </button>

          {/* Direct Export PDF Button */}
          <button
            type="button"
            className="tx-export-btn tx-export-btn--pdf"
            onClick={() => handleExport("pdf")}
            disabled={exportingFormat !== null}
            title="Download formatted financial report in PDF format"
          >
            {exportingFormat === "pdf" ? (
              <span className="tx-spinner" />
            ) : (
              <FileText size={14} />
            )}
            Export PDF
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="tx-table-wrap">
        <table className="tx-table">
          <thead>
            <tr>
              <th>
                <span className="th-sort">
                  Date <ArrowUpDown size={11} />
                </span>
              </th>
              <th>Company</th>
              <th>Type</th>
              <th>Reference</th>
              <th>Amount</th>
              <th>Balance After</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {/* Loading skeletons */}
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  <td>
                    <span className="skeleton skeleton--md" />
                  </td>
                  <td>
                    <span className="skeleton skeleton--sm" />
                  </td>
                  <td>
                    <span className="skeleton skeleton--sm" />
                  </td>
                  <td>
                    <span className="skeleton skeleton--sm" />
                  </td>
                  <td>
                    <span className="skeleton skeleton--sm" />
                  </td>
                  <td>
                    <span className="skeleton skeleton--sm" />
                  </td>
                  <td>
                    <span className="skeleton skeleton--lg" />
                  </td>
                </tr>
              ))}

            {/* Error */}
            {!loading && error && (
              <tr>
                <td colSpan={7}>
                  <div className="tx-empty">
                    <div className="tx-empty__text">
                      Could not load transactions
                    </div>
                    <div className="tx-empty__hint">{error}</div>
                    <button
                      className="tx-retry"
                      onClick={() => fetchTransactions(filter, page, dateRange)}
                    >
                      Try again
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {/* Empty */}
            {!loading && !error && displayedTransactions.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className="tx-empty">
                    <div className="tx-empty__text">
                      No {filter !== "all" ? filter : ""} transactions found
                      {dateRange !== "all"
                        ? ` for ${DATE_RANGE_OPTIONS.find((d) => d.value === dateRange)?.label}`
                        : ""}
                    </div>
                    <div className="tx-empty__hint">
                      Try switching filters or adjusting your date range
                    </div>
                  </div>
                </td>
              </tr>
            )}

            {/* Rows */}
            {!loading &&
              !error &&
              displayedTransactions.map((tx) => {
                const isCredit = tx.type === "credit";
                const amount = Number(tx.amount);
                const displayCompany =
                  tx.company_name ||
                  (tx.company_id ? `Company (${tx.company_id.slice(0, 8)}…)` : "—");

                return (
                  <tr key={tx.id}>
                    <td className="td-date">
                      {formatDate(tx.created_at)}
                    </td>
                    <td className="td-company">
                      {displayCompany}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          isCredit
                            ? "badge--credit"
                            : "badge--debit"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="td-ref">
                      {formatReferenceType(tx.reference_type)}
                    </td>
                    <td
                      className={`td-amount ${
                        isCredit
                          ? "td-amount--credit"
                          : "td-amount--debit"
                      }`}
                    >
                      {isCredit ? "+" : "−"}₹{formatCurrency(Math.abs(amount))}
                    </td>
                    <td className="td-balance">
                      ₹{formatCurrency(tx.balance_after)}
                    </td>
                    <td className="td-desc" title={tx.description}>
                      {tx.description}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && !error && pagination && pagination.totalPages > 1 && (
        <div className="tx-pagination">
          <span className="tx-pagination__info">
            Page {pagination.page} of {pagination.totalPages} &nbsp;·&nbsp;{" "}
            {pagination.total} total
          </span>
          <div className="tx-pagination__controls">
            <button
              className="tx-pagination__btn"
              disabled={!pagination.hasPreviousPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <button
              className="tx-pagination__btn"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
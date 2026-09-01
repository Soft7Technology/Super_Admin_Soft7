"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import styles from "./transactions.module.css";

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

/**
 * Actual API response shape:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     data: Transaction[],
 *     pagination: Pagination
 *   },
 *   meta: { timestamp: string }
 * }
 */
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

/* ── API helpers ───────────────────────────────────────────── */
async function fetchTransactionsApi(
  type: "credit" | "debit",
  page: number,
  limit: number
): Promise<{ transactions: Transaction[]; pagination: Pagination }> {
  const response = await axiosInstance.get<ApiResponse>(TRANSACTIONS_API, {
    params: { limit, page, type },
  });

  // Actual shape: response.data.data.data (axios wraps in .data, then our API wraps in data: { data: [] })
  const payload = response?.data?.data;
  const transactions: Transaction[] = Array.isArray(payload?.data)
    ? payload.data
    : [];
  const pagination: Pagination = payload?.pagination ?? {
    page: 1,
    limit,
    total: transactions.length,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  return { transactions, pagination };
}

async function fetchAllTransactions(
  page: number,
  limit: number
): Promise<{ transactions: Transaction[]; pagination: Pagination }> {
  const [creditResult, debitResult] = await Promise.all([
    fetchTransactionsApi("credit", page, limit),
    fetchTransactionsApi("debit", page, limit),
  ]);

  const merged = [
    ...creditResult.transactions,
    ...debitResult.transactions,
  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Combine pagination totals for "all" view
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
  const [page, setPage] = useState(1);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
const [balanceLoading, setBalanceLoading] = useState(true);

  /* ── Fetch ─────────────────────────────────────────────────── */
  const fetchTransactions = useCallback(
    async (currentFilter: FilterType, currentPage: number) => {
      setLoading(true);
      setError(null);
      try {
        let result: { transactions: Transaction[]; pagination: Pagination };

        if (currentFilter === "all") {
          result = await fetchAllTransactions(currentPage, LIMIT);
        } else {
          result = await fetchTransactionsApi(
            currentFilter,
            currentPage,
            LIMIT
          );
        }

        setTransactions(result.transactions);
        setPagination(result.pagination);
      } catch (err: unknown) {
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
    fetchTransactions(filter, page);
  }, [filter, page, fetchTransactions]);
  
useEffect(() => {
  const fetchBalance = async () => {
    try {
      setBalanceLoading(true);

      const res = await axiosInstance.get("/v1/admin/users/");

      const balance =
        res.data?.data?.credit_balance ?? 0;

      setWalletBalance(Number(balance));
    } catch (err) {
      console.error(err);
    } finally {
      setBalanceLoading(false);
    }
  };

  fetchBalance();

  const interval = setInterval(fetchBalance, 30000);

  return () => clearInterval(interval);
}, []);
  /* ── Filter change resets to page 1 ───────────────────────── */
  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setPage(1);
  };

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

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className={styles["tx-page"]}>
     {/* Header */}
      <div className={styles["tx-page__header"]}>
        <h1 className={styles["tx-page__title"]}>Transaction History</h1>
        <p className={styles["tx-page__subtitle"]}>
          Track all credit and debit activity in one place
        </p>
      </div>

      {/* Wallet Balance Card */}
      <div className={styles["tx-balance-card"]}>
        <div className={styles["tx-balance-card__icon"]}>
          <Wallet size={20} />
        </div>
        <div className={styles["tx-balance-card__info"]}>
          <span className={styles["tx-balance-card__label"]}>
            Current Wallet Balance
          </span>
          {balanceLoading ? (
            <span
              className={`${styles.skeleton} ${styles["skeleton--md"]}`}
            />
          ) : (
            <span className={styles["tx-balance-card__amount"]}>
              ₹{walletBalance !== null ? formatCurrency(walletBalance) : "—"}
            </span>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles["tx-toolbar"]}>
        <div
          className={styles["tx-segment"]}
          role="tablist"
          aria-label="Filter by type"
        >
          {FILTERS.map((opt) => (
            <button
              key={opt.value}
              role="tab"
              aria-selected={filter === opt.value}
              className={`${styles["tx-segment__btn"]} ${
                filter === opt.value ? styles["tx-segment__btn--active"] : ""
              }`}
              onClick={() => handleFilterChange(opt.value)}
            >
              {opt.value !== "all" && (
                <span
                  className={`${styles["tx-segment__dot"]} ${
                    opt.value === "credit"
                      ? styles["tx-segment__dot--credit"]
                      : styles["tx-segment__dot--debit"]
                  }`}
                />
              )}
              {opt.label}
            </button>
          ))}
        </div>

        {!loading && !error && pagination && (
          <span className={styles["tx-count"]}>
            {pagination.total} transaction
            {pagination.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table card */}
      <div className={styles["tx-table-wrap"]}>
        <table className={styles["tx-table"]}>
          <thead>
            <tr>
              <th>
                <span className={styles["th-sort"]}>
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
                    <span
                      className={`${styles.skeleton} ${styles["skeleton--md"]}`}
                    />
                  </td>
                  <td>
                    <span
                      className={`${styles.skeleton} ${styles["skeleton--sm"]}`}
                    />
                  </td>
                  <td>
                    <span
                      className={`${styles.skeleton} ${styles["skeleton--sm"]}`}
                    />
                  </td>
                  <td>
                    <span
                      className={`${styles.skeleton} ${styles["skeleton--sm"]}`}
                    />
                  </td>
                  <td>
                    <span
                      className={`${styles.skeleton} ${styles["skeleton--sm"]}`}
                    />
                  </td>
                  <td>
                    <span
                      className={`${styles.skeleton} ${styles["skeleton--sm"]}`}
                    />
                  </td>
                  <td>
                    <span
                      className={`${styles.skeleton} ${styles["skeleton--lg"]}`}
                    />
                  </td>
                </tr>
              ))}

            {/* Error */}
            {!loading && error && (
              <tr>
                <td colSpan={7}>
                  <div className={styles["tx-empty"]}>
                    <div className={styles["tx-empty__text"]}>
                      Could not load transactions
                    </div>
                    <div className={styles["tx-empty__hint"]}>{error}</div>
                    <button
                      className={styles["tx-retry"]}
                      onClick={() => fetchTransactions(filter, page)}
                    >
                      Try again
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {/* Empty */}
            {!loading && !error && safeTransactions.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className={styles["tx-empty"]}>
                    <div className={styles["tx-empty__text"]}>
                      No {filter !== "all" ? filter : ""} transactions found
                    </div>
                    {filter !== "all" && (
                      <div className={styles["tx-empty__hint"]}>
                        Try switching the filter to "All"
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {/* Rows */}
            {!loading &&
              !error &&
              safeTransactions.map((tx) => {
                const isCredit = tx.type === "credit";
                const amount = Number(tx.amount);
                return (
                  <tr key={tx.id}>
                    <td className={styles["td-date"]}>
                      {formatDate(tx.created_at)}
                    </td>
                    <td className={styles["td-company"]}>
                      {tx.company_name ?? "—"}
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          isCredit
                            ? styles["badge--credit"]
                            : styles["badge--debit"]
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className={styles["td-ref"]}>
                      {formatReferenceType(tx.reference_type)}
                    </td>
                    <td
                      className={`${styles["td-amount"]} ${
                        isCredit
                          ? styles["td-amount--credit"]
                          : styles["td-amount--debit"]
                      }`}
                    >
                      {isCredit ? "+" : "−"}₹{formatCurrency(Math.abs(amount))}
                    </td>
                    <td className={styles["td-balance"]}>
                      ₹{formatCurrency(tx.balance_after)}
                    </td>
                    <td className={styles["td-desc"]} title={tx.description}>
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
        <div className={styles["tx-pagination"]}>
          <span className={styles["tx-pagination__info"]}>
            Page {pagination.page} of {pagination.totalPages} &nbsp;·&nbsp;{" "}
            {pagination.total} total
          </span>
          <div className={styles["tx-pagination__controls"]}>
            <button
              className={styles["tx-pagination__btn"]}
              disabled={!pagination.hasPreviousPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <button
              className={styles["tx-pagination__btn"]}
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
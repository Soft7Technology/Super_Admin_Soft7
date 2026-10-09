"use client";

import React, { useEffect, useState, useCallback } from "react";

import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Download,
  Check,
  RefreshCw,
  Eye,
} from "lucide-react";

import { axiosInstance } from "@/lib/axiosInstance";

import "@/app/globals.css";

import styles from "./transactions.module.css";

import Spinner from "@/components/ui/Spinner";

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

interface ApiResponse {
  success: boolean;

  message: string;

  data: {
    items: Transaction[];

    pagination?: Pagination;
  };
}

type FilterType = "all" | "credit" | "debit";

/* ── Constants ─────────────────────────────────────────────── */

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },

  { label: "Credit", value: "credit" },

  { label: "Debit", value: "debit" },
];

const LIMIT = 25;

const TRANSACTIONS_API = "/v1/super-admin/credits";

/* ── API helpers ───────────────────────────────────────────── */

async function fetchTransactionsApi(
  type: FilterType,

  page: number,

  limit: number,
): Promise<{ transactions: Transaction[]; pagination: Pagination }> {
  const params: Record<string, string | number> = {
    page,

    limit,
  };

  if (type !== "all") {
    params.type = type;
  }

  const response = await axiosInstance.get<ApiResponse>(
    TRANSACTIONS_API,

    { params },
  );

  const payload = response.data?.data;

  const transactions = Array.isArray(payload?.items) ? payload.items : [];

  const pagination: Pagination = payload?.pagination ?? {
    page,

    limit,

    total: transactions.length,

    totalPages: 1,

    hasNextPage: false,

    hasPreviousPage: false,
  };

  return { transactions, pagination };
}

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const axiosErr = err as {
      response?: { status?: number; data?: { message?: string } };

      message?: string;
    };

    if (axiosErr.response?.status === 404)
      return "Endpoint not found (404). Check the API path.";

    if (axiosErr.response?.data?.message) return axiosErr.response.data.message;

    if (axiosErr.message) return axiosErr.message;
  }

  if (err instanceof Error) return err.message;

  return "Failed to load transactions.";
}

function exportToCSV(txList: Transaction[]) {
  const headers = [
    "ID",

    "Date",

    "Company Name",

    "User Email",

    "Type",

    "Reference Type",

    "Reference ID",

    "Amount",

    "Balance Before",

    "Balance After",

    "Description",
  ];

  const escape = (val: unknown) => `"${String(val ?? "").replace(/"/g, '""')}"`;

  const rows = txList.map((tx) =>
    [
      tx.id,

      tx.created_at,

      tx.company_name ?? "",

      tx.email ?? "",

      tx.type,

      tx.reference_type ?? "",

      tx.reference_id ?? "",

      tx.amount,

      tx.balance_before,

      tx.balance_after,

      tx.description ?? "",
    ]

      .map(escape)

      .join(","),
  );

  const csv = [headers.map((h) => escape(h)).join(","), ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
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

  const [exporting, setExporting] = useState(false);

  const [exportDone, setExportDone] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  /* ── Fetch ─────────────────────────────────────────────────── */

  const fetchTransactions = useCallback(
    async (currentFilter: FilterType, currentPage: number) => {
      setLoading(true);

      setError(null);

      try {
        const result = await fetchTransactionsApi(
          currentFilter,

          currentPage,

          LIMIT,
        );

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

    [],
  );

  useEffect(() => {
    fetchTransactions(filter, page);
  }, [filter, page, fetchTransactions]);

  // Keep this function in the component scope so the refresh button can call it.
  async function fetchBalance() {
    setBalanceLoading(true);
    try {
      const res = await axiosInstance.get("/v1/admin/users/");
      const balance = res.data?.data?.credit_balance ?? 0;
      setWalletBalance(Number(balance));
    } catch (err) {
      console.error("Failed to fetch wallet balance:", err);
    } finally {
      setBalanceLoading(false);
    }
  }

  useEffect(() => {
    void fetchBalance();
    // Fetch once on mount; refresh is manual via the wallet-card button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      ? ref.replace(/\_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "—";

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  /* ── Export CSV ────────────────────────────────────────────── */

  const handleExportCSV = () => {
    if (safeTransactions.length === 0) return;

    setExporting(true);

    setTimeout(() => {
      exportToCSV(safeTransactions);

      setExporting(false);

      setExportDone(true);

      setTimeout(() => setExportDone(false), 2500);
    }, 400);
  };

  /* ── Render ──────────────────────────────────────────────── */

  return (
    <div className={`${styles["tx-page"]} tx-page`}>
      {/* Header */}

      <div className={styles["tx-page__header"]}>
        <div>
          <h1 className={styles["tx-page__title"]}>Transaction History</h1>

          <p className={styles["tx-page__subtitle"]}>
            Track all credit and debit activity in one place
          </p>
        </div>

        <div className={styles["tx-header__right"]}>
          <button
            onClick={handleExportCSV}
            disabled={exporting || safeTransactions.length === 0}
            className={`${styles["tx-btn-export"]} ${
              exportDone ? styles["tx-btn-export--done"] : ""
            }`}
          >
            {exporting ? (
              <Spinner size="sm" text="Exporting…" />
            ) : exportDone ? (
              <>
                <Check size={14} />

                <span>Downloaded</span>
              </>
            ) : (
              <>
                <Download size={14} />

                <span>Export</span>
              </>
            )}
          </button>
        </div>
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
              style={{
                display: "inline-flex",

                alignItems: "center",

                gap: 6,

                height: 26,
              }}
            >
              <Spinner size="xs" color="primary" />
            </span>
          ) : (
            <span className={styles["tx-balance-card__amount"]}>
              ₹{walletBalance !== null ? formatCurrency(walletBalance) : "—"}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            void fetchBalance();

            void fetchTransactions(filter, page);
          }}
          disabled={balanceLoading || loading}
          aria-label="Refresh wallet balance and transactions"
          title="Refresh"
          style={{
            marginLeft: "auto",

            display: "inline-flex",

            alignItems: "center",

            justifyContent: "center",

            width: 34,

            height: 34,

            flexShrink: 0,

            border: "1px solid var(--st-border, #dce8e2)",

            borderRadius: 8,

            background: "transparent",

            color: "var(--primary, #087f5b)",

            cursor: balanceLoading || loading ? "not-allowed" : "pointer",

            opacity: balanceLoading || loading ? 0.6 : 1,
          }}
        >
          <RefreshCw
            size={16}
            className={balanceLoading || loading ? "animate-spin" : ""}
          />
        </button>
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

              <th>Amount</th>
              <th>Balance After</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {/* Loading Modern Ring Spinner */}

            {loading && (
              <tr>
                <td colSpan={6} style={{ padding: "40px 0" }}>
                  <Spinner
                    variant="center"
                    size="lg"
                    color="primary"
                    text="Loading transactions..."
                  />
                </td>
              </tr>
            )}

            {/* Error */}

            {!loading && error && (
              <tr>
                <td colSpan={6}>
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
                <td colSpan={6}>
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

                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedTransaction(tx)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 10px",
                          border: "1px solid var(--st-border, #dce8e2)",
                          borderRadius: 7,
                          background: "transparent",
                          color: "var(--primary, #087f5b)",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View (<= 768px) */}

      <div className={styles["tx-mobile-cards"]}>
        {/* Loading skeletons */}

        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={`m-skeleton-${i}`} className={styles["tx-card"]}>
              <div
                style={{
                  display: "flex",

                  justifyContent: "space-between",

                  alignItems: "center",
                }}
              >
                <span
                  className={`${styles.skeleton} ${styles["skeleton--md"]}`}
                />

                <span
                  className={`${styles.skeleton} ${styles["skeleton--sm"]}`}
                />
              </div>

              <span
                className={`${styles.skeleton} ${styles["skeleton--lg"]}`}
              />
            </div>
          ))}

        {/* Error */}

        {!loading && error && (
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
        )}

        {/* Empty */}

        {!loading && !error && safeTransactions.length === 0 && (
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
        )}

        {/* Cards */}

        {!loading &&
          !error &&
          safeTransactions.map((tx) => {
            const isCredit = tx.type === "credit";

            const amount = Number(tx.amount);

            return (
              <div key={`m-tx-${tx.id}`} className={styles["tx-card"]}>
                <div className={styles["tx-card__header"]}>
                  <div className={styles["tx-card__title-wrap"]}>
                    <span className={styles["tx-card__company"]}>
                      {tx.company_name ?? "—"}
                    </span>

                    <span className={styles["tx-card__date"]}>
                      {formatDate(tx.created_at)}
                    </span>
                  </div>

                  <div className={styles["tx-card__badge-wrap"]}>
                    <span
                      className={`${styles.badge} ${
                        isCredit
                          ? styles["badge--credit"]
                          : styles["badge--debit"]
                      }`}
                    >
                      <span
                        className={`${styles["tx-segment__dot"]} ${
                          isCredit
                            ? styles["tx-segment__dot--credit"]
                            : styles["tx-segment__dot--debit"]
                        }`}
                      />

                      {tx.type}
                    </span>

                    <span
                      className={`${styles["tx-card__amount"]} ${
                        isCredit
                          ? styles["td-amount--credit"]
                          : styles["td-amount--debit"]
                      }`}
                    >
                      {isCredit ? "+" : "−"}₹{formatCurrency(Math.abs(amount))}
                    </span>
                  </div>
                </div>

                <div className={styles["tx-card__details"]}>
                  <div className={styles["tx-card__detail-row"]}>
                    <span className={styles["tx-card__label"]}>
                      Balance After
                    </span>

                    <span className={styles["tx-card__val"]}>
                      ₹{formatCurrency(tx.balance_after)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
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

      {selectedTransaction && (
        <div
          onClick={() => setSelectedTransaction(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            background: "rgba(15, 23, 42, 0.45)",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-modal-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 600,
              maxHeight: "85vh",
              overflowY: "auto",
              padding: 24,
              borderRadius: 14,
              background: "var(--card-bg, #ffffff)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div>
                <h2
                  id="transaction-modal-title"
                  style={{ margin: 0, fontSize: 20, fontWeight: 700 }}
                >
                  Transaction Details
                </h2>
                <p style={{ margin: "6px 0 0", fontSize: 13, opacity: 0.7 }}>
                  Complete transaction information
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTransaction(null)}
                aria-label="Close transaction details"
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 24,
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                ×
              </button>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: 16,
                marginBottom: 20,
                borderRadius: 10,
                background: "var(--st-surface, #f5f9f7)",
              }}
            >
              <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
                  Transaction Amount
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color:
                      selectedTransaction.type === "credit"
                        ? "#16845b"
                        : "#d14343",
                  }}
                >
                  {selectedTransaction.type === "credit" ? "+" : "−"}₹
                  {formatCurrency(Math.abs(Number(selectedTransaction.amount)))}
                </div>
              </div>
              <span
                className={`${styles.badge} ${
                  selectedTransaction.type === "credit"
                    ? styles["badge--credit"]
                    : styles["badge--debit"]
                }`}
              >
                {selectedTransaction.type}
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 18,
              }}
            >
              {(
                [
                  ["Transaction ID", selectedTransaction.id],
                  ["Company", selectedTransaction.company_name],
                  ["Company ID", selectedTransaction.company_id],
                  ["User ID", selectedTransaction.user_id],
                  ["User Email", selectedTransaction.email],
                  ["Date", formatDate(selectedTransaction.created_at)],
                  [
                    "Reference Type",
                    formatReferenceType(selectedTransaction.reference_type),
                  ],
                  ["Reference ID", selectedTransaction.reference_id],
                  [
                    "Balance Before",
                    `₹${formatCurrency(selectedTransaction.balance_before)}`,
                  ],
                  [
                    "Balance After",
                    `₹${formatCurrency(selectedTransaction.balance_after)}`,
                  ],
                  ["Created By", selectedTransaction.created_by],
                  ["Description", selectedTransaction.description],
                ] as [string, string | null | undefined][]
              ).map(([label, value]) => (
                <div key={label}>
                  <div style={{ marginBottom: 5, fontSize: 12, opacity: 0.65 }}>
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      overflowWrap: "anywhere",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {value || "—"}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              
              
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 24,
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedTransaction(null)}
                style={{
                  padding: "9px 18px",
                  border: "none",
                  borderRadius: 8,
                  background: "var(--primary, #087f5b)",
                  color: "#ffffff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

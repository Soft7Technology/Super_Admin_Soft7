"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ArrowUpDown, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
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
  user_id: string;
  email: string | null;
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


async function fetchAllTransactions(limit: number): Promise<Transaction[]> {
  const [creditRes, debitRes] = await Promise.all([
    axiosInstance.get(TRANSACTIONS_API, { params: { limit, type: "credit" } }),
    axiosInstance.get(TRANSACTIONS_API, { params: { limit, type: "debit" } }),
  ]);
  const creditRaw = creditRes?.data?.data ?? creditRes?.data ?? [];
  const debitRaw = debitRes?.data?.data ?? debitRes?.data ?? [];
  const merged = [
    ...(Array.isArray(creditRaw) ? creditRaw : []),
    ...(Array.isArray(debitRaw) ? debitRaw : []),
  ].sort(
    (a: Transaction, b: Transaction) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return merged;
}

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const axiosErr = err as {
      response?: { status?: number; data?: { message?: string } };
      message?: string;
    };
    if (axiosErr.response?.status === 404) {
      return "Endpoint not found (404). Check the API path.";
    }
    if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
    if (axiosErr.message) return axiosErr.message;
  }
  if (err instanceof Error) return err.message;
  return "Failed to load transactions.";
}

/* ── Component ─────────────────────────────────────────────── */
export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  const [summaryTx, setSummaryTx] = useState<Transaction[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(true);

  /* ── Table fetch (driven by filter) ───────────────────────── */
  const fetchTransactions = useCallback(async (currentFilter: FilterType) => {
    setLoading(true);
    setError(null);
    try {
      let raw: Transaction[];
      if (currentFilter === "all") {
        raw = await fetchAllTransactions(LIMIT);
      } else {
        const response = await axiosInstance.get(TRANSACTIONS_API, {
          params: { limit: LIMIT, type: currentFilter },
        });
        raw = response?.data?.data ?? response?.data ?? [];
      }
      setTransactions(Array.isArray(raw) ? raw : []);
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Summary fetch (always unfiltered, runs once) ─────────── */
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const raw = await fetchAllTransactions(LIMIT);
      setSummaryTx(raw);
    } catch {
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions(filter);
  }, [filter, fetchTransactions]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  /* ── Formatters ──────────────────────────────────────────── */
  const formatCurrency = (val: string | number) =>
    Number(val).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  const formatReferenceType = (ref: string | null) =>
    ref ? ref.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—";

  /* ── Summary totals — derived ONLY from summaryTx, never from
     the filtered table data ────────────────────────────────── */
  const totalCredit = summaryTx
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalDebit = summaryTx
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const currentBalance = summaryTx.length
    ? Number(
        summaryTx.reduce((latest, t) =>
          new Date(t.created_at) > new Date(latest.created_at) ? t : latest
        ).balance_after
      ) || 0
    : 0;

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

      {/* Summary cards — always reflect the full unfiltered dataset */}
      <div className={styles["tx-summary"]}>
        <div className={styles["tx-summary__card"]}>
          <div className={styles["tx-summary__icon"]}>
            <Wallet size={16} />
          </div>
          <div>
            <div className={styles["tx-summary__label"]}>Current balance</div>
            <div className={styles["tx-summary__value"]}>
              {summaryLoading ? (
                <span className={`${styles.skeleton} ${styles["skeleton--sm"]}`} />
              ) : (
                `₹${formatCurrency(currentBalance)}`
              )}
            </div>
          </div>
        </div>

        <div className={styles["tx-summary__card"]}>
          <div
            className={`${styles["tx-summary__icon"]} ${styles["tx-summary__icon--credit"]}`}
          >
            <TrendingUp size={16} />
          </div>
          <div>
            <div className={styles["tx-summary__label"]}>Total credited</div>
            <div
              className={`${styles["tx-summary__value"]} ${styles["tx-summary__value--credit"]}`}
            >
              {summaryLoading ? (
                <span className={`${styles.skeleton} ${styles["skeleton--sm"]}`} />
              ) : (
                `+₹${formatCurrency(totalCredit)}`
              )}
            </div>
          </div>
        </div>

        <div className={styles["tx-summary__card"]}>
          <div
            className={`${styles["tx-summary__icon"]} ${styles["tx-summary__icon--debit"]}`}
          >
            <TrendingDown size={16} />
          </div>
          <div>
            <div className={styles["tx-summary__label"]}>Total debited</div>
            <div
              className={`${styles["tx-summary__value"]} ${styles["tx-summary__value--debit"]}`}
            >
              {summaryLoading ? (
                <span className={`${styles.skeleton} ${styles["skeleton--sm"]}`} />
              ) : (
                `−₹${formatCurrency(totalDebit)}`
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles["tx-toolbar"]}>
        <div className={styles["tx-segment"]} role="tablist" aria-label="Filter by type">
          {FILTERS.map((opt) => (
            <button
              key={opt.value}
              role="tab"
              aria-selected={filter === opt.value}
              className={`${styles["tx-segment__btn"]} ${
                filter === opt.value ? styles["tx-segment__btn--active"] : ""
              }`}
              onClick={() => setFilter(opt.value)}
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

        {/* {!loading && !error && (
          <span className={styles["tx-count"]}>
            {safeTransactions.length} transaction{safeTransactions.length !== 1 ? "s" : ""}
          </span>
        )} */}
      </div>

      {/* Table card — fills available width, no forced scrollbar */}
      <div className={styles["tx-table-wrap"]}>
        <table className={styles["tx-table"]}>
          <thead>
            <tr>
              <th>
                <span className={styles["th-sort"]}>
                  Date <ArrowUpDown size={11} />
                </span>
              </th>
              <th>Type</th>
              <th>Reference</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Balance after</th>
            </tr>
          </thead>
          <tbody>
            {/* Loading */}
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  <td><span className={`${styles.skeleton} ${styles["skeleton--md"]}`} /></td>
                  <td><span className={`${styles.skeleton} ${styles["skeleton--sm"]}`} /></td>
                  <td><span className={`${styles.skeleton} ${styles["skeleton--sm"]}`} /></td>
                  <td><span className={`${styles.skeleton} ${styles["skeleton--sm"]}`} /></td>
                  <td><span className={`${styles.skeleton} ${styles["skeleton--lg"]}`} /></td>
                  <td><span className={`${styles.skeleton} ${styles["skeleton--sm"]}`} /></td>
                </tr>
              ))}

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
                      onClick={() => fetchTransactions(filter)}
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
                    <td>
                      <span
                        className={`${styles.badge} ${
                          isCredit ? styles["badge--credit"] : styles["badge--debit"]
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
                        isCredit ? styles["td-amount--credit"] : styles["td-amount--debit"]
                      }`}
                    >
                      {isCredit ? "+" : "−"}₹{formatCurrency(Math.abs(amount))}
                    </td>
                    <td className={styles["td-desc"]} title={tx.description}>
                      {tx.description}
                    </td>
                    <td className={styles["td-balance"]}>
                      ₹{formatCurrency(tx.balance_after)}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

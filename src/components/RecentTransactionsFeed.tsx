"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  RefreshCw,
  Clock,
} from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import "@/app/user/dashboard/dashboard.css";

export interface FeedTransaction {
  id: string;
  company_name: string | null;
  type: "credit" | "debit" | string;
  amount: string | number;
  balance_after?: string | number;
  description?: string;
  created_at: string;
  email?: string | null;
}

function formatCurrency(val: string | number): string {
  const num = Number(val);
  return isNaN(num)
    ? "0.00"
    : num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
}
const TRANSACTIONS_API = "/v1/super-admin/credits";
function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr || "Recently";

    const diffMins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

export default function RecentTransactionsFeed({
  limit = 5,
}: {
  limit?: number;
}) {
  const router = useRouter();
  const [transactions, setTransactions] = useState<FeedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(
    async (manual = false) => {
      if (manual) setIsRefreshing(true);
      else setLoading(true);

      setError(null);

      try {
        const response = await axiosInstance.get(TRANSACTIONS_API, {
          params: { limit, page: 1 },
        });

        const payload = response?.data?.data;

        const transactionData: FeedTransaction[] = Array.isArray(payload?.items)
          ? payload.items
          : [];

        setTransactions(transactionData.slice(0, limit));
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load transactions.",
        );
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  return (
    <div className="crm-card" style={{ overflow: "hidden" }}>
      {/* Header */}
      <div className="crm-card__header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(245, 159, 0, 0.12)",
              color: "var(--crm-yellow, #f59f00)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CreditCard size={17} />
          </div>
          <div>
            <h2 className="crm-card__title">Recent Transactions</h2>
            <div className="crm-card__subtitle">
              Live credit top-ups & tenant billing activity
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => loadFeed(true)}
            disabled={isRefreshing || loading}
            title="Refresh Feed"
            className="crm-btn crm-btn--icon"
            style={{ width: 28, height: 28 }}
          >
            <RefreshCw
              size={13}
              style={{
                animation: isRefreshing ? "spin 0.8s linear infinite" : "none",
              }}
            />
          </button>

          <button
            onClick={() => router.push("/user/transactions")}
            className="crm-btn"
            style={{
              border: "none",
              color: "var(--crm-primary)",
              padding: "4px 0",
            }}
          >
            View All <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Feed Content */}
      <div style={{ padding: "8px 0" }}>
        {loading && (
          <div
            style={{
              padding: "8px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "var(--surf2)",
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: 110,
                        height: 12,
                        borderRadius: 4,
                        background: "var(--surf2)",
                      }}
                    />
                    <div
                      style={{
                        width: 160,
                        height: 9,
                        borderRadius: 4,
                        background: "var(--surf2)",
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    width: 70,
                    height: 14,
                    borderRadius: 4,
                    background: "var(--surf2)",
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div
            style={{
              padding: "24px 20px",
              textAlign: "center",
              color: "var(--crm-muted)",
              fontSize: 13,
            }}
          >
            <div style={{ color: "var(--crm-red)", marginBottom: 6 }}>
              {error}
            </div>
            <button onClick={() => loadFeed()} className="crm-btn">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && transactions.length === 0 && (
          <div
            style={{
              padding: "36px 20px",
              textAlign: "center",
              color: "var(--crm-muted)",
            }}
          >
            <CreditCard size={28} style={{ opacity: 0.35, marginBottom: 8 }} />
            <div
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: "var(--crm-title)",
              }}
            >
              No Recent Transactions
            </div>
            <div style={{ fontSize: 12, marginTop: 2 }}>
              Credit adjustments & billing events will appear here in real time.
            </div>
          </div>
        )}

        {!loading &&
          !error &&
          transactions.map((tx, idx) => {
            const isCredit = tx.type === "credit";
            const amt = formatCurrency(tx.amount);
            const title =
              tx.description ||
              tx.company_name ||
              tx.email ||
              "Credit Transaction";

            return (
              <div
                key={tx.id || idx}
                onClick={() => router.push("/user/transactions")}
                className="crm-tx-feed-item"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <div
                    className={`crm-tx-icon ${
                      isCredit ? "crm-tx-icon--credit" : "crm-tx-icon--debit"
                    }`}
                  >
                    {isCredit ? (
                      <ArrowDownLeft size={18} />
                    ) : (
                      <ArrowUpRight size={18} />
                    )}
                  </div>

                  <div className="crm-tx-info">
                    <span className="crm-tx-title" title={title}>
                      {title}
                    </span>
                    <div className="crm-tx-meta">
                      <Clock size={11} style={{ opacity: 0.7 }} />
                      <span>{formatRelativeTime(tx.created_at)}</span>
                     
                    </div>
                  </div>
                </div>

                <div className="crm-tx-amount-wrap">
                  <span
                    className={`crm-tx-amount ${
                      isCredit
                        ? "crm-tx-amount--credit"
                        : "crm-tx-amount--debit"
                    }`}
                  >
                    {isCredit ? `+₹${amt}` : `-₹${amt}`}
                  </span>
                  <span
                    className={`crm-tx-badge ${
                      isCredit ? "crm-tx-badge--credit" : "crm-tx-badge--debit"
                    }`}
                  >
                    {tx.type}
                  </span>
                </div>
              </div>
            );
          })}
      </div>

      {/* Footer */}
      <div
        onClick={() => router.push("/user/transactions")}
        className="crm-tx-footer"
      >
        <span>Manage credit rules & refunds</span>
        <span
          style={{
            color: "var(--crm-primary)",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          Transactions Hub <ChevronRight size={13} />
        </span>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import "./manage-transaction.css";
import { axiosInstance } from "@/lib/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RefreshCw } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const TRANSACTIONS_API = "/v1/admin/credits/superadmin/transaction";
const ITEMS_PER_PAGE = 50;

// ─── TYPES ────────────────────────────────────────────────────────────────────

type TxType = "credit" | "debit";

interface RawTransaction {
  id: string;
  company_id: string;
  type: TxType;
  amount: string;
  balance_before: string;
  balance_after: string;
  reference_type: string | null;
  reference_id: string | null;
  description: string | null;
  created_by: string | null;
  meta_data: unknown;
  created_at: string;
  company_name: string;
  user_id: string | null;
  email: string | null;
  balance_transafered_by: string | null;
}

interface Transaction {
  id: string;
  companyId: string;
  companyName: string;
  type: TxType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string;
  referenceId: string;
  description: string;
  createdAt: string;
  createdAtRaw: string;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function enrichTransaction(raw: RawTransaction): Transaction {
  return {
    id: raw.id,
    companyId: raw.company_id,
    companyName: raw.company_name || "Unknown company",
    type: raw.type,
    amount: Number(raw.amount || 0),
    balanceBefore: Number(raw.balance_before || 0),
    balanceAfter: Number(raw.balance_after || 0),
    referenceType: raw.reference_type || "—",
    referenceId: raw.reference_id || "—",
    description: raw.description || "—",
    createdAt: raw.created_at
      ? new Date(raw.created_at).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—",
    createdAtRaw: raw.created_at,
  };
}

function money(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function shortId(id: string) {
  if (!id || id === "—") return "—";
  return id.length > 10 ? `${id.slice(0, 8)}…` : id;
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: TxType }) {
  return (
    <span className={`tx-badge tx-badge--${type}`}>
      <span className="tx-badge__dot" />
      {type[0].toUpperCase() + type.slice(1)}
    </span>
  );
}

function KPI({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="tx-kpi">
      <div className="tx-kpi__orb" style={{ background: `${color}10` }} />
      <div className="tx-kpi__top">
        <span className="tx-kpi__label">{label}</span>
        <div className="tx-kpi__icon" style={{ background: `${color}18` }}>
          {icon}
        </div>
      </div>
      <div className="tx-kpi__value" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

// ─── PAGINATION ───────────────────────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pages: (number | "...")[] = [];
  const windowSize = 1;

  for (let p = 1; p <= totalPages; p++) {
    const inWindow = p >= currentPage - windowSize && p <= currentPage + windowSize;
    if (p === 1 || p === totalPages || inWindow) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="tx-pagination">
      <div className="tx-pagination__summary">
        Showing <strong>{startItem}</strong>–<strong>{endItem}</strong> of{" "}
        <strong>{totalItems}</strong> transactions
      </div>

      <div className="tx-pagination__controls">
        <button
          type="button"
          className="tx-page-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          ‹ Prev
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="tx-pagination__ellipsis">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`tx-page-num ${p === currentPage ? "tx-page-num--active" : ""}`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          className="tx-page-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next ›
        </button>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ManageTransactions() {
  const { isDark } = useTheme();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | TxType>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchTransactions = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setFetchError(null);

    try {
      const res = await axiosInstance.get(TRANSACTIONS_API);
      const data = res.data;

      console.log("GET TRANSACTIONS RESPONSE =>", data);

      if (data?.success === false) {
        throw new Error(data?.message || "Failed to load transactions");
      }

      // API shape: { success, message, data: RawTransaction[] }
      const payload = data?.data;
      const raw: RawTransaction[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : [];

      setTransactions(raw.map(enrichTransaction));

      if (isRefresh) toast.success("Transactions refreshed");
    } catch (e: any) {
      console.error("TRANSACTIONS FETCH ERROR =>", e);
      const message =
        e?.response?.data?.message || e?.message || "Failed to load transactions";
      setFetchError(message);
      if (isRefresh) toast.error(message);
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter]);

  const query = search.trim().toLowerCase();

  const filtered = transactions.filter((t) => {
    if (typeFilter !== "ALL" && t.type !== typeFilter) return false;
    if (!query) return true;
    const searchable = [
      t.companyName,
      t.description,
      t.id,
      t.companyId,
      t.referenceType,
    ]
      .join(" ")
      .toLowerCase();
    return searchable.includes(query);
  });

  const totalCredit = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebit = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);
  const companyCount = new Set(transactions.map((t) => t.companyId)).size;

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(pageStart, pageStart + ITEMS_PER_PAGE);

  // ─── Theme-aware CSS variables ──────────────────────────────────────────
  // These override the --mc-* fallbacks used throughout manage-transaction.css
  const themeVars = isDark
    ? {
        "--mc-text": "#e8e6e1",
        "--mc-muted": "#8890a0",
        "--mc-surface": "#1a1a2e",
        "--mc-border": "#2c3657",
        "--mc-hover": "rgba(255,255,255,0.03)",
      }
    : {
        "--mc-text": "#111827",
        "--mc-muted": "#64748b",
        "--mc-surface": "#ffffff",
        "--mc-border": "#d1fae5",
        "--mc-hover": "#f0fdf4",
      };

  return (
    <div className="tx-root" style={themeVars as React.CSSProperties}>
      {/* HEADER */}
      <div className="tx-header">
        <div>
          <h1 className="tx-header__title">Superadmin Transactions</h1>
          <p className="tx-header__sub">
            Full credit ledger across every company on the platform.
          </p>
        </div>
        <button
          className="tx-btn tx-btn--primary"
          onClick={() => fetchTransactions(true)}
          disabled={refreshing}
        >
          <RefreshCw size={15} className={refreshing ? "tx-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* KPIs */}
      <div className="tx-kpi-grid">
        <KPI
          label="Transactions"
          value={String(transactions.length)}
          icon="📒"
          color="#10B981"
        />
        <KPI label="Total Credited" value={`₹${money(totalCredit)}`} icon="⬆️" color="#00CBA4" />
        <KPI label="Total Debited" value={`₹${money(totalDebit)}`} icon="⬇️" color="#FF6B6B" />
        <KPI label="Companies" value={String(companyCount)} icon="🏢" color="#FDCB6E" />
      </div>

      {/* FILTER BAR */}
      <div className="tx-filter-bar">
        <div className="tx-search-wrap">
          <span className="tx-search-icon">🔍</span>
          <input
            className="tx-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, description, id…"
            autoComplete="off"
          />
        </div>
        <div className="tx-filter-group">
          {(["ALL", "credit", "debit"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setTypeFilter(f)}
              className={`tx-filter-btn ${typeFilter === f ? "tx-filter-btn--active" : ""}`}
            >
              {f !== "ALL" && (
                <span
                  className="tx-filter-btn__dot"
                  style={{ background: f === "credit" ? "#00cba4" : "#ff6b6b" }}
                />
              )}
              {f === "ALL" ? "All" : f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <span className="tx-filter-count">{filtered.length} transactions</span>
      </div>

      {/* TABLE */}
      {fetchError ? (
        <div className="tx-empty">⚠️ {fetchError}</div>
      ) : (
        <div className="tx-table-wrapper">
          <table className="tx-table">
            <thead>
              <tr>
                <th>COMPANY</th>
                <th>TYPE</th>
                <th>AMOUNT</th>
                <th>BALANCE FLOW</th>
                <th>DESCRIPTION</th>
                <th>REFERENCE</th>
                <th>CREATED</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="tx-empty-row">
                  <td colSpan={7}>Loading transactions…</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr className="tx-empty-row">
                  <td colSpan={7}>No transactions match your filters.</td>
                </tr>
              ) : (
                paginated.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="tx-company-name">{t.companyName}</div>
                      <div className="tx-company-id">{shortId(t.companyId)}</div>
                    </td>
                    <td>
                      <TypeBadge type={t.type} />
                    </td>
                    <td>
                      <span className={`tx-amount tx-amount--${t.type}`}>
                        {t.type === "credit" ? "+" : "−"}₹{money(t.amount)}
                      </span>
                    </td>
                    <td>
                      <div className="tx-flow">
                        <span className="tx-flow__before">₹{money(t.balanceBefore)}</span>
                        <span className="tx-flow__arrow">→</span>
                        <span className="tx-flow__after">₹{money(t.balanceAfter)}</span>
                      </div>
                    </td>
                    <td className="tx-desc">{t.description}</td>
                    <td className="tx-reference">{t.referenceType}</td>
                    <td className="tx-created">{t.createdAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      {!loading && !fetchError && filtered.length > 0 && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={ITEMS_PER_PAGE}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme={isDark ? "dark" : "light"}
      />
    </div>
  );
}
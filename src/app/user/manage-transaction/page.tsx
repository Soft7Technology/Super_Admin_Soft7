"use client";

import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  RefreshCw,
  Search,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { PageContainer, PageHeader } from "@/components/layout";
import KpiCard from "@/components/admin/KpiCard";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Pagination from "@/components/ui/Pagination";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Table from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import { cn } from "@/lib/utils";


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

/// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: TxType }) {
  return (
    <Badge variant={type === "credit" ? "success" : "error"} dot>
      {type[0].toUpperCase() + type.slice(1)}
    </Badge>
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

  const columns: Column<Transaction>[] = [
    {
      key: "companyName",
      header: "Company",
      render: (t) => (
        <div>
          <p className="font-medium text-foreground">{t.companyName}</p>
          <p className="font-mono text-[0.6875rem] text-muted-foreground">{shortId(t.companyId)}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (t) => <TypeBadge type={t.type} />,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (t) => (
        <span className={cn("font-semibold tabular-nums", t.type === "credit" ? "text-success" : "text-error")}>
          {t.type === "credit" ? "+" : "−"}₹{money(t.amount)}
        </span>
      ),
    },
    {
      key: "balanceFlow",
      header: "Balance Flow",
      render: (t) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap text-[0.8125rem] tabular-nums">
          <span className="text-muted-foreground">₹{money(t.balanceBefore)}</span>
          <ArrowRight size={13} className="text-disabled-foreground" />
          <span className="font-medium text-foreground">₹{money(t.balanceAfter)}</span>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (t) => (
        <span className="block max-w-xs truncate text-secondary-foreground" title={t.description}>
          {t.description}
        </span>
      ),
    },
    {
      key: "referenceType",
      header: "Reference",
      render: (t) => <span className="text-secondary-foreground">{t.referenceType}</span>,
    },
    {
      key: "createdAt",
      header: "Created",
      render: (t) => <span className="whitespace-nowrap text-muted-foreground">{t.createdAt}</span>,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Superadmin Transactions"
        description="Full credit ledger across every company on the platform."
        actions={
          <Button
            onClick={() => fetchTransactions(true)}
            isLoading={refreshing}
            leftIcon={<RefreshCw size={15} />}
          >
            Refresh
          </Button>
        }
      />

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Transactions" value={String(transactions.length)} icon={<BookOpen size={18} />} />
        <KpiCard label="Total Credited" value={`₹${money(totalCredit)}`} icon={<ArrowUpRight size={18} />} tone="success" />
        <KpiCard label="Total Debited" value={`₹${money(totalDebit)}`} icon={<ArrowDownRight size={18} />} tone="error" />
        <KpiCard label="Companies" value={String(companyCount)} icon={<Building2 size={18} />} tone="warning" />
      </div>

      {/* FILTER BAR */}
      <Card padding="sm" className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            wrapperClassName="min-w-0 flex-[1_1_16rem]"
            leftIcon={<Search size={15} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, description, id…"
            autoComplete="off"
            aria-label="Search transactions"
          />
          <SegmentedControl<"ALL" | TxType>
            aria-label="Filter by type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={(["ALL", "credit", "debit"] as const).map((f) => ({
              value: f,
              label: f === "ALL" ? "All" : f[0].toUpperCase() + f.slice(1),
              icon:
                f === "ALL" ? undefined : (
                  <span className={cn("h-1.5 w-1.5 rounded-full", f === "credit" ? "bg-success" : "bg-error")} aria-hidden />
                ),
            }))}
          />
          <span className="text-sm whitespace-nowrap text-muted-foreground">{filtered.length} transactions</span>
        </div>
      </Card>

      {/* TABLE */}
      {fetchError ? (
        <Alert variant="error" message={fetchError} />
      ) : (
        <Table
          columns={columns}
          data={paginated}
          rowKey={(t) => t.id}
          loading={loading}
          emptyMessage="No transactions match your filters."
        />
      )}

      {/* PAGINATION */}
      {!loading && !fetchError && filtered.length > 0 && (
        <Pagination
          className="mt-4"
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          showInfo
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
    </PageContainer>
  );
}

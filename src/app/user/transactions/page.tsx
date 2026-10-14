"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AlertTriangle, RefreshCw, Wallet } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { PageContainer, PageHeader } from "@/components/layout";
import KpiCard from "@/components/admin/KpiCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PaginationControl from "@/components/ui/Pagination";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Skeleton from "@/components/ui/Skeleton";
import Table from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import { cn } from "@/lib/utils";


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

  const columns: Column<Transaction>[] = [
    {
      key: "created_at",
      header: "Date",
      render: (tx) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(tx.created_at)}</span>,
    },
    {
      key: "company_name",
      header: "Company",
      render: (tx) => <span className="font-medium text-foreground">{tx.company_name ?? "—"}</span>,
    },
    {
      key: "type",
      header: "Type",
      render: (tx) => (
        <Badge variant={tx.type === "credit" ? "success" : "error"} dot className="capitalize">
          {tx.type}
        </Badge>
      ),
    },
    {
      key: "reference_type",
      header: "Reference",
      render: (tx) => <span className="text-secondary-foreground">{formatReferenceType(tx.reference_type)}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (tx) => {
        const isCredit = tx.type === "credit";
        return (
          <span className={cn("font-semibold tabular-nums", isCredit ? "text-success" : "text-error")}>
            {isCredit ? "+" : "−"}₹{formatCurrency(Math.abs(Number(tx.amount)))}
          </span>
        );
      },
    },
    {
      key: "balance_after",
      header: "Balance After",
      align: "right",
      render: (tx) => <span className="tabular-nums text-foreground">₹{formatCurrency(tx.balance_after)}</span>,
    },
    {
      key: "description",
      header: "Description",
      render: (tx) => (
        <span className="block max-w-xs truncate text-secondary-foreground" title={tx.description}>
          {tx.description}
        </span>
      ),
    },
  ];

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <PageContainer>
      <PageHeader title="Transaction History" description="Track all credit and debit activity in one place" />

      {/* Wallet balance */}
      <div className="mb-6 max-w-sm">
        <KpiCard
          label="Current Wallet Balance"
          value={
            balanceLoading ? (
              <Skeleton className="h-7 w-32 rounded-md" />
            ) : (
              `₹${walletBalance !== null ? formatCurrency(walletBalance) : "—"}`
            )
          }
          icon={<Wallet size={18} />}
        />
      </div>

      {/* Filter + count */}
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <SegmentedControl<FilterType>
          aria-label="Filter by type"
          value={filter}
          onChange={handleFilterChange}
          options={FILTERS.map((opt) => ({
            value: opt.value,
            label: opt.label,
            icon:
              opt.value === "all" ? undefined : (
                <span
                  className={cn("h-1.5 w-1.5 rounded-full", opt.value === "credit" ? "bg-success" : "bg-error")}
                  aria-hidden
                />
              ),
          }))}
        />
        {!loading && !error && pagination && (
          <p className="text-sm text-muted-foreground">
            {pagination.total} transaction{pagination.total !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {error && !loading ? (
        <Card padding="none">
          <EmptyState
            icon={<AlertTriangle size={20} />}
            title="Could not load transactions"
            description={error}
            action={
              <Button variant="secondary" leftIcon={<RefreshCw size={15} />} onClick={() => fetchTransactions(filter, page)}>
                Try again
              </Button>
            }
          />
        </Card>
      ) : (
        <Table
          columns={columns}
          data={safeTransactions}
          rowKey={(tx) => tx.id}
          loading={loading}
          emptyMessage={`No ${filter !== "all" ? filter : ""} transactions found`}
          emptyDescription={filter !== "all" ? 'Try switching the filter to "All"' : undefined}
        />
      )}

      {/* Pagination */}
      {!loading && !error && pagination && pagination.totalPages > 1 && (
        <PaginationControl
          className="mt-4"
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          showInfo
          onPageChange={setPage}
        />
      )}
    </PageContainer>
  );
}

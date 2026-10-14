"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Check,
  CheckCircle2,
  Download,
  Info,
  RefreshCw,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { PageContainer, PageHeader } from "@/components/layout";
import KpiCard from "@/components/admin/KpiCard";
import type { KpiTone } from "@/components/admin/KpiCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import Pagination from "@/components/ui/Pagination";
import Select from "@/components/ui/Select";
import Table from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import { cn } from "@/lib/utils";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type ActionType =
  | "LOGIN"
  | "SEND"
  | "UPDATE"
  | "ACTIVATE"
  | "CREATE"
  | "SUSPEND"
  | "SUBSCRIBE";
type SeverityType = "INFO" | "WARNING" | "CRITICAL" | "SUCCESS";
type TypeFilter =
  | "USER"
  | "AUTH"
  | "MESSAGE"
  | "SUBSCRIBE"
  | "CAMPAIGN"
  | "WALLET"
  | "CONTACT"
  | "CHATBOT"
  | "WABA";
type TimeFrame = "today" | "7days" | "30days" | "90days" | "1year";

interface LogEntry {
  id: number | string;
  action: string;
  userId: string;
  entityType: string;
  resource: string;
  detail: string;
  ip: string;
  time: string;
  date: string;
  severity: SeverityType;
  company: string;
  changes: Record<string, string>;
}

interface RawLog {
  id: number | string;
  action?: string;
  event?: string;
  user_id?: string;
  user?: string;
  actor?: string;
  actor_name?: string;
  role?: string;
  actor_role?: string;
  resource?: string;
  type?: string;
  entity_type?: string;
  entity_id?: string;
  description?: string;
  detail?: string;
  message?: string;
  ip?: string;
  ip_address?: string;
  created_at?: string;
  timestamp?: string;
  severity?: string;
  level?: string;
  status?: string;
  company?: string;
  company_name?: string;
  metadata?: Record<string, string>;
  changes?: Record<string, string>;
  new_data?: Record<string, string>;
  old_data?: Record<string, string>;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
}

// ─── LOOKUP MAPS (unchanged — same data, used for labels) ─────────────────────
const ACTION_META: Record<string, { icon: string; label: string }> = {
  CREATE: { icon: "✚", label: "Create" },
  UPDATE: { icon: "✎", label: "Update" },
  DELETE: { icon: "✕", label: "Delete" },
  LOGIN: { icon: "→", label: "Login" },
  SEND: { icon: "↗", label: "Send" },
  ACTIVATE: { icon: "✔", label: "Activate" },
  SUSPEND: { icon: "⊘", label: "Suspend" },
  SUBSCRIBE: { icon: "★", label: "Subscribe" },
  EXPORT: { icon: "↑", label: "Export" },
  CREDIT: { icon: "₹", label: "Credit" },
};


const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "USER", label: "User" },
  { value: "AUTH", label: "Auth" },
  { value: "MESSAGE", label: "Message" },
  { value: "SUBSCRIBE", label: "Subscribe" },
  { value: "CAMPAIGN", label: "Campaign" },
  { value: "WALLET", label: "Wallet" },
  { value: "CONTACT", label: "Contact" },
  { value: "CHATBOT", label: "Chatbot" },
  { value: "WABA", label: "WABA" },
];

const ACTION_OPTIONS: { value: ActionType; label: string }[] = [
  { value: "LOGIN", label: "Login" },
  { value: "SEND", label: "Send" },
  { value: "UPDATE", label: "Update" },
  { value: "ACTIVATE", label: "Activate" },
  { value: "CREATE", label: "Create" },
  { value: "SUSPEND", label: "Suspend" },
  { value: "SUBSCRIBE", label: "Subscribe" },
];

const TIME_FRAME_OPTIONS: { value: TimeFrame; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
  { value: "90days", label: "Last 90 Days" },
  { value: "1year", label: "Last 1 Year" },
];

// ─── HELPERS (unchanged) ───────────────────────────────────────────────────────
function normaliseSeverity(raw?: string): SeverityType {
  const map: Record<string, SeverityType> = {
    info: "INFO",
    warning: "WARNING",
    warn: "WARNING",
    critical: "CRITICAL",
    error: "CRITICAL",
    success: "SUCCESS",
    ok: "SUCCESS",
  };
  return map[raw?.toLowerCase() ?? ""] ?? "INFO";
}

function formatDate(raw?: string): string {
  if (!raw) return "—";
  try {
    return new Date(raw).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return raw;
  }
}

function timeAgo(raw?: string): string {
  if (!raw) return "—";
  try {
    const diff = Date.now() - new Date(raw).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } catch {
    return "—";
  }
}

// Shortens a UUID-style id for compact display,
function shortenId(id?: string): string {
  if (!id) return "—";
  if (id.length <= 14) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

function enrichLog(raw: RawLog): LogEntry {
  // The API uses "status" (SUCCESS/FAILED) for severity, and "action" for
  // the action type. Fall back to old field names too in case the shape
  // changes again.
  const action = (raw.action || raw.event || "").toUpperCase();
  return {
    id: raw.id,
    action,
    userId: raw.user_id || raw.actor || raw.user || "—",
    entityType: raw.entity_type || raw.type || raw.resource || "—",
    resource: raw.resource || raw.type || raw.entity_type || "—",
    detail: raw.description || raw.detail || raw.message || "—",
    ip: raw.ip || raw.ip_address || "—",
    time: timeAgo(raw.created_at || raw.timestamp),
    date: formatDate(raw.created_at || raw.timestamp),
    severity: normaliseSeverity(raw.severity || raw.level || raw.status),
    company: raw.company_name || raw.company || "—",
    changes: raw.metadata || raw.changes || raw.new_data || {},
  };
}

// severity -> the 4 visual buckets used by the stat cards / row icons
function severityBucket(
  s: SeverityType,
): "info" | "success" | "warning" | "error" {
  if (s === "CRITICAL") return "error";
  if (s === "WARNING") return "warning";
  if (s === "SUCCESS") return "success";
  return "info";
}

/// ─── ACTIVITY ICON (small wave/pulse glyph, colored by severity) ──────────────
type Bucket = "info" | "success" | "warning" | "error";

const BUCKET_TONE: Record<Bucket, string> = {
  info: "bg-info-bg text-info",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  error: "bg-error-bg text-error",
};

const BUCKET_TEXT: Record<Bucket, string> = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
};

function ActivityIcon({ bucket }: { bucket: Bucket }) {
  return (
    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", BUCKET_TONE[bucket])}>
      <Activity size={14} strokeWidth={2.2} />
    </div>
  );
}

// ─── CSV EXPORT (updated to match the new columns: User ID + Type instead of
// Actor/Actor Role, IP still included since it's still useful in the export) ──
function exportToCSV(logs: LogEntry[]) {
  const allChangeKeys = Array.from(
    new Set(logs.flatMap((l) => Object.keys(l.changes))),
  );
  const allHeaders = [
    "ID",
    "Date",
    "Action",
    "Severity",
    "User ID",
    "Type",
    "Company",
    "Detail",
    "IP Address",
    "Time",
    ...allChangeKeys,
  ];
  const escape = (val: string) => `"${String(val ?? "").replace(/"/g, '""')}"`;
  const rows = logs.map((l) =>
    [
      l.id,
      l.date,
      l.action,
      l.severity,
      l.userId,
      l.entityType,
      l.company,
      l.detail,
      l.ip,
      l.time,
      ...allChangeKeys.map((k) => l.changes[k] ?? ""),
    ]
      .map((v) => escape(String(v)))
      .join(","),
  );
  const csv = [allHeaders.map((h) => escape(h)).join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function AuditLogs() {

  const [typeFilter, setTypeFilter] = useState<TypeFilter | "ALL">("ALL");
  const [actionFilter, setActionFilter] = useState<ActionType | "ALL">("ALL");
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("7days");
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [clearing, setClearing] = useState(false);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);


  const [search, setSearch] = useState("");
  const [userSuggestions, setUserSuggestions] = useState<UserOption[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const [users,setUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);

  type Toast = {
    id: number;
    kind: "info" | "success" | "error" | "confirm";
    message: string;
    onConfirm?: () => void;
  };
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = (
    kind: Toast["kind"],
    message: string,
    onConfirm?: () => void,
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, kind, message, onConfirm }]);
    if (kind !== "confirm") {
      setTimeout(() => dismissToast(id), 3000);
    }
    return id;
  };
  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const LIMIT = 10;

  // ── Fetch activity logs ───────────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const params = new URLSearchParams();
      params.append("page", String(currentPage));
      params.append("limit", "25");

      if (typeFilter !== "ALL") params.append("type", typeFilter);
      if (actionFilter !== "ALL") params.append("action", actionFilter);
      if (selectedUserId) params.append("user_id", selectedUserId);

      const endpoint = `/v1/super-admin/activities?${params.toString()}`;
      const res = await axiosInstance.get(endpoint);

      const raw: RawLog[] = Array.isArray(res.data?.data?.data)
        ? res.data.data.data
        : Array.isArray(res.data?.data?.items)
        ? res.data.data.items
        : Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.logs)
        ? res.data.logs
        : [];

      const total =
        res.data?.data?.pagination?.total ??
        res.data?.data?.total ??
        res.data?.total ??
        raw.length;

      setLogs(raw.map(enrichLog));
      setTotalItems(Number(total) || 0);
    } catch (error) {
      console.error("AUDIT LOGS ERROR =>", error);
      setFetchError(
        error instanceof Error ? error.message : "Failed to load audit logs",
      );
      setLogs([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, timeFrame, typeFilter, actionFilter, selectedUserId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset to page 1 when filters change (unchanged)
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, actionFilter, timeFrame, search, selectedUserId]);

  // ── Client-side search filter — now also matches on user_id ────────────────
  const filtered = logs.filter((l) => {
    if (selectedUserId) return true; // already filtered server-side by user_id — don't re-filter by email text
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.userId.toLowerCase().includes(q) ||
      l.detail.toLowerCase().includes(q) ||
      l.entityType.toLowerCase().includes(q) ||
      l.company.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(totalItems / LIMIT));

  // ── Export (unchanged behavior) ─────────────────────────────────────────────
  const handleExportCSV = () => {
    setExporting(true);
    setTimeout(() => {
      exportToCSV(filtered);
      setExporting(false);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 2500);
    }, 400);
  };

  // ── Clear logs — confirmation now happens via a toast with buttons,
  // not window.confirm. ──────────────────────────────────────────────────────
  const handleClearLogs = () => {
    pushToast(
      "confirm",
      "This will permanently delete all audit log entries. This action cannot be undone.",
      async () => {
        setClearing(true);
        try {
          await axiosInstance.delete("/v1/super-admin/activities");
          await fetchLogs();
          pushToast("success", "All audit logs were cleared.");
        } catch (e) {
          console.error("CLEAR LOGS ERROR =>", e);
          const msg = e instanceof Error ? e.message : "Failed to clear logs";
          setFetchError(msg);
          pushToast("error", msg);
        } finally {
          setClearing(false);
        }
      },
    );
  };

  // ── Stat counts (by severity bucket, matches reference cards) ──────────────
  const infoCount = logs.filter(
    (l) => severityBucket(l.severity) === "info",
  ).length;
  const successCount = logs.filter(
    (l) => severityBucket(l.severity) === "success",
  ).length;
  const warningCount = logs.filter(
    (l) => severityBucket(l.severity) === "warning",
  ).length;
  const errorCount = logs.filter(
    (l) => severityBucket(l.severity) === "error",
  ).length;
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosInstance.get("/v1/super-admin/users", {
          params: {
            page: 1,
            limit: 25,
          },
        });

        const raw =
          (Array.isArray(res.data?.data?.data) ? res.data.data.data : null) ||
          (Array.isArray(res.data?.data?.items) ? res.data.data.items : null) ||
          (Array.isArray(res.data?.data?.users) ? res.data.data.users : null) ||
          (Array.isArray(res.data?.data) ? res.data.data : null) ||
          [];

        setUsers(
          raw.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
          })),
        );
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };

    fetchUsers();
  }, []);
  useEffect(() => {
    if (selectedUser || search.trim().length < 2) {
      setUserSuggestions([]);
      return;
    }
    const handle = setTimeout(async () => {
      setSuggestLoading(true);
      try {
        const res = await axiosInstance.get("/v1/super-admin/users", {
          params: { search, limit: 8 },
        });
        const raw = Array.isArray(res.data?.data?.data)
          ? res.data.data.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
        setUserSuggestions(
          raw.map((u: any) => ({ id: u.id, name: u.name, email: u.email })),
        );
        setShowSuggestions(true);
      } catch (e) {
        console.error("USER SEARCH ERROR =>", e);
        setUserSuggestions([]);
      } finally {
        setSuggestLoading(false);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [search, selectedUser]);

  // Close suggestion dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        searchWrapRef.current &&
        !searchWrapRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const columns: Column<LogEntry>[] = [
    {
      key: "activity",
      header: "Activity",
      render: (log) => {
        const m = ACTION_META[log.action] ?? { icon: "•", label: log.action };
        const bucket = severityBucket(log.severity);
        return (
          <div className="flex min-w-[16rem] items-start gap-3">
            <ActivityIcon bucket={bucket} />
            <div className="min-w-0">
              <p className={cn("text-xs font-semibold uppercase tracking-wide", BUCKET_TEXT[bucket])}>
                {m.label.toUpperCase()}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[0.8125rem] text-secondary-foreground">{log.detail}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "userId",
      header: "User ID",
      render: (log) => (
        <span className="font-mono text-xs text-muted-foreground" title={log.userId}>
          {shortenId(log.userId)}
        </span>
      ),
    },
    {
      key: "entityType",
      header: "Type",
      render: (log) => <Badge>{log.entityType}</Badge>,
    },
    {
      key: "action",
      header: "Action",
      render: (log) => <span className="text-secondary-foreground">{log.action || "—"}</span>,
    },
    {
      key: "time",
      header: "Time",
      render: (log) => (
        <span className="whitespace-nowrap text-muted-foreground" title={log.date}>
          {log.time}
        </span>
      ),
    },
  ];

  const statCards: { label: string; value: number; icon: ReactNode; tone: KpiTone }[] = [
    { label: "Info", value: infoCount, icon: <Info size={18} />, tone: "info" },
    { label: "Success", value: successCount, icon: <CheckCircle2 size={18} />, tone: "success" },
    { label: "Warnings", value: warningCount, icon: <AlertTriangle size={18} />, tone: "warning" },
    { label: "Errors", value: errorCount, icon: <XCircle size={18} />, tone: "error" },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Activity Logs"
        description="Monitor all system activities and user actions"
        actions={
          <>
            <Button
              variant="secondary"
              onClick={handleExportCSV}
              disabled={exporting || filtered.length === 0}
              isLoading={exporting}
              leftIcon={exportDone ? <Check size={15} /> : <Download size={15} />}
            >
              {exportDone ? "Downloaded" : "Export"}
            </Button>
            <Button
              variant="danger"
              onClick={handleClearLogs}
              disabled={clearing || logs.length === 0}
              isLoading={clearing}
              leftIcon={<Trash2 size={15} />}
            >
              Clear Logs
            </Button>
          </>
        }
      />

      {/* STAT CARDS — by severity (Info / Success / Warnings / Errors) */}
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {statCards.map((s) => (
          <KpiCard key={s.label} label={s.label} value={s.value} icon={s.icon} tone={s.tone} />
        ))}
      </div>

      {/* FILTER BAR */}
      <Card padding="sm" className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-[1_1_16rem]" ref={searchWrapRef}>
            <Input
              leftIcon={<Search size={15} />}
              rightIcon={
                selectedUser ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(null);
                      setSelectedUserId("");
                      setSearch("");
                    }}
                    className="pointer-events-auto flex items-center text-muted-foreground hover:text-foreground"
                    aria-label="Clear user filter"
                    title={`Filtering by ${selectedUser.email}`}
                  >
                    <X size={15} />
                  </button>
                ) : undefined
              }
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (selectedUser) {
                  setSelectedUser(null);
                  setSelectedUserId("");
                }
              }}
              onFocus={() => userSuggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search activities, or type an email to filter by user…"
              autoComplete="off"
              aria-label="Search activities"
            />

            {showSuggestions && !selectedUser && (
              <div className="absolute inset-x-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-popover py-1 shadow-lg">
                {suggestLoading ? (
                  <p className="px-3 py-2 text-[0.8125rem] text-muted-foreground">Searching users…</p>
                ) : userSuggestions.length === 0 ? (
                  <p className="px-3 py-2 text-[0.8125rem] text-muted-foreground">No matching users</p>
                ) : (
                  userSuggestions.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSelectedUser(u);
                        setSelectedUserId(u.id);
                        setSearch(u.email);
                        setUserSuggestions([]);
                        setShowSuggestions(false);
                      }}
                      className="block w-full px-3 py-2 text-left text-[0.8125rem] hover:bg-surface-hover"
                    >
                      <span className="block font-semibold text-foreground">{u.name}</span>
                      <span className="block text-muted-foreground">{u.email}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              aria-label="Filter by user"
              wrapperClassName="w-52"
              value={selectedUserId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedUserId(id);
                if (id === "") {
                  setSelectedUser(null);
                  setSearch("");
                } else {
                  const u = users.find((usr) => usr.id === id) || null;
                  setSelectedUser(u);
                  setSearch(u?.email || "");
                }
              }}
              options={[
                { value: "", label: "All Users" },
                ...users.map((user) => ({ value: user.id, label: `${user.name} (${user.email})` })),
              ]}
            />
            <Select
              aria-label="Filter by type"
              wrapperClassName="w-36"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter | "ALL")}
              options={[{ value: "ALL", label: "All Types" }, ...TYPE_OPTIONS]}
            />
            <Select
              aria-label="Filter by action"
              wrapperClassName="xl:w-36"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as ActionType | "ALL")}
              options={[{ value: "ALL", label: "All Actions" }, ...ACTION_OPTIONS]}
            />
            <Select
              aria-label="Time frame"
              wrapperClassName="xl:w-40"
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
              options={TIME_FRAME_OPTIONS}
            />
          </div>
        </div>
      </Card>

      {/* TABLE — ACTIVITY · USER ID · TYPE · ACTION · TIME */}
      {fetchError && !loading ? (
        <Card padding="none">
          <EmptyState
            icon={<AlertTriangle size={20} />}
            title="Failed to load logs"
            description={fetchError}
            action={
              <Button variant="secondary" leftIcon={<RefreshCw size={15} />} onClick={fetchLogs}>
                Retry
              </Button>
            }
          />
        </Card>
      ) : (
        <Table
          columns={columns}
          data={filtered}
          rowKey={(log) => String(log.id)}
          loading={loading}
          emptyMessage="No activity found"
          emptyDescription="Try adjusting your search or filters."
        />
      )}

      {/* PAGINATION */}
      {!loading && !fetchError && totalPages > 1 && (
        <Pagination
          className="mt-4"
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={LIMIT}
          showInfo
          onPageChange={setCurrentPage}
        />
      )}

      {/* TOASTS — "confirm" toasts show Confirm/Cancel inline; others auto-dismiss after 3s. */}
      <div className="fixed bottom-4 right-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" || t.kind === "confirm" ? "alert" : "status"}
            className={cn(
              "flex items-start gap-3 rounded-xl border bg-popover p-3 text-[0.8125rem] text-foreground shadow-lg",
              t.kind === "success" && "border-success-border",
              t.kind === "error" && "border-error-border",
              t.kind === "confirm" && "border-warning-border",
              t.kind === "info" && "border-border",
            )}
          >
            <span className="flex-1">{t.message}</span>
            {t.kind === "confirm" ? (
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    t.onConfirm?.();
                    dismissToast(t.id);
                  }}
                >
                  Confirm
                </Button>
                <Button size="sm" variant="secondary" onClick={() => dismissToast(t.id)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <IconButton size="sm" aria-label="Dismiss" icon={<X size={14} />} onClick={() => dismissToast(t.id)} />
            )}
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

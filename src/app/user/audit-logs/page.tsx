"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import "./audit-logs.css";
import { axiosInstance } from "@/lib/axiosInstance";
import Spinner from "@/components/ui/Spinner";
import {
  Download,
  Trash2,
  Check,
  Search,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  RotateCw,
  Activity,
  Plus,
  Pencil,
  LogIn,
  Send,
  CheckCircle,
  Ban,
  Sparkles,
  CreditCard,
  FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

interface ActionMeta {
  icon: LucideIcon;
  label: string;
}

// ─── LOOKUP MAPS (with Lucide icons) ──────────────────────────────────────────
const ACTION_META: Record<string, ActionMeta> = {
  CREATE: { icon: Plus, label: "Create" },
  UPDATE: { icon: Pencil, label: "Update" },
  DELETE: { icon: Trash2, label: "Delete" },
  LOGIN: { icon: LogIn, label: "Login" },
  SEND: { icon: Send, label: "Send" },
  ACTIVATE: { icon: CheckCircle, label: "Activate" },
  SUSPEND: { icon: Ban, label: "Suspend" },
  SUBSCRIBE: { icon: Sparkles, label: "Subscribe" },
  EXPORT: { icon: Download, label: "Export" },
  CREDIT: { icon: CreditCard, label: "Credit" },
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

// ─── HELPERS ──────────────────────────────────────────────────────────────────
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

// Shortens a UUID-style id for compact display
function shortenId(id?: string): string {
  if (!id) return "—";
  if (id.length <= 14) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

function enrichLog(raw: RawLog): LogEntry {
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

// ─── ACTIVITY BUCKET (Colors action & icon strictly by activity type) ────────
function getActivityBucket(
  action?: string,
  severity?: SeverityType,
): "info" | "success" | "warning" | "error" {
  const act = (action || "").toUpperCase().trim();

  // If backend explicitly marked CRITICAL error
  if (severity === "CRITICAL") return "error";

  // 1. Red / Danger actions (DELETE, REMOVE, SUSPEND, BAN, BLOCK, REVOKE, FAIL)
  if (
    act.includes("DELETE") ||
    act.includes("REMOVE") ||
    act.includes("SUSPEND") ||
    act.includes("BAN") ||
    act.includes("BLOCK") ||
    act.includes("REVOKE") ||
    act.includes("FAIL") ||
    act.includes("DROP") ||
    act.includes("TERMINAT")
  ) {
    return "error";
  }

  // 2. Green / Success actions (CREATE, ADD, ACTIVATE, REGISTER, INSERT, VERIFY)
  if (
    act.includes("CREATE") ||
    act.includes("ACTIVATE") ||
    act.includes("ADD") ||
    act.includes("REGISTER") ||
    act.includes("INSERT") ||
    act.includes("ENABLE") ||
    act.includes("VERIF")
  ) {
    return "success";
  }

  // 3. Amber / Warning actions (UPDATE, EDIT, MODIFY, CHANGE, PATCH, RESET)
  if (
    act.includes("UPDATE") ||
    act.includes("EDIT") ||
    act.includes("MODIFY") ||
    act.includes("CHANGE") ||
    act.includes("PATCH") ||
    act.includes("RESET")
  ) {
    return "warning";
  }

  // 4. Blue / Info actions (LOGIN, LOGOUT, AUTH, SEND, EXPORT, DOWNLOAD, SUBSCRIBE, CREDIT, VIEW)
  if (
    act.includes("LOGIN") ||
    act.includes("LOGOUT") ||
    act.includes("AUTH") ||
    act.includes("SEND") ||
    act.includes("EXPORT") ||
    act.includes("DOWNLOAD") ||
    act.includes("SUBSCRIBE") ||
    act.includes("CREDIT") ||
    act.includes("VIEW")
  ) {
    return "info";
  }

  // 5. Fallback based on severity if provided, else "info"
  if (severity) {
    return severityBucket(severity);
  }
  return "info";
}

function getActionMeta(action?: string): ActionMeta {
  const act = (action || "").toUpperCase().trim();
  if (ACTION_META[act]) return ACTION_META[act];
  if (act.includes("DELETE") || act.includes("REMOVE")) return { icon: Trash2, label: action || "Delete" };
  if (act.includes("CREATE") || act.includes("ADD")) return { icon: Plus, label: action || "Create" };
  if (act.includes("UPDATE") || act.includes("EDIT") || act.includes("PATCH")) return { icon: Pencil, label: action || "Update" };
  if (act.includes("SUSPEND") || act.includes("BAN") || act.includes("BLOCK")) return { icon: Ban, label: action || "Suspend" };
  if (act.includes("ACTIVATE") || act.includes("ENABLE")) return { icon: CheckCircle, label: action || "Activate" };
  if (act.includes("LOGIN") || act.includes("AUTH")) return { icon: LogIn, label: action || "Login" };
  if (act.includes("SEND")) return { icon: Send, label: action || "Send" };
  if (act.includes("EXPORT") || act.includes("DOWNLOAD")) return { icon: Download, label: action || "Export" };
  if (act.includes("CREDIT") || act.includes("PAY")) return { icon: CreditCard, label: action || "Credit" };
  return { icon: Activity, label: action || "Activity" };
}

// ─── ACTION ICON COMPONENT (Lucide Icon colored by activity) ──────────────────
function ActionIcon({
  action,
  bucket,
}: {
  action: string;
  bucket: "info" | "success" | "warning" | "error";
}) {
  const meta = getActionMeta(action);
  const IconComponent = meta.icon;
  return (
    <div className={`al-log-row__icon al-log-row__icon--${bucket}`}>
      <IconComponent size={14} strokeWidth={2.2} />
    </div>
  );
}

// ─── CSV EXPORT ───────────────────────────────────────────────────────────────
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
  const [users, setUsers] = useState<UserOption[]>([]);
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, actionFilter, timeFrame, search, selectedUserId]);

  // ── Client-side search filter ─────────────────────────────────────────────
  const filtered = logs.filter((l) => {
    if (selectedUserId) return true;
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

  // ── Export CSV ────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    setExporting(true);
    setTimeout(() => {
      exportToCSV(filtered);
      setExporting(false);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 2500);
    }, 400);
  };

  // ── Clear logs ────────────────────────────────────────────────────────────
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

  // ── Stat counts ───────────────────────────────────────────────────────────
  const infoCount = logs.filter(
    (l) => getActivityBucket(l.action, l.severity) === "info",
  ).length;
  const successCount = logs.filter(
    (l) => getActivityBucket(l.action, l.severity) === "success",
  ).length;
  const warningCount = logs.filter(
    (l) => getActivityBucket(l.action, l.severity) === "warning",
  ).length;
  const errorCount = logs.filter(
    (l) => getActivityBucket(l.action, l.severity) === "error",
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

  return (
    <div className="al-root">
      {/* HEADER */}
      <div className="al-header">
        <div>
          <h1 className="al-header__title">Activity Logs</h1>
          <p className="al-header__sub">
            Monitor all system activities and user actions
          </p>
        </div>
        <div className="al-header__right">
          <button
            onClick={handleExportCSV}
            disabled={exporting || filtered.length === 0}
            className={`al-btn-export ${
              exportDone ? "al-btn-export--done" : ""
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
          <button
            onClick={handleClearLogs}
            disabled={clearing || logs.length === 0}
            className="al-btn-clear"
          >
            {clearing ? (
              <Spinner size="sm" text="Clearing…" />
            ) : (
              <>
                <Trash2 size={14} />
                <span>Clear Logs</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* STAT CARDS — Lucide Icons & consistent Dashboard tokens */}
      <div className="al-stat-grid">
        <div className="al-stat">
          <div className="al-stat__icon al-stat__icon--info">
            <Info size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="al-stat__value">{infoCount}</div>
            <div className="al-stat__label">Info</div>
          </div>
        </div>
        <div className="al-stat">
          <div className="al-stat__icon al-stat__icon--success">
            <CheckCircle2 size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="al-stat__value">{successCount}</div>
            <div className="al-stat__label">Success</div>
          </div>
        </div>
        <div className="al-stat">
          <div className="al-stat__icon al-stat__icon--warning">
            <AlertTriangle size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="al-stat__value">{warningCount}</div>
            <div className="al-stat__label">Warnings</div>
          </div>
        </div>
        <div className="al-stat">
          <div className="al-stat__icon al-stat__icon--error">
            <AlertCircle size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="al-stat__value">{errorCount}</div>
            <div className="al-stat__label">Errors</div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="al-filter-bar">
        <div
          className="al-search-wrap"
          ref={searchWrapRef}
        >
          <Search size={15} className="al-search-icon" />
          <input
            className="al-search-input"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (selectedUser) {
                setSelectedUser(null);
                setSelectedUserId("");
              }
            }}
            onFocus={() =>
              userSuggestions.length > 0 && setShowSuggestions(true)
            }
            placeholder="Search activities, or type an email to filter by user…"
            autoComplete="off"
          />
          {selectedUser && (
            <button
              type="button"
              onClick={() => {
                setSelectedUser(null);
                setSelectedUserId("");
                setSearch("");
              }}
              className="al-search-clear-btn"
              aria-label="Clear user filter"
              title={`Filtering by ${selectedUser.email}`}
            >
              <X size={14} />
            </button>
          )}

          {showSuggestions && !selectedUser && (
            <div className="al-search-suggestions">
              {suggestLoading ? (
                <div style={{ padding: "10px 14px", fontSize: 13, color: "var(--al-muted)" }}>
                  Searching users…
                </div>
              ) : userSuggestions.length === 0 ? (
                <div style={{ padding: "10px 14px", fontSize: 13, color: "var(--al-muted)" }}>
                  No matching users
                </div>
              ) : (
                userSuggestions.map((u) => (
                  <div
                    key={u.id}
                    className="al-search-suggestion-item"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelectedUser(u);
                      setSelectedUserId(u.id);
                      setSearch(u.email);
                      setUserSuggestions([]);
                      setShowSuggestions(false);
                    }}
                  >
                    <div style={{ fontWeight: 600, color: "var(--al-title)" }}>{u.name}</div>
                    <div style={{ color: "var(--al-muted)", fontSize: 12 }}>{u.email}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="al-dropdown-inner">
          <select
            className="al-dropdown"
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
          >
            <option value="">All Users</option>
            {users.map((user) => {
              const fullName = user.name || "";
              const email = user.email || "";
              const label = fullName ? `${fullName} (${email})` : email;
              const display =
                label.length > 38 ? `${label.slice(0, 36)}…` : label;
              return (
                <option key={user.id} value={user.id} title={label}>
                  {display}
                </option>
              );
            })}
          </select>
          <ChevronDown size={14} className="al-dropdown-arrow" />
        </div>

        <div className="al-dropdowns-group">
          <div className="al-dropdown-inner">
            <select
              className="al-dropdown"
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as TypeFilter | "ALL")
              }
            >
              <option value="ALL">All Types</option>
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="al-dropdown-arrow" />
          </div>

          <div className="al-dropdown-inner">
            <select
              className="al-dropdown"
              value={actionFilter}
              onChange={(e) =>
                setActionFilter(e.target.value as ActionType | "ALL")
              }
            >
              <option value="ALL">All Actions</option>
              {ACTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="al-dropdown-arrow" />
          </div>

          <div className="al-dropdown-inner">
            <select
              className="al-dropdown"
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
            >
              {TIME_FRAME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="al-dropdown-arrow" />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="al-table">
        <div className="al-table__head">
          <div className="al-table__head-cell" />
          <div className="al-table__head-cell">ACTIVITY</div>
          <div className="al-table__head-cell">USER ID</div>
          <div className="al-table__head-cell">TYPE</div>
          <div className="al-table__head-cell">ACTION</div>
          <div className="al-table__head-cell">TIME</div>
        </div>

        {loading ? (
          <div className="al-empty">
            <Spinner variant="center" size="lg" color="primary" text="Loading activity logs…" />
          </div>
        ) : fetchError ? (
          <div className="al-empty">
            <div className="al-empty__icon al-empty__icon--error">
              <AlertCircle size={36} />
            </div>
            <div className="al-empty__title">Failed to load logs</div>
            <div className="al-empty__desc">{fetchError}</div>
            <button onClick={fetchLogs} className="al-empty__retry">
              <RotateCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="al-empty">
            <div className="al-empty__icon">
              <FileText size={36} />
            </div>
            <div className="al-empty__title">No activity found</div>
            <div className="al-empty__desc">
              Try adjusting your search or filters.
            </div>
          </div>
        ) : (
          filtered.map((log) => {
            const m = getActionMeta(log.action);
            const bucket = getActivityBucket(log.action, log.severity);

            return (
              <div key={log.id} className="al-log-row">
                <div className="al-log-row__main">
                  <ActionIcon action={log.action} bucket={bucket} />

                  <div className="al-log-row__activity">
                    <div
                      className={`al-log-row__name al-log-row__name--${bucket}`}
                    >
                      {m.label.toUpperCase()}
                    </div>
                    <div className="al-log-row__detail">{log.detail}</div>
                  </div>

                  <div className="al-log-row__user-col">
                    <div className="al-log-row__user" title={log.userId}>
                      {shortenId(log.userId)}
                    </div>
                  </div>

                  <div className="al-log-row__ip">{log.entityType}</div>

                  <div className="al-log-row__ip">{log.action || "—"}</div>

                  <div className="al-log-row__time-col">
                    <div className="al-log-row__time-rel">{log.time}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PAGINATION */}
      {!loading && !fetchError && totalPages > 1 && (
        <div className="al-pagination">
          <div className="al-pagination__info">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>{" "}
            · {totalItems} total events
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="al-pagination__btn"
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="al-pagination__btn"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* TOASTS */}
      <div className="al-toast-stack">
        {toasts.map((t) => {
          const ToastIcon =
            t.kind === "success"
              ? CheckCircle2
              : t.kind === "error"
              ? AlertCircle
              : t.kind === "confirm"
              ? AlertTriangle
              : Info;
          return (
            <div key={t.id} className={`al-toast al-toast--${t.kind}`}>
              <div className="al-toast__left">
                <ToastIcon size={16} className={`al-toast__icon--${t.kind}`} />
                <span className="al-toast__msg">{t.message}</span>
              </div>
              {t.kind === "confirm" ? (
                <div className="al-toast__actions">
                  <button
                    className="al-toast__btn al-toast__btn--confirm"
                    onClick={() => {
                      t.onConfirm?.();
                      dismissToast(t.id);
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    className="al-toast__btn al-toast__btn--cancel"
                    onClick={() => dismissToast(t.id)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="al-toast__close"
                  onClick={() => dismissToast(t.id)}
                  aria-label="Dismiss toast"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import "./audit-logs.css";
import { axiosInstance } from "@/lib/axiosInstance";
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

// ─── ACTIVITY ICON (small wave/pulse glyph, colored by severity) ──────────────
function ActivityIcon({
  bucket,
}: {
  bucket: "info" | "success" | "warning" | "error";
}) {
  return (
    <div className={`al-log-row__icon al-log-row__icon--${bucket}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 12h4l2 7 4-14 2 7h6"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
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
      params.append("role", "user");
      params.append("page", String(currentPage));
      params.append("limit", String(LIMIT));
      params.append("time_frame", timeFrame);

      if (typeFilter !== "ALL") params.append("type", typeFilter);
      if (actionFilter !== "ALL") params.append("action", actionFilter);
      if (selectedUserId) params.append("user_id", selectedUserId);

      const endpoint = `/v1/admin/activity?${params.toString()}`;
      const res = await axiosInstance.get(endpoint);

      const raw: RawLog[] = Array.isArray(res.data?.data?.data)
        ? res.data.data.data
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
          await axiosInstance.delete("/v1/admin/activity");
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
      const res = await axiosInstance.get("/v1/admin/companies/user", {
        params: {
          role: "user",
          page: 1,
          limit: 10,
          status: "all",
        },
      });

      const raw = res.data?.data?.data || [];

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
      const res = await axiosInstance.get("/v1/admin/companies/user", {
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
              <>
                <span className="al-btn-spinner" /> Exporting…
              </>
            ) : exportDone ? (
              <>✓ Downloaded</>
            ) : (
              <>⬇ Export</>
            )}
          </button>
          <button
            onClick={handleClearLogs}
            disabled={clearing || logs.length === 0}
            className="al-btn-clear"
          >
            {clearing ? (
              <>
                <span className="al-btn-spinner" /> Clearing…
              </>
            ) : (
              <>🗑 Clear Logs</>
            )}
          </button>
        </div>
      </div>

      {/* STAT CARDS — by severity, matches reference (Info / Success / Warnings / Errors) */}
      <div className="al-stat-grid">
        <div className="al-stat">
          <div className="al-stat__icon al-stat__icon--info">ⓘ</div>
          <div>
            <div className="al-stat__value">{infoCount}</div>
            <div className="al-stat__label">Info</div>
          </div>
        </div>
        <div className="al-stat">
          <div className="al-stat__icon al-stat__icon--success">✓</div>
          <div>
            <div className="al-stat__value">{successCount}</div>
            <div className="al-stat__label">Success</div>
          </div>
        </div>
        <div className="al-stat">
          <div className="al-stat__icon al-stat__icon--warning">⚠</div>
          <div>
            <div className="al-stat__value">{warningCount}</div>
            <div className="al-stat__label">Warnings</div>
          </div>
        </div>
        <div className="al-stat">
          <div className="al-stat__icon al-stat__icon--error">✕</div>
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
          style={{ position: "relative" }}
        >
          <span className="al-search-icon">🔍</span>
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
              style={{ background: "none", border: "none", cursor: "pointer" }}
              aria-label="Clear user filter"
              title={`Filtering by ${selectedUser.email}`}
            >
              ✕
            </button>
          )}

          {showSuggestions && !selectedUser && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 30,
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                marginTop: 4,
                maxHeight: 240,
                overflowY: "auto",
                boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
              }}
            >
              {suggestLoading ? (
                <div style={{ padding: 10, fontSize: 13, color: "#6b7280" }}>
                  Searching users…
                </div>
              ) : userSuggestions.length === 0 ? (
                <div style={{ padding: 10, fontSize: 13, color: "#6b7280" }}>
                  No matching users
                </div>
              ) : (
                userSuggestions.map((u) => (
                  <div
                    key={u.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelectedUser(u);
                      setSelectedUserId(u.id);
                      setSearch(u.email);
                      setUserSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    style={{
                      padding: "8px 10px",
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div style={{ color: "#6b7280" }}>{u.email}</div>
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
              if(id===""){
                setSelectedUser(null);
                setSearch("");
              }else{
                const u= users.find((usr) => usr.id === id)|| null;
                setSelectedUser(u);
                setSearch(u?.email || "");
              }
            }}
          >
            <option value="">All Users</option>

            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>

          <span className="al-dropdown-arrow">▾</span>
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
            <span className="al-dropdown-arrow">▾</span>
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
            <span className="al-dropdown-arrow">▾</span>
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
            <span className="al-dropdown-arrow">▾</span>
          </div>
        </div>
      </div>

      {/* TABLE — columns are now: ACTIVITY · USER ID · TYPE · ACTION · TIME
        to match. */}
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
            <div className="al-empty__icon">⏳</div>
            <div className="al-empty__title">Loading activity logs…</div>
          </div>
        ) : fetchError ? (
          <div className="al-empty">
            <div className="al-empty__icon">⚠️</div>
            <div className="al-empty__title">Failed to load logs</div>
            <div className="al-empty__desc">{fetchError}</div>
            <button onClick={fetchLogs} className="al-empty__retry">
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="al-empty">
            <div className="al-empty__icon">🔍</div>
            <div className="al-empty__title">No activity found</div>
            <div className="al-empty__desc">
              Try adjusting your search or filters.
            </div>
          </div>
        ) : (
          filtered.map((log) => {
            const m = ACTION_META[log.action] ?? {
              icon: "•",
              label: log.action,
            };
            const bucket = severityBucket(log.severity);

            return (
              <div key={log.id} className="al-log-row">
                <div className="al-log-row__main">
                  <ActivityIcon bucket={bucket} />

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

      {/* PAGINATION (unchanged behavior, restyled) */}
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
              ‹ Prev
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="al-pagination__btn"
            >
              Next ›
            </button>
          </div>
        </div>
      )}

      {/* TOASTS — replaces window.confirm/alert. "confirm" toasts show
          Confirm/Cancel buttons inline; others auto-dismiss after 3s. */}
      <div className="al-toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`al-toast al-toast--${t.kind}`}>
            <span className="al-toast__msg">{t.message}</span>
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
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

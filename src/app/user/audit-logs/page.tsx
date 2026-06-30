"use client";

import { useState, useEffect, useCallback } from "react";
import "./audit-logs.css";
import { axiosInstance } from "@/lib/axiosInstance";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type ActionType   = "LOGIN" | "SEND" | "UPDATE" | "ACTIVATE" | "CREATE" | "SUSPEND" | "SUBSCRIBE";
type SeverityType = "INFO" | "WARNING" | "CRITICAL" | "SUCCESS";
type TypeFilter   = "USER" | "AUTH" | "MESSAGE" | "SUBSCRIBE" | "CAMPAIGN" | "WALLET" | "CONTACT" | "CHATBOT";
type TimeFrame    = "today" | "7days" | "30days" | "90days" | "1year";

interface LogEntry {
  id:        number | string;
  action:    string;
  actor:     string;
  actorRole: string;
  resource:  string;
  detail:    string;
  ip:        string;
  time:      string;
  date:      string;
  severity:  SeverityType;
  company:   string;
  changes:   Record<string, string>;
}

interface RawLog {
  id:           number | string;
  action?:      string;
  event?:       string;
  user?:        string;
  actor?:       string;
  actor_name?:  string;
  role?:        string;
  actor_role?:  string;
  resource?:    string;
  type?:        string;
  description?: string;
  detail?:      string;
  message?:     string;
  ip?:          string;
  ip_address?:  string;
  created_at?:  string;
  timestamp?:   string;
  severity?:    string;
  level?:       string;
  company?:     string;
  company_name?:string;
  metadata?:    Record<string, string>;
  changes?:     Record<string, string>;
}

// ─── LOOKUP MAPS (unchanged — same data, used for labels) ─────────────────────
const ACTION_META: Record<string, { icon: string; label: string }> = {
  CREATE:    { icon: "✚", label: "Create"    },
  UPDATE:    { icon: "✎", label: "Update"    },
  DELETE:    { icon: "✕", label: "Delete"    },
  LOGIN:     { icon: "→", label: "Login"     },
  SEND:      { icon: "↗", label: "Send"      },
  ACTIVATE:  { icon: "✔", label: "Activate"  },
  SUSPEND:   { icon: "⊘", label: "Suspend"   },
  SUBSCRIBE: { icon: "★", label: "Subscribe" },
  EXPORT:    { icon: "↑", label: "Export"    },
  CREDIT:    { icon: "₹", label: "Credit"    },
};

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "USER",      label: "User"      },
  { value: "AUTH",      label: "Auth"      },
  { value: "MESSAGE",   label: "Message"   },
  { value: "SUBSCRIBE", label: "Subscribe" },
  { value: "CAMPAIGN",  label: "Campaign"  },
  { value: "WALLET",    label: "Wallet"    },
  { value: "CONTACT",   label: "Contact"   },
  { value: "CHATBOT",   label: "Chatbot"   },
];

const ACTION_OPTIONS: { value: ActionType; label: string }[] = [
  { value: "LOGIN",     label: "Login"     },
  { value: "SEND",      label: "Send"      },
  { value: "UPDATE",    label: "Update"    },
  { value: "ACTIVATE",  label: "Activate"  },
  { value: "CREATE",    label: "Create"    },
  { value: "SUSPEND",   label: "Suspend"   },
  { value: "SUBSCRIBE", label: "Subscribe" },
];

const TIME_FRAME_OPTIONS: { value: TimeFrame; label: string }[] = [
  { value: "today",  label: "Today"        },
  { value: "7days",  label: "Last 7 Days"  },
  { value: "30days", label: "Last 30 Days" },
  { value: "90days", label: "Last 90 Days" },
  { value: "1year",  label: "Last 1 Year"  },
];

// ─── HELPERS (unchanged) ───────────────────────────────────────────────────────
function normaliseSeverity(raw?: string): SeverityType {
  const map: Record<string, SeverityType> = {
    info: "INFO", warning: "WARNING", warn: "WARNING",
    critical: "CRITICAL", error: "CRITICAL",
    success: "SUCCESS", ok: "SUCCESS",
  };
  return map[raw?.toLowerCase() ?? ""] ?? "INFO";
}

function formatDate(raw?: string): string {
  if (!raw) return "—";
  try {
    return new Date(raw).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return raw;
  }
}

function timeAgo(raw?: string): string {
  if (!raw) return "—";
  try {
    const diff = Date.now() - new Date(raw).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    if (mins  < 1)  return "just now";
    if (mins  < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } catch {
    return "—";
  }
}

function enrichLog(raw: RawLog): LogEntry {
  const action = (raw.action || raw.event || "").toUpperCase();
  return {
    id:        raw.id,
    action,
    actor:     raw.actor_name || raw.actor || raw.user || "Unknown",
    actorRole: raw.actor_role || raw.role || "User",
    resource:  raw.resource || raw.type || "—",
    detail:    raw.description || raw.detail || raw.message || "—",
    ip:        raw.ip || raw.ip_address || "—",
    time:      timeAgo(raw.created_at || raw.timestamp),
    date:      formatDate(raw.created_at || raw.timestamp),
    severity:  normaliseSeverity(raw.severity || raw.level),
    company:   raw.company_name || raw.company || "—",
    changes:   raw.metadata || raw.changes || {},
  };
}

// severity -> the 4 visual buckets used by the stat cards / row icons
function severityBucket(s: SeverityType): "info" | "success" | "warning" | "error" {
  if (s === "CRITICAL") return "error";
  if (s === "WARNING")  return "warning";
  if (s === "SUCCESS")  return "success";
  return "info";
}

// ─── ACTIVITY ICON (small wave/pulse glyph, colored by severity) ──────────────
function ActivityIcon({ bucket }: { bucket: "info" | "success" | "warning" | "error" }) {
  return (
    <div className={`al-log-row__icon al-log-row__icon--${bucket}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M3 12h4l2 7 4-14 2 7h6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ─── CSV EXPORT (unchanged) ────────────────────────────────────────────────────
function exportToCSV(logs: LogEntry[]) {
  const allChangeKeys = Array.from(new Set(logs.flatMap(l => Object.keys(l.changes))));
  const allHeaders    = ["ID","Date","Action","Severity","Actor","Actor Role","Company","Resource","Detail","IP Address","Time",...allChangeKeys];
  const escape = (val: string) => `"${String(val ?? "").replace(/"/g, '""')}"`;
  const rows = logs.map(l => [
    l.id, l.date, l.action, l.severity, l.actor, l.actorRole,
    l.company, l.resource, l.detail, l.ip, l.time,
    ...allChangeKeys.map(k => l.changes[k] ?? ""),
  ].map(v => escape(String(v))).join(","));
  const csv  = [allHeaders.map(h => escape(h)).join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
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
  const [search,      setSearch]      = useState("");
  const [typeFilter,  setTypeFilter]  = useState<TypeFilter | "ALL">("ALL");
  const [actionFilter,setActionFilter]= useState<ActionType | "ALL">("ALL");
  const [timeFrame,   setTimeFrame]   = useState<TimeFrame>("7days");
  const [exporting,   setExporting]   = useState(false);
  const [exportDone,  setExportDone]  = useState(false);
  const [clearing,    setClearing]    = useState(false);

  // API state (unchanged)
  const [logs,        setLogs]        = useState<LogEntry[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems,  setTotalItems]  = useState(0);
  const LIMIT = 10;

  // ── Fetch logs (unchanged) ──────────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const params = new URLSearchParams();
      params.append("role",       "user");
      params.append("page",       String(currentPage));
      params.append("limit",      String(LIMIT));
      params.append("time_frame", timeFrame);
      if (typeFilter   !== "ALL") params.append("type",   typeFilter);
      if (actionFilter !== "ALL") params.append("action", actionFilter);

      const endpoint = `/v1/admin/activity?${params.toString()}`;
      console.log("AUDIT LOGS API =>", endpoint);

      const res = await axiosInstance.get(endpoint);
      console.log("AUDIT LOGS RESPONSE =>", res.data);

      const raw: RawLog[] = Array.isArray(res.data?.data?.data)
        ? res.data.data.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.logs)
        ? res.data.logs
        : [];

      const total = res.data?.data?.total ?? res.data?.total ?? raw.length;

      setLogs(raw.map(enrichLog));
      setTotalItems(total);
    } catch (e) {
      console.error("AUDIT LOGS ERROR =>", e);
      setFetchError(e instanceof Error ? e.message : "Failed to load audit logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, timeFrame, typeFilter, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset to page 1 when filters change (unchanged)
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, actionFilter, timeFrame, search]);

  // ── Client-side search filter (unchanged) ──────────────────────────────────
  const filtered = logs.filter(l =>
    !search.trim() ||
    l.actor.toLowerCase().includes(search.toLowerCase())   ||
    l.detail.toLowerCase().includes(search.toLowerCase())  ||
    l.resource.toLowerCase().includes(search.toLowerCase())||
    l.company.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase())
  );

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

  // ── Clear logs ───────────────────────────────────────────────────────────────
  // NOTE: no "clear logs" endpoint existed in the original code. Wire this to
  // your real route — placeholder below assumes a DELETE on the same resource.
  const handleClearLogs = async () => {
    const confirmed = window.confirm(
      "This will permanently delete all audit log entries. This action cannot be undone. Continue?"
    );
    if (!confirmed) return;

    setClearing(true);
    try {
      await axiosInstance.delete("/v1/admin/activity");
      await fetchLogs();
    } catch (e) {
      console.error("CLEAR LOGS ERROR =>", e);
      setFetchError(e instanceof Error ? e.message : "Failed to clear logs");
    } finally {
      setClearing(false);
    }
  };

  // ── Stat counts (by severity bucket, matches reference cards) ──────────────
  const infoCount    = logs.filter(l => severityBucket(l.severity) === "info").length;
  const successCount = logs.filter(l => severityBucket(l.severity) === "success").length;
  const warningCount = logs.filter(l => severityBucket(l.severity) === "warning").length;
  const errorCount   = logs.filter(l => severityBucket(l.severity) === "error").length;

  return (
    <div className="al-root">

      {/* HEADER */}
      <div className="al-header">
        <div>
          <h1 className="al-header__title">Activity Logs</h1>
          <p className="al-header__sub">Monitor all system activities and user actions</p>
        </div>
        <div className="al-header__right">
          <button
            onClick={handleExportCSV}
            disabled={exporting || filtered.length === 0}
            className={`al-btn-export ${exportDone ? "al-btn-export--done" : ""}`}
          >
            {exporting ? (
              <><span className="al-btn-spinner" /> Exporting…</>
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
            {clearing ? <><span className="al-btn-spinner" /> Clearing…</> : <>🗑 Clear Logs</>}
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
        <div className="al-search-wrap">
          <span className="al-search-icon">🔍</span>
          <input
            className="al-search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search activities, users, emails…"
            autoComplete="off"
          />
        </div>

        <div className="al-dropdowns-group">
          <div className="al-dropdown-inner">
            <select
              className="al-dropdown"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as TypeFilter | "ALL")}
            >
              <option value="ALL">All Types</option>
              {TYPE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span className="al-dropdown-arrow">▾</span>
          </div>

          <div className="al-dropdown-inner">
            <select
              className="al-dropdown"
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value as ActionType | "ALL")}
            >
              <option value="ALL">All Actions</option>
              {ACTION_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span className="al-dropdown-arrow">▾</span>
          </div>

          <div className="al-dropdown-inner">
            <select
              className="al-dropdown"
              value={timeFrame}
              onChange={e => setTimeFrame(e.target.value as TimeFrame)}
            >
              {TIME_FRAME_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span className="al-dropdown-arrow">▾</span>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="al-table">
        <div className="al-table__head">
          <div className="al-table__head-cell" />
          <div className="al-table__head-cell">ACTIVITY</div>
          <div className="al-table__head-cell">USER</div>
          <div className="al-table__head-cell">IP ADDRESS</div>
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
            <button onClick={fetchLogs} className="al-empty__retry">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="al-empty">
            <div className="al-empty__icon">🔍</div>
            <div className="al-empty__title">No activity found</div>
            <div className="al-empty__desc">Try adjusting your search or filters.</div>
          </div>
        ) : (
          filtered.map(log => {
            const m      = ACTION_META[log.action] ?? { icon: "•", label: log.action };
            const bucket = severityBucket(log.severity);

            return (
              <div key={log.id} className="al-log-row">
                <div className="al-log-row__main">
                  <ActivityIcon bucket={bucket} />

                  <div className="al-log-row__activity">
                    <div className={`al-log-row__name al-log-row__name--${bucket}`}>
                      {m.label.toUpperCase()}
                    </div>
                    <div className="al-log-row__detail">{log.detail}</div>
                  </div>

                  <div className="al-log-row__user-col">
                    <div className="al-log-row__user">{log.actor}</div>
                    <div className="al-log-row__type">{log.resource}</div>
                  </div>

                  <div className="al-log-row__ip">{log.ip}</div>

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
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> · {totalItems} total events
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="al-pagination__btn"
            >
              ‹ Prev
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="al-pagination__btn"
            >
              Next ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
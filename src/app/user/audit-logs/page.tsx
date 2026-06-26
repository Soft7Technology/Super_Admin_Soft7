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

// ─── LOOKUP MAPS ──────────────────────────────────────────────────────────────
const ACTION_META: Record<string, { icon: string; label: string; dotColor: string }> = {
  CREATE:    { icon: "✚", label: "Create",    dotColor: "var(--al-action-create-color)"    },
  UPDATE:    { icon: "✎", label: "Update",    dotColor: "var(--al-action-update-color)"    },
  DELETE:    { icon: "✕", label: "Delete",    dotColor: "var(--al-action-delete-color)"    },
  LOGIN:     { icon: "→", label: "Login",     dotColor: "var(--al-action-login-color)"     },
  SEND:      { icon: "↗", label: "Send",      dotColor: "var(--al-action-export-color)"    },
  ACTIVATE:  { icon: "✔", label: "Activate",  dotColor: "var(--al-action-create-color)"    },
  SUSPEND:   { icon: "⊘", label: "Suspend",   dotColor: "var(--al-action-suspend-color)"   },
  SUBSCRIBE: { icon: "★", label: "Subscribe", dotColor: "var(--al-action-update-color)"    },
  EXPORT:    { icon: "↑", label: "Export",    dotColor: "var(--al-action-export-color)"    },
};

const SEVERITY_COLORS: Record<SeverityType, string> = {
  INFO:     "var(--al-sev-info-color)",
  WARNING:  "var(--al-sev-warning-color)",
  CRITICAL: "var(--al-sev-critical-color)",
  SUCCESS:  "var(--al-sev-success-color)",
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

// ─── HELPERS ──────────────────────────────────────────────────────────────────
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

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function KPI({ label, value, icon, color }: {
  label: string; value: string; icon: string; color: string;
}) {
  return (
    <div className="al-kpi">
      <div className="al-kpi__orb" style={{ background: `${color}10` }} />
      <div className="al-kpi__top">
        <span className="al-kpi__label">{label}</span>
        <div className="al-kpi__icon" style={{ background: `${color}18` }}>{icon}</div>
      </div>
      <div className="al-kpi__value">{value}</div>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const m = ACTION_META[action] ?? { icon: "•", label: action, dotColor: "#6b7280" };
  return (
    <span className={`al-action-badge al-action-badge--${action}`}>
      <span className="al-action-badge__icon">{m.icon}</span>{m.label || action}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: SeverityType }) {
  return (
    <span className={`al-severity-badge al-severity-badge--${severity}`}>{severity}</span>
  );
}

function ActorAvatar({ name, size = 24 }: { name: string; size?: number }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="al-actor-avatar" style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

// ─── DETAIL PANEL ─────────────────────────────────────────────────────────────
function LogDetailPanel({ log, onClose }: { log: LogEntry; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(`Event #${log.id} | ${log.action} | ${log.detail} | ${log.date}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="al-panel">
      <div className="al-panel__header">
        <div>
          <div className="al-panel__header-title">Event Details</div>
          <div className="al-panel__header-id">ID #{log.id}</div>
        </div>
        <button className="al-panel__close" onClick={onClose}>×</button>
      </div>

      <div className="al-panel__body">
        <div className="al-panel__event-card">
          <div className="al-panel__event-card-top">
            <ActionBadge action={log.action} />
            <SeverityBadge severity={log.severity} />
          </div>
          <div className="al-panel__event-detail">{log.detail}</div>
          <div className="al-panel__event-date">{log.date}</div>
        </div>

        <div className="al-panel__section">
          <div className="al-panel__section-label">ACTOR</div>
          <div className="al-panel__actor-card">
            <ActorAvatar name={log.actor} size={34} />
            <div>
              <div className="al-panel__actor-name">{log.actor}</div>
              <div className="al-panel__actor-role">{log.actorRole} · {log.company}</div>
            </div>
          </div>
        </div>

        <div className="al-panel__section">
          <div className="al-panel__section-label">DETAILS</div>
          {([
            ["Resource",   log.resource],
            ["IP Address", log.ip],
            ["Time",       log.time],
            ["Date",       log.date],
          ] as [string, string][]).map(([l, v]) => (
            <div key={l} className="al-panel__detail-row">
              <span className="al-panel__detail-key">{l}</span>
              <span className="al-panel__detail-val">{v}</span>
            </div>
          ))}
        </div>

        {Object.keys(log.changes).length > 0 && (
          <div className="al-panel__section">
            <div className="al-panel__section-label">CHANGES / METADATA</div>
            <div className="al-panel__changes-grid">
              {Object.entries(log.changes).map(([k, v]) => (
                <div key={k} className="al-change-cell">
                  <div className="al-change-cell__key">{k.toUpperCase()}</div>
                  <div className="al-change-cell__val">{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="al-panel__btn-row">
          <button onClick={handleCopy} className={`al-btn-copy ${copied ? "al-btn-copy--done" : ""}`}>
            {copied ? "✓ Copied!" : "📋 Copy Event ID"}
          </button>
          <button onClick={() => exportToCSV([log])} className="al-btn-export-event">
            ⬇ Export This Event
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CSV EXPORT ───────────────────────────────────────────────────────────────
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
  const [selected,    setSelected]    = useState<LogEntry | null>(null);
  const [expanded,    setExpanded]    = useState<Set<number | string>>(new Set());
  const [exporting,   setExporting]   = useState(false);
  const [exportDone,  setExportDone]  = useState(false);

  // API state
  const [logs,        setLogs]        = useState<LogEntry[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems,  setTotalItems]  = useState(0);
  const LIMIT = 10;

  const toggleExpand = (id: number | string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Fetch logs ──────────────────────────────────────────────────────────────
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, actionFilter, timeFrame, search]);

  // ── Client-side search filter ───────────────────────────────────────────────
  const filtered = logs.filter(l =>
    !search.trim() ||
    l.actor.toLowerCase().includes(search.toLowerCase())   ||
    l.detail.toLowerCase().includes(search.toLowerCase())  ||
    l.resource.toLowerCase().includes(search.toLowerCase())||
    l.company.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(totalItems / LIMIT));

  // ── Export ──────────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    setExporting(true);
    setTimeout(() => {
      exportToCSV(filtered);
      setExporting(false);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 2500);
    }, 400);
  };

  const criticalCount = logs.filter(l => l.severity === "CRITICAL").length;
  const uniqueActors  = new Set(logs.map(l => l.actor)).size;

  return (
    <div className="al-root">

      {/* HEADER */}
      <div className="al-header">
        <div>
          <h1 className="al-header__title">Audit Logs</h1>
          <p className="al-header__sub">Track every action, change, and event across the platform.</p>
        </div>
        <div className="al-header__right">
          <button
            onClick={handleExportCSV}
            disabled={exporting || filtered.length === 0}
            className={`al-btn-export ${exporting ? "al-btn-export--loading" : ""} ${exportDone ? "al-btn-export--done" : ""}`}
          >
            {exporting ? (
              <><span className="al-btn-export__spinner" /> Exporting…</>
            ) : exportDone ? (
              <>✓ Downloaded!</>
            ) : (
              <><span>⬇</span> Export CSV</>
            )}
          </button>
          <span className="al-header__hint">
            {totalItems > 0 ? `${totalItems} total events` : "No events"}
          </span>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="al-kpi-grid">
        <KPI label="Total Events"    value={String(totalItems)}     icon="📋" color="#6C5CE7" />
        <KPI label="Shown"           value={String(filtered.length)} icon="📅" color="#74B9FF" />
        <KPI label="Critical Events" value={String(criticalCount)}  icon="🔴" color="#FF6B6B" />
        <KPI label="Unique Actors"   value={String(uniqueActors)}   icon="👤" color="#FDCB6E" />
      </div>

      {/* FILTER BAR */}
      <div className="al-filter-bar">
        {/* Search - reduced width */}
        <div className="al-search-wrap">
          <span className="al-search-icon">🔍</span>
          <input
            className="al-search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search actor, resource…"
            autoComplete="off"
          />
        </div>

        {/* Dropdowns group */}
        <div className="al-dropdowns-group">
          {/* Type dropdown */}
          <div className="al-dropdown-wrap">
            <span className="al-dropdown-label">TYPE</span>
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
          </div>

          {/* Action dropdown */}
          <div className="al-dropdown-wrap">
            <span className="al-dropdown-label">ACTION</span>
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
          </div>

          {/* Time frame dropdown */}
          <div className="al-dropdown-wrap">
            <span className="al-dropdown-label">TIME FRAME</span>
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

        <span className="al-filter-count">{filtered.length} events</span>
      </div>

      {/* MAIN CONTENT */}
      <div className={`al-main-grid ${selected ? "al-main-grid--split" : "al-main-grid--full"}`}>

        {/* LOG TABLE */}
        <div className="al-table">
          <div className="al-table__head">
            {["", "Event", "Actor", "Resource", "Action", "Severity", "Time"].map(h => (
              <div key={h} className="al-table__head-cell">{h.toUpperCase()}</div>
            ))}
          </div>

          {loading ? (
            <div className="al-empty">
              <div className="al-empty__icon">⏳</div>
              <div className="al-empty__title">Loading audit logs…</div>
            </div>
          ) : fetchError ? (
            <div className="al-empty">
              <div className="al-empty__icon">⚠️</div>
              <div className="al-empty__title">Failed to load logs</div>
              <div className="al-empty__desc">{fetchError}</div>
              <button
                onClick={fetchLogs}
                style={{ marginTop: 12, padding: "6px 16px", borderRadius: 8, cursor: "pointer", background: "#10b981", color: "#fff", border: "none" }}
              >
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="al-empty">
              <div className="al-empty__icon">🔍</div>
              <div className="al-empty__title">No events found</div>
              <div className="al-empty__desc">Try adjusting your search or filters.</div>
            </div>
          ) : (
            filtered.map(log => {
              const m          = ACTION_META[log.action] ?? { icon: "•", label: log.action, dotColor: "#6b7280" };
              const isExpanded = expanded.has(log.id);
              const isSelected = selected?.id === log.id;

              return (
                <div key={log.id} className="al-log-row">
                  <div className={`al-log-row__main ${isSelected ? "al-log-row__main--active" : ""}`}>
                    {/* Dot */}
                    <div className="al-log-row__dot">
                      <div className="al-log-row__dot-inner"
                        style={{ background: m.dotColor, boxShadow: `0 0 6px ${m.dotColor}60` }} />
                    </div>

                    {/* Event */}
                    <div className="al-log-row__event" onClick={() => setSelected(isSelected ? null : log)}>
                      <div className="al-log-row__detail">{log.detail}</div>
                      <div className="al-log-row__meta">{log.company} · {log.ip}</div>
                    </div>

                    {/* Actor */}
                    <div className="al-log-row__actor" onClick={() => setSelected(isSelected ? null : log)}>
                      <ActorAvatar name={log.actor} size={24} />
                      <div style={{ minWidth: 0 }}>
                        <div className="al-log-row__actor-name">{log.actor}</div>
                        <div className="al-log-row__actor-role">{log.actorRole}</div>
                      </div>
                    </div>

                    {/* Resource */}
                    <div onClick={() => setSelected(isSelected ? null : log)}>
                      <span className="al-resource-chip">{log.resource}</span>
                    </div>

                    {/* Action */}
                    <div onClick={() => setSelected(isSelected ? null : log)}>
                      <ActionBadge action={log.action} />
                    </div>

                    {/* Severity */}
                    <div onClick={() => setSelected(isSelected ? null : log)}>
                      <SeverityBadge severity={log.severity} />
                    </div>

                    {/* Time + expand */}
                    <div className="al-log-row__time-col">
                      <span className="al-log-row__time">{log.time}</span>
                      <button className="al-btn-expand"
                        onClick={e => { e.stopPropagation(); toggleExpand(log.id); }}
                        title={isExpanded ? "Collapse" : "Expand metadata"}>
                        {isExpanded ? "▲" : "▼"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded metadata */}
                  {isExpanded && Object.keys(log.changes).length > 0 && (
                    <div className="al-log-row__expanded">
                      <div className="al-changes-grid">
                        {Object.entries(log.changes).map(([k, v]) => (
                          <div key={k} className="al-change-cell">
                            <div className="al-change-cell__key">{k.toUpperCase()}</div>
                            <div className="al-change-cell__val">{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* DETAIL PANEL */}
        {selected && <LogDetailPanel log={selected} onClose={() => setSelected(null)} />}
      </div>

      {/* PAGINATION */}
      {!loading && !fetchError && totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, padding: "14px 4px 4px" }}>
          <div style={{ fontSize: 13, color: "var(--al-muted, #6b7280)" }}>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> · {totalItems} total events
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              style={{ border: "1px solid var(--al-border, #2c3657)", background: "var(--al-surface, #1a1a2e)", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1, color: "inherit" }}
            >
              ‹ Prev
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              style={{ border: "1px solid var(--al-border, #2c3657)", background: "var(--al-surface, #1a1a2e)", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1, color: "inherit" }}
            >
              Next ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import "./audit-logs.css";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type ActionType   = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "EXPORT" | "SUSPEND";
type SeverityType = "INFO" | "WARNING" | "CRITICAL" | "SUCCESS";

interface LogEntry {
  id:        number;
  action:    ActionType;
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

// ─── LOOKUP MAPS ──────────────────────────────────────────────────────────────
const ACTION_META: Record<ActionType, { icon: string; label: string; dotColor: string }> = {
  CREATE:  { icon: "✚", label: "Create",  dotColor: "var(--al-action-create-color)"  },
  UPDATE:  { icon: "✎", label: "Update",  dotColor: "var(--al-action-update-color)"  },
  DELETE:  { icon: "✕", label: "Delete",  dotColor: "var(--al-action-delete-color)"  },
  LOGIN:   { icon: "→", label: "Login",   dotColor: "var(--al-action-login-color)"   },
  EXPORT:  { icon: "↑", label: "Export",  dotColor: "var(--al-action-export-color)"  },
  SUSPEND: { icon: "⊘", label: "Suspend", dotColor: "var(--al-action-suspend-color)" },
};

const SEVERITY_WARN_COLORS: Record<SeverityType, string> = {
  INFO:     "var(--al-sev-info-color)",
  WARNING:  "var(--al-sev-warning-color)",
  CRITICAL: "var(--al-sev-critical-color)",
  SUCCESS:  "var(--al-sev-success-color)",
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const LOGS: LogEntry[] = [
  { id:1,  action:"CREATE",  actor:"James Doe",    actorRole:"Admin",   resource:"Company",      detail:"Created new company: Orbit Analytics",        ip:"192.168.1.10",  time:"2 mins ago",  date:"Mar 11, 2026 10:42 AM", severity:"SUCCESS",  company:"Acme Corp",       changes:{ Name:"Orbit Analytics",  Plan:"Pro",       Seats:"100",      Status:"ACTIVE"       } },
  { id:2,  action:"DELETE",  actor:"Sara Rivera",  actorRole:"Admin",   resource:"User",         detail:"Deleted user account: tom@skyline.co",        ip:"10.0.0.45",     time:"15 mins ago", date:"Mar 11, 2026 10:30 AM", severity:"CRITICAL", company:"Nexus Ltd",       changes:{ User:"Tom King",         Email:"tom@skyline.co", Role:"Manager", Action:"Permanent Delete" } },
  { id:3,  action:"UPDATE",  actor:"Anya Patel",   actorRole:"Manager", resource:"Subscription", detail:"Upgraded plan: Basic → Pro",                  ip:"172.16.0.5",    time:"1 hr ago",    date:"Mar 11, 2026 09:45 AM", severity:"INFO",     company:"Zenith Group",    changes:{ OldPlan:"Basic",         NewPlan:"Pro",    Price:"₹999→₹2499", Billing:"Monthly"    } },
  { id:4,  action:"LOGIN",   actor:"Mike Loren",   actorRole:"User",    resource:"Auth",         detail:"Failed login attempt (3rd try)",              ip:"203.0.113.55",  time:"2 hrs ago",   date:"Mar 11, 2026 08:55 AM", severity:"WARNING",  company:"Vertex Co",       changes:{ Attempts:"3",            Method:"Password", Status:"FAILED",  IP:"203.0.113.55"     } },
  { id:5,  action:"EXPORT",  actor:"Priya Sharma", actorRole:"Manager", resource:"Report",       detail:"Exported user data CSV (847 records)",        ip:"10.0.1.22",     time:"3 hrs ago",   date:"Mar 11, 2026 07:30 AM", severity:"WARNING",  company:"Prism Analytics", changes:{ Format:"CSV",            Records:"847",    Size:"2.4MB",     Scope:"All Users"     } },
  { id:6,  action:"SUSPEND", actor:"James Doe",    actorRole:"Admin",   resource:"Company",      detail:"Suspended company: Orbit Systems",            ip:"192.168.1.10",  time:"5 hrs ago",   date:"Mar 11, 2026 06:00 AM", severity:"CRITICAL", company:"Acme Corp",       changes:{ Company:"Orbit Systems", Reason:"Payment Failed", OldStatus:"ACTIVE", NewStatus:"SUSPENDED" } },
  { id:7,  action:"UPDATE",  actor:"Ravi Kumar",   actorRole:"Manager", resource:"User",         detail:"Updated user role: User → Manager",           ip:"172.16.0.8",    time:"Yesterday",   date:"Mar 10, 2026 04:15 PM", severity:"INFO",     company:"Acme Corp",       changes:{ User:"Carlos Mendes",   OldRole:"User",   NewRole:"Manager", UpdatedBy:"Ravi Kumar"} },
  { id:8,  action:"CREATE",  actor:"Leila Hassan", actorRole:"Admin",   resource:"Chatbot",      detail:"Created chatbot: SupportBot v2",              ip:"10.0.2.14",     time:"Yesterday",   date:"Mar 10, 2026 02:00 PM", severity:"SUCCESS",  company:"Nexus Ltd",       changes:{ Name:"SupportBot v2",   Type:"Support",   Language:"English", Status:"Active"       } },
  { id:9,  action:"DELETE",  actor:"Sara Rivera",  actorRole:"Admin",   resource:"Campaign",     detail:"Deleted campaign: Summer Sale 2025",          ip:"10.0.0.45",     time:"2 days ago",  date:"Mar 9, 2026 11:00 AM",  severity:"CRITICAL", company:"Nexus Ltd",       changes:{ Campaign:"Summer Sale 2025", Messages:"12,400", Status:"Deleted", Reason:"Completed" } },
  { id:10, action:"LOGIN",   actor:"Anya Patel",   actorRole:"Admin",   resource:"Auth",         detail:"Successful login from new device",            ip:"198.51.100.22", time:"2 days ago",  date:"Mar 9, 2026 09:00 AM",  severity:"WARNING",  company:"Zenith Group",    changes:{ Device:"MacBook Pro",   Location:"Mumbai, IN", Method:"2FA", Status:"SUCCESS"  } },
  { id:11, action:"EXPORT",  actor:"Priya Sharma", actorRole:"Manager", resource:"Subscription", detail:"Exported billing report Q1 2026",            ip:"10.0.1.22",     time:"3 days ago",  date:"Mar 8, 2026 03:30 PM",  severity:"INFO",     company:"Prism Analytics", changes:{ Period:"Q1 2026",        Format:"PDF",     Size:"1.1MB",     Scope:"Billing"       } },
  { id:12, action:"UPDATE",  actor:"James Doe",    actorRole:"Admin",   resource:"Settings",     detail:"Updated SMTP settings",                      ip:"192.168.1.10",  time:"4 days ago",  date:"Mar 7, 2026 10:00 AM",  severity:"INFO",     company:"Acme Corp",       changes:{ Setting:"SMTP Host",    Old:"smtp.old.com", New:"smtp.sendgrid.net", Port:"587" } },
];

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function KPI({ label, value, delta, icon, color, up = true }: {
  label: string; value: string; delta?: string; icon: string; color: string; up?: boolean;
}) {
  return (
    <div className="al-kpi">
      <div className="al-kpi__orb" style={{ background: `${color}10` }} />
      <div className="al-kpi__top">
        <span className="al-kpi__label">{label}</span>
        <div className="al-kpi__icon" style={{ background: `${color}18` }}>{icon}</div>
      </div>
      <div className="al-kpi__value">{value}</div>
      {delta && <div className={`al-kpi__delta ${up ? "al-kpi__delta--up" : "al-kpi__delta--down"}`}>{up ? "↑" : "↓"} {delta}</div>}
    </div>
  );
}

function ActionBadge({ action }: { action: ActionType }) {
  const m = ACTION_META[action];
  return (
    <span className={`al-action-badge al-action-badge--${action}`}>
      <span className="al-action-badge__icon">{m.icon}</span>{m.label}
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
        {/* Action + severity */}
        <div className="al-panel__event-card">
          <div className="al-panel__event-card-top">
            <ActionBadge action={log.action} />
            <SeverityBadge severity={log.severity} />
          </div>
          <div className="al-panel__event-detail">{log.detail}</div>
          <div className="al-panel__event-date">{log.date}</div>
        </div>

        {/* Actor */}
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

        {/* Details */}
        <div className="al-panel__section">
          <div className="al-panel__section-label">DETAILS</div>
          {([
            ["Resource",   log.resource, "var(--al-text)"],
            ["IP Address", log.ip,       "var(--al-warn)"],
            ["Time",       log.time,     "var(--al-text)"],
            ["Date",       log.date,     "var(--al-text)"],
          ] as [string, string, string][]).map(([l, v, c]) => (
            <div key={l} className="al-panel__detail-row">
              <span className="al-panel__detail-key">{l}</span>
              <span className="al-panel__detail-val" style={{ color: c }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Changes */}
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

        {/* Actions */}
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
  link.href = url; link.download = `audit-logs-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(link); link.click();
  document.body.removeChild(link); URL.revokeObjectURL(url);
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function AuditLogs() {
  const [search,     setSearch]     = useState("");
  const [actionF,    setActionF]    = useState("ALL");
  const [severityF,  setSeverityF]  = useState("ALL");
  const [selected,   setSelected]   = useState<LogEntry | null>(null);
  const [expanded,   setExpanded]   = useState<Set<number>>(new Set());
  const [exporting,  setExporting]  = useState(false);
  const [exportDone, setExportDone] = useState(false);

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = LOGS.filter(l =>
    (actionF   === "ALL" || l.action   === actionF)   &&
    (severityF === "ALL" || l.severity === severityF) &&
    (l.actor.toLowerCase().includes(search.toLowerCase())    ||
     l.detail.toLowerCase().includes(search.toLowerCase())   ||
     l.resource.toLowerCase().includes(search.toLowerCase()) ||
     l.company.toLowerCase().includes(search.toLowerCase()))
  );

  const handleExportCSV = () => {
    setExporting(true);
    setTimeout(() => {
      exportToCSV(filtered);
      setExporting(false); setExportDone(true);
      setTimeout(() => setExportDone(false), 2500);
    }, 400);
  };

  const criticalCount = LOGS.filter(l => l.severity === "CRITICAL").length;
  const todayCount    = LOGS.filter(l => l.time.includes("mins") || l.time.includes("hr")).length;
  const actorCount    = new Set(LOGS.map(l => l.actor)).size;

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
            className={`al-btn-export ${exporting ? "al-btn-export--loading" : ""} ${exportDone ? "al-btn-export--done" : ""}`}>
            {exporting ? (
              <><span className="al-btn-export__spinner" /> Exporting…</>
            ) : exportDone ? (
              <>✓ Downloaded!</>
            ) : (
              <>
                <span>⬇</span> Export CSV
                {filtered.length < LOGS.length && (
                  <span className="al-btn-export__count">{filtered.length}</span>
                )}
              </>
            )}
          </button>
          <span className="al-header__hint">
            {filtered.length === LOGS.length
              ? `All ${LOGS.length} events`
              : `${filtered.length} of ${LOGS.length} filtered events`}
          </span>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="al-kpi-grid">
        <KPI label="Total Events"    value={String(LOGS.length)}   delta="18% this month"       icon="📋" color="#6C5CE7" />
        <KPI label="Today"           value={String(todayCount)}    delta="3 more than avg"      icon="📅" color="#74B9FF" />
        <KPI label="Critical Events" value={String(criticalCount)} delta="review required"      icon="🔴" color="#FF6B6B" up={false} />
        <KPI label="Unique Actors"   value={String(actorCount)}    delta="across all companies" icon="👤" color="#FDCB6E" />
      </div>

      {/* FILTER BAR */}
      <div className="al-filter-bar">
        <div className="al-search-wrap">
          <span className="al-search-icon">🔍</span>
          <input className="al-search-input" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search actor, action, resource, company…"
            autoComplete="off" />
        </div>

        {/* Action filters */}
        <div className="al-filter-group">
          {(["ALL","CREATE","UPDATE","DELETE","LOGIN","EXPORT","SUSPEND"] as const).map(a => {
            const m = ACTION_META[a as ActionType];
            const isActive = actionF === a;
            return (
              <button key={a} onClick={() => setActionF(a)}
                className={`al-filter-btn ${isActive ? "al-filter-btn--active" : ""}`}
                style={isActive && a !== "ALL" ? { color: `var(--al-action-${a.toLowerCase()}-color)` } : isActive ? { color: "var(--al-accent2)" } : {}}>
                {m && <span>{m.icon}</span>}
                {a === "ALL" ? "All" : m?.label ?? a}
              </button>
            );
          })}
        </div>

        {/* Severity filters */}
        <div className="al-filter-group">
          {(["ALL","SUCCESS","INFO","WARNING","CRITICAL"] as const).map(s => {
            const isActive = severityF === s;
            return (
              <button key={s} onClick={() => setSeverityF(s)}
                className={`al-filter-btn ${isActive ? "al-filter-btn--active" : ""}`}
                style={isActive && s !== "ALL" ? { color: `var(--al-sev-${s.toLowerCase()}-color)` } : isActive ? { color: "var(--al-accent2)" } : {}}>
                {s === "ALL" ? "All Severity" : s}
              </button>
            );
          })}
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

          {filtered.map(log => {
            const m          = ACTION_META[log.action];
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
                {isExpanded && (
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
          })}

          {filtered.length === 0 && (
            <div className="al-empty">
              <div className="al-empty__icon">🔍</div>
              <div className="al-empty__title">No events found</div>
              <div className="al-empty__desc">Try adjusting your search or filters.</div>
            </div>
          )}
        </div>

        {/* DETAIL PANEL */}
        {selected && <LogDetailPanel log={selected} onClose={() => setSelected(null)} />}
      </div>
    </div>
  );
}
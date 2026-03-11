"use client";

import { useState } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg:      "#080A12",
  surf:    "#0F1120",
  surf2:   "#171929",
  surf3:   "#1E2035",
  border:  "rgba(255,255,255,0.07)",
  accent:  "#6C5CE7",
  accent2: "#A29BFE",
  text:    "#E2E4F0",
  muted:   "#565875",
  success: "#00CBA4",
  danger:  "#FF6B6B",
  warn:    "#FDCB6E",
  info:    "#74B9FF",
} as const;

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
const ACTION_META: Record<ActionType, { color: string; bg: string; icon: string; label: string }> = {
  CREATE:  { color: "#00CBA4", bg: "rgba(0,203,164,0.10)",   icon: "✚", label: "Create"  },
  UPDATE:  { color: "#74B9FF", bg: "rgba(116,185,255,0.10)", icon: "✎", label: "Update"  },
  DELETE:  { color: "#FF6B6B", bg: "rgba(255,107,107,0.10)", icon: "✕", label: "Delete"  },
  LOGIN:   { color: "#A29BFE", bg: "rgba(162,155,254,0.10)", icon: "→", label: "Login"   },
  EXPORT:  { color: "#FDCB6E", bg: "rgba(253,203,110,0.10)", icon: "↑", label: "Export"  },
  SUSPEND: { color: "#FD79A8", bg: "rgba(253,121,168,0.10)", icon: "⊘", label: "Suspend" },
};

const SEVERITY_META: Record<SeverityType, { color: string; bg: string }> = {
  INFO:     { color: "#74B9FF", bg: "rgba(116,185,255,0.10)"  },
  WARNING:  { color: "#FDCB6E", bg: "rgba(253,203,110,0.10)"  },
  CRITICAL: { color: "#FF6B6B", bg: "rgba(255,107,107,0.12)"  },
  SUCCESS:  { color: "#00CBA4", bg: "rgba(0,203,164,0.10)"    },
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
    <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -6, right: -6, width: 56, height: 56, borderRadius: "50%", background: `${color}10` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>{label}</span>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 4 }}>{value}</div>
      {delta && <div style={{ fontSize: 10, color: up ? T.success : T.danger, fontWeight: 600 }}>{up ? "↑" : "↓"} {delta}</div>}
    </div>
  );
}

function ActionBadge({ action }: { action: ActionType }) {
  const m = ACTION_META[action];
  return (
    <span style={{ background: m.bg, color: m.color, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
      <span style={{ fontSize: 11 }}>{m.icon}</span>{m.label}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: SeverityType }) {
  const s = SEVERITY_META[severity];
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap" }}>
      {severity}
    </span>
  );
}

function ActorAvatar({ name, size = 24 }: { name: string; size?: number }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
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
    <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", position: "sticky", top: 0, maxHeight: "calc(100vh - 220px)", display: "flex", flexDirection: "column" }}>
      {/* Panel header */}
      <div style={{ background: T.surf2, padding: "14px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Event Details</div>
          <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>ID #{log.id}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
      </div>

      <div style={{ overflowY: "auto", flex: 1, padding: "18px" }}>
        {/* Action + severity header */}
        <div style={{ background: T.surf2, borderRadius: 12, padding: "14px 16px", marginBottom: 16, border: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <ActionBadge action={log.action} />
            <SeverityBadge severity={log.severity} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 5, lineHeight: 1.4 }}>{log.detail}</div>
          <div style={{ fontSize: 10, color: T.muted }}>{log.date}</div>
        </div>

        {/* Actor */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: "0.07em", marginBottom: 8 }}>ACTOR</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: T.surf2, borderRadius: 10, padding: "11px 13px", border: `1px solid ${T.border}` }}>
            <ActorAvatar name={log.actor} size={34} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{log.actor}</div>
              <div style={{ fontSize: 10, color: T.muted }}>{log.actorRole} · {log.company}</div>
            </div>
          </div>
        </div>

        {/* Meta fields */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: "0.07em", marginBottom: 8 }}>DETAILS</div>
          {([
            ["Resource",   log.resource, T.text],
            ["IP Address", log.ip,       T.warn],
            ["Time",       log.time,     T.text],
            ["Date",       log.date,     T.text],
          ] as [string, string, string][]).map(([l, v, c]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 11, color: T.muted }}>{l}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: c }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Changes / metadata */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: "0.07em", marginBottom: 8 }}>CHANGES / METADATA</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            {Object.entries(log.changes).map(([k, v]) => (
              <div key={k} style={{ background: T.surf2, borderRadius: 8, padding: "9px 10px", border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 3 }}>{k.toUpperCase()}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.text, wordBreak: "break-all" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <button onClick={handleCopy}
            style={{ background: copied ? "rgba(0,203,164,0.15)" : `linear-gradient(135deg,${T.accent},${T.accent2})`, color: copied ? T.success : "#fff", border: copied ? "1px solid rgba(0,203,164,0.3)" : "none", padding: "9px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 600, transition: "all 0.2s" }}>
            {copied ? "✓ Copied!" : "📋 Copy Event ID"}
          </button>
          <button
            onClick={() => exportToCSV([log])}
            style={{ background: T.surf2, color: T.muted, border: `1px solid ${T.border}`, padding: "9px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 600 }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = T.accent2)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
            ⬇ Export This Event
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CSV EXPORT UTILITY ───────────────────────────────────────────────────────
function exportToCSV(logs: LogEntry[]) {
  const headers = [
    "ID", "Date", "Action", "Severity", "Actor", "Actor Role",
    "Company", "Resource", "Detail", "IP Address", "Time",
    ...Array.from(new Set(logs.flatMap(l => Object.keys(l.changes)))),
  ];

  // Collect all unique change keys across all logs
  const allChangeKeys = Array.from(new Set(logs.flatMap(l => Object.keys(l.changes))));
  const allHeaders    = ["ID","Date","Action","Severity","Actor","Actor Role","Company","Resource","Detail","IP Address","Time",...allChangeKeys];

  const escape = (val: string) => `"${String(val ?? "").replace(/"/g, '""')}"`;

  const rows = logs.map(l => [
    l.id,
    l.date,
    l.action,
    l.severity,
    l.actor,
    l.actorRole,
    l.company,
    l.resource,
    l.detail,
    l.ip,
    l.time,
    ...allChangeKeys.map(k => l.changes[k] ?? ""),
  ].map(v => escape(String(v))).join(","));

  const csv     = [allHeaders.map(h => escape(h)).join(","), ...rows].join("\n");
  const blob    = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url     = URL.createObjectURL(blob);
  const link    = document.createElement("a");
  link.href     = url;
  link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── PAGE COMPONENT ───────────────────────────────────────────────────────────
export default function AuditLogs() {
  const [search,      setSearch]      = useState<string>("");
  const [actionF,     setActionF]     = useState<string>("ALL");
  const [severityF,   setSeverityF]   = useState<string>("ALL");
  const [selected,    setSelected]    = useState<LogEntry | null>(null);
  const [expanded,    setExpanded]    = useState<Set<number>>(new Set());
  const [exporting,   setExporting]   = useState<boolean>(false);
  const [exportDone,  setExportDone]  = useState<boolean>(false);

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
    (
      l.actor.toLowerCase().includes(search.toLowerCase())    ||
      l.detail.toLowerCase().includes(search.toLowerCase())   ||
      l.resource.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleExportCSV = () => {
    setExporting(true);
    // slight delay so button animates before browser file dialog
    setTimeout(() => {
      exportToCSV(filtered);
      setExporting(false);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 2500);
    }, 400);
  };

  const criticalCount = LOGS.filter(l => l.severity === "CRITICAL").length;
  const todayCount    = LOGS.filter(l => l.time.includes("mins") || l.time.includes("hr")).length;
  const actorCount    = new Set(LOGS.map(l => l.actor)).size;

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: T.bg, minHeight: "100vh", padding: "28px 32px", color: T.text }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #222440; border-radius: 4px; }
        ::placeholder { color: #3A3D5C; }
        button, input, select { font-family: inherit; }
        @keyframes slideIn  { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin     { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes popIn    { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Audit Logs</h1>
          <p style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>Track every action, change, and event across the platform.</p>
        </div>

        {/* ── EXPORT CSV BUTTON ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <button
            onClick={handleExportCSV}
            disabled={exporting || filtered.length === 0}
            style={{
              background: exportDone
                ? "rgba(0,203,164,0.12)"
                : exporting
                ? T.surf2
                : `linear-gradient(135deg,${T.accent},${T.accent2})`,
              color: exportDone ? T.success : exporting ? T.muted : "#fff",
              border: exportDone ? `1px solid rgba(0,203,164,0.35)` : "none",
              padding: "10px 20px",
              borderRadius: 9,
              cursor: filtered.length === 0 ? "not-allowed" : "pointer",
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.25s",
              opacity: filtered.length === 0 ? 0.45 : 1,
              minWidth: 160,
              justifyContent: "center",
            }}
            onMouseEnter={e => { if (!exporting && !exportDone && filtered.length > 0) e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = filtered.length === 0 ? "0.45" : "1"; }}
          >
            {exporting ? (
              <>
                <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                Exporting…
              </>
            ) : exportDone ? (
              <>
                <span style={{ animation: "popIn 0.3s ease", display: "inline-block" }}>✓</span>
                Downloaded!
              </>
            ) : (
              <>
                <span>⬇</span>
                Export CSV
                {filtered.length < LOGS.length && (
                  <span style={{ background: "rgba(255,255,255,0.18)", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 800 }}>
                    {filtered.length}
                  </span>
                )}
              </>
            )}
          </button>

          {/* Subtle hint */}
          <span style={{ fontSize: 10, color: T.muted }}>
            {filtered.length === LOGS.length
              ? `All ${LOGS.length} events`
              : `${filtered.length} of ${LOGS.length} filtered events`}
          </span>
        </div>
      </div>

      {/* ── KPI ROW ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <KPI label="Total Events"    value={String(LOGS.length)}  delta="18% this month"       icon="📋" color={T.accent}  />
        <KPI label="Today"           value={String(todayCount)}   delta="3 more than avg"      icon="📅" color={T.info}    />
        <KPI label="Critical Events" value={String(criticalCount)} delta="review required"     icon="🔴" color={T.danger}  up={false} />
        <KPI label="Unique Actors"   value={String(actorCount)}   delta="across all companies" icon="👤" color={T.warn}    />
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{ display: "flex", gap: 9, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: T.muted, fontSize: 14, pointerEvents: "none" }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search actor, action, resource, company…"
            style={{ width: "100%", background: T.surf, border: `1px solid ${T.border}`, color: T.text, padding: "9px 14px 9px 35px", borderRadius: 10, fontSize: 12, outline: "none" }}
            onFocus={e => (e.target.style.borderColor = T.accent)}
            onBlur={e  => (e.target.style.borderColor = T.border)}
          />
        </div>

        {/* Action filter */}
        <div style={{ display: "flex", background: T.surf, border: `1px solid ${T.border}`, borderRadius: 10, padding: 3, gap: 2, flexWrap: "wrap" }}>
          {(["ALL", "CREATE", "UPDATE", "DELETE", "LOGIN", "EXPORT", "SUSPEND"] as const).map(a => {
            const m = ACTION_META[a as ActionType];
            const isActive = actionF === a;
            return (
              <button key={a} onClick={() => setActionF(a)}
                style={{ background: isActive ? T.surf2 : "transparent", border: `1px solid ${isActive ? "rgba(108,92,231,0.35)" : "transparent"}`, color: isActive ? (m?.color ?? T.accent2) : T.muted, padding: "5px 10px", borderRadius: 7, cursor: "pointer", fontSize: 10, fontWeight: isActive ? 700 : 400, display: "flex", alignItems: "center", gap: 4, transition: "all 0.12s" }}>
                {m && <span>{m.icon}</span>}
                {a === "ALL" ? "All" : m?.label ?? a}
              </button>
            );
          })}
        </div>

        {/* Severity filter */}
        <div style={{ display: "flex", background: T.surf, border: `1px solid ${T.border}`, borderRadius: 10, padding: 3, gap: 2 }}>
          {(["ALL", "SUCCESS", "INFO", "WARNING", "CRITICAL"] as const).map(s => {
            const sv = SEVERITY_META[s as SeverityType];
            const isActive = severityF === s;
            return (
              <button key={s} onClick={() => setSeverityF(s)}
                style={{ background: isActive ? T.surf2 : "transparent", border: `1px solid ${isActive ? "rgba(108,92,231,0.35)" : "transparent"}`, color: isActive ? (sv?.color ?? T.accent2) : T.muted, padding: "5px 10px", borderRadius: 7, cursor: "pointer", fontSize: 10, fontWeight: isActive ? 700 : 400, transition: "all 0.12s" }}>
                {s === "ALL" ? "All Severity" : s}
              </button>
            );
          })}
        </div>

        <span style={{ fontSize: 11, color: T.muted }}>{filtered.length} events</span>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 320px" : "1fr", gap: 16, alignItems: "start" }}>

        {/* ── LOG TABLE ── */}
        <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>

          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 0.7fr 0.7fr 0.55fr 0.55fr 70px", padding: "10px 18px", background: T.surf2, borderBottom: `1px solid ${T.border}` }}>
            {["", "Event", "Actor", "Resource", "Action", "Severity", "Time"].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: "0.06em" }}>{h.toUpperCase()}</div>
            ))}
          </div>

          {/* Log rows */}
          {filtered.map((log) => {
            const m          = ACTION_META[log.action];
            const isExpanded = expanded.has(log.id);
            const isSelected = selected?.id === log.id;

            return (
              <div key={log.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                {/* Main row */}
                <div
                  style={{ display: "grid", gridTemplateColumns: "28px 1fr 0.7fr 0.7fr 0.55fr 0.55fr 70px", padding: "12px 18px", cursor: "pointer", background: isSelected ? "rgba(108,92,231,0.07)" : "transparent", borderLeft: `3px solid ${isSelected ? T.accent : "transparent"}`, transition: "all 0.12s", alignItems: "center" }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(108,92,231,0.03)"; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Status dot */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.color, boxShadow: `0 0 6px ${m.color}60`, flexShrink: 0 }} />
                  </div>

                  {/* Event detail */}
                  <div onClick={() => setSelected(isSelected ? null : log)} style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{log.detail}</div>
                    <div style={{ fontSize: 10, color: T.muted }}>{log.company} · {log.ip}</div>
                  </div>

                  {/* Actor */}
                  <div onClick={() => setSelected(isSelected ? null : log)} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <ActorAvatar name={log.actor} size={24} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.actor}</div>
                      <div style={{ fontSize: 9, color: T.muted }}>{log.actorRole}</div>
                    </div>
                  </div>

                  {/* Resource */}
                  <div onClick={() => setSelected(isSelected ? null : log)}>
                    <span style={{ background: T.surf2, color: T.muted, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, border: `1px solid ${T.border}` }}>{log.resource}</span>
                  </div>

                  {/* Action badge */}
                  <div onClick={() => setSelected(isSelected ? null : log)}>
                    <ActionBadge action={log.action} />
                  </div>

                  {/* Severity badge */}
                  <div onClick={() => setSelected(isSelected ? null : log)}>
                    <SeverityBadge severity={log.severity} />
                  </div>

                  {/* Time + expand toggle */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                    <span style={{ fontSize: 10, color: T.muted, whiteSpace: "nowrap" }}>{log.time}</span>
                    <button
                      onClick={e => { e.stopPropagation(); toggleExpand(log.id); }}
                      style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 11, padding: "1px 4px", borderRadius: 4, transition: "color 0.12s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = T.accent2)}
                      onMouseLeave={e => (e.currentTarget.style.color = T.muted)}
                      title={isExpanded ? "Collapse" : "Expand metadata"}
                    >
                      {isExpanded ? "▲" : "▼"}
                    </button>
                  </div>
                </div>

                {/* Expanded metadata row */}
                {isExpanded && (
                  <div style={{ padding: "12px 18px 14px 46px", background: "rgba(108,92,231,0.03)", animation: "slideIn 0.15s", borderTop: `1px solid ${T.border}` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                      {Object.entries(log.changes).map(([k, v]) => (
                        <div key={k} style={{ background: T.surf2, borderRadius: 8, padding: "8px 10px", border: `1px solid ${T.border}` }}>
                          <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 3 }}>{k.toUpperCase()}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: T.text, wordBreak: "break-word" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty state */}
          {filtered.length === 0 && (
            <div style={{ padding: "60px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>No events found</div>
              <div style={{ fontSize: 12, color: T.muted }}>Try adjusting your search or filters.</div>
            </div>
          )}
        </div>

        {/* ── DETAIL PANEL ── */}
        {selected && <LogDetailPanel log={selected} onClose={() => setSelected(null)} />}
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import {
  Plus, Pencil, LogIn, Send, Trash2, HelpCircle,
  Info, CheckCircle2, AlertTriangle, XCircle,
  Download, MoreHorizontal, ChevronRight, ChevronDown,
  Trash, X, Copy, Check, Clock,
} from "lucide-react";
import "./audit-logs.css";

// Users fetched dynamically now

const AC: Record<string, [React.ReactNode, string]> = {
  CREATE: [<Plus size={15} strokeWidth={2.5} />, "var(--a-create)"],
  UPDATE: [<Pencil size={14} strokeWidth={2.5} />, "var(--a-update)"],
  LOGIN:  [<LogIn size={14} strokeWidth={2.5} />, "var(--a-login)"],
  SEND:   [<Send size={14} strokeWidth={2.5} />, "var(--a-send)"],
  DELETE: [<Trash2 size={14} strokeWidth={2.5} />, "var(--a-delete)"],
};

const SV: Record<string, [string, string]> = {
  info: ["var(--in)", "var(--ins)"],
  success: ["var(--ok)", "var(--oks)"],
  warning: ["var(--wa)", "var(--was)"],
  error: ["var(--er)", "var(--ers)"]
};

const TPL: [string, string, string, string, string, string, number][] = [
  ["CREATE", "CAMPAIGN", "success", "Previewed campaign recipients", "POST", "/v1/admin/campaigns/preview-recipients", 2],
  ["LOGIN", "AUTH", "info", "Logged in successfully", "POST", "/v1/auth/login", 0],
  ["SEND", "MESSAGE", "success", "Sent template message to +917490953955", "POST", "/v1/messages/template", 1],
  ["SEND", "MESSAGE", "warning", "Text message to +918755070003 delayed", "POST", "/v1/messages/text", 1],
  ["UPDATE", "CONTACT", "info", "Updated contact", "PUT", "/v1/admin/contacts/", 3],
  ["CREATE", "TEMPLATE", "success", "Synced templates", "POST", "/v1/admin/templates/sync", 4],
  ["DELETE", "CONTACT", "warning", "Deleted contact", "DELETE", "/v1/admin/contacts/", 3]
];

// Generate dummy data exact same way
const rnd = (s => () => (s = (s * 9301 + 49297) % 233280) / 233280)(7);
const hex = (n: number) => [...Array(n)].map(() => Math.floor(rnd() * 16).toString(16)).join("");

interface LogEntry {
  id: number | string;
  act: string;
  type: string;
  sev: string;
  text: string;
  m: string;
  path: string;
  u: { n: string, e: string, id: string };
  min: number;
  st: number;
  ip: string;
  ms: number;
  changes?: Record<string, any>;
  rawDate?: string;
}

const fetchData = async (params: Record<string, any>): Promise<{ data: LogEntry[], total: number }> => {
  try {
    const res = await axiosInstance.get("/v1/super-admin/activities", { params });

    const rawData = res.data?.data?.data
      ? res.data.data.data
      : res.data?.data?.items
      ? res.data.data.items
      : res.data?.data
      ? res.data.data
      : res.data;

    const rawArray = Array.isArray(rawData) ? rawData : [];

    const total = res.data?.data?.pagination?.total ?? res.data?.data?.total ?? res.data?.total ?? rawArray.length;
    
    const data = rawArray.map((raw: any, i: number) => {
      const ts = raw.created_at || raw.timestamp || new Date().toISOString();
      const diffMs = Date.now() - new Date(ts).getTime();
      const minAgo = Math.max(0, Math.floor(diffMs / 60000));

      const sevStr = (raw.severity || raw.level || raw.status || "info").toString().toLowerCase();
      const mappedSev = sevStr.includes("crit") || sevStr.includes("err") ? "error" :
                        sevStr.includes("warn") ? "warning" :
                        sevStr.includes("succ") ? "success" : "info";

      return {
        id: raw.id || i,
        act: (raw.action || raw.event || "UNKNOWN").toUpperCase(),
        type: (raw.entity_type || raw.type || raw.resource || "SYSTEM").toUpperCase(),
        sev: mappedSev,
        text: raw.description || raw.detail || raw.message || "No description provided",
        m: raw.method || "GET",
        path: raw.path || raw.resource || "",
        u: {
          n: raw.actor_name || raw.user_name || "Unknown User",
          e: raw.actor_email || raw.user_email || raw.actor || raw.user_id || "Unknown Email",
          id: raw.user_id || raw.actor || raw.user || "unknown-id"
        },
        min: minAgo,
        st: raw.status_code || (mappedSev === "error" ? 400 : 200),
        ip: raw.ip || raw.ip_address || "—",
        ms: raw.duration_ms || raw.ms || 0,
        changes: raw.metadata || raw.changes || raw.new_data || {},
        rawDate: ts,
      };
    });

    return { data, total };
  } catch (err) {
    console.error("Failed to fetch audit logs", err);
    return { data: [], total: 0 };
  }
};

const ago = (m: number) => m < 1 ? "just now" : m < 60 ? m + " mins ago" : m < 1440 ? Math.floor(m / 60) + " hrs ago" : Math.floor(m / 1440) + " days ago";
const getDayStr = (m: number) => m < 1440 ? "Today" : m < 2880 ? "Yesterday" : "Earlier";

export default function AuditLogs() {
  const [L, setL] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // States
  const [q, setQ] = useState("");
  const [uFilter, setUFilter] = useState("");
  const [tFilter, setTFilter] = useState("");
  const [aFilter, setAFilter] = useState("");
  const [dFilter, setDFilter] = useState(7);
  const [sevFilter, setSevFilter] = useState("");
  
  const [pg, setPg] = useState(1);
  const [pp, setPp] = useState(25); // Default to 25 as requested
  const [totalItems, setTotalItems] = useState(0);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showRawDiff, setShowRawDiff] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearInput, setClearInput] = useState("");
  const [allUsers, setAllUsers] = useState<{id: string, n: string, e: string}[]>([]);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetchData({
        page: pg,
        limit: pp,
        search: q || undefined,
        user_id: uFilter || undefined,
        type: tFilter || undefined,
        action: aFilter || undefined,
        days: dFilter !== 7 ? dFilter : undefined,
        severity: sevFilter || undefined
      }).then(res => {
        setL(res.data);
        setTotalItems(res.total);
        setLoading(false);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [pg, pp, q, uFilter, tFilter, aFilter, dFilter, sevFilter]);

  useEffect(() => {
    // Fetch users for dropdown
    axiosInstance.get("/v1/super-admin/users", { params: { limit: 100 } }).then(res => {
      const raw = Array.isArray(res.data?.data?.data) ? res.data.data.data : Array.isArray(res.data?.data?.items) ? res.data.data.items : Array.isArray(res.data?.data) ? res.data.data : [];
      setAllUsers(raw.map((u: any) => ({ id: u.id, n: u.name || "Unknown", e: u.email || "" })));
    }).catch(console.error);

    const clickHandler = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.menu')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, []);

  const base = useMemo(() => {
    const qLower = q.toLowerCase();
    return L.filter(l => 
      l.min <= dFilter * 1440 &&
      (!uFilter || l.u.id === uFilter) &&
      (!tFilter || l.type === tFilter) &&
      (!aFilter || l.act === aFilter) &&
      (!qLower || (l.text + l.path + l.u.e + l.u.n).toLowerCase().includes(qLower))
    );
  }, [L, dFilter, uFilter, tFilter, aFilter, q]);

  const counts = useMemo(() => {
    const c = { info: 0, success: 0, warning: 0, error: 0 };
    base.forEach(l => {
      c[l.sev as keyof typeof c]++;
    });
    return c;
  }, [base]);

  const filteredBySev = useMemo(() => {
    return sevFilter ? base.filter(l => l.sev === sevFilter) : base;
  }, [base, sevFilter]);

  const groups = useMemo(() => {
    const out: { k: LogEntry, items: LogEntry[] }[] = [];
    L.forEach(r => {
      const g = out[out.length - 1];
      if (g && g.k.u.id === r.u.id && g.k.act === r.act && g.k.type === r.type && r.act === "UPDATE" && Math.abs(g.k.min - r.min) <= 2) {
        g.items.push(r);
      } else {
        out.push({ k: r, items: [r] });
      }
    });
    return out;
  }, [L]);

  const pages = Math.max(1, Math.ceil(totalItems / pp));
  useEffect(() => { if (pg > pages) setPg(pages); }, [pages, pg]);
  
  // Since we use server-side pagination now, pagedGroups is just groups
  const pagedGroups = groups;

  const pgBtns = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - pg) <= 1) pgBtns.push(i);
    else if (pgBtns[pgBtns.length - 1] !== "…") pgBtns.push("…");
  }

  const exportCSV = () => {
    const b = base.map(l => [l.act, l.type, l.u.e, l.path, ago(l.min)].join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv," + encodeURIComponent("action,type,user,path,time\n" + b);
    a.download = "audit-logs.csv";
    a.click();
  };

  const handleClear = () => {
    setL([]);
    setClearModalOpen(false);
  };

  const uniqueUsers = Array.from(new Set(L.map(l => l.u.id))).map(id => L.find(l => l.u.id === id)!.u);
  const uniqueTypes = [
    "USER", "AUTH", "MESSAGE", "SUBSCRIBE", "CAMPAIGN", "WALLET", "CONTACT", "CHATBOT", "WABA"
  ].map(x => [x, x[0] + x.slice(1).toLowerCase()]);
  const uniqueActions = [
    "LOGIN", "SEND", "UPDATE", "ACTIVATE", "CREATE", "SUSPEND", "SUBSCRIBE", "DELETE"
  ].map(x => [x, x[0] + x.slice(1).toLowerCase()]);

  const renderRow = (l: LogEntry, isChild = false, extra?: React.ReactNode) => {
    const [ic, co] = AC[l.act] || [<HelpCircle size={14} />, "#64748b"];
    return (
      <div 
        key={l.id} 
        className={`row ${isChild ? "child" : ""}`} 
        onClick={(e) => {
          if ((e.target as Element).closest('.grp')) return;
          setSelectedLog(l);
          setShowRawDiff(false);
        }}
      >
        <div className="act">
          <div className="ico" style={{ background: `color-mix(in srgb, ${co} 14%, transparent)`, color: co }}>{ic}</div>
          <div style={{ minWidth: 0 }}>
            <div className="t1">
              <span className="dot" style={{ background: SV[l.sev][0] }} title={l.sev}></span>
              {extra || l.text}
            </div>
          </div>
        </div>
        <div className="usr">
          {(() => {
            const resolvedUser = allUsers.find(u => String(u.id) === String(l.u.id)) || { n: l.u.n, e: l.u.e };
            return (
              <>
                <div className="av">{resolvedUser.n[0]?.toUpperCase() || '?'}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="un">{resolvedUser.n}</div>
                  <div className="ue" title={l.u.id}>{resolvedUser.e}</div>
                </div>
              </>
            );
          })()}
        </div>
        <div>
          <span className="badge" style={{ background: co }}>{l.act[0] + l.act.slice(1).toLowerCase()}</span>
        </div>
        <div className="time" title={l.rawDate ? new Date(l.rawDate).toLocaleString() : new Date(Date.now() - l.min * 60000).toLocaleString()}>
          {ago(l.min)}
        </div>
      </div>
    );
  };

  const metaData: Record<string, [React.ReactNode, string]> = {
    info:    [<Info size={18} strokeWidth={2.5} />, "Info"],
    success: [<CheckCircle2 size={18} strokeWidth={2.5} />, "Success"],
    warning: [<AlertTriangle size={18} strokeWidth={2.5} />, "Warnings"],
    error:   [<XCircle size={18} strokeWidth={2.5} />, "Errors"],
  };

  return (
    <div className="al-page">
      <div className="wrap">
        <div className="head">
          <div>
            <h1>Activity logs</h1>
            <div className="sub">Monitor all system activities and user actions</div>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button className="btn" onClick={exportCSV} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              <Download size={15} strokeWidth={2.5} />
              Export CSV
            </button>
            <div className="menu">
              <button className="btn" onClick={() => setMenuOpen(!menuOpen)} style={{ padding: "9px 12px" }}>
                <MoreHorizontal size={17} strokeWidth={2.5} />
              </button>
              <div className={`pop ${menuOpen ? "open" : ""}`}>
                <button className="red" onClick={() => { setMenuOpen(false); setClearModalOpen(true); }}>Clear logs…</button>
              </div>
            </div>
          </div>
        </div>

        <div className="stats">
          {(["info", "success", "warning", "error"] as const).map(k => (
            <button 
              key={k} 
              className={`stat ${sevFilter === k ? "sel" : ""}`} 
              onClick={() => { setSevFilter(sevFilter === k ? "" : k); setPg(1); }}
            >
              <i style={{ background: SV[k][1], color: SV[k][0] }}>{metaData[k][0]}</i>
              <div>
                <b>{counts[k]}</b>
                <span>{metaData[k][1]}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="bar">
          <input 
            placeholder="Search activity, path or user email…" 
            value={q} 
            onChange={e => { setQ(e.target.value); setPg(1); }} 
          />
          <select value={uFilter} onChange={e => { setUFilter(e.target.value); setPg(1); }}>
            <option value="">All users</option>
            {allUsers.map(u => <option key={u.id} value={u.id}>{u.n} ({u.e})</option>)}
          </select>
          <select value={tFilter} onChange={e => { setTFilter(e.target.value); setPg(1); }}>
            <option value="">All types</option>
            {uniqueTypes.map(t => <option key={t[0]} value={t[0]}>{t[1]}</option>)}
          </select>
          <select value={aFilter} onChange={e => { setAFilter(e.target.value); setPg(1); }}>
            <option value="">All actions</option>
            {uniqueActions.map(a => <option key={a[0]} value={a[0]}>{a[1]}</option>)}
          </select>
          <select value={dFilter} onChange={e => { setDFilter(Number(e.target.value)); setPg(1); }}>
            <option value={7}>Last 7 days</option>
            <option value={1}>Last 24 hours</option>
            <option value={30}>Last 30 days</option>
          </select>
          <button 
            className="reset" 
            onClick={() => { setQ(""); setUFilter(""); setTFilter(""); setAFilter(""); setDFilter(7); setSevFilter(""); setPg(1); }}
          >
            Reset
          </button>
        </div>

        <div className="tbl">
          <div className="scroll">
            <div className="th">
              <div>Activity</div>
              <div>User</div>
              <div>Action</div>
              <div style={{ textAlign: "right" }}>Time</div>
            </div>
            <div className="tbl-body">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <div className="row" key={i}>
                    <div className="sk" /><div className="sk" /><div className="sk" /><div className="sk" />
                  </div>
                ))
              ) : pagedGroups.length === 0 ? (
                <div className="empty">
                  <b>No activity matches these filters</b><br/>
                  Try a wider date range or reset the filters.
                </div>
              ) : (
                pagedGroups.map((g, gi) => {
                  const dStr = getDayStr(g.k.min);
                  const prevDStr = gi > 0 ? getDayStr(pagedGroups[gi - 1].k.min) : null;
                  const isGroup = g.items.length > 1;
                  const isOpen = openGroups[g.k.id];

                  return (
                    <div key={g.k.id} className="row-group">
                      {dStr !== prevDStr && <div className="day">{dStr}</div>}
                      {renderRow(
                        g.k, 
                        false, 
                        isGroup ? (
                          <>
                            Updated {g.items.length} contacts
                            <button 
                              className="grp" 
                              style={{ marginLeft: 8 }}
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setOpenGroups(p => ({ ...p, [g.k.id]: !p[g.k.id] })); 
                              }}
                            >
                              {isOpen ? "Hide" : "Show all"}
                            </button>
                          </>
                        ) : undefined
                      )}
                      {isGroup && isOpen && g.items.map(i => renderRow(i, true))}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="foot">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div>
              Rows per page <select className="ib" style={{ padding: "4px 8px", marginLeft: "4px", outline: "none", border: "none", background: "transparent", fontWeight: 500 }} value={pp} onChange={e => { setPp(Number(e.target.value)); setPg(1); }}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div>
              Showing <b>{Math.min((pg - 1) * pp + 1, totalItems)}-{Math.min(pg * pp, totalItems)}</b> of <b>{totalItems}</b> activities
            </div>
          </div>
          <div className="pg">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginRight: "16px" }}>
              Go to page <input type="number" min={1} max={pages} className="ib" style={{ width: "50px", padding: "4px 8px", outline: "none" }} onKeyDown={e => {
                if (e.key === "Enter") {
                  let v = Number((e.target as HTMLInputElement).value);
                  if (v >= 1 && v <= pages) setPg(v);
                }
              }} />
            </div>
            <button className="text-btn" disabled={pg <= 1} onClick={() => setPg(pg - 1)}>‹ Prev</button>
            {pgBtns.map((p, i) => (
              p === "…" ? <span key={`ell-${i}`}>…</span> : 
              <button key={p} className={`num-btn ${p === pg ? "on" : ""}`} onClick={() => setPg(p as number)}>{p}</button>
            ))}
            <button className="text-btn" disabled={pg >= pages} onClick={() => setPg(pg + 1)}>Next ›</button>
          </div>
        </div>
      </div>

      <div className={`ov ${selectedLog || clearModalOpen ? "open" : ""}`} onClick={() => { setSelectedLog(null); setClearModalOpen(false); }} />
      
      <aside className={`dr ${selectedLog ? "open" : ""}`}>
        {selectedLog && (() => {
          const l = selectedLog;
          const [ic, co] = AC[l.act] || [<HelpCircle size={15} />, "#64748b"];
          const resolvedUser = allUsers.find(u => String(u.id) === String(l.u.id)) || { n: l.u.n, e: l.u.e };
          const formattedDate = l.rawDate 
            ? new Date(l.rawDate).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" })
            : new Date(Date.now() - l.min * 60000).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" });

          return (
            <div className="dr-inner">
              {/* Header */}
              <div className="dr-head">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="badge" style={{ background: co }}>{l.act}</span>
                  <span className="dr-type-tag">{l.type}</span>
                </div>
                <button className="dr-close-btn" onClick={() => setSelectedLog(null)} aria-label="Close">
                  <X size={18} strokeWidth={2.2} />
                </button>
              </div>

              {/* Title & Date */}
              <div className="dr-summary">
                <h3 className="dr-title">{l.text}</h3>
                <div className="dr-sub">
                  <Clock size={13} strokeWidth={2} />
                  <span>{formattedDate}</span>
                  <span className="dr-ago">({ago(l.min)})</span>
                </div>
              </div>

              {/* Actor Card */}
              <div className="dr-card">
                <div className="dr-card-title">User Information</div>
                <div className="dr-user-info">
                  <div className="av dr-user-av">
                    {resolvedUser.n[0]?.toUpperCase() || "U"}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="dr-user-name">{resolvedUser.n}</div>
                    <div className="dr-user-email">{resolvedUser.e}</div>
                  </div>
                </div>
                {l.u.id && (
                  <div className="dr-id-box">
                    <span className="dr-id-lbl">User ID</span>
                    <code className="dr-id-val">{l.u.id}</code>
                    <button 
                      className="dr-copy-btn" 
                      onClick={() => {
                        navigator.clipboard.writeText(l.u.id);
                        setCopiedId(true);
                        setTimeout(() => setCopiedId(false), 2000);
                      }}
                      title="Copy ID"
                    >
                      {copiedId ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={2} />}
                      <span>{copiedId ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Execution Details Card */}
              <div className="dr-card">
                <div className="dr-card-title">Event Details</div>
                <div className="dr-detail-rows">
                  <div className="dr-detail-row">
                    <span className="dr-detail-lbl">Status</span>
                    <span className={`dr-status-pill ${l.st >= 200 && l.st < 300 ? "ok" : l.st >= 400 ? "err" : "info"}`}>
                      {l.st}
                    </span>
                  </div>

                  <div className="dr-detail-row">
                    <span className="dr-detail-lbl">Severity</span>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span className="dot" style={{ background: SV[l.sev]?.[0] || "var(--in)" }} />
                      <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{l.sev}</span>
                    </div>
                  </div>

                  {l.path && (
                    <div className="dr-detail-row">
                      <span className="dr-detail-lbl">Endpoint</span>
                      <div className="dr-path-box">
                        <span className="dr-method-pill">{l.m || "POST"}</span>
                        <code className="dr-path-text">{l.path}</code>
                      </div>
                    </div>
                  )}

                  <div className="dr-detail-row">
                    <span className="dr-detail-lbl">Duration</span>
                    <span className="dr-detail-val">{l.ms} ms</span>
                  </div>

                  <div className="dr-detail-row">
                    <span className="dr-detail-lbl">IP Address</span>
                    <span className="dr-detail-val">{l.ip === "ÔÇö" || !l.ip ? "—" : l.ip}</span>
                  </div>
                </div>
              </div>

              {/* Changes section if UPDATE */}
              {l.act === "UPDATE" && (
                <div style={{ marginTop: 20 }}>
                  <div className="dr-card-title" style={{ marginBottom: 10 }}>Field Changes</div>
                  
                  <div className="diff-card">
                    <div className="diff-card-title">STATUS</div>
                    <div className="diff-cols">
                      <div className="diff-box old">
                        <div className="diff-lbl">BEFORE</div>
                        <div className="diff-val">inactive</div>
                      </div>
                      <div className="diff-arr">→</div>
                      <div className="diff-box new">
                        <div className="diff-lbl">AFTER</div>
                        <div className="diff-val">active</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="diff-card">
                    <div className="diff-card-title">TAGS</div>
                    <div className="diff-cols">
                      <div className="diff-box old">
                        <div className="diff-lbl">BEFORE</div>
                        <div className="diff-val diff-empty">empty</div>
                      </div>
                      <div className="diff-arr">→</div>
                      <div className="diff-box new">
                        <div className="diff-lbl">AFTER</div>
                        <div className="diff-val">vip</div>
                      </div>
                    </div>
                  </div>
                  
                  <button className="diff-tog" onClick={() => setShowRawDiff(!showRawDiff)}>
                    {showRawDiff ? <ChevronDown size={14} strokeWidth={2.5} /> : <ChevronRight size={14} strokeWidth={2.5} />}
                    View raw diff
                  </button>

                  {showRawDiff && (
                    <pre className="diff">
                      <span className="o">- status: "inactive"</span>{"\n"}
                      <span className="n">+ status: "active"</span>{"\n"}
                      <span className="o">- tags: []</span>{"\n"}
                      <span className="n">+ tags: ["vip"]</span>
                    </pre>
                  )}
                </div>
              )}
            </div>
          );
        })()}
      </aside>

      <div className={`modal ${clearModalOpen ? "open" : ""}`}>
        <h3 style={{ margin: "0 0 8px" }}>Clear all logs?</h3>
        <div className="sub">This permanently deletes all events and can't be undone. Type <b>CLEAR</b> to confirm.</div>
        <input 
          placeholder="CLEAR" 
          value={clearInput}
          onChange={e => setClearInput(e.target.value)}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button className="btn" onClick={() => setClearModalOpen(false)}>Cancel</button>
          <button className="btn dg" disabled={clearInput !== "CLEAR"} onClick={handleClear}>Clear logs</button>
        </div>
      </div>
    </div>
  );
}

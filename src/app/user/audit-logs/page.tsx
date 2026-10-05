"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import "./audit-logs.css";

const U = [
  { n: "Rupesh Giri", e: "rupesh@soft7.in", id: "ccc9d3d5-4e2a-41b0-9c1f-8a77d2c8" },
  { n: "Priya Sharma", e: "priya@acme.co", id: "ae6ff5f9-1b3c-4d2e-8f90-6a4d" },
  { n: "Admin", e: "admin@soft7.in", id: "e0b6333a-77c1-4a5b-b3d2-067b" },
  { n: "Aman Verma", e: "aman@zenith.io", id: "1e8c0729-5d4f-4e6a-a1c3-fed1" },
  { n: "Neha Singh", e: "neha@bright.in", id: "b673e9ea-2c9d-4f10-8e5a-078e" }
];

const AC: Record<string, [string, string]> = {
  CREATE: ["+", "var(--a-create)"],
  UPDATE: ["✎", "var(--a-update)"],
  LOGIN: ["→", "var(--a-login)"],
  SEND: ["➤", "var(--a-send)"],
  DELETE: ["×", "var(--a-delete)"]
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
  id: number;
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
}

const generateData = () => {
  let L: LogEntry[] = [];
  let t = 1;
  for (let i = 0; i < 120; i++) {
    const burst = i >= 8 && i < 60;
    const k = burst ? (i % 6 < 4 ? 4 : 5) : Math.floor(rnd() * 4);
    const T = TPL[k];
    const u = U[T[6]];
    t += burst ? (i % 12 === 0 ? 9 : 0) : Math.floor(rnd() * 6) + 1;
    const p = T[5].endsWith("/") ? T[5] + hex(8) + "-" + hex(4) + "-" + hex(4) + "-" + hex(12) : T[5];
    
    L.push({
      id: i, act: T[0], type: T[1], sev: T[2], text: T[3], m: T[4], path: p, u, min: t,
      st: T[2] === "warning" ? 429 : 200,
      ip: "49.36." + Math.floor(rnd() * 255) + "." + Math.floor(rnd() * 255),
      ms: Math.floor(rnd() * 400) + 40
    });
  }
  L.push({ id: 200, act: "UPDATE", type: "CONTACT", sev: "info", text: "Updated contact", m: "PUT", path: "/v1/admin/contacts/old", u: U[3], min: 60 * 30, st: 200, ip: "49.36.1.9", ms: 90 });
  return L;
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
  const [pp, setPp] = useState(10);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showRawDiff, setShowRawDiff] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearInput, setClearInput] = useState("");

  useEffect(() => {
    // simulate load
    setTimeout(() => {
      setL(generateData());
      setLoading(false);
    }, 500);
    
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
    filteredBySev.forEach(r => {
      const g = out[out.length - 1];
      if (g && g.k.u.id === r.u.id && g.k.act === r.act && g.k.type === r.type && r.act === "UPDATE" && Math.abs(g.k.min - r.min) <= 2) {
        g.items.push(r);
      } else {
        out.push({ k: r, items: [r] });
      }
    });
    return out;
  }, [filteredBySev]);

  const pages = Math.max(1, Math.ceil(groups.length / pp));
  useEffect(() => { if (pg > pages) setPg(pages); }, [pages, pg]);
  
  const pagedGroups = groups.slice((pg - 1) * pp, pg * pp);

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
  const uniqueTypes = Array.from(new Set(L.map(l => l.type))).map(x => [x, x[0] + x.slice(1).toLowerCase()]);
  const uniqueActions = Object.keys(AC).map(x => [x, x[0] + x.slice(1).toLowerCase()]);

  const renderRow = (l: LogEntry, isChild = false, extra?: React.ReactNode) => {
    const [ic, co] = AC[l.act] || ["?", "#000"];
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
          <div className="av">{l.u.n[0]}</div>
          <div style={{ minWidth: 0 }}>
            <div className="un">{l.u.n}</div>
            <div className="ue" title={l.u.id}>{l.u.e}</div>
          </div>
        </div>
        <div>
          <span className="badge" style={{ background: co }}>{l.act[0] + l.act.slice(1).toLowerCase()}</span>
        </div>
        <div className="time" title={new Date(Date.now() - l.min * 60000).toLocaleString()}>
          {ago(l.min)}
        </div>
      </div>
    );
  };

  const metaData: Record<string, [string, string]> = {
    info: ["i", "Info"],
    success: ["✓", "Success"],
    warning: ["!", "Warnings"],
    error: ["!", "Errors"]
  };

  return (
    <div className="al-page">
      <div className="wrap">
        <div className="head">
          <div>
            <h1>Activity logs</h1>
            <div className="sub">Monitor all system activities and user actions</div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn" onClick={exportCSV}>Export CSV</button>
            <div className="menu">
              <button className="btn" onClick={() => setMenuOpen(!menuOpen)}>⋯</button>
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
            {uniqueUsers.map(u => <option key={u.id} value={u.id}>{u.n}</option>)}
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
            <div>
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
                    <div key={g.k.id}>
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
              Showing <b>{Math.min((pg - 1) * pp + 1, filteredBySev.length)}-{Math.min(pg * pp, filteredBySev.length)}</b> of <b>{filteredBySev.length}</b> activities
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
          const [ic, co] = AC[l.act] || ["?", "#000"];
          return (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="badge" style={{ background: co }}>{l.act}</span>
                <button className="btn" onClick={() => setSelectedLog(null)}>Close</button>
              </div>
              <h3 style={{ margin: "16px 0 4px" }}>{l.text}</h3>
              <div className="sub">{new Date(Date.now() - l.min * 60000).toLocaleString()}</div>
              
              <div className="kv">
                <span>User</span><div>{l.u.n} · {l.u.e}</div>
                <span>User ID</span>
                <div>
                  <code>{l.u.id}</code> 
                  <button className="reset" onClick={() => navigator.clipboard.writeText(l.u.id)}>Copy</button>
                </div>
                <span>Type</span><div>{l.type}</div>
                <span>Severity</span>
                <div><span className="dot" style={{ background: SV[l.sev][0], display: "inline-block" }} /> {l.sev}</div>
                <span>Status</span><div>{l.st}</div>
                <span>Duration</span><div>{l.ms} ms</div>
                <span>IP address</span><div>{l.ip}</div>
              </div>
              
              {l.act === "UPDATE" && (
                <div style={{ marginTop: 24 }}>
                  <b style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    Changes <span style={{ fontSize: 11, color: "var(--mu)", fontWeight: 500 }}>2 fields</span>
                  </b>
                  
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
                    <span style={{ fontSize: 10 }}>{showRawDiff ? "▼" : "▶"}</span> View raw diff
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
            </>
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

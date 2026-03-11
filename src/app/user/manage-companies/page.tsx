"use client";

import { useState } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg:      "#080A12",
  surf:    "#0F1120",
  surf2:   "#171929",
  border:  "rgba(255,255,255,0.07)",
  accent:  "#6C5CE7",
  accent2: "#A29BFE",
  text:    "#E2E4F0",
  muted:   "#565875",
  success: "#00CBA4",
  danger:  "#FF6B6B",
  warn:    "#FDCB6E",
} as const;

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Status = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "TRIAL";
type Plan   = "Starter" | "Basic" | "Pro" | "Enterprise";

interface Company {
  id:     number;
  name:   string;
  domain: string;
  logo:   string;
  col:    string;
  status: Status;
  plan:   Plan;
  users:  number;
  mrr:    number;
  end:    string;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const COMPANIES: Company[] = [
  { id:1, name:"Acme Corp",       domain:"acme.com",           logo:"AC", col:"#6C5CE7", status:"ACTIVE",    plan:"Enterprise", users:320, mrr:7999, end:"Dec 31, 2026" },
  { id:2, name:"Nexus Ltd",       domain:"nexusltd.io",        logo:"NX", col:"#FDCB6E", status:"ACTIVE",    plan:"Pro",        users:148, mrr:2499, end:"Jun 30, 2026" },
  { id:3, name:"SkyLine Inc",     domain:"skyline.co",         logo:"SK", col:"#00CBA4", status:"TRIAL",     plan:"Starter",    users:42,  mrr:0,    end:"Mar 15, 2026" },
  { id:4, name:"Vertex Co",       domain:"vertexco.com",       logo:"VT", col:"#FF6B6B", status:"INACTIVE",  plan:"Basic",      users:87,  mrr:999,  end:"Dec 1, 2025"  },
  { id:5, name:"Zenith Group",    domain:"zenithgroup.net",    logo:"ZN", col:"#A29BFE", status:"ACTIVE",    plan:"Enterprise", users:510, mrr:7999, end:"Jan 31, 2027" },
  { id:6, name:"Orbit Systems",   domain:"orbitsys.tech",      logo:"OS", col:"#FD79A8", status:"SUSPENDED", plan:"Starter",    users:23,  mrr:0,    end:"Nov 1, 2025"  },
  { id:7, name:"Prism Analytics", domain:"prismanalytics.com", logo:"PA", col:"#00B894", status:"ACTIVE",    plan:"Pro",        users:195, mrr:2499, end:"Sep 15, 2026" },
  { id:8, name:"Delta Forge",     domain:"deltaforge.io",      logo:"DF", col:"#E17055", status:"ACTIVE",    plan:"Basic",      users:67,  mrr:999,  end:"Jul 20, 2026" },
];

const PLAN_COLOR: Record<Plan, string> = {
  Enterprise: "#A29BFE",
  Pro:        "#6C5CE7",
  Basic:      "#FDCB6E",
  Starter:    "#00CBA4",
};

const STATUS_MAP: Record<Status, [string, string]> = {
  ACTIVE:    ["#00CBA4", "rgba(0,203,164,0.12)"],
  INACTIVE:  ["#565875", "rgba(86,88,117,0.18)"],
  SUSPENDED: ["#FF6B6B", "rgba(255,107,107,0.12)"],
  TRIAL:     ["#A29BFE", "rgba(162,155,254,0.14)"],
};

// ─── BADGE ────────────────────────────────────────────────────────────────────
function Badge({ status }: { status: Status }) {
  const [color, bg] = STATUS_MAP[status];
  return (
    <span style={{ background: bg, color, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {status[0] + status.slice(1).toLowerCase()}
    </span>
  );
}

// ─── BUTTON ───────────────────────────────────────────────────────────────────
type BtnVariant = "primary" | "ghost" | "danger";

function Btn({ children, onClick, variant = "primary", small }: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  variant?: BtnVariant;
  small?: boolean;
}) {
  const variantStyle: Record<BtnVariant, React.CSSProperties> = {
    primary: { background: `linear-gradient(135deg,${T.accent},${T.accent2})`, color: "#fff", border: "none" },
    ghost:   { background: T.surf2, color: T.muted, border: `1px solid ${T.border}` },
    danger:  { background: "rgba(255,107,107,0.08)", color: T.danger, border: "1px solid rgba(255,107,107,0.25)" },
  };
  return (
    <button
      onClick={onClick}
      style={{ ...variantStyle[variant], padding: small ? "5px 12px" : "9px 18px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: small ? 11 : 12, fontWeight: 600, whiteSpace: "nowrap", transition: "opacity 0.15s" }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
    >
      {children}
    </button>
  );
}

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
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

// ─── INPUT ────────────────────────────────────────────────────────────────────
function Inp({ label, placeholder, type = "text", defaultValue }: {
  label?: string; placeholder: string; type?: string; defaultValue?: string;
}) {
  return (
    <div>
      {label && <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: "0.07em", marginBottom: 5 }}>{label}</div>}
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        style={{ width: "100%", background: T.surf2, border: `1px solid ${T.border}`, color: T.text, padding: "9px 12px", borderRadius: 9, fontSize: 12, outline: "none", fontFamily: "inherit" }}
        onFocus={e => (e.target.style.borderColor = T.accent)}
        onBlur={e  => (e.target.style.borderColor = T.border)}
      />
    </div>
  );
}

// ─── ADD / EDIT MODAL ─────────────────────────────────────────────────────────
function CompanyModal({ company, onClose }: { company: Company | null; onClose: () => void }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400, backdropFilter: "blur(5px)" }}
      onClick={onClose}
    >
      <div
        style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 18, padding: "28px 30px", width: 440, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{company ? "Edit Company" : "Add New Company"}</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{company ? `Editing ${company.name}` : "Fill in the details below."}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <Inp label="COMPANY NAME"  placeholder="e.g. Acme Corp"         defaultValue={company?.name} />
          <Inp label="DOMAIN"        placeholder="e.g. acme.com"           defaultValue={company?.domain} />
          <Inp label="ADMIN EMAIL"   placeholder="admin@company.com"       type="email" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
            <div>
              <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: "0.07em", marginBottom: 5 }}>STATUS</div>
              <select defaultValue={company?.status ?? "ACTIVE"} style={{ width: "100%", background: T.surf2, border: `1px solid ${T.border}`, color: T.text, padding: "9px 12px", borderRadius: 9, fontSize: 12, outline: "none", fontFamily: "inherit" }}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="TRIAL">Trial</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: "0.07em", marginBottom: 5 }}>PLAN</div>
              <select defaultValue={company?.plan ?? "Starter"} style={{ width: "100%", background: T.surf2, border: `1px solid ${T.border}`, color: T.text, padding: "9px 12px", borderRadius: 9, fontSize: 12, outline: "none", fontFamily: "inherit" }}>
                <option>Starter</option>
                <option>Basic</option>
                <option>Pro</option>
                <option>Enterprise</option>
              </select>
            </div>
          </div>

          <div style={{ height: 1, background: T.border }} />

          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={onClose}>{company ? "Save Changes" : "Create Company"}</Btn>
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── VIEW / DETAIL MODAL ──────────────────────────────────────────────────────
function CompanyDetailModal({ company, onClose, onEdit }: {
  company: Company;
  onClose: () => void;
  onEdit: (c: Company) => void;
}) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400, backdropFilter: "blur(5px)" }}
      onClick={onClose}
    >
      <div
        style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 18, padding: "28px 30px", width: 480, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: company.col, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "#fff", boxShadow: `0 6px 20px ${company.col}60`, flexShrink: 0 }}>
              {company.logo}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>{company.name}</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{company.domain}</div>
              <div style={{ marginTop: 6 }}><Badge status={company.status} /></div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ height: 1, background: T.border, marginBottom: 18 }} />

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
          {([
            ["Plan",            company.plan,                                                  PLAN_COLOR[company.plan]],
            ["Monthly Revenue", company.mrr > 0 ? `₹${company.mrr.toLocaleString()}` : "Free", T.success],
            ["Total Users",     String(company.users),                                          T.accent2],
            ["Renewal Date",    company.end,                                                    T.warn],
          ] as [string, string, string][]).map(([l, v, c]) => (
            <div key={l} style={{ background: T.surf2, borderRadius: 10, padding: "12px 14px", border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: "0.07em", marginBottom: 5 }}>{l.toUpperCase()}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: c }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div style={{ background: "rgba(108,92,231,0.06)", border: "1px solid rgba(108,92,231,0.15)", borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: T.accent2, fontWeight: 700, marginBottom: 10, letterSpacing: "0.05em" }}>QUICK STATS</div>
          <div style={{ display: "flex", gap: 20 }}>
            {([ ["Messages","84.2K"], ["Campaigns","12"], ["Chatbots","3"], ["Flows","18"] ] as [string,string][]).map(([l, v]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{v}</div>
                <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={() => { onClose(); onEdit(company); }}>✏️ Edit Company</Btn>
          <Btn variant="ghost" onClick={onClose}>Close</Btn>
          {company.status !== "SUSPENDED"
            ? <Btn variant="danger" onClick={onClose}>⛔ Suspend</Btn>
            : <Btn variant="ghost"  onClick={onClose}>✅ Restore</Btn>
          }
        </div>
      </div>
    </div>
  );
}

// ─── COMPANY CARD ─────────────────────────────────────────────────────────────
function CompanyCard({ company, onEdit, onView }: {
  company: Company;
  onEdit: (c: Company) => void;
  onView: (c: Company) => void;
}) {
  return (
    <div
      style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 15, padding: "18px", transition: "all 0.18s", cursor: "pointer" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(108,92,231,0.45)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(108,92,231,0.1)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: company.col, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#fff", flexShrink: 0, boxShadow: `0 4px 14px ${company.col}50` }}>
            {company.logo}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 2 }}>{company.name}</div>
            <div style={{ fontSize: 10, color: T.muted }}>{company.domain}</div>
          </div>
        </div>
        <Badge status={company.status} />
      </div>

      <div style={{ height: 1, background: T.border, marginBottom: 12 }} />

      {/* Metrics grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 13 }}>
        {([
          ["USERS",  String(company.users),                                          "👥"],
          ["MRR",    company.mrr > 0 ? `₹${company.mrr.toLocaleString()}` : "Free", "💰"],
          ["PLAN",   company.plan,                                                   "📦"],
          ["RENEWS", company.end,                                                    "📅"],
        ] as [string, string, string][]).map(([label, value, icon]) => (
          <div key={label} style={{ background: T.surf2, borderRadius: 9, padding: "8px 10px", border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: "0.07em", marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}>
              {icon} {label}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: label === "PLAN" ? PLAN_COLOR[company.plan] : T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 6 }}>
        <Btn variant="ghost" small onClick={e => { e.stopPropagation(); onEdit(company); }}>✏️ Edit</Btn>
        <Btn variant="ghost" small onClick={e => { e.stopPropagation(); onView(company); }}>👁 View</Btn>
        {company.status !== "SUSPENDED"
          ? <Btn variant="danger" small onClick={e => e.stopPropagation()}>⛔ Suspend</Btn>
          : <Btn variant="ghost"  small onClick={e => e.stopPropagation()}>✅ Restore</Btn>
        }
      </div>
    </div>
  );
}

// ─── PAGE COMPONENT ───────────────────────────────────────────────────────────
export default function ManageCompanies() {
  const [search,     setSearch]     = useState<string>("");
  const [filter,     setFilter]     = useState<string>("ALL");
  const [showModal,  setShowModal]  = useState<boolean>(false);
  const [editTarget, setEditTarget] = useState<Company | null>(null);
  const [viewTarget, setViewTarget] = useState<Company | null>(null);

  const filtered = COMPANIES.filter(c =>
    (filter === "ALL" || c.status === filter) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.domain.includes(search.toLowerCase()))
  );

  const openAdd  = ()            => { setEditTarget(null); setShowModal(true); };
  const openEdit = (c: Company)  => { setEditTarget(c);    setShowModal(true); };
  const openView = (c: Company)  => setViewTarget(c);

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: T.bg, minHeight: "100vh", padding: "28px 32px", color: T.text }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #222440; border-radius: 4px; }
        ::placeholder { color: #3A3D5C; }
        button, input, select { font-family: inherit; }
        select option { background: #171929; }
      `}</style>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Manage Companies</h1>
          <p style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>All registered companies and their subscription health.</p>
        </div>
        <Btn onClick={openAdd}>+ Add Company</Btn>
      </div>

      {/* KPI ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <KPI label="Total Companies" value="248" delta="12% vs last month" icon="🏢" color={T.accent}  />
        <KPI label="Active"          value="198" delta="5 new this week"   icon="✅" color={T.success} />
        <KPI label="Suspended"       value="18"  delta="2 this month"      icon="⛔" color={T.danger}  up={false} />
        <KPI label="On Trial"        value="31"  delta="8 expiring soon"   icon="⏳" color={T.warn}    />
      </div>

      {/* FILTER BAR */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: T.muted, fontSize: 14, pointerEvents: "none" }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or domain…"
            style={{ width: "100%", background: T.surf, border: `1px solid ${T.border}`, color: T.text, padding: "9px 14px 9px 35px", borderRadius: 10, fontSize: 12, outline: "none" }}
            onFocus={e => (e.target.style.borderColor = T.accent)}
            onBlur={e  => (e.target.style.borderColor = T.border)}
          />
        </div>

        <div style={{ display: "flex", background: T.surf, border: `1px solid ${T.border}`, borderRadius: 10, padding: 4, gap: 3 }}>
          {["ALL", "ACTIVE", "TRIAL", "SUSPENDED", "INACTIVE"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ background: filter === f ? T.surf2 : "transparent", border: `1px solid ${filter === f ? "rgba(108,92,231,0.35)" : "transparent"}`, color: filter === f ? T.accent2 : T.muted, padding: "5px 12px", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: filter === f ? 700 : 400, transition: "all 0.12s" }}
            >
              {f === "ALL" ? "All" : f[0] + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <span style={{ fontSize: 11, color: T.muted }}>{filtered.length} companies</span>
      </div>

      {/* GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(272px,1fr))", gap: 14 }}>
        {filtered.map(c => (
          <CompanyCard key={c.id} company={c} onEdit={openEdit} onView={openView} />
        ))}
      </div>

      {/* MODALS */}
      {showModal && (
        <CompanyModal company={editTarget} onClose={() => setShowModal(false)} />
      )}
      {viewTarget && (
        <CompanyDetailModal
          company={viewTarget}
          onClose={() => setViewTarget(null)}
          onEdit={c => { setViewTarget(null); openEdit(c); }}
        />
      )}
    </div>
  );
}
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
type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
type UserRole   = "Admin" |"User";
type UserPlan   = "Starter" | "Basic" | "Pro" | "Enterprise";

interface User {
  id:        number;
  name:      string;
  email:     string;
  phone:     string;
  role:      UserRole;
  status:    UserStatus;
  company:   string;
  plan:      UserPlan;
  av:        string;   // avatar color
  login:     string;   // last login label
  joined:    string;
  msgs:      number;
  campaigns: number;
  chatbots:  number;
  pro:       boolean;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const USERS: User[] = [
  { id:1,  name:"James Doe",     email:"james@acmecorp.com",        phone:"+91 98765 00001", role:"Admin",   status:"ACTIVE",    company:"Acme Corp",       plan:"Enterprise", av:"#6C5CE7", login:"2 mins ago",   joined:"Jan 12, 2024", msgs:1240, campaigns:18, chatbots:5, pro:true  },
  {id:8,name:"Emma Wilson",email:"emma@orbitsys.tech",role:"User",status:"SUSPENDED",company:"Orbit Systems",plan:"Starter",av:"#FD79A8",login:"2 months ago",msgs:4,campaigns:0,chatbots:0,pro:false,phone:"+91 98765 00008",joined:"Jun 1, 2024"}, 
];

// ─── LOOKUP MAPS ──────────────────────────────────────────────────────────────
const STATUS_MAP: Record<UserStatus, [string, string]> = {
  ACTIVE:    ["#00CBA4", "rgba(0,203,164,0.12)"],
  INACTIVE:  ["#565875", "rgba(86,88,117,0.18)"],
  SUSPENDED: ["#FF6B6B", "rgba(255,107,107,0.12)"],
  PENDING:   ["#FDCB6E", "rgba(253,203,110,0.12)"],
};

const ROLE_COLOR: Record<UserRole, string> = {
  Admin:   "#A29BFE",
  User:    "#475569",
};

const PLAN_COLOR: Record<UserPlan, string> = {
  Enterprise: "#A29BFE",
  Pro:        "#6C5CE7",
  Basic:      "#FDCB6E",
  Starter:    "#00CBA4",
};

// ─── BADGE ────────────────────────────────────────────────────────────────────
function Badge({ status }: { status: UserStatus }) {
  const [color, bg] = STATUS_MAP[status];
  const label = status === "PENDING" ? "Pending" : status[0] + status.slice(1).toLowerCase();
  return (
    <span style={{ background: bg, color, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {label}
    </span>
  );
}

// ─── BUTTON ───────────────────────────────────────────────────────────────────
type BtnVariant = "primary" | "ghost" | "danger" | "success";

function Btn({ children, onClick, variant = "primary", small }: {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  variant?: BtnVariant;
  small?: boolean;
}) {
  const styles: Record<BtnVariant, React.CSSProperties> = {
    primary: { background: `linear-gradient(135deg,${T.accent},${T.accent2})`, color: "#fff",     border: "none" },
    ghost:   { background: T.surf2,                                             color: T.muted,    border: `1px solid ${T.border}` },
    danger:  { background: "rgba(255,107,107,0.08)",                            color: T.danger,   border: "1px solid rgba(255,107,107,0.25)" },
    success: { background: "rgba(0,203,164,0.10)",                              color: T.success,  border: "1px solid rgba(0,203,164,0.25)" },
  };
  return (
    <button
      onClick={onClick}
      style={{ ...styles[variant], padding: small ? "5px 12px" : "9px 18px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: small ? 11 : 12, fontWeight: 600, whiteSpace: "nowrap", transition: "opacity 0.15s", width: "100%" }}
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

// ─── AVATAR ───────────────────────────────────────────────────────────────────
function Avatar({ name, color, size = 36 }: { name: string; color: string; size?: number }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.3, color: "#fff", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// ─── DETAIL PANEL ─────────────────────────────────────────────────────────────
function DetailPanel({ user, onClose }: { user: User; onClose: () => void }) {
  const [tab, setTab] = useState<"info" | "stats">("info");

  return (
    <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", position: "sticky", top: 0, maxHeight: "calc(100vh - 220px)", display: "flex", flexDirection: "column" }}>

      {/* Panel header */}
      <div style={{ background: T.surf2, padding: "14px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>User Details</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
      </div>

      <div style={{ overflowY: "auto", flex: 1, padding: "18px" }}>

        {/* Avatar + identity */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: 10 }}>
            <Avatar name={user.name} color={user.av} size={62} />
            <div style={{ position: "absolute", bottom: 2, right: 2, width: 14, height: 14, borderRadius: "50%", background: user.status === "ACTIVE" ? T.success : user.status === "SUSPENDED" ? T.danger : T.muted, border: `2px solid ${T.surf}` }} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", marginBottom: 3 }}>{user.name}</div>
          <div style={{ fontSize: 11, color: T.muted, marginBottom: 10 }}>{user.email}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
            <Badge status={user.status} />
            <span style={{ background: `${ROLE_COLOR[user.role]}18`, color: ROLE_COLOR[user.role], fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{user.role}</span>
            {user.pro && (
              <span style={{ background: "rgba(253,203,110,0.15)", color: T.warn, fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20 }}>⭐ PRO</span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 3, background: T.surf2, borderRadius: 9, padding: 3, marginBottom: 16 }}>
          {([["info", "📋 Info"], ["stats", "📊 Stats"]] as [string, string][]).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k as "info" | "stats")}
              style={{ flex: 1, padding: "6px 0", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 11, fontWeight: tab === k ? 700 : 400, background: tab === k ? T.surf3 : "transparent", color: tab === k ? T.accent2 : T.muted, fontFamily: "inherit" }}>
              {l}
            </button>
          ))}
        </div>

        {/* Info tab */}
        {tab === "info" && (
          <div>
            {([
              ["Company",    user.company],
              ["Plan",       user.plan],
              ["Phone",      user.phone],
              ["Joined",     user.joined],
              ["Last Login", user.login],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 11, color: T.muted }}>{label}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: label === "Plan" ? (PLAN_COLOR[value as UserPlan] || T.text) : T.text }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Stats tab */}
        {tab === "stats" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            {([
              ["Messages",  user.msgs.toLocaleString(),            T.accent2],
              ["Campaigns", String(user.campaigns),                T.success],
              ["Chatbots",  String(user.chatbots),                 T.warn],
              ["Flows",     String(Math.floor(user.msgs / 80)),    T.info],
            ] as [string, string, string][]).map(([label, value, color]) => (
              <div key={label} style={{ background: T.surf2, borderRadius: 10, padding: "12px 10px", border: `1px solid ${T.border}`, textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color, marginBottom: 3 }}>{value}</div>
                <div style={{ fontSize: 10, color: T.muted }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 18 }}>
          <Btn>✏️ Edit User</Btn>
          <Btn variant="ghost">🔑 Reset Password</Btn>
          {user.status === "SUSPENDED"
            ? <Btn variant="success">✅ Restore Account</Btn>
            : <Btn variant="danger">⛔ Suspend User</Btn>
          }
        </div>
      </div>
    </div>
  );
}

// ─── INVITE MODAL ─────────────────────────────────────────────────────────────
function InviteModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400, backdropFilter: "blur(5px)" }}
      onClick={onClose}
    >
      <div
        style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 18, padding: "28px 30px", width: 430, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Invite New User</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Send an invitation to join the platform.</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 22 }}>×</button>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {([
            ["FULL NAME",      "e.g. John Smith",       "text"],
            ["EMAIL ADDRESS",  "john@company.com",      "email"],
            ["PHONE NUMBER",   "+91 98765 43210",       "tel"],
          ] as [string, string, string][]).map(([label, ph, type]) => (
            <div key={label}>
              <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: "0.07em", marginBottom: 5 }}>{label}</div>
              <input
                type={type}
                placeholder={ph}
                style={{ width: "100%", background: T.surf2, border: `1px solid ${T.border}`, color: T.text, padding: "9px 12px", borderRadius: 9, fontSize: 12, outline: "none", fontFamily: "inherit" }}
                onFocus={e => (e.target.style.borderColor = T.accent)}
                onBlur={e  => (e.target.style.borderColor = T.border)}
              />
            </div>
          ))}

          {/* Role + Plan */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
            {([
              ["ROLE",  ["Admin", "Manager", "User"]],
              ["PLAN",  ["Starter", "Basic", "Pro", "Enterprise"]],
            ] as [string, string[]][]).map(([label, options]) => (
              <div key={label}>
                <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: "0.07em", marginBottom: 5 }}>{label}</div>
                <select style={{ width: "100%", background: T.surf2, border: `1px solid ${T.border}`, color: T.text, padding: "9px 12px", borderRadius: 9, fontSize: 12, outline: "none", fontFamily: "inherit" }}>
                  {options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Company */}
          <div>
            <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: "0.07em", marginBottom: 5 }}>COMPANY</div>
            <select style={{ width: "100%", background: T.surf2, border: `1px solid ${T.border}`, color: T.text, padding: "9px 12px", borderRadius: 9, fontSize: 12, outline: "none", fontFamily: "inherit" }}>
              {["Acme Corp", "Nexus Ltd", "SkyLine Inc", "Zenith Group", "Prism Analytics"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div style={{ height: 1, background: T.border }} />

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onClose}
              style={{ flex: 1, background: `linear-gradient(135deg,${T.accent},${T.accent2})`, color: "#fff", border: "none", padding: "9px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600 }}
            >
              📨 Send Invite
            </button>
            <button
              onClick={onClose}
              style={{ flex: 1, background: T.surf2, color: T.muted, border: `1px solid ${T.border}`, padding: "9px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600 }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── USER CARD ────────────────────────────────────────────────────────────────
function UserCard({ user, isSelected, onClick }: {
  user:       User;
  isSelected: boolean;
  onClick:    () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{ background: isSelected ? "rgba(108,92,231,0.07)" : T.surf, border: `1px solid ${isSelected ? "rgba(108,92,231,0.4)" : T.border}`, borderRadius: 14, padding: "16px", cursor: "pointer", transition: "all 0.16s", boxShadow: isSelected ? "0 0 0 1px rgba(108,92,231,0.2)" : "none" }}
      onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = "rgba(108,92,231,0.35)"; e.currentTarget.style.transform = "translateY(-2px)"; } }}
      onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; } }}
    >
      {/* Top row: avatar + name + badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Avatar name={user.name} color={user.av} size={38} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: user.status === "ACTIVE" ? T.success : user.status === "SUSPENDED" ? T.danger : T.muted, border: `2px solid ${T.surf}` }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>{user.name}</span>
              {user.pro && <span style={{ background: "rgba(253,203,110,0.15)", color: T.warn, fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 4 }}>PRO</span>}
            </div>
            <div style={{ fontSize: 10, color: T.muted }}>{user.company}</div>
          </div>
        </div>
        <Badge status={user.status} />
      </div>

      {/* Email */}
      <div style={{ fontSize: 10, color: T.muted, marginBottom: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
        <span>✉</span> {user.email}
      </div>

      {/* Role + Plan */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11 }}>
        <span style={{ background: `${ROLE_COLOR[user.role]}18`, color: ROLE_COLOR[user.role], fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>{user.role}</span>
        <span style={{ background: `${PLAN_COLOR[user.plan]}18`, color: PLAN_COLOR[user.plan], fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>{user.plan}</span>
      </div>

      {/* Mini stats */}
      <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
        {([
          ["💬", user.msgs.toLocaleString(), "msgs"],
          ["📢", String(user.campaigns),     "camps"],
          ["🤖", String(user.chatbots),      "bots"],
        ] as [string, string, string][]).map(([icon, val, lbl]) => (
          <div key={lbl} style={{ flex: 1, background: T.surf2, borderRadius: 7, padding: "5px 6px", textAlign: "center", border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{icon} {val}</div>
            <div style={{ fontSize: 9, color: T.muted, marginTop: 1 }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
        <span style={{ fontSize: 10, color: T.muted }}>🕐 {user.login}</span>
        <span style={{ fontSize: 10, color: isSelected ? T.accent2 : T.muted, fontWeight: isSelected ? 700 : 400 }}>
          {isSelected ? "▼ Selected" : "▶ Details"}
        </span>
      </div>
    </div>
  );
}

// ─── PAGE COMPONENT ───────────────────────────────────────────────────────────
export default function AllUsers() {
  const [search,  setSearch]  = useState<string>("");
  const [status,  setStatus]  = useState<string>("ALL");
  const [role,    setRole]    = useState<string>("ALL");
  const [sort,    setSort]    = useState<string>("name");
  const [detail,  setDetail]  = useState<User | null>(null);
  const [invite,  setInvite]  = useState<boolean>(false);

  const filtered = USERS
    .filter(u =>
      (status === "ALL" || u.status === status) &&
      (role   === "ALL" || u.role   === role)   &&
      (
        u.name.toLowerCase().includes(search.toLowerCase())    ||
        u.email.toLowerCase().includes(search.toLowerCase())   ||
        u.company.toLowerCase().includes(search.toLowerCase())
      )
    )
    .sort((a, b) =>
      sort === "msgs" ? b.msgs - a.msgs : a.name.localeCompare(b.name)
    );

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

      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>All Users</h1>
          <p style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>Manage all platform users across every company.</p>
        </div>
        <button
          onClick={() => setInvite(true)}
          style={{ background: `linear-gradient(135deg,${T.accent},${T.accent2})`, color: "#fff", border: "none", padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600 }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          + Invite User
        </button>
      </div>

      {/* ── KPI ROW ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <KPI label="Total Users"   value="5,831" delta="8.4% this month" icon="👥" color={T.accent}  />
        <KPI label="Active"        value="4,982" delta="6.1% growth"     icon="🟢" color={T.success} />
        <KPI label="Suspended"     value="421"   delta="1.2% increase"   icon="🔴" color={T.danger}  up={false} />
        <KPI label="Premium Users" value="2,104" delta="14% this month"  icon="⭐" color={T.warn}    />
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{ display: "flex", gap: 9, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: T.muted, fontSize: 14, pointerEvents: "none" }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, company…"
            style={{ width: "100%", background: T.surf, border: `1px solid ${T.border}`, color: T.text, padding: "9px 14px 9px 35px", borderRadius: 10, fontSize: 12, outline: "none" }}
            onFocus={e => (e.target.style.borderColor = T.accent)}
            onBlur={e  => (e.target.style.borderColor = T.border)}
          />
        </div>

        {/* Status filter */}
        <div style={{ display: "flex", background: T.surf, border: `1px solid ${T.border}`, borderRadius: 10, padding: 3, gap: 2 }}>
          {["ALL", "ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"].map(f => (
            <button key={f} onClick={() => setStatus(f)}
              style={{ background: status === f ? T.surf2 : "transparent", border: `1px solid ${status === f ? "rgba(108,92,231,0.35)" : "transparent"}`, color: status === f ? T.accent2 : T.muted, padding: "5px 11px", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: status === f ? 700 : 400, transition: "all 0.12s" }}>
              {f === "ALL" ? "All" : f[0] + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Role filter */}
        <div style={{ display: "flex", background: T.surf, border: `1px solid ${T.border}`, borderRadius: 10, padding: 3, gap: 2 }}>
          {["ALL", "Admin", "Manager", "User"].map(r => (
            <button key={r} onClick={() => setRole(r)}
              style={{ background: role === r ? T.surf2 : "transparent", border: `1px solid ${role === r ? "rgba(108,92,231,0.35)" : "transparent"}`, color: role === r ? T.accent2 : T.muted, padding: "5px 10px", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: role === r ? 700 : 400, transition: "all 0.12s" }}>
              {r === "ALL" ? "All Roles" : r}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{ background: T.surf, border: `1px solid ${T.border}`, color: T.muted, padding: "8px 12px", borderRadius: 10, fontSize: 11, outline: "none", cursor: "pointer" }}
        >
          <option value="name">Sort: Name A–Z</option>
          <option value="msgs">Sort: Most Messages</option>
        </select>

        <span style={{ fontSize: 11, color: T.muted }}>{filtered.length} users</span>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ display: "grid", gridTemplateColumns: detail ? "1fr 300px" : "1fr", gap: 16, alignItems: "start" }}>

        {/* User cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 13 }}>
          {filtered.map(u => (
            <UserCard
              key={u.id}
              user={u}
              isSelected={detail?.id === u.id}
              onClick={() => setDetail(detail?.id === u.id ? null : u)}
            />
          ))}

          {filtered.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>No users found</div>
              <div style={{ fontSize: 12, color: T.muted }}>Try adjusting your search or filters.</div>
            </div>
          )}
        </div>

        {/* Sticky detail panel */}
        {detail && <DetailPanel user={detail} onClose={() => setDetail(null)} />}
      </div>

      {/* ── INVITE MODAL ── */}
      {invite && <InviteModal onClose={() => setInvite(false)} />}
    </div>
  );
}
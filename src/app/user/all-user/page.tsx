"use client";

import { useState } from "react";
import "./all-user.css";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
type UserRole   = "Admin" | "User";
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
  av:        string;
  login:     string;
  joined:    string;
  msgs:      number;
  campaigns: number;
  chatbots:  number;
  pro:       boolean;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const USERS: User[] = [
  { id:1, name:"James Doe",   email:"james@acmecorp.com", phone:"+91 98765 00001", role:"Admin", status:"ACTIVE",    company:"Acme Corp",    plan:"Enterprise", av:"#6C5CE7", login:"2 mins ago",   joined:"Jan 12, 2024", msgs:1240, campaigns:18, chatbots:5, pro:true  },
  { id:8, name:"Emma Wilson", email:"emma@orbitsys.tech", phone:"+91 98765 00008", role:"User",  status:"SUSPENDED", company:"Orbit Systems", plan:"Starter",    av:"#FD79A8", login:"2 months ago", joined:"Jun 1, 2024",  msgs:4,    campaigns:0,  chatbots:0, pro:false },
];

// ─── LOOKUP MAPS ──────────────────────────────────────────────────────────────
const STATUS_CSS: Record<UserStatus, string> = {
  ACTIVE:    "au-badge--active",
  INACTIVE:  "au-badge--inactive",
  SUSPENDED: "au-badge--suspended",
  PENDING:   "au-badge--pending",
};

const STATUS_DOT: Record<UserStatus, string> = {
  ACTIVE:    "au-status-dot--active",
  INACTIVE:  "au-status-dot--other",
  SUSPENDED: "au-status-dot--suspended",
  PENDING:   "au-status-dot--other",
};

const PLAN_COLOR: Record<UserPlan, string> = {
  Enterprise: "#A29BFE",
  Pro:        "#6C5CE7",
  Basic:      "#FDCB6E",
  Starter:    "#00CBA4",
};

const ROLE_COLOR: Record<UserRole, string> = {
  Admin: "#A29BFE",
  User:  "#475569",
};

// ─── BADGE ────────────────────────────────────────────────────────────────────
function Badge({ status }: { status: UserStatus }) {
  const label = status === "PENDING" ? "Pending" : status[0] + status.slice(1).toLowerCase();
  return (
    <span className={`au-badge ${STATUS_CSS[status]}`}>
      <span className="au-badge__dot" />
      {label}
    </span>
  );
}

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
function KPI({ label, value, delta, icon, color, up = true }: {
  label: string; value: string; delta?: string; icon: string; color: string; up?: boolean;
}) {
  return (
    <div className="au-kpi-card">
      <div className="au-kpi-card__orb" style={{ background: `${color}20` }} />
      <div className="au-kpi-card__top">
        <span className="au-kpi-card__label">{label}</span>
        <div className="au-kpi-card__icon" style={{ background: `${color}18` }}>{icon}</div>
      </div>
      <div className="au-kpi-card__value">{value}</div>
      {delta && (
        <div className={`au-kpi-card__delta ${up ? "au-kpi-card__delta--up" : "au-kpi-card__delta--down"}`}>
          {up ? "↑" : "↓"} {delta}
        </div>
      )}
    </div>
  );
}

// ─── DETAIL PANEL ─────────────────────────────────────────────────────────────
function DetailPanel({ user, onClose }: { user: User; onClose: () => void }) {
  const [tab, setTab] = useState<"info" | "stats">("info");

  return (
    <div className="au-panel">
      <div className="au-panel__header">
        <span className="au-panel__title">User Details</span>
        <button className="au-panel__close" onClick={onClose}>×</button>
      </div>

      <div className="au-panel__body">
        {/* Avatar + identity */}
        <div className="au-panel__identity">
          <div className="au-panel__avatar-wrap">
            <div className="au-avatar au-avatar--62" style={{ background: user.av }}>
              {user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className={`au-status-dot au-status-dot--panel ${STATUS_DOT[user.status]}`} />
          </div>
          <div className="au-panel__name">{user.name}</div>
          <div className="au-panel__email">{user.email}</div>
          <div className="au-panel__badges">
            <Badge status={user.status} />
            <span className="au-role-chip" style={{ background: `${ROLE_COLOR[user.role]}18`, color: ROLE_COLOR[user.role] }}>
              {user.role}
            </span>
            {user.pro && <span className="au-pro-badge--lg">⭐ PRO</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className="au-panel__tabs">
          {([["info", "📋 Info"], ["stats", "📊 Stats"]] as [string, string][]).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k as "info" | "stats")}
              className={`au-panel__tab ${tab === k ? "au-panel__tab--active" : ""}`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Info tab */}
        {tab === "info" && (
          <div>
            {([
              ["Company",    user.company, ""],
              ["Plan",       user.plan,    "plan"],
              ["Phone",      user.phone,   ""],
              ["Joined",     user.joined,  ""],
              ["Last Login", user.login,   ""],
            ] as [string, string, string][]).map(([label, value, type]) => (
              <div key={label} className="au-info-row">
                <span className="au-info-row__label">{label}</span>
                <span
                  className="au-info-row__value"
                  style={type === "plan" ? { color: PLAN_COLOR[value as UserPlan] } : undefined}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Stats tab */}
        {tab === "stats" && (
          <div className="au-stats-grid">
            {([
              ["Messages",  user.msgs.toLocaleString(),         "#A29BFE"],
              ["Campaigns", String(user.campaigns),             "#00CBA4"],
              ["Chatbots",  String(user.chatbots),              "#FDCB6E"],
              ["Flows",     String(Math.floor(user.msgs / 80)), "#74B9FF"],
            ] as [string, string, string][]).map(([label, value, color]) => (
              <div key={label} className="au-stats-cell">
                <div className="au-stats-cell__val" style={{ color }}>{value}</div>
                <div className="au-stats-cell__lbl">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="au-panel__actions">
          <button className="au-btn au-btn--primary">✏️ Edit User</button>
          <button className="au-btn au-btn--ghost">🔑 Reset Password</button>
          {user.status === "SUSPENDED"
            ? <button className="au-btn au-btn--success">✅ Restore Account</button>
            : <button className="au-btn au-btn--danger">⛔ Suspend User</button>
          }
        </div>
      </div>
    </div>
  );
}

// ─── INVITE MODAL ─────────────────────────────────────────────────────────────
function InviteModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="au-overlay" onClick={onClose}>
      <div className="au-modal" onClick={e => e.stopPropagation()}>
        <div className="au-modal__header">
          <div>
            <div className="au-modal__title">Invite New User</div>
            <div className="au-modal__subtitle">Send an invitation to join the platform.</div>
          </div>
          <button className="au-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="au-modal__body">
          {([
            ["FULL NAME",     "e.g. John Smith",  "text"],
            ["EMAIL ADDRESS", "john@company.com", "email"],
            ["PHONE NUMBER",  "+91 98765 43210",  "tel"],
          ] as [string, string, string][]).map(([label, ph, type]) => (
            <div key={label}>
              <div className="au-field-label">{label}</div>
              <input type={type} placeholder={ph} className="au-field-input" />
            </div>
          ))}

          <div className="au-modal__two-col">
            {([
              ["ROLE", ["Admin", "User"]],
              ["PLAN", ["Starter", "Basic", "Pro", "Enterprise"]],
            ] as [string, string[]][]).map(([label, options]) => (
              <div key={label}>
                <div className="au-field-label">{label}</div>
                <select className="au-field-select">
                  {options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div>
            <div className="au-field-label">COMPANY</div>
            <select className="au-field-select">
              {["Acme Corp","Nexus Ltd","SkyLine Inc","Zenith Group","Prism Analytics"].map(o => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>

          <div className="au-modal__divider" />

          <div className="au-modal__footer">
            <button className="au-modal__send" onClick={onClose}>📨 Send Invite</button>
            <button className="au-modal__cancel" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── USER CARD ────────────────────────────────────────────────────────────────
function UserCard({ user, isSelected, onClick }: {
  user: User; isSelected: boolean; onClick: () => void;
}) {
  return (
    <div onClick={onClick} className={`au-card ${isSelected ? "au-card--selected" : ""}`}>
      {/* Top row */}
      <div className="au-card__top">
        <div className="au-card__identity">
          <div className="au-avatar-wrap">
            <div className="au-avatar au-avatar--38" style={{ background: user.av }}>
              {user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className={`au-status-dot au-status-dot--card ${STATUS_DOT[user.status]}`} />
          </div>
          <div>
            <div className="au-card__name-row">
              <span className="au-card__name">{user.name}</span>
              {user.pro && <span className="au-pro-badge">PRO</span>}
            </div>
            <div className="au-card__company">{user.company}</div>
          </div>
        </div>
        <Badge status={user.status} />
      </div>

      {/* Email */}
      <div className="au-card__email">
        <span>✉</span> {user.email}
      </div>

      {/* Role + Plan chips */}
      <div className="au-card__meta">
        <span className="au-chip" style={{ background: `${ROLE_COLOR[user.role]}18`, color: ROLE_COLOR[user.role] }}>
          {user.role}
        </span>
        <span className="au-chip" style={{ background: `${PLAN_COLOR[user.plan]}18`, color: PLAN_COLOR[user.plan] }}>
          {user.plan}
        </span>
      </div>

      {/* Mini stats */}
      <div className="au-card__stats">
        {([
          ["💬", user.msgs.toLocaleString(), "msgs"],
          ["📢", String(user.campaigns),     "camps"],
          ["🤖", String(user.chatbots),      "bots"],
        ] as [string, string, string][]).map(([icon, val, lbl]) => (
          <div key={lbl} className="au-stat-box">
            <div className="au-stat-box__val">{icon} {val}</div>
            <div className="au-stat-box__lbl">{lbl}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="au-card__footer">
        <span className="au-card__login">🕐 {user.login}</span>
        <span className={isSelected ? "au-card__cta--sel" : "au-card__cta"}>
          {isSelected ? "▼ Selected" : "▶ Details"}
        </span>
      </div>
    </div>
  );
}

// ─── PAGE COMPONENT ───────────────────────────────────────────────────────────
export default function AllUsers() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [role,   setRole]   = useState("ALL");
  const [sort,   setSort]   = useState("name");
  const [detail, setDetail] = useState<User | null>(null);
  const [invite, setInvite] = useState(false);

  const filtered = USERS
    .filter(u =>
      (status === "ALL" || u.status === status) &&
      (role   === "ALL" || u.role   === role)   &&
      (u.name.toLowerCase().includes(search.toLowerCase())    ||
       u.email.toLowerCase().includes(search.toLowerCase())   ||
       u.company.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => sort === "msgs" ? b.msgs - a.msgs : a.name.localeCompare(b.name));

  return (
    <div className="au-root">

      {/* ── HEADER ── */}
      <div className="au-header">
        <div>
          <h1 className="au-header__title">All Users</h1>
          <p className="au-header__subtitle">All platform users across every company.</p>
        </div>
        <button className="au-btn-invite" onClick={() => setInvite(true)}>
          + Invite User
        </button>
      </div>

      {/* ── KPI ROW ── */}
      <div className="au-kpi-grid">
        <KPI label="Total Users"   value="5,831" delta="8.4% this month" icon="👥" color="#6C5CE7" />
        <KPI label="Active"        value="4,982" delta="6.1% growth"     icon="🟢" color="#00CBA4" />
        <KPI label="Suspended"     value="421"   delta="1.2% increase"   icon="🔴" color="#FF6B6B" up={false} />
        <KPI label="Premium Users" value="2,104" delta="14% this month"  icon="⭐" color="#FDCB6E" />
      </div>

      {/* ── FILTER BAR ── */}
      <div className="au-filter-bar">
        <div className="au-search-wrap">
          <span className="au-search-icon">🔍</span>
          <input
            className="au-search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, company…"
          />
        </div>

        <div className="au-filter-group">
          {["ALL","ACTIVE","INACTIVE","SUSPENDED","PENDING"].map(f => (
            <button key={f} onClick={() => setStatus(f)}
              className={`au-filter-pill ${status === f ? "au-filter-pill--active" : ""}`}>
              {f === "ALL" ? "All" : f[0] + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="au-filter-group">
          {["ALL","Admin","User"].map(r => (
            <button key={r} onClick={() => setRole(r)}
              className={`au-filter-pill au-filter-pill--role ${role === r ? "au-filter-pill--active" : ""}`}>
              {r === "ALL" ? "All Roles" : r}
            </button>
          ))}
        </div>

        <select className="au-sort-select" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="name">Sort: Name A–Z</option>
          <option value="msgs">Sort: Most Messages</option>
        </select>

        <span className="au-filter-count">{filtered.length} users</span>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className={`au-main-grid ${detail ? "au-main-grid--panel" : "au-main-grid--full"}`}>
        <div className="au-cards-grid">
          {filtered.map(u => (
            <UserCard
              key={u.id}
              user={u}
              isSelected={detail?.id === u.id}
              onClick={() => setDetail(detail?.id === u.id ? null : u)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="au-empty">
              <div className="au-empty__icon">🔍</div>
              <div className="au-empty__title">No users found</div>
              <div className="au-empty__desc">Try adjusting your search or filters.</div>
            </div>
          )}
        </div>
        {detail && <DetailPanel user={detail} onClose={() => setDetail(null)} />}
      </div>

      {invite && <InviteModal onClose={() => setInvite(false)} />}
    </div>
  );
}
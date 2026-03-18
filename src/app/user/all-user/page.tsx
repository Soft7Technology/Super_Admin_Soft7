"use client";

import { useState, useEffect } from "react";
import "./all-user.css";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface User {
  id:        number;
  name:      string;
  email:     string;
  phone:     string;
  role:      string;
  status:    string;
  company:   string;
  plan:      string;
  av:        string;
  login:     string;
  joined:    string;
  msgs:      number;
  campaigns: number;
  chatbots:  number;
  pro:       boolean;
}

interface UserStats {
  totalUsers:   number;
  activeUsers:  number;
  adminUsers:   number;
  premiumUsers: number;
}

// ─── LOOKUP MAPS ──────────────────────────────────────────────────────────────
const STATUS_CSS: Record<string, string> = {
  ACTIVE:    "au-badge--active",
  INACTIVE:  "au-badge--inactive",
  SUSPENDED: "au-badge--suspended",
  PENDING:   "au-badge--pending",
};

const STATUS_DOT: Record<string, string> = {
  ACTIVE:    "au-status-dot--active",
  INACTIVE:  "au-status-dot--other",
  SUSPENDED: "au-status-dot--suspended",
  PENDING:   "au-status-dot--other",
};

const PLAN_COLOR: Record<string, string> = {
  Enterprise: "#A29BFE",
  Pro:        "#6C5CE7",
  Basic:      "#FDCB6E",
  Starter:    "#00CBA4",
};
function planColor(plan: string) { return PLAN_COLOR[plan] ?? "#94a3b8"; }

const ROLE_COLOR: Record<string, string> = {
  Admin: "#A29BFE",
  User:  "#475569",
};
function roleColor(role: string) { return ROLE_COLOR[role] ?? "#94a3b8"; }

// ─── BADGE ────────────────────────────────────────────────────────────────────
function Badge({ status }: { status: string }) {
  const label = status[0] + status.slice(1).toLowerCase();
  return (
    <span className={`au-badge ${STATUS_CSS[status] ?? "au-badge--inactive"}`}>
      <span className="au-badge__dot" />
      {label}
    </span>
  );
}

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
function KPI({ label, value, icon, color, up = true }: {
  label: string; value: string; icon: string; color: string; up?: boolean;
}) {
  return (
    <div className="au-kpi-card">
      <div className="au-kpi-card__orb" style={{ background: `${color}20` }} />
      <div className="au-kpi-card__top">
        <span className="au-kpi-card__label">{label}</span>
        <div className="au-kpi-card__icon" style={{ background: `${color}18` }}>{icon}</div>
      </div>
      <div className="au-kpi-card__value">{value}</div>
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
        <button className="au-panel__close" onClick={onClose}>x</button>
      </div>

      <div className="au-panel__body">
        <div className="au-panel__identity">
          <div className="au-panel__avatar-wrap">
            <div className="au-avatar au-avatar--62" style={{ background: user.av }}>
              {user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className={`au-status-dot au-status-dot--panel ${STATUS_DOT[user.status] ?? "au-status-dot--other"}`} />
          </div>
          <div className="au-panel__name">{user.name}</div>
          <div className="au-panel__email">{user.email}</div>
          <div className="au-panel__badges">
            <Badge status={user.status} />
            <span className="au-role-chip" style={{ background: `${roleColor(user.role)}18`, color: roleColor(user.role) }}>
              {user.role}
            </span>
            {user.pro && <span className="au-pro-badge--lg">PRO</span>}
          </div>
        </div>

        <div className="au-panel__tabs">
          {([["info", "Info"], ["stats", "Stats"]] as [string, string][]).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k as "info" | "stats")}
              className={`au-panel__tab ${tab === k ? "au-panel__tab--active" : ""}`}
            >
              {l}
            </button>
          ))}
        </div>

        {tab === "info" && (
          <div>
            {([
              ["Company",    user.company,    ""],
              ["Plan",       user.plan,       "plan"],
              ["Phone",      user.phone || "-", ""],
              ["Joined",     user.joined,     ""],
              ["Last Login", user.login,      ""],
            ] as [string, string, string][]).map(([label, value, type]) => (
              <div key={label} className="au-info-row">
                <span className="au-info-row__label">{label}</span>
                <span
                  className="au-info-row__value"
                  style={type === "plan" ? { color: planColor(value) } : undefined}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

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

        <div className="au-panel__actions">
          <button className="au-btn au-btn--primary">Edit User</button>
          <button className="au-btn au-btn--ghost">Reset Password</button>
          {user.status === "SUSPENDED"
            ? <button className="au-btn au-btn--success">Restore Account</button>
            : <button className="au-btn au-btn--danger">Suspend User</button>
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
      <div className="au-modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className="au-modal__header">
          <div>
            <div className="au-modal__title">Invite New User</div>
            <div className="au-modal__subtitle">Send an invitation to join the platform.</div>
          </div>
          <button className="au-modal__close" onClick={onClose}>x</button>
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
                  {options.map((o: string) => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div className="au-modal__divider" />

          <div className="au-modal__footer">
            <button className="au-modal__send" onClick={onClose}>Send Invite</button>
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
      <div className="au-card__top">
        <div className="au-card__identity">
          <div className="au-avatar-wrap">
            <div className="au-avatar au-avatar--38" style={{ background: user.av }}>
              {user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className={`au-status-dot au-status-dot--card ${STATUS_DOT[user.status] ?? "au-status-dot--other"}`} />
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

      <div className="au-card__email">
        <span>@</span> {user.email}
      </div>

      <div className="au-card__meta">
        <span className="au-chip" style={{ background: `${roleColor(user.role)}18`, color: roleColor(user.role) }}>
          {user.role}
        </span>
        <span className="au-chip" style={{ background: `${planColor(user.plan)}18`, color: planColor(user.plan) }}>
          {user.plan}
        </span>
      </div>

      <div className="au-card__stats">
        {([
          ["msgs",      user.msgs.toLocaleString(), "msgs"],
          ["campaigns", String(user.campaigns),     "camps"],
          ["chatbots",  String(user.chatbots),      "bots"],
        ] as [string, string, string][]).map(([key, val, lbl]) => (
          <div key={key} className="au-stat-box">
            <div className="au-stat-box__val">{val}</div>
            <div className="au-stat-box__lbl">{lbl}</div>
          </div>
        ))}
      </div>

      <div className="au-card__footer">
        <span className="au-card__login">{user.login}</span>
        <span className={isSelected ? "au-card__cta--sel" : "au-card__cta"}>
          {isSelected ? "Selected" : "Details"}
        </span>
      </div>
    </div>
  );
}

// ─── PAGE COMPONENT ───────────────────────────────────────────────────────────
export default function AllUsers() {
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("ALL");
  const [role,   setRole]     = useState("ALL");
  const [sort,   setSort]     = useState("name");
  const [detail, setDetail]   = useState<User | null>(null);
  const [invite, setInvite]   = useState(false);
  const [users,   setUsers]   = useState<User[]>([]);
  const [stats,   setStats]   = useState<UserStats>({ totalUsers: 0, activeUsers: 0, adminUsers: 0, premiumUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();

        if (cancelled) {
          return;
        }

        if (!res.ok) {
          throw new Error(data.error ?? `Server error ${res.status}`);
        }

        setUsers(data.users ?? []);
        setStats(data.stats ?? { totalUsers: 0, activeUsers: 0, adminUsers: 0, premiumUsers: 0 });
        setError(data.error ?? null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = [...users]
    .filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.company.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        status === "ALL"
          ? true
          : status === "ADMIN"
            ? user.role.toLowerCase() === "admin"
            : user.status === status;
      const matchesRole = role === "ALL" || user.role.toLowerCase() === role.toLowerCase();

      return matchesSearch && matchesStatus && matchesRole;
    })
    .sort((left, right) => {
      if (sort === "msgs") {
        return right.msgs - left.msgs;
      }

      return left.name.localeCompare(right.name);
    });

  return (
    <div className="au-root">

      <div className="au-header">
        <div>
          <h1 className="au-header__title">All Users</h1>
          <p className="au-header__subtitle">All platform users across every company.</p>
        </div>
        <button className="au-btn-invite" onClick={() => setInvite(true)}>
          + Invite User
        </button>
      </div>

      <div className="au-kpi-grid">
        <KPI label="Total Users"   value={stats.totalUsers.toLocaleString()}   icon="Users"  color="#6C5CE7" />
        <KPI label="Active Users"  value={stats.activeUsers.toLocaleString()}  icon="Active" color="#00CBA4" />
        <KPI label="Admin Users"   value={stats.adminUsers.toLocaleString()}   icon="Admin"  color="#FF6B6B" up={false} />
        <KPI label="Premium Users" value={stats.premiumUsers.toLocaleString()} icon="Pro"    color="#FDCB6E" />
      </div>

      <div className="au-filter-bar">
        <div className="au-search-wrap">
          <span className="au-search-icon">Search</span>
          <input
            className="au-search-input"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Search name, email, company..."
          />
        </div>

        <div className="au-filter-group">
          {["ALL","ACTIVE","INACTIVE","ADMIN","PENDING"].map(f => (
            <button key={f} onClick={() => setStatus(f)}
              className={`au-filter-pill ${status === f ? "au-filter-pill--active" : ""}`}>
              {f === "ALL" ? "All" : f === "ADMIN" ? "Admin Users" : f[0] + f.slice(1).toLowerCase()}
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

        <select className="au-sort-select" value={sort} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSort(e.target.value)}>
          <option value="name">Sort: Name A-Z</option>
          <option value="msgs">Sort: Most Messages</option>
        </select>

        <span className="au-filter-count">{loading ? "..." : `${filteredUsers.length} users`}</span>
      </div>

      <div className={`au-main-grid ${detail ? "au-main-grid--panel" : "au-main-grid--full"}`}>
        <div className="au-cards-grid">
          {loading && (
            <div className="au-empty">
              <div className="au-empty__icon">Loading</div>
              <div className="au-empty__title">Loading users...</div>
            </div>
          )}
          {!loading && error && (
            <div className="au-empty">
              <div className="au-empty__icon">Error</div>
              <div className="au-empty__title">Could not load users</div>
              <div className="au-empty__desc">{error}</div>
            </div>
          )}
          {!loading && !error && filteredUsers.map(u => (
            <UserCard
              key={u.id}
              user={u}
              isSelected={detail?.id === u.id}
              onClick={() => setDetail(detail?.id === u.id ? null : u)}
            />
          ))}
          {!loading && !error && filteredUsers.length === 0 && (
            <div className="au-empty">
              <div className="au-empty__icon">Search</div>
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

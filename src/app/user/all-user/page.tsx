"use client";

import { useState, useEffect } from "react";
import "./all-user.css";

const EXTERNAL_USERS_API = "https://hostapi.soft7.in/v1/admin/companies/user";

const getExternalHeaders = () => {
  let token =
    typeof window !== "undefined"
      ? localStorage.getItem("console_access_token")
      : null;
  if (token && token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
  }
  return {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface User {
  id: number; name: string; email: string; phone: string;
  role: string; status: string; company: string; companyId?: number;
  plan: string; av: string; login: string; joined: string;
  msgs: number; campaigns: number; chatbots: number; pro: boolean;
}
interface UserStats {
  totalUsers: number; activeUsers: number; adminUsers: number; premiumUsers: number;
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
  Enterprise: "#0d9488",
  Pro:        "#6366f1",
  Basic:      "#f59e0b",
  Starter:    "#14b8a6",
};
function planColor(plan: string) { return PLAN_COLOR[plan] ?? "#94a3b8"; }
const ROLE_COLOR: Record<string, string> = {
  Admin: "#0d9488",
  User:  "#64748b",
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
function KPI({ label, value, icon, color }: {
  label: string; value: string; icon: string; color: string;
}) {
  return (
    <div className="au-kpi-card">
      <div className="au-kpi-card__orb" style={{ background: `${color}18` }} />
      <div className="au-kpi-card__top">
        <span className="au-kpi-card__label">{label}</span>
        <div className="au-kpi-card__icon" style={{ background: `${color}18`, color }}>{icon}</div>
      </div>
      <div className="au-kpi-card__value">{value}</div>
      <div className="au-kpi-card__bar" style={{ background: `${color}40` }}>
        <div className="au-kpi-card__bar-fill" style={{ background: color }} />
      </div>
    </div>
  );
}

// ─── DETAIL PANEL ─────────────────────────────────────────────────────────────
function DetailPanel({ user, onClose }: { user: User; onClose: () => void }) {
  const [tab, setTab] = useState<"info" | "stats">("info");
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="au-panel">
      <div className="au-panel__header">
        <span className="au-panel__title">User Details</span>
        <button className="au-panel__close" onClick={onClose}>×</button>
      </div>
      <div className="au-panel__body">
        <div className="au-panel__identity">
          <div className="au-panel__avatar-wrap">
            <div className="au-avatar au-avatar--68" style={{ background: user.av }}>
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
            >{l}</button>
          ))}
        </div>

        {tab === "info" && (
          <div>
            {([
              ["Company", user.company, ""],
              ["Plan",    user.plan,    "plan"],
              ["Phone",   user.phone || "—", ""],
              ["Joined",  user.joined,  ""],
              ["Last Login", user.login, ""],
            ] as [string, string, string][]).map(([label, value, type]) => (
              <div key={label} className="au-info-row">
                <span className="au-info-row__label">{label}</span>
                <span className="au-info-row__value"
                  style={type === "plan" ? { color: planColor(value) } : undefined}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === "stats" && (
          <div className="au-stats-grid">
            {([
              ["Messages",  user.msgs.toLocaleString(),           "#0d9488"],
              ["Campaigns", String(user.campaigns),               "#6366f1"],
              ["Chatbots",  String(user.chatbots),                "#f59e0b"],
              ["Flows",     String(Math.floor(user.msgs / 80)),   "#14b8a6"],
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

      {editOpen && (
        <EditUserModal
          user={user}
          onClose={() => setEditOpen(false)}
          onUpdated={(updatedUser) => { Object.assign(user, updatedUser); }}
        />
      )}
    </div>
  );
}

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────
function EditUserModal({
  user, onClose, onUpdated,
}: {
  user: User; onClose: () => void; onUpdated: (u: User) => void;
}) {
  const [form, setForm] = useState({ ...user });
  const handleChange = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email,
          phone: form.phone, companyId: form.companyId, plan: form.plan,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Updated successfully");
        onUpdated({ ...user, ...form });
        onClose();
      } else {
        alert(data.error || "Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="au-overlay" onClick={onClose}>
      <div className="au-modal" onClick={(e) => e.stopPropagation()}>
        <div className="au-modal__header">
          <div>
            <div className="au-modal__title">Edit User</div>
            <div className="au-modal__sub">Update user details below</div>
          </div>
          <button className="au-modal__close" onClick={onClose}>×</button>
        </div>
        <div className="au-modal__body">
          <div className="au-field">
            <div className="au-field__label">FULL NAME</div>
            <input type="text" className="au-input" value={form.name}
              onChange={(e) => handleChange("name", e.target.value)} />
          </div>
          <div className="au-field">
            <div className="au-field__label">EMAIL ADDRESS</div>
            <input type="email" className="au-input" value={form.email}
              onChange={(e) => handleChange("email", e.target.value)} />
          </div>
          <div className="au-field">
            <div className="au-field__label">MOBILE NUMBER</div>
            <input type="tel" className="au-input" value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)} />
          </div>
          <div className="au-modal__grid-2">
            <div className="au-field">
              <div className="au-field__label">COMPANY</div>
              <select className="au-select" value={form.companyId || ""}
                onChange={(e) => handleChange("companyId", Number(e.target.value))}>
                <option value="">No Company</option>
                <option value={1}>Soft7</option>
                <option value={2}>Acme Corp</option>
                <option value={3}>Tech Solutions</option>
              </select>
            </div>
            <div className="au-field">
              <div className="au-field__label">PLAN</div>
              <select className="au-select" value={form.plan || "Starter"}
                onChange={(e) => handleChange("plan", e.target.value)}>
                <option value="Starter">Starter</option>
                <option value="Basic">Basic</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
          </div>
        </div>
        <div className="au-modal__actions">
          <button className="au-btn au-btn--primary" onClick={handleSave}>Save Changes</button>
          <button className="au-btn au-btn--ghost" onClick={onClose}>Cancel</button>
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
            <div className="au-modal__sub">Send an invitation to join the platform.</div>
          </div>
          <button className="au-modal__close" onClick={onClose}>×</button>
        </div>
        <div className="au-modal__body">
          {([
            ["FULL NAME",     "e.g. John Smith",  "text"],
            ["EMAIL ADDRESS", "john@company.com", "email"],
            ["PHONE NUMBER",  "+91 98765 43210",  "tel"],
          ] as [string, string, string][]).map(([label, ph, type]) => (
            <div key={label} className="au-field">
              <div className="au-field__label">{label}</div>
              <input type={type} placeholder={ph} className="au-input" />
            </div>
          ))}
          <div className="au-modal__grid-2">
            {([
              ["ROLE", ["Admin", "User"]],
              ["PLAN", ["Starter", "Basic", "Pro", "Enterprise"]],
            ] as [string, string[]][]).map(([label, options]) => (
              <div key={label} className="au-field">
                <div className="au-field__label">{label}</div>
                <select className="au-select">
                  {options.map((o: string) => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="au-modal__actions">
            <button className="au-btn au-btn--primary" onClick={onClose}>Send Invite</button>
            <button className="au-btn au-btn--ghost"   onClick={onClose}>Cancel</button>
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
            <div className="au-avatar au-avatar--44" style={{ background: user.av }}>
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
        <span className="au-card__email-icon">@</span> {user.email}
      </div>

      <div className="au-card__meta">
        <span className="au-chip" style={{ background: `${roleColor(user.role)}15`, color: roleColor(user.role) }}>
          {user.role}
        </span>
        <span className="au-chip" style={{ background: `${planColor(user.plan)}15`, color: planColor(user.plan) }}>
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
          {isSelected ? "Selected ✓" : "View Details →"}
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
  const [users,  setUsers]    = useState<User[]>([]);
  const [stats,  setStats]    = useState<UserStats>({ totalUsers: 0, activeUsers: 0, adminUsers: 0, premiumUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  function timeAgo(dateString: string | null) {
    if (!dateString) return "—";
    const diffMs   = Date.now() - new Date(dateString).getTime();
    const diffDays  = Math.floor(diffMs / 86400000);
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffDays  > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return "Just now";
  }

useEffect(() => {
  let cancelled = false;
  async function loadUsers() {
    setLoading(true); setError(null);
    try {
      // Step 1: fetch first page of users to get total page count
      const firstRes = await fetch(
        `${EXTERNAL_USERS_API}?role=user&page=1&limit=10`,
        { headers: getExternalHeaders() }
      );
      if (!firstRes.ok) throw new Error("Failed to fetch users");
      const firstJson = await firstRes.json();

      const totalPages: number = firstJson?.data?.pagination?.totalPages ?? 1;

      // Step 2: fetch remaining user pages + admins in parallel
      const pageRequests = Array.from({ length: totalPages - 1 }, (_, i) =>
        fetch(`${EXTERNAL_USERS_API}?role=user&page=${i + 2}&limit=10`, {
          headers: getExternalHeaders(),
        }).then(r => r.json())
      );
      const adminRequest = fetch(`${EXTERNAL_USERS_API}?role=admin`, {
        headers: getExternalHeaders(),
      }).then(r => r.json());

      const [adminJson, ...restPages] = await Promise.all([adminRequest, ...pageRequests]);

      // Step 3: flatten all raw records
      const allUserRecords: any[] = [
        ...(firstJson?.data?.data ?? []),           // page 1 users
        ...restPages.flatMap(p => p?.data?.data ?? []), // remaining pages
        ...(adminJson?.data?.data ?? []),            // admins
      ];

      const mappedUsers: User[] = allUserRecords.map((u: any) => ({
        id:      u.id,
        name:    u.name  || "No Name",
        email:   u.email || "",
        phone:   u.phone || "",
        role:    u.role === "admin" ? "Admin" : "User",
        status:  (u.status || "active").toUpperCase(),
        company: u.company_id ? `ID: ${u.company_id.slice(0, 8)}…` : "—",
        //       ↑ company_id is a UUID string, not a nested object
        plan:
          u.plan_name === "Enterpriess" ? "Enterprise" :
          u.plan_name === "Free Trial"  ? "Starter"    :
          u.plan_name                   || "Starter",
        av:        "#0d9488",
        login:     timeAgo(u.last_login_at),
        joined:    u.created_at ? new Date(u.created_at).toLocaleDateString() : "—",
        msgs: 0, campaigns: 0, chatbots: 0,
        pro: ["Pro", "Enterprise"].includes(u.plan_name),
      }));

      if (!cancelled) {
        setUsers(mappedUsers);
        setStats({
          totalUsers:   mappedUsers.length,
          activeUsers:  mappedUsers.filter(u => u.status === "ACTIVE").length,
          adminUsers:   mappedUsers.filter(u => u.role === "Admin").length,
          premiumUsers: mappedUsers.filter(u => ["Pro", "Enterprise"].includes(u.plan)).length,
        });
      }
    } catch (e) {
      if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      if (!cancelled) setLoading(false);
    }
  }
  loadUsers();
  return () => { cancelled = true; };
}, []);

  const filteredUsers = [...users]
    .filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.company.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        status === "ALL" ? true :
        status === "ADMIN" ? user.role.toLowerCase() === "admin" :
        user.status === status;
      const matchesRole = role === "ALL" || user.role.toLowerCase() === role.toLowerCase();
      return matchesSearch && matchesStatus && matchesRole;
    })
    .sort((a, b) => sort === "msgs" ? b.msgs - a.msgs : a.name.localeCompare(b.name));

  return (
    <div className="au-root">
      {/* Header */}
      <div className="au-header">
        <div>
          <h1 className="au-header__title">All Users</h1>
          <p className="au-header__subtitle">All platform users across every company</p>
        </div>
        <button className="au-btn-invite" onClick={() => setInvite(true)}>
          + Invite User
        </button>
      </div>

      {/* KPI */}
      <div className="au-kpi-grid">
        <KPI label="Total Users"   value={stats.totalUsers.toLocaleString()}   icon="👥" color="#0d9488" />
        <KPI label="Active Users"  value={stats.activeUsers.toLocaleString()}  icon="✅" color="#14b8a6" />
        <KPI label="Admin Users"   value={stats.adminUsers.toLocaleString()}   icon="🛡" color="#6366f1" />
        <KPI label="Premium Users" value={stats.premiumUsers.toLocaleString()} icon="⭐" color="#f59e0b" />
      </div>

      {/* Filter bar */}
      <div className="au-filter-bar">
        <div className="au-search-wrap">
          <span className="mc-search-icon">🔍</span>
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
              {f === "ALL" ? "All" : f === "ADMIN" ? "Admins" : f[0] + f.slice(1).toLowerCase()}
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
        <select className="au-sort-select" value={sort}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSort(e.target.value)}>
          <option value="name">Name A–Z</option>
          <option value="msgs">Most Messages</option>
        </select>
        <span className="au-filter-count">
          {loading ? "…" : `${filteredUsers.length} users`}
        </span>
      </div>

      {/* Grid */}
      <div className={`au-main-grid ${detail ? "au-main-grid--panel" : "au-main-grid--full"}`}>
        <div className="au-cards-grid">
          {loading && (
            <div className="au-empty">
              <div className="au-empty__spinner" />
              <div className="au-empty__title">Loading users…</div>
            </div>
          )}
          {!loading && error && (
            <div className="au-empty">
              <div className="au-empty__icon">⚠️</div>
              <div className="au-empty__title">Could not load users</div>
              <div className="au-empty__desc">{error}</div>
            </div>
          )}
          {!loading && !error && filteredUsers.map(u => (
            <UserCard key={u.id} user={u} isSelected={detail?.id === u.id}
              onClick={() => setDetail(detail?.id === u.id ? null : u)} />
          ))}
          {!loading && !error && filteredUsers.length === 0 && (
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

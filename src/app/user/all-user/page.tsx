"use client";

import { useState } from "react";
import "./all-user.css";

import { User, UserStats } from "./types";
import { useUsers } from "./hooks/useUsers";
import { KPI } from "./components/KPI";
import { FilterBar } from "./components/FilterBar";
import { UserCard } from "./components/UserCard";
import { DetailPanel } from "./components/DetailPanel";
import { InviteModal } from "./components/InviteModal";

export default function AllUsers() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [role,   setRole]   = useState("ALL");
  const [sort,   setSort]   = useState("name");
  const [detail, setDetail] = useState<User | null>(null);
  const [invite, setInvite] = useState(false);

  const { users, stats, loading, error } = useUsers();

  const filteredUsers = [...users]
    .filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.company.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "ALL" || user.status === status;
      const matchesRole   = role   === "ALL" || user.role.toLowerCase() === role.toLowerCase();
      return matchesSearch && matchesStatus && matchesRole;
    })
    .sort((a, b) =>
      sort === "msgs" ? b.msgs - a.msgs : a.name.localeCompare(b.name)
    );

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

      {/* KPIs */}
      <div className="au-kpi-grid">
        <KPI label="Total Users"   value={stats.totalUsers.toLocaleString()}   icon="👥" color="#2bc386" />
        <KPI label="Active Users"  value={stats.activeUsers.toLocaleString()}  icon="✅" color="#34d399" />
        <KPI label="Admin Users"   value={stats.adminUsers.toLocaleString()}   icon="🛡" color="#6366f1" />
        <KPI label="Premium Users" value={stats.premiumUsers.toLocaleString()} icon="⭐" color="#f59e0b" />
      </div>

      {/* Filters */}
      <FilterBar
        search={search}       onSearchChange={setSearch}
        status={status}       onStatusChange={setStatus}
        role={role}           onRoleChange={setRole}
        sort={sort}           onSortChange={setSort}
        count={filteredUsers.length}
        loading={loading}
      />

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

          {!loading && !error && filteredUsers.map((u) => (
            <UserCard
              key={u.id}
              user={u}
              isSelected={detail?.id === u.id}
              onClick={() => setDetail(detail?.id === u.id ? null : u)}
            />
          ))}

          {!loading && !error && filteredUsers.length === 0 && (
            <div className="au-empty">
              <div className="au-empty__icon">🔍</div>
              <div className="au-empty__title">No users found</div>
              <div className="au-empty__desc">Try adjusting your search or filters.</div>
            </div>
          )}
        </div>

        {detail && (
          <DetailPanel user={detail} onClose={() => setDetail(null)} />
        )}
      </div>

      {invite && <InviteModal onClose={() => setInvite(false)} />}
    </div>
  );
}

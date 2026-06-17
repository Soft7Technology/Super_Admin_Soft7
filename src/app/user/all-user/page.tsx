"use client";

import { useState } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import "./all-user.css";

import { User, UserStats } from "./types";
import { useUsers } from "./hooks/useUsers";
import { KPI } from "./components/KPI";
import { FilterBar } from "./components/FilterBar";
import { UserCard } from "./components/UserCard";
import { DetailPanel } from "./components/DetailPanel";

export default function AllUsers() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [role,   setRole]   = useState("ALL");
  const [sort,   setSort]   = useState("name");
  const [detail, setDetail] = useState<User | null>(null);
  const [invite, setInvite] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const { users, stats, loading, error } = useUsers();
  const query = search.trim().toLowerCase();
  const handleSelectUser = (userId: string) => {
  setSelectedUsers((prev) =>
    prev.includes(userId)
      ? prev.filter((id) => id !== userId)
      : [...prev, userId]
  );
};

const handleSelectAll = () => {
  if (selectedUsers.length === filteredUsers.length) {
    setSelectedUsers([]);
  } else {
    setSelectedUsers(filteredUsers.map((u) => u.id));
  }
};

const handleDeleteSelected = async () => {
  if (!selectedUsers.length) return;

  const confirmDelete = window.confirm(
    `Delete ${selectedUsers.length} users?`
  );

  if (!confirmDelete) return;

  try {
    await axiosInstance.delete("/v1/admin/users/bulk-delete", {
      data: {
        user_ids: selectedUsers,
      },
    });

    window.location.reload();
  } catch (error) {
    console.error(error);
  }
};

  const filteredUsers = [...users]
    .filter((user) => {
      const emailDomain = user.email.includes("@") ? user.email.split("@").pop() ?? "" : "";
      const searchable = [
        user.name,
        user.email,
        emailDomain,
        user.company,
        user.companyDomain,
      ].join(" ").toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
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
<div className="au-selection-toolbar">
  {selectedUsers.length > 0 && (
    <button
      className="au-btn au-btn--danger au-btn--bulk-delete"
      onClick={handleDeleteSelected}
    >
      Delete Selected ({selectedUsers.length})
    </button>
  )}

  <label className="au-select-all">
    <input
      type="checkbox"
      checked={
        filteredUsers.length > 0 &&
        selectedUsers.length === filteredUsers.length
      }
      onChange={handleSelectAll}
    />
    Select All
  </label>
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

          {!loading && !error && filteredUsers.map((u) => (
            <UserCard
  key={u.id}
  user={u}
  isSelected={detail?.id === u.id}
  checked={selectedUsers.includes(u.id)}
  onCheck={() => handleSelectUser(u.id)}
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
  <DetailPanel
    user={detail}
    onClose={() => setDetail(null)}
    onDeleted={() => {
      setDetail(null);
      window.location.reload();
    }}
  />
)}
      </div>
    </div>
  );
}

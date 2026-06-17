"use client";

import { useState } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import "./all-user.css";
import {
  User,
  UserStats,
  roleColor,
  planColor,
} from "./types";

import { Badge } from "./components/Badge";
import { useUsers } from "./hooks/useUsers";
import { KPI } from "./components/KPI";
import { FilterBar } from "./components/FilterBar";

import { DetailPanel } from "./components/DetailPanel";
import { Eye } from "lucide-react";

export default function AllUsers() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [role,   setRole]   = useState("ALL");
  const [sort,   setSort]   = useState("name");
  const [detail, setDetail] = useState<User | null>(null);
  const [invite, setInvite] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
const rowsPerPage = 10;

  const { users, stats, loading, error, refresh } = useUsers();
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
const totalPages = Math.ceil(
  filteredUsers.length / rowsPerPage
);

const paginatedUsers = filteredUsers.slice(
  (currentPage - 1) * rowsPerPage,
  currentPage * rowsPerPage
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
        <div className="au-table-wrapper">
  <table className="au-table">
   <thead>
<tr>
  <th style={{ width: "50px" }}>
          <input
            type="checkbox"
            checked={
              filteredUsers.length > 0 &&
              selectedUsers.length === filteredUsers.length
            }
            onChange={handleSelectAll}
          />
        </th>
<th style={{ width: "220px" }}>USER</th>

<th style={{ width: "320px" }}>EMAIL</th>

<th style={{ width: "180px" }}>PHONE</th>

<th style={{ width: "120px" }}>ROLE</th>

<th style={{ width: "140px" }}>PLAN</th>

<th style={{ width: "140px" }}>STATUS</th>

<th style={{ width: "140px" }}>JOINED</th>

<th style={{ width: "120px" }}>ACTIONS</th>
      </tr>
    </thead>

    <tbody>
    {paginatedUsers.map((user) => (
        <tr key={user.id}>
          <td>
            <input
              type="checkbox"
              checked={selectedUsers.includes(user.id)}
              onChange={() => handleSelectUser(user.id)}
            />
          </td>

         <td>
  <div className="au-user-cell">
    <div
      className="au-avatar au-avatar--table"
      style={{ background: user.av }}
    >
      {user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()}
    </div>

    <span className="au-user-name">
      {user.name}
    </span>
  </div>
</td>
          <td>{user.email}</td>

          <td>{user.phone || "-"}</td>

          <td>
            <span
              className="au-chip"
              style={{
                background: `${roleColor(user.role)}15`,
                color: roleColor(user.role),
              }}
            >
              {user.role}
            </span>
          </td>

          <td>
            <span
              className="au-chip"
              style={{
                background: `${planColor(user.plan)}15`,
                color: planColor(user.plan),
              }}
            >
              {user.plan}
            </span>
          </td>

          <td>
            <Badge status={user.status} />
          </td>

          <td>{user.joined}</td>

          <td>
  <button
    className="au-action-btn"
    onClick={() => setDetail(user)}
  >
    <Eye size={18} />
  </button>
</td>
        </tr>
      ))}
    </tbody>
  </table>
  <div className="au-pagination">
  <button
    disabled={currentPage === 1}
    onClick={() =>
      setCurrentPage((p) => p - 1)
    }
  >
    Previous
  </button>

  <span>
    Page {currentPage} of {totalPages}
  </span>

  <button
    disabled={currentPage === totalPages}
    onClick={() =>
      setCurrentPage((p) => p + 1)
    }
  >
    Next
  </button>
</div>
{detail && (
  <DetailPanel
    user={detail}
    onClose={() => setDetail(null)}
    onRefresh={refresh}
  />
)}
</div>
      </div>
    </div>
  );
}
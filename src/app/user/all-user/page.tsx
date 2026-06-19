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
import { EditUserModal } from "./components/EditUserModal";
import { ResetPasswordModal } from "./components/ResetPasswordModal";
import { Eye, Pencil, KeyRound, ShieldOff, ShieldCheck, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

export default function AllUsers() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [role,   setRole]   = useState("ALL");
  const [sort,   setSort]   = useState("name");
  const [detail, setDetail] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Inline action states
  const [editUser,       setEditUser]       = useState<User | null>(null);
  const [passwordUser,   setPasswordUser]   = useState<User | null>(null);
  const [suspendingId,   setSuspendingId]   = useState<string | null>(null);
  const [deletingId,     setDeletingId]     = useState<string | null>(null);

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
    const confirmDelete = window.confirm(`Delete ${selectedUsers.length} users?`);
    if (!confirmDelete) return;
    try {
      await axiosInstance.delete("/v1/admin/users/bulk-delete", {
        data: { user_ids: selectedUsers },
      });
  toast.success(`${selectedUsers.length} users deleted successfully`);
      window.location.reload();
    } catch (error) {
      console.error(error);
   toast.error("Failed to delete users");
    }
  };

const handleSuspendToggle = async (user: User) => {
  const isSuspended = user.status === "SUSPENDED";

  try {
    setSuspendingId(user.id);

    const endpoint = isSuspended
      ? `/v1/admin/users/${user.id}/active-user`
      : `/v1/admin/users/${user.id}/suspend-user`;

    const { data } = await axiosInstance.put(endpoint);

    if (data.success !== false) {
      user.status = isSuspended ? "ACTIVE" : "SUSPENDED";

      toast.success(
        `User ${
          isSuspended ? "restored" : "suspended"
        } successfully`
      );

      refresh();
    } else {
      toast.error(data.message || "Operation failed");
    }
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message ||
      "Something went wrong"
    );
  } finally {
    setSuspendingId(null);
  }
};
  const handleDeleteUser = async (user: User) => {
  try {
    setDeletingId(user.id);

    const { data } = await axiosInstance.delete(
      `/v1/admin/users/${user.id}`
    );

    if (data.success !== false) {
      toast.success(
        `User "${user.name}" deleted successfully`
      );

      refresh();
    } else {
      toast.error(
        data.message || "Failed to delete user"
      );
    }
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message ||
      "Something went wrong"
    );
  } finally {
    setDeletingId(null);
  }
};
  const filteredUsers = [...users]
    .filter((user) => {
      const emailDomain = user.email.includes("@") ? user.email.split("@").pop() ?? "" : "";
      const searchable = [user.name, user.email, emailDomain, user.company, user.companyDomain]
        .join(" ").toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      const matchesStatus = status === "ALL" || user.status === status;
      const matchesRole   = role   === "ALL" || user.role.toLowerCase() === role.toLowerCase();
      return matchesSearch && matchesStatus && matchesRole;
    })
    .sort((a, b) =>
      sort === "msgs" ? b.msgs - a.msgs : a.name.localeCompare(b.name)
    );

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
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

      {/* Selection toolbar */}
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
            checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
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
                    checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th style={{ width: "180px", maxWidth: "180px" }}>USER</th>
                <th style={{ width: "240px", maxWidth: "240px" }}>EMAIL</th>
                <th style={{ width: "150px" }}>PHONE</th>
                <th style={{ width: "100px" }}>ROLE</th>
                <th style={{ width: "120px" }}>PLAN</th>
                <th style={{ width: "120px" }}>STATUS</th>
                <th style={{ width: "120px" }}>JOINED</th>
                <th style={{ width: "220px" }}>ACTIONS</th>
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
                      <div className="au-avatar au-avatar--table" style={{ background: user.av }}>
                        {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <span className="au-user-name">{user.name}</span>
                    </div>
                  </td>

                  <td>{user.email}</td>
                  <td>{user.phone || "-"}</td>

                  <td>
                    <span
                      className="au-chip"
                      style={{ background: `${roleColor(user.role)}15`, color: roleColor(user.role) }}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td>
                    <span
                      className="au-chip"
                      style={{ background: `${planColor(user.plan)}15`, color: planColor(user.plan) }}
                    >
                      {user.plan}
                    </span>
                  </td>

                  <td>
                    <Badge status={user.status} />
                  </td>

                  <td>{user.joined}</td>

                  {/* ── ACTION BUTTONS COLUMN ── */}
                  <td>
                    <div className="au-action-group">
                      {/* View Details */}
                      <button
                        className="au-action-btn"
                        title="View Details"
                        onClick={() => setDetail(user)}
                      >
                        <Eye size={15} />
                      </button>

                      {/* Edit User */}
                      <button
                        className="au-action-btn au-action-btn--edit"
                        title="Edit User"
                        onClick={() => setEditUser(user)}
                      >
                        <Pencil size={15} />
                      </button>

                      {/* Reset Password */}
                      <button
                        className="au-action-btn au-action-btn--key"
                        title="Reset Password"
                        onClick={() => setPasswordUser(user)}
                      >
                        <KeyRound size={15} />
                      </button>

                      {/* Suspend / Restore */}
                      {user.status === "SUSPENDED" ? (
                        <button
                          className="au-action-btn au-action-btn--restore"
                          title="Restore Account"
                          disabled={suspendingId === user.id}
                          onClick={() => handleSuspendToggle(user)}
                        >
                          <ShieldCheck size={15} />
                        </button>
                      ) : (
                        <button
                          className="au-action-btn au-action-btn--suspend"
                          title="Suspend User"
                          disabled={suspendingId === user.id}
                          onClick={() => handleSuspendToggle(user)}
                        >
                          <ShieldOff size={15} />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        className="au-action-btn au-action-btn--delete"
                        title="Delete User"
                        disabled={deletingId === user.id}
                        onClick={() => handleDeleteUser(user)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="au-pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </div>

        {/* Detail panel (view only — no action buttons) */}
        {detail && (
          <DetailPanel
            user={detail}
            onClose={() => setDetail(null)}
            onRefresh={refresh}
          />
        )}
      </div>

      {/* Edit modal */}
      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onUpdated={(updatedUser) => {
            Object.assign(editUser, updatedUser);
          toast.success(`User "${editUser.name}" updated successfully`);
            refresh();
            setEditUser(null);
          }}
        />
      )}

      {/* Reset password modal */}
      {passwordUser && (
        <ResetPasswordModal user={passwordUser} onClose={() => setPasswordUser(null)} />
      )}
      <ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop
  closeOnClick
  pauseOnHover
  draggable
  theme="light"
/>
    </div>
  );
}
"use client";

import { useState, useMemo } from "react";
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


export default function AllUsers() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [role,   setRole]   = useState("ALL");
  const [sort,   setSort]   = useState("name");
  const [detail, setDetail] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  // Inline action states
  const [editUser,       setEditUser]       = useState<User | null>(null);
  const [passwordUser,   setPasswordUser]   = useState<User | null>(null);
  const [suspendingId,   setSuspendingId]   = useState<string | null>(null);
  const [deletingId,     setDeletingId]     = useState<string | null>(null);

  const { users, stats, loading, error, refresh, updateUserStatus } = useUsers();

  // Filter users by status, role, and search query
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      // Status filter
      if (status !== "ALL" && u.status.toUpperCase() !== status.toUpperCase()) {
        return false;
      }
      // Role filter
      if (role !== "ALL" && u.role.toLowerCase() !== role.toLowerCase()) {
        return false;
      }
      // Search filter
      if (q) {
        const searchable = [
          u.name,
          u.email,
          u.phone,
          u.company,
          u.companyDomain,
          u.plan,
          u.role,
          u.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [users, status, role, search]);

  // Sort filtered users
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) =>
      sort === "msgs" ? b.msgs - a.msgs : a.name.localeCompare(b.name)
    );
  }, [filteredUsers, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedUsers = useMemo(() => {
    const start = (safeCurrentPage - 1) * rowsPerPage;
    return sortedUsers.slice(start, start + rowsPerPage);
  }, [sortedUsers, safeCurrentPage, rowsPerPage]);

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map((u) => u.id));
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
      toast.success(
        `User ${isSuspended ? "restored" : "suspended"} successfully`
      );
      // Optimistically update the UI immediately
      updateUserStatus(user.id, isSuspended ? "ACTIVE" : "SUSPENDED");
      
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
  // Reset to page 1 whenever filters change
  const handleStatusChange = (value: string) => {
    setStatus(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    setCurrentPage(1);
  };

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

      {/* Filters, with Select All / bulk-delete pinned to the right of the same row */}
      <FilterBar
        search={search}       onSearchChange={handleSearchChange}
        status={status}       onStatusChange={handleStatusChange}
        role={role}           onRoleChange={handleRoleChange}
        sort={sort}           onSortChange={handleSortChange}
        count={filteredUsers.length}
        loading={loading}
        rightSlot={
          <div
            className="au-selection-toolbar"
            style={{ display: "flex", alignItems: "center", gap: "12px", margin: 0, padding: 0 }}
          >
            {selectedUsers.length > 0 && (
              <button
                className="au-btn au-btn--danger au-btn--bulk-delete"
                onClick={handleDeleteSelected}
              >
                Delete Selected ({selectedUsers.length})
              </button>
            )}
            <label className="au-select-all" style={{ margin: 0 }}>
              <input
                type="checkbox"
                checked={paginatedUsers.length > 0 && selectedUsers.length === paginatedUsers.length}
                onChange={handleSelectAll}
              />
              Select All
            </label>
          </div>
        }
      />

      {/* Grid */}
      <div className={`au-main-grid ${detail ? "au-main-grid--panel" : "au-main-grid--full"}`}>
        <div className="au-table-wrapper">
          <table className="au-table">
            <thead>
              <tr>
                <th style={{ width: "50px" }}>
                  <input
                    type="checkbox"
                    checked={paginatedUsers.length > 0 && selectedUsers.length === paginatedUsers.length}
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
               <th style={{ width: "260px", minWidth: "260px" }}>
  ACTIONS
</th>
              </tr>
            </thead>

            <tbody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
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
                ))
              ) : (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "32px 0", color: "#6b7280" }}>
                    {loading ? "Loading users..." : "No users match your filters"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="au-pagination">
            <button disabled={safeCurrentPage <= 1 || loading} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
              Previous
            </button>
            <span>Page {safeCurrentPage} of {totalPages}</span>
            <button disabled={safeCurrentPage >= totalPages || loading} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
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
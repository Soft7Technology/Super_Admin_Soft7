"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { axiosInstance } from "@/lib/axiosInstance";
import { getAuthHeaders } from "@/lib/auth-client";
import "./all-user.css";
import {
  User,
  roleColor,
  planColor,
  formatPhoneNumber,
} from "./types";

import Swal from "sweetalert2";
import { Badge } from "./components/Badge";
import { useUsers } from "./hooks/useUsers";
import { KPI } from "./components/KPI";
import { FilterBar } from "./components/FilterBar";
import { DetailPanel } from "./components/DetailPanel";
import { EditUserModal } from "./components/EditUserModal";
import { ResetPasswordModal } from "./components/ResetPasswordModal";
import { AddUserModal } from "./components/AddUserModal";
import { DeleteUserModal } from "./components/DeleteUserModal";
import { StatusUserModal } from "./components/StatusUserModal";
import { Eye, Pencil, KeyRound, ShieldOff, ShieldCheck, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AllUsersContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState("ALL");
  const [role,   setRole]   = useState("ALL");
  const [sort,   setSort]   = useState("name");
  const [detail, setDetail] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  // Sync search query from URL (e.g. from Global Topbar Search)
  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) {
      setSearch(q);
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Inline action states
  const [showAddModal,   setShowAddModal]   = useState(false);
  const [editUser,       setEditUser]       = useState<User | null>(null);
  const [passwordUser,   setPasswordUser]   = useState<User | null>(null);
  const [userToDelete,   setUserToDelete]   = useState<User | null>(null);
  const [statusUserModal, setStatusUserModal] = useState<{
    user: User;
    targetStatus: "ACTIVE" | "SUSPENDED";
  } | null>(null);
  const [suspendingId,   setSuspendingId]   = useState<string | null>(null);
  const [deletingId,     setDeletingId]     = useState<string | null>(null);

  const { users, stats, loading, refresh, updateUserStatus, companies, companiesMap } = useUsers();

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
    if (!selectedUsers.length || deletingId) return;

    const result = await Swal.fire({
      title: `Delete ${selectedUsers.length} Selected Users?`,
      html: `Are you sure you want to delete <strong>${selectedUsers.length}</strong> selected users?<br/><br/><span style="font-size:13px;color:#ef4444;">This action cannot be undone.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete Selected",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId("bulk");
      let deleted = false;
      try {
        const { data } = await axiosInstance.delete("/v1/admin/users/bulk-delete", {
          data: { user_ids: selectedUsers },
        });
        if (data?.success !== false) deleted = true;
      } catch (extErr: any) {
        console.warn("External bulk delete note:", extErr?.message);
      }

      try {
        await Promise.all(
          selectedUsers.map((uid) =>
            fetch(`/api/admin/users/${uid}`, { method: "DELETE" }).catch(() => null)
          )
        );
        deleted = true;
      } catch (locErr: any) {
        console.warn("Local bulk delete note:", locErr?.message);
      }

      if (deleted) {
        toast.success(`${selectedUsers.length} users deleted successfully`);
        setSelectedUsers([]);
        refresh();
      } else {
        toast.error("Failed to delete selected users");
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Failed to delete users");
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenStatusModal = (user: User) => {
    if (suspendingId) return;
    const isSuspended = user.status === "SUSPENDED";
    const targetStatus = isSuspended ? "ACTIVE" : "SUSPENDED";
    setStatusUserModal({ user, targetStatus });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusUserModal || suspendingId) return;

    const { user, targetStatus } = statusUserModal;
    const isSuspending = targetStatus === "SUSPENDED";
    const actionVerb = isSuspending ? "suspend" : "activate";

    try {
      setSuspendingId(user.id);

      let updated = false;

      // 1. Try external endpoint
      try {
        const endpoint = isSuspending
          ? `/v1/admin/users/${user.id}/suspend-user`
          : `/v1/admin/users/${user.id}/active-user`;
        const { data } = await axiosInstance.put(endpoint);
        if (data?.success !== false) {
          updated = true;
        }
      } catch (extErr: any) {
        console.warn("External status update note:", extErr?.message);
      }

      // 2. Try internal Next.js Prisma API
      try {
        const localRes = await fetch(`/api/admin/users/${user.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ status: targetStatus }),
        });
        if (localRes.ok) {
          const localData = await localRes.json().catch(() => ({}));
          if (localData?.success !== false) {
            updated = true;
          }
        }
      } catch (localErr: any) {
        console.warn("Local status update note:", localErr?.message);
      }

      if (updated) {
        toast.success(
          `User "${user.name}" ${isSuspending ? "suspended" : "activated"} successfully`
        );
        updateUserStatus(user.id, targetStatus);
        setStatusUserModal(null);
        refresh();
      } else {
        toast.error(`Failed to ${actionVerb} user. Please try again.`);
      }
    } catch (error: any) {
      console.error("Status toggle error:", error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update user status"
      );
    } finally {
      setSuspendingId(null);
    }
  };

  const handleDeleteUser = (user: User) => {
    if (deletingId) return;
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete || deletingId) return;

    const targetUser = userToDelete;
    const targetUserId = targetUser.id;
    const targetUserName = targetUser.name?.trim() || targetUser.email || "User";

    try {
      setDeletingId(targetUserId);

      let deleted = false;
      let errorMessage = "Failed to delete user. Please try again.";

      // 1. Try external backend
      try {
        const { data } = await axiosInstance.delete(`/v1/admin/users/${targetUserId}`);
        if (data?.success !== false) {
          deleted = true;
        } else if (data?.message) {
          errorMessage = data.message;
        }
      } catch (extErr: any) {
        console.warn("External user delete note:", extErr?.message);
        if (extErr?.response?.data?.message) {
          errorMessage = extErr.response.data.message;
        }
      }

      // 2. Try internal Next.js Prisma API
      try {
        const localRes = await fetch(`/api/admin/users/${targetUserId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        if (localRes.ok) {
          const localData = await localRes.json().catch(() => ({}));
          if (localData?.success !== false) {
            deleted = true;
          }
        }
      } catch (localErr: any) {
        console.warn("Local user delete note:", localErr?.message);
      }

      if (deleted) {
        toast.success(`User "${targetUserName}" deleted successfully`);
        setUserToDelete(null);
        setSelectedUsers((prev) => prev.filter((id) => id !== targetUserId));
        if (detail?.id === targetUserId) {
          setDetail(null);
        }
        refresh();
      } else {
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete user"
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
      <div className="au-header" style={{ alignItems: "center" }}>
        <div>
          <h1 className="au-header__title">All Users</h1>
          <p className="au-header__subtitle">All platform users across every company</p>
        </div>
        <button
          type="button"
          className="au-btn au-btn--primary"
          style={{
            width: "auto",
            minWidth: "130px",
            height: "40px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "0 18px",
            fontSize: "13px",
            fontWeight: 700,
          }}
          onClick={() => setShowAddModal(true)}
        >
          + Add User
        </button>
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
      <div className="au-main-grid au-main-grid--full">
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
                <th style={{ minWidth: "220px" }}>EMAIL</th>
                <th style={{ width: "150px", minWidth: "140px" }}>PHONE</th>
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

                  <td title={user.email} className="au-email-cell">
                    <span className="au-email-text">{user.email}</span>
                  </td>
                  <td>{formatPhoneNumber(user.phone)}</td>

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
                          disabled={suspendingId !== null}
                          onClick={() => handleOpenStatusModal(user)}
                        >
                          <ShieldCheck size={15} />
                        </button>
                      ) : (
                        <button
                          className="au-action-btn au-action-btn--suspend"
                          title="Suspend User"
                          disabled={suspendingId !== null}
                          onClick={() => handleOpenStatusModal(user)}
                        >
                          <ShieldOff size={15} />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        className="au-action-btn au-action-btn--delete"
                        title="Delete User"
                        disabled={deletingId !== null}
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
      </div>

      {/* User Details Modal (rendered outside table grid) */}
      {detail && (
        <DetailPanel
          user={detail}
          onClose={() => setDetail(null)}
          onRefresh={refresh}
          companiesMap={companiesMap}
        />
      )}

      {/* Add / Invite User Modal */}
      {showAddModal && (
        <AddUserModal
          companies={companies}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            refresh();
          }}
        />
      )}

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

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <DeleteUserModal
          user={userToDelete}
          isDeleting={deletingId === userToDelete.id}
          onClose={() => {
            if (deletingId) return;
            setUserToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Status User Confirmation Modal */}
      {statusUserModal && (
        <StatusUserModal
          user={statusUserModal.user}
          targetStatus={statusUserModal.targetStatus}
          isUpdating={suspendingId === statusUserModal.user.id}
          onClose={() => {
            if (suspendingId) return;
            setStatusUserModal(null);
          }}
          onConfirm={handleConfirmStatusChange}
        />
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

export default function AllUsers() {
  return (
    <Suspense fallback={null}>
      <AllUsersContent />
    </Suspense>
  );
}
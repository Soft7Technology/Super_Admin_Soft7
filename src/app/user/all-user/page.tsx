"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { axiosInstance } from "@/lib/axiosInstance";
import "./all-user.css";
import Spinner from "@/components/ui/Spinner";
import { User, UserStats, roleColor, planColor } from "./types";

import { Badge } from "./components/Badge";
import { useUsers } from "./hooks/useUsers";
import { KPI } from "./components/KPI";
import { FilterBar } from "./components/FilterBar";
import { CompanyDropdown } from "./components/CompanyDropdown";
import { useCompanies } from "./hooks/useCompanies";
import { DetailPanel } from "./components/DetailPanel";
import { EditUserModal } from "./components/EditUserModal";
import { ResetPasswordModal } from "./components/ResetPasswordModal";
import {
  Eye,
  Pencil,
  KeyRound,
  ShieldOff,
  ShieldCheck,
  Trash2,
  Users,
  UserCheck,
  Award,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AllUsers() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [role, setRole] = useState("ALL");
  const [sort, setSort] = useState("name");
  const [detail, setDetail] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  // Inline action states
  const [editUser, setEditUser] = useState<User | null>(null);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    companies,
    loading: companiesLoading,
    error: companiesError,
  } = useCompanies();

  const {
    users,
    stats,
    pagination,
    loading,
    error,
    refresh,
    updateUserStatus,
  } = useUsers({
    page: currentPage,
    limit: rowsPerPage,
    companyId: selectedCompanyId || undefined,
  });

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
      sort === "msgs" ? b.msgs - a.msgs : a.name.localeCompare(b.name),
    );
  }, [filteredUsers, sort]);

  // Backend handles pagination, so use the total page count returned by the API.
  const totalPages = Math.max(
    1,
    pagination?.totalPages ??
      Math.ceil((pagination?.total ?? users.length) / rowsPerPage),
  );

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setCurrentPage(1);
    setSelectedUsers([]);
    setDetail(null);
  };

  const selectedCompany = companies.find((company) => company.id === selectedCompanyId);

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === sortedUsers.length && sortedUsers.length > 0) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(sortedUsers.map((u) => u.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedUsers.length) return;
    const confirmDelete = window.confirm(
      `Delete ${selectedUsers.length} users?`,
    );
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

      const endpoint = `/v1/super-admin/companies/${user.companyId}/users/${user.id}/status`;

      const { data } = await axiosInstance.patch(endpoint, {
        status: isSuspended ? "active" : "suspended",
        reason: "User review",
      });

      if (data.success !== false) {
        toast.success(
          `User ${isSuspended ? "restored" : "suspended"} successfully`,
        );
        // Optimistically update the UI immediately
        updateUserStatus(user.id, isSuspended ? "ACTIVE" : "SUSPENDED");
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setSuspendingId(null);
    }
  };
  const handleDeleteUser = async (user: User) => {
    try {
      setDeletingId(user.id);

      const { data } = await axiosInstance.delete(`/v1/admin/users/${user.id}`);

      if (data.success !== false) {
        toast.success(`User "${user.name}" deleted successfully`);

        refresh();
      } else {
        toast.error(data.message || "Failed to delete user");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
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
          <p className="au-header__subtitle">
            {selectedCompany
              ? `Users of ${selectedCompany.name}`
              : "All platform users across every company"}
          </p>
        </div>

        <CompanyDropdown
          companies={companies}
          value={selectedCompanyId}
          onChange={handleCompanyChange}
          loading={companiesLoading}
          error={companiesError}
        />
      </div>

      {/* KPIs */}
      <div className="au-kpi-grid">
        <KPI
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={<Users size={20} strokeWidth={2} />}
          color="#206bc4"
        />
        <KPI
          label="Active Users"
          value={stats.activeUsers.toLocaleString()}
          icon={<UserCheck size={20} strokeWidth={2} />}
          color="#2fb344"
        />
        <KPI
          label="Premium Users"
          value={stats.premiumUsers.toLocaleString()}
          icon={<Award size={20} strokeWidth={2} />}
          color="#f59f00"
        />
      </div>

      {/* Filters, with Select All / bulk-delete pinned to the right of the same row */}
      <FilterBar
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        role={role}
        onRoleChange={handleRoleChange}
        sort={sort}
        onSortChange={handleSortChange}
        count={filteredUsers.length}
        loading={loading}
        rightSlot={
          <div
            className="au-selection-toolbar"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: 0,
              padding: 0,
            }}
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
                checked={
                  sortedUsers.length > 0 &&
                  selectedUsers.length === sortedUsers.length
                }
                onChange={handleSelectAll}
              />
              Select All
            </label>
          </div>
        }
      />

      {/* Grid */}
      <div
        className={`au-main-grid ${
          detail ? "au-main-grid--panel" : "au-main-grid--full"
        }`}
      >
        <div className="au-table-wrapper au-desktop-only">
          <table className="au-table">
            <thead>
              <tr>
                <th style={{ width: "50px" }}>
                  <input
                    type="checkbox"
                    checked={
                      sortedUsers.length > 0 &&
                      selectedUsers.length === sortedUsers.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th style={{ width: "180px", maxWidth: "180px" }}>USER</th>
                <th style={{ width: "240px", maxWidth: "240px" }}>EMAIL</th>
                <th style={{ width: "150px" }}>PHONE</th>
                <th style={{ width: "100px" }}>ROLE</th>
                <th style={{ width: "120px" }}>PLAN</th>
                <th style={{ width: "120px" }}>STATUS</th>
                <th style={{ width: "260px", minWidth: "260px" }}>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {sortedUsers.length > 0 ? (
                sortedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </td>

                    <td>
                      <Link
                        href={`/user/all-user/${user.id}`}
                        onClick={() => {
                          try {
                            sessionStorage.setItem(`user_${user.id}`, JSON.stringify(user));
                            sessionStorage.setItem("sa_selected_user", JSON.stringify(user));
                          } catch {}
                        }}
                        className="au-user-cell"
                        title={`View profile of ${user.name}`}
                      >
                        <div
                          className="au-avatar au-avatar--table"
                          style={{
                            background:
                              !user.av || user.av === "#10b981" || user.av === "#00a67d"
                                ? "var(--crm-primary, #206bc4)"
                                : user.av,
                          }}
                        >
                          {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <span className="au-user-name">{user.name}</span>
                      </Link>
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

                    {/* ── ACTION BUTTONS COLUMN ── */}
                    <td>
                      <div className="au-action-group">
                        <button
                          className="au-action-btn"
                          title="View Details"
                          onClick={() => setDetail(user)}
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          className="au-action-btn au-action-btn--edit"
                          title="Edit User"
                          onClick={() => setEditUser(user)}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          className="au-action-btn au-action-btn--key"
                          title="Reset Password"
                          onClick={() => setPasswordUser(user)}
                        >
                          <KeyRound size={15} />
                        </button>

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
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      padding: "32px 0",
                      color: "#6b7280",
                    }}
                  >
                    {loading ? (
                      <Spinner
                        variant="center"
                        size="lg"
                        color="primary"
                        text="Loading users..."
                      />
                    ) : (
                      "No users match your filters"
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (<= 768px) */}
        <div className="au-mobile-cards">
          {sortedUsers.length > 0 ? (
            sortedUsers.map((user) => (
              <div key={user.id} className="au-user-card">
                {/* Header row: Checkbox, Avatar, Name & Email, Status Badge */}
                <div className="au-user-card__header">
                  <div className="au-user-card__identity">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="au-user-card__checkbox"
                    />
                    <Link
                      href={`/user/all-user/${user.id}`}
                      onClick={() => {
                        try {
                          sessionStorage.setItem(`user_${user.id}`, JSON.stringify(user));
                          sessionStorage.setItem("sa_selected_user", JSON.stringify(user));
                        } catch {}
                      }}
                      className="au-user-card__link"
                    >
                      <div
                        className="au-avatar au-avatar--table"
                        style={{
                          background:
                            !user.av || user.av === "#10b981" || user.av === "#00a67d"
                              ? "var(--crm-primary, #206bc4)"
                              : user.av,
                        }}
                      >
                        {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="au-user-card__name-wrap">
                        <span className="au-user-card__name">{user.name}</span>
                        <span className="au-user-card__email">{user.email}</span>
                      </div>
                    </Link>
                  </div>

                  <div className="au-user-card__status">
                    <Badge status={user.status} />
                  </div>
                </div>

                {/* Meta details: Phone, Role, Plan, Joined */}
                <div className="au-user-card__details">
                  <div className="au-user-card__detail-row">
                    <span className="au-user-card__detail-label">Phone</span>
                    <span className="au-user-card__detail-val">{user.phone || "—"}</span>
                  </div>

                  <div className="au-user-card__detail-row">
                    <span className="au-user-card__detail-label">Role</span>
                    <span
                      className="au-chip"
                      style={{
                        background: `${roleColor(user.role)}15`,
                        color: roleColor(user.role),
                        fontSize: "11px",
                        padding: "2px 8px",
                      }}
                    >
                      {user.role}
                    </span>
                  </div>

                  <div className="au-user-card__detail-row">
                    <span className="au-user-card__detail-label">Plan</span>
                    <span
                      className="au-chip"
                      style={{
                        background: `${planColor(user.plan)}15`,
                        color: planColor(user.plan),
                        fontSize: "11px",
                        padding: "2px 8px",
                      }}
                    >
                      {user.plan}
                    </span>
                  </div>

                </div>

                {/* Bottom Actions Toolbar */}
                <div className="au-user-card__actions">
                  <button
                    className="au-user-card__action-btn"
                    title="View Details"
                    onClick={() => setDetail(user)}
                  >
                    <Eye size={14} />
                    <span>View</span>
                  </button>

                  <button
                    className="au-user-card__action-btn"
                    title="Edit User"
                    onClick={() => setEditUser(user)}
                  >
                    <Pencil size={14} />
                    <span>Edit</span>
                  </button>

                  <button
                    className="au-user-card__action-btn"
                    title="Reset Password"
                    onClick={() => setPasswordUser(user)}
                  >
                    <KeyRound size={14} />
                    <span>Pass</span>
                  </button>

                  {user.status === "SUSPENDED" ? (
                    <button
                      className="au-user-card__action-btn au-user-card__action-btn--restore"
                      title="Restore Account"
                      disabled={suspendingId === user.id}
                      onClick={() => handleSuspendToggle(user)}
                    >
                      <ShieldCheck size={14} />
                      <span>Active</span>
                    </button>
                  ) : (
                    <button
                      className="au-user-card__action-btn au-user-card__action-btn--suspend"
                      title="Suspend User"
                      disabled={suspendingId === user.id}
                      onClick={() => handleSuspendToggle(user)}
                    >
                      <ShieldOff size={14} />
                      <span>Suspend</span>
                    </button>
                  )}

                  <button
                    className="au-user-card__action-btn au-user-card__action-btn--delete"
                    title="Delete User"
                    disabled={deletingId === user.id}
                    onClick={() => handleDeleteUser(user)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="au-user-card--empty">
              {loading ? (
                <Spinner
                  variant="center"
                  size="md"
                  color="primary"
                  text="Loading users..."
                />
              ) : (
                "No users match your filters"
              )}
            </div>
          )}
        </div>

          {/* Pagination */}
          <div className="au-pagination">
            <button
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
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
        <ResetPasswordModal
          user={passwordUser}
          onClose={() => setPasswordUser(null)}
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

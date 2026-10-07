"use client";

import { useState, useMemo, useEffect } from "react";
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
  ArrowLeft,
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
  const [search, setSearch] = useState(() => typeof window !== "undefined" ? sessionStorage.getItem("sa_allusers_search") || "" : "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [status, setStatus] = useState(() => typeof window !== "undefined" ? sessionStorage.getItem("sa_allusers_status") || "ALL" : "ALL");
  const [role, setRole] = useState(() => typeof window !== "undefined" ? sessionStorage.getItem("sa_allusers_role") || "ALL" : "ALL");
  const [sort, setSort] = useState("name");
  const [detail, setDetail] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(() => typeof window !== "undefined" ? parseInt(sessionStorage.getItem("sa_allusers_page") || "1") : 1);
  const [rowsPerPage, setRowsPerPage] = useState(() => typeof window !== "undefined" ? parseInt(sessionStorage.getItem("sa_allusers_rows") || "25") : 25);
  const [selectedCompanyId, setSelectedCompanyId] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("sa_selected_company_id") || "";
    }
    return "";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("sa_allusers_search", search);
      sessionStorage.setItem("sa_allusers_status", status);
      sessionStorage.setItem("sa_allusers_role", role);
      sessionStorage.setItem("sa_allusers_page", currentPage.toString());
      sessionStorage.setItem("sa_allusers_rows", rowsPerPage.toString());
    }
  }, [search, status, role, currentPage, rowsPerPage]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    // Reset page to 1 when filters change
    setCurrentPage(1);
  }, [debouncedSearch, status, role, selectedCompanyId]);

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
    search: debouncedSearch || undefined,
    status,
    role,
  });

  // Sort filtered users
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) =>
      sort === "msgs" ? b.msgs - a.msgs : a.name.localeCompare(b.name),
    );
  }, [users, sort]);

  // Backend handles pagination, so use the total page count returned by the API.
  const totalPages = Math.max(
    1,
    pagination?.totalPages ??
      Math.ceil((pagination?.total ?? users.length) / rowsPerPage),
  );

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    try {
      if (companyId) {
        sessionStorage.setItem("sa_selected_company_id", companyId);
      } else {
        sessionStorage.removeItem("sa_selected_company_id");
      }
    } catch {}
    setCurrentPage(1);
    setSelectedUsers([]);
    setDetail(null);
  };

  const handleClearCompanyFilter = () => {
    setSelectedCompanyId("");
    try { sessionStorage.removeItem("sa_selected_company_id"); } catch {}
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {selectedCompany && (
              <button
                onClick={handleClearCompanyFilter}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "1px solid var(--au-border, #e2e8f0)",
                  background: "var(--au-card-bg, #fff)",
                  cursor: "pointer",
                  color: "var(--au-text, #1e293b)",
                  flexShrink: 0,
                }}
                title="Back to All Users"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <h1 className="au-header__title">
              {selectedCompany ? `Users of ${selectedCompany.name}` : "All Users"}
            </h1>
          </div>
          {!selectedCompany && (
            <p className="au-header__subtitle">
              All platform users across every company
            </p>
          )}
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
        count={pagination?.total ?? users.length}
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
        
          <div className="au-tbl au-tbl-scroll au-desktop-only">
            <div className="au-th">
              <div>
                <input type="checkbox" checked={sortedUsers.length > 0 && selectedUsers.length === sortedUsers.length} onChange={handleSelectAll} />
              </div>
              <div>USER</div>
              <div>EMAIL</div>
              <div>PHONE</div>
              <div>ROLE</div>
              <div>PLAN</div>
              <div>STATUS</div>
              <div>ACTIONS</div>
            </div>
            
            {loading ? (
               <div style={{ padding: '32px 0', textAlign: 'center' }}>
                 <Spinner variant="center" size="lg" color="primary" text="Loading users..." />
               </div>
            ) : sortedUsers.length === 0 ? (
               <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--muted)' }}>
                 No users match your filters
               </div>
            ) : (
              sortedUsers.map(user => (
                <div className="au-row" key={user.id}>
                  <div>
                    <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => handleSelectUser(user.id)} />
                  </div>
                  
                  <div className="au-usr">
                    <Link href={`/user/all-user/${user.id}`} onClick={() => { try { sessionStorage.setItem("user_" + user.id, JSON.stringify(user)); } catch {} }} className="au-av" style={{ background: !user.av || user.av === '#10b981' || user.av === '#00a67d' ? 'var(--crm-primary, #206bc4)' : user.av }}>
                      {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </Link>
                    <Link href={`/user/all-user/${user.id}`} onClick={() => { try { sessionStorage.setItem("user_" + user.id, JSON.stringify(user)); } catch {} }} className="au-un">
                      {user.name}
                    </Link>
                  </div>
                  
                  <div className="au-cell-muted">{user.email}</div>
                  <div className="au-cell-muted">{user.phone || "-"}</div>
                  
                  <div>
                    <span className="au-badge-role" style={{ color: roleColor(user.role) }}>{user.role}</span>
                  </div>
                  
                  <div>
                    <span className="au-badge-plan"><Award size={14} color={planColor(user.plan)} /> {user.plan}</span>
                  </div>
                  
                  <div>
                    <Badge status={user.status} />
                  </div>
                  
                  <div className="au-action-group">
                    <button className="au-action-btn" title="View Details" onClick={() => setDetail(user)}><Eye size={15} /></button>
                    <button className="au-action-btn au-action-btn--edit" title="Edit User" onClick={() => setEditUser(user)}><Pencil size={15} /></button>
                    <button className="au-action-btn au-action-btn--key" title="Reset Password" onClick={() => setPasswordUser(user)}><KeyRound size={15} /></button>
                    {user.status === "SUSPENDED" ? (
                      <button className="au-action-btn au-action-btn--restore" title="Restore Account" disabled={suspendingId === user.id} onClick={() => handleSuspendToggle(user)}><ShieldCheck size={15} /></button>
                    ) : (
                      <button className="au-action-btn au-action-btn--suspend" title="Suspend User" disabled={suspendingId === user.id} onClick={() => handleSuspendToggle(user)}><ShieldOff size={15} /></button>
                    )}
                    <button className="au-action-btn au-action-btn--delete" title="Delete User" disabled={deletingId === user.id} onClick={() => handleDeleteUser(user)}><Trash2 size={15} /></button>
                  </div>
                </div>
              ))
            )}
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
                    <Link href={`/user/all-user/${user.id}`} onClick={() => { try { sessionStorage.setItem("user_" + user.id, JSON.stringify(user)); } catch {} }} className="au-user-card__link"
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
          
          {/* Pagination */}
          <div className="au-foot au-desktop-only">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <div>
                  Showing <b>{Math.min((currentPage - 1) * rowsPerPage + 1, pagination?.total || users.length)}-{Math.min(currentPage * rowsPerPage, pagination?.total || users.length)}</b> of <b>{pagination?.total || users.length}</b> users
              </div>
            </div>
            
            <div className="au-pg">
              <button className="text-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1).map((p, i, arr) => (
                <span key={p} style={{display: 'flex', alignItems: 'center'}}>
                  {i > 0 && arr[i - 1] !== p - 1 && <span style={{margin: '0 4px', color: 'var(--muted)'}}>...</span>}
                  <button className={`num-btn ${currentPage === p ? 'on' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
                </span>
              ))}
              
              <button className="text-btn" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
            </div>
          </div>

        {/* Detail panel (view only - no action buttons) */}
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







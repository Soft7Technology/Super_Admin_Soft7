"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { axiosInstance } from "@/lib/axiosInstance";
import { User, UserStats, planVariant, roleVariant } from "./types";

import { Badge } from "./components/Badge";
import { useUsers } from "./hooks/useUsers";
import { KPI } from "./components/KPI";
import { FilterBar } from "./components/FilterBar";
import { DetailPanel } from "./components/DetailPanel";
import { EditUserModal } from "./components/EditUserModal";
import { ResetPasswordModal } from "./components/ResetPasswordModal";
import {
  Eye,
  Pencil,
  KeyRound,
  Shield,
  ShieldOff,
  ShieldCheck,
  Star,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PageContainer, PageHeader } from "@/components/layout";
import Alert from "@/components/ui/Alert";
import Avatar from "@/components/ui/Avatar";
import KitBadge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import IconButton from "@/components/ui/IconButton";
import Pagination from "@/components/ui/Pagination";
import Table from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import { useTheme } from "@/context/ThemeContext";

export default function AllUsers() {
  const { isDark } = useTheme();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [role, setRole] = useState("ALL");
  const [sort, setSort] = useState("name");
  const [detail, setDetail] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  // Inline action states
  const [editUser, setEditUser] = useState<User | null>(null);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const allSelected = sortedUsers.length > 0 && selectedUsers.length === sortedUsers.length;

  const columns: Column<User>[] = [
    {
      key: "select",
      width: "48px",
      header: <Checkbox aria-label="Select all users" checked={allSelected} onChange={handleSelectAll} />,
      render: (user) => (
        <Checkbox
          aria-label={`Select ${user.name}`}
          checked={selectedUsers.includes(user.id)}
          onChange={() => handleSelectUser(user.id)}
        />
      ),
    },
    {
      key: "name",
      header: "User",
      render: (user) => (
        <Link
          href={`/user/all-user/${user.id}`}
          onClick={() => {
            try {
              sessionStorage.setItem(`user_${user.id}`, JSON.stringify(user));
              sessionStorage.setItem("sa_selected_user", JSON.stringify(user));
            } catch {}
          }}
          className="group flex max-w-[12rem] items-center gap-3"
          title={`View profile of ${user.name}`}
        >
          <Avatar name={user.name} size="sm" />
          <span className="truncate font-medium text-foreground group-hover:text-primary-text group-hover:underline">
            {user.name}
          </span>
        </Link>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (user) => <span className="block max-w-[15rem] truncate text-secondary-foreground">{user.email}</span>,
    },
    {
      key: "phone",
      header: "Phone",
      render: (user) => <span className="tabular-nums text-secondary-foreground">{user.phone || "-"}</span>,
    },
    {
      key: "role",
      header: "Role",
      render: (user) => <KitBadge variant={roleVariant(user.role)}>{user.role}</KitBadge>,
    },
    {
      key: "plan",
      header: "Plan",
      render: (user) => <KitBadge variant={planVariant(user.plan)}>{user.plan}</KitBadge>,
    },
    {
      key: "status",
      header: "Status",
      render: (user) => <Badge status={user.status} />,
    },
    {
      key: "joined",
      header: "Joined",
      render: (user) => <span className="text-muted-foreground">{user.joined}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (user) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton size="sm" aria-label="View Details" icon={<Eye size={15} />} onClick={() => setDetail(user)} />
          <IconButton size="sm" aria-label="Edit User" icon={<Pencil size={15} />} onClick={() => setEditUser(user)} />
          <IconButton size="sm" aria-label="Reset Password" icon={<KeyRound size={15} />} onClick={() => setPasswordUser(user)} />
          {user.status === "SUSPENDED" ? (
            <IconButton
              size="sm"
              aria-label="Restore Account"
              icon={<ShieldCheck size={15} />}
              className="text-success hover:bg-success-bg"
              disabled={suspendingId === user.id}
              onClick={() => handleSuspendToggle(user)}
            />
          ) : (
            <IconButton
              size="sm"
              aria-label="Suspend User"
              icon={<ShieldOff size={15} />}
              className="text-warning hover:bg-warning-bg"
              disabled={suspendingId === user.id}
              onClick={() => handleSuspendToggle(user)}
            />
          )}
          <IconButton
            size="sm"
            aria-label="Delete User"
            icon={<Trash2 size={15} />}
            className="text-error hover:bg-error-bg"
            disabled={deletingId === user.id}
            onClick={() => handleDeleteUser(user)}
          />
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader title="All Users" description="All platform users across every company" />

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPI label="Total Users" value={stats.totalUsers.toLocaleString()} icon={<Users size={18} />} />
        <KPI label="Active Users" value={stats.activeUsers.toLocaleString()} icon={<UserCheck size={18} />} tone="success" />
        <KPI label="Admin Users" value={stats.adminUsers.toLocaleString()} icon={<Shield size={18} />} tone="info" />
        <KPI label="Premium Users" value={stats.premiumUsers.toLocaleString()} icon={<Star size={18} />} tone="warning" />
      </div>

      {error && <Alert variant="error" className="mb-4" message={error} />}

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
          <div className="flex items-center gap-3">
            {selectedUsers.length > 0 && (
              <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={handleDeleteSelected}>
                Delete Selected ({selectedUsers.length})
              </Button>
            )}
            <Checkbox label="Select All" checked={allSelected} onChange={handleSelectAll} />
          </div>
        }
      />

      <Table
        columns={columns}
        data={sortedUsers}
        rowKey={(user) => user.id}
        loading={loading}
        emptyMessage="No users match your filters"
      />

      {/* Pagination */}
      <Pagination
        className="mt-4"
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={pagination?.total}
        itemsPerPage={rowsPerPage}
        showInfo
        onPageChange={(page) => {
          if (!loading) setCurrentPage(page);
        }}
      />

      {/* Detail panel (view only — no action buttons) */}
      {detail && (
        <DetailPanel
          user={detail}
          onClose={() => setDetail(null)}
          onRefresh={refresh}
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
        theme={isDark ? "dark" : "light"}
      />
    </PageContainer>
  );
}

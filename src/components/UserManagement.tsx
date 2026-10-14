"use client";
import React from "react";
import { ChevronRight, Users } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Table, { type Column } from "@/components/ui/Table";
import Alert from "@/components/ui/Alert";

interface DbUser {
  id: string;
  un: string;
  role: string;
  status: string;
  av: string;
  col: string;
}

const ROLE_VARIANT: Record<string, BadgeVariant> = {
  admin: "primary",
  manager: "warning",
  user: "neutral",
};

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  active: "success",
  inactive: "neutral",
  pending: "warning",
  suspended: "error",
};

/** User table card — same design as WA_ADMIN's dashboard tables. */
export default function UserManagement({
  users = [],
  loading = false,
  error = null,
  title = "User Management",
  showViewAll = true,
  onUserClick,
  onViewAll,
}: {
  users?: DbUser[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  showViewAll?: boolean;
  onUserClick?: (user: DbUser) => void;
  onViewAll?: () => void;
}) {
  const columns: Column<DbUser>[] = [
    {
      key: "un",
      header: "User",
      render: (u) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={u.un} size="sm" />
          <span className="truncate font-medium text-foreground" title={u.un}>
            {u.un}
          </span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (u) => <Badge variant={ROLE_VARIANT[u.role.toLowerCase()] ?? "neutral"}>{u.role}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <Badge variant={STATUS_VARIANT[u.status.toLowerCase()] ?? "neutral"} dot>
          {u.status}
        </Badge>
      ),
    },
  ];

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="px-5 pt-5">
        <CardHeader
          icon={Users}
          title={title}
          action={
            showViewAll && onViewAll ? (
              <Button variant="ghost" size="sm" rightIcon={<ChevronRight size={14} />} onClick={onViewAll}>
                View all
              </Button>
            ) : undefined
          }
        />
      </div>
      {error ? (
        <div className="px-5 pb-5">
          <Alert variant="error" message={error} />
        </div>
      ) : (
        <Table
          className="rounded-none border-x-0 border-b-0"
          columns={columns}
          data={users}
          rowKey={(u) => u.id}
          loading={loading}
          onRowClick={onUserClick}
          emptyMessage="No users found"
        />
      )}
    </Card>
  );
}

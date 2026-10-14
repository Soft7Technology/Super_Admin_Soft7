"use client";
import React from "react";
import { Building2, ChevronRight } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Table, { type Column } from "@/components/ui/Table";
import Alert from "@/components/ui/Alert";

interface Company {
  id: string;
  name: string;
  ini: string;
  col: string;
  status: string;
  plan: string;
  users: number;
}

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  Active: "success",
  Inactive: "neutral",
  Trial: "warning",
  Suspended: "error",
};

/** Company table card — same design as WA_ADMIN's dashboard tables. */
export default function CompanyOverview({
  companies = [],
  loading = false,
  error = null,
  title = "Company Overview",
  showViewAll = true,
  onCompanyClick,
  onViewAll,
}: {
  companies?: Company[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  showViewAll?: boolean;
  onCompanyClick?: (company: Company) => void;
  onViewAll?: () => void;
}) {
  const columns: Column<Company>[] = [
    {
      key: "name",
      header: "Company Name",
      render: (co) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={co.name} size="sm" />
          <span className="truncate font-medium text-foreground" title={co.name}>
            {co.name}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (co) => (
        <Badge variant={STATUS_VARIANT[co.status] ?? "neutral"} dot>
          {co.status}
        </Badge>
      ),
    },
    { key: "plan", header: "Plan", render: (co) => <Badge>{co.plan}</Badge> },
    {
      key: "users",
      header: "Users",
      align: "right",
      render: (co) => <span className="font-medium tabular-nums text-foreground">{co.users}</span>,
    },
  ];

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="px-5 pt-5">
        <CardHeader
          icon={Building2}
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
          data={companies}
          rowKey={(co) => co.id}
          loading={loading}
          onRowClick={onCompanyClick}
          emptyMessage="No companies found"
        />
      )}
    </Card>
  );
}

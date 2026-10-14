"use client";

import { Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Select from "@/components/ui/Select";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  role: string;
  onRoleChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  count: number;
  loading: boolean;
  /** Optional extra content rendered at the end of the filter bar row
   *  (e.g. the "Select All" / bulk-delete toolbar). */
  rightSlot?: React.ReactNode;
}

const STATUS_FILTERS = ["ALL", "ACTIVE", "INACTIVE", "SUSPENDED"];
const ROLE_FILTERS   = ["ALL", "Admin", "User"];

const SORT_OPTIONS = [
  { value: "name", label: "Name A–Z" },
  { value: "msgs", label: "Most Messages" },
];

export function FilterBar({
  search, onSearchChange,
  status, onStatusChange,
  role,   onRoleChange,
  sort,   onSortChange,
  count,  loading,
  rightSlot,
}: FilterBarProps) {
  return (
    <Card padding="sm" className="mb-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <Input
          wrapperClassName="min-w-0 flex-[1_1_14rem]"
          leftIcon={<Search size={15} />}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name, email, domain..."
          aria-label="Search users"
        />

        <div className="flex flex-wrap items-center gap-2">
          {/* Status */}
          <SegmentedControl
            aria-label="Filter by status"
            value={status}
            onChange={onStatusChange}
            options={STATUS_FILTERS.map((f) => ({
              value: f,
              label: f === "ALL" ? "All" : f[0] + f.slice(1).toLowerCase(),
            }))}
          />

          {/* Role */}
          <SegmentedControl
            aria-label="Filter by role"
            value={role}
            onChange={onRoleChange}
            options={ROLE_FILTERS.map((r) => ({ value: r, label: r === "ALL" ? "All Roles" : r }))}
          />

          {/* Sort */}
          <Select
            aria-label="Sort users"
            wrapperClassName="w-44"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            options={SORT_OPTIONS}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {loading ? "…" : `${count} users`}
          </span>
          {rightSlot}
        </div>
      </div>
    </Card>
  );
}

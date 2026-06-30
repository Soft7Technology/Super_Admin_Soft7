"use client";

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

export function FilterBar({
  search, onSearchChange,
  status, onStatusChange,
  role,   onRoleChange,
  sort,   onSortChange,
  count,  loading,
  rightSlot,
}: FilterBarProps) {
  return (
    <div className="au-filter-bar">
      {/* Search */}
      <div className="au-search-wrap">
        <span className="mc-search-icon">🔍</span>
        <input
          className="au-search-input"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name, email, domain..."
        />
      </div>

      {/* Status pills */}
      <div className="au-filter-group">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => onStatusChange(f)}
            className={`au-filter-pill ${status === f ? "au-filter-pill--active" : ""}`}
          >
            {f === "ALL" ? "All" : f[0] + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Role pills */}
      <div className="au-filter-group">
        {ROLE_FILTERS.map((r) => (
          <button
            key={r}
            onClick={() => onRoleChange(r)}
            className={`au-filter-pill au-filter-pill--role ${role === r ? "au-filter-pill--active" : ""}`}
          >
            {r === "ALL" ? "All Roles" : r}
          </button>
        ))}
      </div>

      {/* Sort */}
      <select
        className="au-sort-select"
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="name">Name A–Z</option>
        <option value="msgs">Most Messages</option>
      </select>

      <span className="au-filter-count">
        {loading ? "…" : `${count} users`}
      </span>

      {/* Select All / bulk-delete toolbar — pushed to the far right of the
          same row, right after the users count */}
      {rightSlot && (
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
          {rightSlot}
        </div>
      )}
    </div>
  );
}
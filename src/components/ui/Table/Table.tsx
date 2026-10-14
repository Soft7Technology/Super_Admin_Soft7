"use client";

import { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import EmptyState from "../EmptyState";
import Skeleton from "../Skeleton";
import styles from "./Table.module.css";

export interface Column<T> {
  key: string;
  header: ReactNode;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onSort?: (key: string) => void;
  sortKey?: string;
  sortOrder?: "asc" | "desc";
  onRowClick?: (row: T) => void;
  rowKey?: (row: T, index: number) => string | number;
  loading?: boolean;
  emptyMessage?: ReactNode;
  emptyDescription?: ReactNode;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Table<T extends Record<string, any>>({
  columns,
  data,
  onSort,
  sortKey,
  sortOrder,
  onRowClick,
  rowKey,
  loading = false,
  emptyMessage = "No data available",
  emptyDescription,
  className,
}: TableProps<T>) {
  const sortIcon = (key: string) =>
    sortKey !== key ? (
      <ArrowUpDown size={13} />
    ) : sortOrder === "asc" ? (
      <ArrowUp size={13} />
    ) : (
      <ArrowDown size={13} />
    );

  return (
    <div className={cn(styles.container, className)}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                style={{ width: column.width }}
                aria-sort={
                  sortKey === column.key ? (sortOrder === "asc" ? "ascending" : "descending") : undefined
                }
                className={cn(
                  styles.th,
                  styles[column.align || "left"],
                  column.sortable && styles.sortable,
                  sortKey === column.key && styles.sorted,
                )}
                onClick={() => column.sortable && onSort?.(column.key)}
              >
                {column.header}
                {column.sortable && <span className={styles.sortIcon}>{sortIcon(column.key)}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className={cn(styles.row, styles.skeletonRow)}>
                {columns.map((column) => (
                  <td key={column.key} className={styles.td}>
                    <Skeleton className="h-3.5 w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.empty}>
                <EmptyState title={emptyMessage} description={emptyDescription} />
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={rowKey ? rowKey(row, index) : index}
                className={cn(styles.row, onRowClick && styles.clickable)}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className={cn(styles.td, styles[column.align || "left"])}>
                    {column.render ? column.render(row) : row[column.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export { Table };

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./Pagination.module.css";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  showInfo?: boolean;
  className?: string;
}

function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 2) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 10,
  showInfo = true,
  className,
}: PaginationProps) {
  const start = totalItems ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const end = Math.min(currentPage * itemsPerPage, totalItems || 0);

  return (
    <nav className={cn(styles.root, className)} aria-label="Pagination">
      {showInfo && !!totalItems && (
        <p className={styles.info}>
          Showing <strong>{start}</strong>–<strong>{end}</strong> of <strong>{totalItems}</strong>
        </p>
      )}
      <div className={styles.nav}>
        <button
          type="button"
          className={styles.step}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
          <span className="hidden sm:inline">Previous</span>
        </button>
        <div className={styles.pages}>
          {pageList(currentPage, totalPages).map((page, i) =>
            page === "…" ? (
              <span key={`e${i}`} className={styles.ellipsis}>
                …
              </span>
            ) : (
              <button
                key={page}
                type="button"
                className={styles.page}
                aria-current={page === currentPage ? "page" : undefined}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ),
          )}
        </div>
        <button
          type="button"
          className={styles.step}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={15} />
        </button>
      </div>
    </nav>
  );
}

export { Pagination };

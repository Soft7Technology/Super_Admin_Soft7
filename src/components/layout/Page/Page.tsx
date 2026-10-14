import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./Page.module.css";

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** "default" = 80rem content max (dashboard parity), "wide" = full width, "narrow" = forms */
  width?: "default" | "wide" | "narrow";
  /** Vertical rhythm between direct children */
  stack?: boolean;
}

/** Centered, padded page frame used by every admin screen. */
export function PageContainer({ width = "default", stack = false, className, children, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(styles.page, width === "wide" && styles.wide, width === "narrow" && styles.narrow, stack && styles.stack, className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  /** Primary actions, right-aligned (wraps below on small screens) */
  actions?: ReactNode;
}

/** Page title + description + actions row. */
export function PageHeader({ title, description, eyebrow, actions, className, children, ...props }: PageHeaderProps) {
  return (
    <div className={cn(styles.header, className)} {...props}>
      <div className={styles.heading}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
        {children}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}

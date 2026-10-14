import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./EmptyState.module.css";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}

export default function EmptyState({ icon, title, description, action, compact, className }: EmptyStateProps) {
  return (
    <div className={cn(styles.root, compact && styles.compact, className)}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

export { EmptyState };

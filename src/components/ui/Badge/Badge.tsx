import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./Badge.module.css";

export type BadgeVariant =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info"
  /** @deprecated use "neutral" */
  | "default"
  /** @deprecated use "error" */
  | "danger"
  /** @deprecated use "primary" */
  | "secondary";

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  neutral: styles.neutral,
  default: styles.neutral,
  primary: styles.primary,
  secondary: styles.primary,
  success: styles.success,
  warning: styles.warning,
  error: styles.error,
  danger: styles.error,
  info: styles.info,
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  square?: boolean;
}

export default function Badge({
  variant = "neutral",
  size = "md",
  dot = false,
  square = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(styles.badge, VARIANT_CLASS[variant], styles[size], square && styles.square, className)}
      {...props}
    >
      {dot && <span className={styles.dot} aria-hidden />}
      {children}
    </span>
  );
}

export { Badge };

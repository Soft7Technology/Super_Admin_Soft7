import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./Spinner.module.css";

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "white" | "gray";
  label?: string;
}

export default function Spinner({ size = "md", color = "primary", label = "Loading", className, ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(styles.spinner, styles[size], styles[color], className)}
      {...props}
    />
  );
}

export function SpinnerOverlay({ message = "Loading…" }: { message?: string }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.overlayCard}>
        <Spinner size="lg" />
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export { Spinner };

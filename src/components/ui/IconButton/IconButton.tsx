import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";
import styles from "./IconButton.module.css";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: icon-only buttons need an accessible name */
  "aria-label": string;
  icon: ReactNode;
  variant?: "ghost" | "outlined" | "solid";
  size?: "sm" | "md" | "lg";
  round?: boolean;
  active?: boolean;
  /** Numeric badge (e.g. counts); 0/undefined hides it */
  badge?: number;
  /** Small attention dot */
  dot?: boolean;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      variant = "ghost",
      size = "md",
      round = false,
      active = false,
      badge,
      dot,
      className,
      type = "button",
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      title={props.title ?? props["aria-label"]}
      aria-pressed={active || undefined}
      className={cn(
        styles.iconButton,
        variant !== "ghost" && styles[variant],
        styles[size],
        round && styles.round,
        active && styles.active,
        className,
      )}
      {...props}
    >
      {icon}
      {badge ? <span className={styles.badge}>{badge > 99 ? "99+" : badge}</span> : null}
      {!badge && dot ? <span className={styles.dot} aria-hidden /> : null}
    </button>
  ),
);

IconButton.displayName = "IconButton";

export default IconButton;

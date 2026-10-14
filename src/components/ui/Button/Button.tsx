import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        className,
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      <span className={cn("inline-flex items-center gap-2", isLoading && styles.loadingLabel)}>
        {leftIcon}
        {children}
        {rightIcon}
      </span>
      {isLoading && (
        <span className={styles.loadingOverlay} aria-hidden>
          <span className={styles.spinner} />
        </span>
      )}
    </button>
  ),
);

Button.displayName = "Button";

export default Button;

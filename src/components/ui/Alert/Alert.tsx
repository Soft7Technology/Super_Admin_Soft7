"use client";

import { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./Alert.module.css";

export type AlertVariant = "success" | "error" | "warning" | "info";

const ICONS: Record<AlertVariant, ReactNode> = {
  success: <CheckCircle2 size={18} />,
  error: <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

export interface AlertProps {
  variant?: AlertVariant;
  title?: ReactNode;
  message: ReactNode;
  onClose?: () => void;
  className?: string;
}

export default function Alert({ variant = "info", title, message, onClose, className }: AlertProps) {
  return (
    <div className={cn(styles.alert, styles[variant], className)} role={variant === "error" ? "alert" : "status"}>
      <span className={styles.icon}>{ICONS[variant]}</span>
      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        <div>{message}</div>
      </div>
      {onClose && (
        <button type="button" onClick={onClose} className={styles.close} aria-label="Dismiss">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export interface ToastProps extends AlertProps {
  isVisible: boolean;
  duration?: number;
}

/** Floating alert (legacy API). Prefer react-hot-toast for new code. */
export function Toast({ isVisible, ...props }: ToastProps) {
  if (!isVisible) return null;
  return <Alert {...props} className={cn(styles.floating, props.className)} />;
}

export { Alert };

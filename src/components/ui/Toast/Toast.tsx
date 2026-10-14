"use client";

import { useEffect } from "react";
import Alert from "../Alert";
import styles from "./Toast.module.css";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

/** Auto-dismissing bottom-right notification (legacy API). */
export default function Toast({ message, type = "success", onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={styles.toast}>
      <Alert variant={type} message={message} onClose={onClose} />
    </div>
  );
}

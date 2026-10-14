import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./Field.module.css";

export { styles as fieldStyles };

export interface FieldProps {
  id?: string;
  label?: ReactNode;
  required?: boolean;
  error?: ReactNode;
  helperText?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Label + control + hint/error, with ids wired for accessibility. */
export default function Field({ id, label, required, error, helperText, className, children }: FieldProps) {
  return (
    <div className={cn(styles.field, className)}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden>
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p id={id ? `${id}-error` : undefined} className={styles.error} role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p id={id ? `${id}-hint` : undefined} className={styles.hint}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export function describedBy(id: string | undefined, error?: ReactNode, helperText?: ReactNode) {
  if (!id) return undefined;
  if (error) return `${id}-error`;
  if (helperText) return `${id}-hint`;
  return undefined;
}

export { Field };

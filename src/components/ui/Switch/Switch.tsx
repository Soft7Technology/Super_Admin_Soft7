import { InputHTMLAttributes, ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";
import styles from "./Switch.module.css";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: ReactNode;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ checked, onCheckedChange, label, disabled, className, ...props }, ref) => (
    <label className={cn(styles.root, className)} data-disabled={disabled || undefined}>
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className={styles.input}
        {...props}
      />
      <span className={styles.track} aria-hidden>
        <span className={styles.thumb} />
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  ),
);

Switch.displayName = "Switch";

export default Switch;

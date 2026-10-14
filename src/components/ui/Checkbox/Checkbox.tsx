import { InputHTMLAttributes, ReactNode, forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";
import styles from "./Checkbox.module.css";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  description?: ReactNode;
  indeterminate?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, indeterminate = false, className, disabled, ...props }, ref) => {
    const inner = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inner.current as HTMLInputElement);
    useEffect(() => {
      if (inner.current) inner.current.indeterminate = indeterminate;
    }, [indeterminate]);

    const box = (
      <input ref={inner} type="checkbox" disabled={disabled} className={cn(styles.box, !label && className)} {...props} />
    );
    if (!label) return box;

    return (
      <label className={cn(styles.root, className)} data-disabled={disabled || undefined}>
        {box}
        <span className={styles.text}>
          {label}
          {description && <span className={styles.description}>{description}</span>}
        </span>
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;

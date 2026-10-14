import { ReactElement, ReactNode, cloneElement, useId } from "react";
import { cn } from "@/lib/utils";
import styles from "./Tooltip.module.css";

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement<{ "aria-describedby"?: string }>;
  side?: "top" | "bottom" | "left" | "right";
  disabled?: boolean;
  className?: string;
}

/** Lightweight CSS tooltip — shows on hover and keyboard focus. */
export default function Tooltip({ content, children, side = "top", disabled, className }: TooltipProps) {
  const id = useId();
  return (
    <span className={cn(styles.root, disabled && styles.disabled, className)}>
      {cloneElement(children, { "aria-describedby": disabled ? undefined : id })}
      <span id={id} role="tooltip" className={cn(styles.tip, styles[side])}>
        {content}
      </span>
    </span>
  );
}

export { Tooltip };

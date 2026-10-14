"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./SegmentedControl.module.css";

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  "aria-label": string;
  className?: string;
}

/** Compact single-choice switcher (date ranges, list/grid views…). */
export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  className,
  ...props
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={props["aria-label"]}
      className={cn(styles.root, size === "sm" && styles.sm, className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
          className={styles.item}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

export { SegmentedControl };

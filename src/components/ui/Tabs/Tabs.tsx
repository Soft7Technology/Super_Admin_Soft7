"use client";

import { KeyboardEvent, ReactNode, useId, useState } from "react";
import { cn } from "@/lib/utils";
import styles from "./Tabs.module.css";

export interface Tab {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  count?: number;
  content?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: "line" | "pills";
  className?: string;
}

export default function Tabs({
  tabs,
  defaultTab,
  activeTab,
  onChange,
  variant = "line",
  className,
}: TabsProps) {
  const baseId = useId();
  const [internal, setInternal] = useState(defaultTab || tabs[0]?.id || "");
  const current = activeTab ?? internal;

  const select = (id: string) => {
    if (activeTab === undefined) setInternal(id);
    onChange?.(id);
  };

  // Arrow-key navigation between enabled tabs (WAI-ARIA tabs pattern)
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const enabled = tabs.filter((t) => !t.disabled);
    const index = enabled.findIndex((t) => t.id === current);
    const next = enabled[(index + (e.key === "ArrowRight" ? 1 : -1) + enabled.length) % enabled.length];
    if (next) {
      select(next.id);
      document.getElementById(`${baseId}-tab-${next.id}`)?.focus();
    }
  };

  const activeContent = tabs.find((t) => t.id === current)?.content;

  return (
    <div className={cn("w-full", className)}>
      <div role="tablist" className={cn(styles.list, styles[variant])} onKeyDown={onKeyDown}>
        {tabs.map((tab) => {
          const selected = current === tab.id;
          return (
            <button
              key={tab.id}
              id={`${baseId}-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => select(tab.id)}
              className={styles.tab}
            >
              {tab.icon}
              {tab.label}
              {typeof tab.count === "number" && <span className={styles.count}>{tab.count}</span>}
            </button>
          );
        })}
      </div>
      {activeContent !== undefined && (
        <div
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${current}`}
          className={styles.panel}
        >
          {activeContent}
        </div>
      )}
    </div>
  );
}

export { Tabs };

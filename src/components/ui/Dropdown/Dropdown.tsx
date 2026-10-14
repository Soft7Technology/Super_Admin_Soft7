"use client";

import Link from "next/link";
import {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import styles from "./Dropdown.module.css";

const CloseContext = createContext<() => void>(() => {});

type TriggerProps = {
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  "aria-haspopup"?: "menu";
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
};

export interface DropdownProps {
  /** A single focusable element (button) that toggles the menu */
  trigger: ReactElement<TriggerProps>;
  children: ReactNode;
  align?: "start" | "end";
  side?: "bottom" | "top";
  width?: string;
  className?: string;
  menuClassName?: string;
  /** Controlled open state (optional) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function Dropdown({
  trigger,
  children,
  align = "end",
  side = "bottom",
  width,
  className,
  menuClassName,
  open: controlledOpen,
  onOpenChange,
}: DropdownProps) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const open = controlledOpen ?? uncontrolled;
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );
  const close = useCallback(() => setOpen(false), [setOpen]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  // Arrow-key navigation between items
  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = items[(index + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length];
    next?.focus();
  };

  const triggerEl = cloneElement(trigger, {
    onClick: (e: MouseEvent<HTMLElement>) => {
      trigger.props.onClick?.(e);
      setOpen(!open);
    },
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? menuId : undefined,
  });

  return (
    <div ref={rootRef} className={cn(styles.root, className)}>
      {triggerEl}
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          onKeyDown={onMenuKeyDown}
          className={cn(styles.menu, styles[side], styles[align], menuClassName)}
          style={width ? ({ width } as CSSProperties) : undefined}
        >
          <CloseContext.Provider value={close}>{children}</CloseContext.Provider>
        </div>
      )}
    </div>
  );
}

export interface DropdownItemProps {
  children: ReactNode;
  icon?: ReactNode;
  onSelect?: () => void;
  href?: string;
  danger?: boolean;
  className?: string;
}

export function DropdownItem({ children, icon, onSelect, href, danger, className }: DropdownItemProps) {
  const close = useContext(CloseContext);
  const cls = cn(styles.item, danger && styles.danger, className);
  if (href) {
    return (
      <Link href={href} role="menuitem" className={cls} onClick={close}>
        {icon}
        {children}
      </Link>
    );
  }
  return (
    <button
      type="button"
      role="menuitem"
      className={cls}
      onClick={() => {
        onSelect?.();
        close();
      }}
    >
      {icon}
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div role="separator" className={styles.separator} />;
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return <div className={styles.label}>{children}</div>;
}

export { Dropdown };

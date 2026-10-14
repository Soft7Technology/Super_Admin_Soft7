"use client";

import { CSSProperties, ReactNode, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import IconButton from "../IconButton";
import { useDialogBehavior } from "../Modal/useDialogBehavior";
import styles from "./Drawer.module.css";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  side?: "right" | "left";
  /** CSS width, e.g. "22rem" */
  width?: string;
  className?: string;
}

export default function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = "right",
  width,
  className,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useDialogBehavior(open, onClose, panelRef);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <>
      <div className={styles.overlay} onMouseDown={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(styles.panel, styles[side], className)}
        style={width ? ({ "--drawer-width": width } as CSSProperties) : undefined}
      >
        <div className={styles.header}>
          <div className="min-w-0">
            {title && (
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
            )}
            {description && <p className={styles.description}>{description}</p>}
          </div>
          <IconButton aria-label="Close panel" size="sm" icon={<X size={18} />} onClick={onClose} />
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </>,
    document.body,
  );
}

export { Drawer };

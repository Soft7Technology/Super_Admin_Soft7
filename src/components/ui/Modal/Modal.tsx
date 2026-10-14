"use client";

import { ReactNode, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import IconButton from "../IconButton";
import { useDialogBehavior } from "./useDialogBehavior";
import styles from "./Modal.module.css";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
  showCloseButton = true,
  className,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useDialogBehavior(isOpen, onClose, panelRef);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(styles.panel, styles[size], className)}
      >
        {(title || showCloseButton) && (
          <div className={styles.header}>
            <div className="min-w-0">
              {title && (
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className={styles.description}>
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <IconButton aria-label="Close dialog" size="sm" icon={<X size={18} />} onClick={onClose} />
            )}
          </div>
        )}
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export { Modal };

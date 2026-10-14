"use client";

import { RefObject, useEffect, useRef } from "react";

/**
 * Shared overlay behavior for Modal and Drawer:
 * Escape to close, body scroll lock, initial focus, focus restore on close.
 * `onClose` is read through a ref so inline callbacks don't re-run the effect.
 */
export function useDialogBehavior(
  open: boolean,
  onClose: () => void,
  panelRef: RefObject<HTMLElement | null>,
) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelector<HTMLElement>(
        "[autofocus], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])",
      );
      (focusable ?? panel).focus();
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open, panelRef]);
}

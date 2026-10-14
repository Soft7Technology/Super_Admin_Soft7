import type { CSSProperties } from "react";

// react-phone-input-2 only accepts inline styles — these mirror the kit's
// form-control surface (Field.module.css `.control`) using theme tokens.

export const phoneInputStyle: CSSProperties = {
  width: "100%",
  height: "2.375rem",
  background: "var(--color-surface)",
  color: "var(--color-text)",
  border: "1px solid var(--color-input-border)",
  borderRadius: "var(--radius-md)",
  paddingLeft: "52px",
  fontSize: "0.875rem",
};

export const phoneButtonStyle: CSSProperties = {
  background: "var(--color-surface-muted)",
  border: "1px solid var(--color-input-border)",
  borderRadius: "var(--radius-md) 0 0 var(--radius-md)",
};

export const phoneDropdownStyle: CSSProperties = {
  background: "var(--color-popover)",
  color: "var(--color-text)",
  border: "1px solid var(--color-border)",
  maxHeight: "250px",
};

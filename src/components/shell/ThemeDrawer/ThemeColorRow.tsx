"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { normalizeHex } from "@/theme";
import styles from "./ThemeDrawer.module.css";

export interface ThemeColorRowProps {
  label: string;
  hint?: string;
  /** Effective color right now, "#rrggbb" — the default unless overridden. */
  value: string;
  /** True when the client has set this role explicitly. */
  overridden: boolean;
  onChange: (hex: string) => void;
  onReset: () => void;
}

/**
 * One editable color in the Theme Editor: swatch (opens the OS picker),
 * name, HEX field, and a reset that appears once the role is overridden.
 */
export default function ThemeColorRow({
  label,
  hint,
  value,
  overridden,
  onChange,
  onReset,
}: ThemeColorRowProps) {
  const nativeRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(value.toUpperCase());
  const [invalid, setInvalid] = useState(false);
  // Color shown on the swatch while dragging, ahead of the throttled app-wide apply.
  const [live, setLive] = useState<string | null>(null);
  const pending = useRef<string | null>(null);
  const timer = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setDraft(value.toUpperCase());
    setInvalid(false);
    if (!pending.current && timer.current === null) setLive(null);
  }, [value]);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      if (pending.current) onChangeRef.current(pending.current);
    },
    [],
  );

  // Re-theming the whole app is expensive; apply at most every 80ms while dragging.
  const scheduleChange = (hex: string) => {
    setLive(hex);
    setDraft(hex.toUpperCase());
    pending.current = hex;
    if (timer.current !== null) return;
    timer.current = window.setTimeout(() => {
      timer.current = null;
      const next = pending.current;
      pending.current = null;
      if (next) onChangeRef.current(next);
    }, 80);
  };

  const shown = live ?? value;

  const commit = (input: string) => {
    const hex = normalizeHex(input);
    setInvalid(!hex);
    if (hex && hex !== value.toLowerCase()) onChange(hex);
  };

  const openNative = () => {
    const el = nativeRef.current;
    if (!el) return;
    try {
      el.showPicker();
    } catch {
      el.click();
    }
  };

  return (
    <div className={styles.row}>
      <button
        type="button"
        className={styles.rowSwatch}
        onClick={openNative}
        aria-label={`Change ${label}`}
        style={{ backgroundColor: shown }}
      >
        <input
          ref={nativeRef}
          type="color"
          tabIndex={-1}
          aria-hidden
          className={styles.nativeInput}
          value={shown}
          onChange={(e) => scheduleChange(e.target.value)}
        />
      </button>

      <span className={styles.rowLabel}>
        <span className={styles.rowName}>
          {label}
          {overridden && (
            <span className={styles.rowDot} title="Customized" aria-label="Customized" />
          )}
        </span>
        {hint && <span className={styles.rowHint}>{hint}</span>}
      </span>

      <input
        className={`${styles.rowHex} ${invalid ? styles.rowHexInvalid : ""}`}
        value={draft}
        spellCheck={false}
        aria-label={`${label} hex value`}
        aria-invalid={invalid || undefined}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit((e.target as HTMLInputElement).value);
        }}
      />

      <button
        type="button"
        className={styles.rowReset}
        onClick={onReset}
        disabled={!overridden}
        aria-label={`Reset ${label}`}
        title="Reset to default"
      >
        <RotateCcw size={13} />
      </button>
    </div>
  );
}

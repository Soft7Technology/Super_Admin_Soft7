"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { AlertTriangle, Moon, RotateCcw, Sun } from "lucide-react";
import {
  BRAND_ROLES,
  GROUP_LABELS,
  MODE_ROLES,
  SEMANTIC_ROLES,
  auditContrast,
  readRoleColors,
  useThemeColors,
  type RoleGroup,
  type ThemeModeName,
  type ThemeRole,
} from "@/theme";
import Button from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import SegmentedControl from "@/components/ui/SegmentedControl";
import ThemeColorRow from "./ThemeColorRow";
import ThemePreview from "./ThemePreview";
import styles from "./ThemeDrawer.module.css";

type Bucket = "brand" | "light" | "dark" | "semantic";

/**
 * Brand Theme editor — the ONE place a workspace's colors are customized.
 *
 * Every row maps to a design token, so a change here repaints the whole
 * application live. Edits are a draft until saved; Cancel restores the saved
 * theme. Opened from the topbar; state lives in ThemeColorProvider.
 */
export default function ThemeDrawer() {
  const {
    draft, isDirty, overrideCount, isPickerOpen, setPickerOpen,
    setPrimary, setRole, clearRole, save, cancel, resetAll, revision,
  } = useThemeColors();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  useEffect(() => setMounted(true), []);

  const mode: ThemeModeName = mounted && theme === "dark" ? "dark" : "light";
  const bucket: Bucket = mode;

  // Effective colors for every role, re-read whenever the painted theme changes.
  const allVars = useMemo(
    () => [...BRAND_ROLES, ...MODE_ROLES, ...SEMANTIC_ROLES].map((r) => r.cssVar),
    [],
  );
  const current = useMemo(
    () => (mounted ? readRoleColors(allVars, mode) : {}),
    [allVars, mode, mounted, revision],
  );

  const warnings = useMemo(
    () => (mounted ? auditContrast(mode).filter((c) => c.ratio < c.target) : []),
    [mode, mounted, revision],
  );

  const visible = (role: ThemeRole) => advanced || role.basic;

  const renderRows = (roles: ThemeRole[], inBucket: Bucket) => {
    const shown = roles.filter(visible);
    if (!shown.length) return null;
    return shown.map((role) => (
      <ThemeColorRow
        key={`${inBucket}:${role.key}`}
        label={role.label}
        hint={advanced ? role.hint : undefined}
        value={current[role.cssVar] || "#000000"}
        overridden={Boolean(
          inBucket === "brand" && role.key === "primary"
            ? false
            : (draft[inBucket] as Record<string, string>)[role.key],
        )}
        onChange={(hex) =>
          inBucket === "brand" && role.key === "primary"
            ? setPrimary(hex)
            : setRole(inBucket, role.key, hex)
        }
        onReset={() => clearRole(inBucket, role.key)}
      />
    ));
  };

  /** Mode roles bucketed by section, in registry order. */
  const modeGroups = useMemo(() => {
    const order: RoleGroup[] = ["surface", "text", "nav", "header"];
    return order
      .map((group) => ({ group, roles: MODE_ROLES.filter((r) => r.group === group) }))
      .filter((g) => g.roles.some(visible));
  }, [advanced]);

  return (
    <Drawer
      open={isPickerOpen}
      onClose={() => setPickerOpen(false)}
      title="Brand Theme"
      description="Customize how the Super Admin portal looks"
      width="27rem"
      footer={
        <div className={styles.footer}>
          <Button variant="ghost" size="sm" onClick={resetAll} title="Restore the default blue Super Admin theme">
            <RotateCcw size={14} /> Reset all
          </Button>
          <div className={styles.footerRight}>
            {isDirty && (
              <Button variant="outline" size="sm" onClick={cancel}>
                Cancel
              </Button>
            )}
            <Button size="sm" onClick={save} disabled={!isDirty}>
              {isDirty ? "Save changes" : "Saved"}
            </Button>
          </div>
        </div>
      }
    >
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Appearance</h3>
        <p className={styles.sectionText}>
          Choose the mode to preview and edit. Light and dark keep separate colors.
        </p>
        <SegmentedControl
          aria-label="Color mode"
          value={mode}
          onChange={(value) => setTheme(value)}
          options={[
            { value: "light", label: "Light", icon: <Sun size={14} /> },
            { value: "dark", label: "Dark", icon: <Moon size={14} /> },
          ]}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h3 className={styles.sectionTitle}>Preview</h3>
            <p className={styles.sectionText}>
              Changes apply to the whole app instantly — save to keep them.
            </p>
          </div>
        </div>
        <ThemePreview />
        {warnings.length > 0 && (
          <div className={styles.warnings} role="status">
            <AlertTriangle size={14} className={styles.warningIcon} />
            <div>
              <strong className={styles.warningTitle}>
                {warnings.length} contrast {warnings.length === 1 ? "issue" : "issues"}
              </strong>
              <ul className={styles.warningList}>
                {warnings.slice(0, 4).map((w) => (
                  <li key={w.label}>
                    {w.label} — {w.ratio.toFixed(1)}:1 (needs {w.target}:1)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h3 className={styles.sectionTitle}>{GROUP_LABELS.brand}</h3>
            <p className={styles.sectionText}>
              Your primary color. Shades below derive from it automatically.
            </p>
          </div>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={advanced}
              onChange={(e) => setAdvanced(e.target.checked)}
            />
            <span>Advanced</span>
          </label>
        </div>
        <div className={styles.rows}>{renderRows(BRAND_ROLES, "brand")}</div>
      </section>

      {modeGroups.map(({ group, roles }) => (
        <section className={styles.section} key={group}>
          <h3 className={styles.sectionTitle}>
            {GROUP_LABELS[group]}
            <span className={styles.modeTag}>{mode}</span>
          </h3>
          <div className={styles.rows}>{renderRows(roles, bucket)}</div>
        </section>
      ))}

      {advanced && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>{GROUP_LABELS.semantic}</h3>
          <p className={styles.sectionText}>
            Status colors stay independent of your brand so success, warning and error keep their meaning.
          </p>
          <div className={styles.rows}>{renderRows(SEMANTIC_ROLES, "semantic")}</div>
        </section>
      )}

      {overrideCount > 0 && (
        <p className={styles.overrideNote}>
          {overrideCount} {overrideCount === 1 ? "color is" : "colors are"} customized. Everything
          else follows the Super Admin defaults.
        </p>
      )}
    </Drawer>
  );
}

export { ThemeDrawer };

/**
 * SuperAdmin Theme Configuration (ported from WA_DASHBOARD) — the ONE source of
 * truth for SuperAdmin branding. Defaults resolve to the blue admin brand.
 *
 * HOW IT WORKS
 * ------------
 * `styles/tokens.css` still defines every default (light in `:root`, dark in
 * `html.dark`). This module layers *overrides* on top of those defaults:
 *
 *   ThemeConfig (sparse overrides)
 *        ↓  buildThemeCss()
 *   one <style id="soft7-theme-overrides"> block
 *        ↓
 *   every token, Tailwind utility and component style in the app
 *
 * Only roles the client actually changed are emitted, so the design-system
 * defaults stay authoritative and there is no second set of values to keep in
 * sync. Because the output is plain CSS custom properties, applying a theme is
 * a single DOM write — it never re-renders the React tree.
 *
 * Light and dark are independent: light overrides land in `:root`, dark ones in
 * `html.dark, .dark`, so the two modes never share a value unless the defaults
 * already do.
 */

import { DEFAULT_PRIMARY, computeBrandVars, normalizeHex } from "./colors";

export const THEME_CONFIG_KEY = "soft7_superadmin_theme_config";
export const OVERRIDE_STYLE_ID = "soft7-superadmin-theme-overrides";

export type ThemeModeName = "light" | "dark";
export type RoleGroup = "brand" | "surface" | "text" | "nav" | "header" | "semantic";

export interface ThemeRole {
  /** Key inside the config bucket. */
  key: string;
  /** CSS custom property this role drives. */
  cssVar: string;
  label: string;
  hint?: string;
  group: RoleGroup;
  /** Shown in Basic mode; everything else is Advanced-only. */
  basic?: boolean;
}

/* ── Brand: mode-agnostic source color ──────────────────────────────────── */
export const BRAND_ROLES: ThemeRole[] = [
  { key: "primary", cssVar: "--brand-tint", label: "Primary brand", hint: "Drives buttons, links, charts and highlights", group: "brand", basic: true },
  { key: "primaryHover", cssVar: "--color-primary-hover", label: "Primary hover", group: "brand" },
  { key: "primaryActive", cssVar: "--color-primary-active", label: "Primary active", group: "brand" },
  { key: "primarySoft", cssVar: "--color-primary-light", label: "Primary soft / tint", hint: "Selected rows, active nav, icon chips", group: "brand" },
  { key: "primaryDark", cssVar: "--color-primary-dark", label: "Primary dark", group: "brand" },
  { key: "primaryForeground", cssVar: "--color-primary-foreground", label: "Primary foreground", hint: "Auto-calculated for contrast unless set", group: "brand" },
];

/* ── Per-mode roles: instantiated once for light and once for dark ──────── */
export const MODE_ROLES: ThemeRole[] = [
  // Surfaces
  { key: "background", cssVar: "--color-background", label: "Page background", group: "surface", basic: true },
  { key: "surface", cssVar: "--color-surface", label: "Card / surface", group: "surface", basic: true },
  { key: "surfaceRaised", cssVar: "--color-surface-raised", label: "Elevated surface", hint: "Popovers, modals, dropdowns", group: "surface" },
  { key: "surfaceMuted", cssVar: "--color-surface-muted", label: "Muted surface", group: "surface" },
  { key: "surfaceHover", cssVar: "--color-surface-hover", label: "Hover surface", group: "surface" },
  { key: "surfaceActive", cssVar: "--color-surface-active", label: "Active / selected", group: "surface" },
  { key: "panel", cssVar: "--color-panel", label: "Large pane", hint: "Side panels and settings nav", group: "surface" },

  // Text
  { key: "text", cssVar: "--color-text", label: "Primary text", group: "text", basic: true },
  { key: "textSecondary", cssVar: "--color-text-secondary", label: "Secondary text", group: "text" },
  { key: "textMuted", cssVar: "--color-text-muted", label: "Muted text", group: "text" },
  { key: "accentText", cssVar: "--color-primary-text", label: "Accent text", hint: "Brand-colored labels and links", group: "text" },
  { key: "accentIcon", cssVar: "--color-accent-icon", label: "Accent icon", group: "text" },

  // Borders & inputs
  { key: "border", cssVar: "--color-border", label: "Border", group: "surface", basic: true },
  { key: "borderSubtle", cssVar: "--color-border-subtle", label: "Subtle border", group: "surface" },
  { key: "input", cssVar: "--color-input", label: "Input background", group: "surface" },
  { key: "inputBorder", cssVar: "--color-input-border", label: "Input border", group: "surface" },

  // Sidebar / navigation
  { key: "sidebar", cssVar: "--color-sidebar", label: "Sidebar background", group: "nav", basic: true },
  { key: "sidebarText", cssVar: "--color-sidebar-text", label: "Sidebar text", group: "nav" },
  { key: "sidebarIcon", cssVar: "--color-sidebar-icon", label: "Sidebar icon", group: "nav" },
  { key: "sidebarHover", cssVar: "--color-sidebar-hover", label: "Sidebar hover", group: "nav" },
  { key: "sidebarActiveBg", cssVar: "--color-sidebar-active-bg", label: "Active background", group: "nav", basic: true },
  { key: "sidebarActiveText", cssVar: "--color-sidebar-active-text", label: "Active text", group: "nav" },
  { key: "sidebarActiveIcon", cssVar: "--color-sidebar-active-icon", label: "Active icon", group: "nav" },
  { key: "sidebarActiveIndicator", cssVar: "--color-sidebar-active-indicator", label: "Active indicator", group: "nav" },

  // Header
  { key: "header", cssVar: "--color-header", label: "Header background", group: "header", basic: true },
  { key: "headerText", cssVar: "--color-header-text", label: "Header text", group: "header" },
  { key: "headerIcon", cssVar: "--color-header-icon", label: "Header icon", group: "header" },

];

/* ── Semantic: status colors stay independent of the brand ──────────────── */
export const SEMANTIC_ROLES: ThemeRole[] = [
  { key: "success", cssVar: "--semantic-success", label: "Success", group: "semantic" },
  { key: "warning", cssVar: "--semantic-warning", label: "Warning", group: "semantic" },
  { key: "error", cssVar: "--semantic-error", label: "Error", group: "semantic" },
  { key: "info", cssVar: "--semantic-info", label: "Info", group: "semantic" },
];

export const GROUP_LABELS: Record<RoleGroup, string> = {
  brand: "Brand",
  surface: "Surfaces & borders",
  text: "Text",
  nav: "Navigation",
  header: "Header",
  semantic: "Status colors",
};

export interface ThemeConfig {
  /** The one brand color everything else derives from. */
  primary: string;
  brand: Record<string, string>;
  light: Record<string, string>;
  dark: Record<string, string>;
  semantic: Record<string, string>;
}

export function createDefaultConfig(): ThemeConfig {
  return { primary: DEFAULT_PRIMARY.toLowerCase(), brand: {}, light: {}, dark: {}, semantic: {} };
}

export function isDefaultConfig(config: ThemeConfig): boolean {
  return (
    normalizeHex(config.primary) === normalizeHex(DEFAULT_PRIMARY) &&
    countOverrides(config) === 0
  );
}

export function countOverrides(config: ThemeConfig): number {
  return (
    Object.keys(config.brand).length +
    Object.keys(config.light).length +
    Object.keys(config.dark).length +
    Object.keys(config.semantic).length
  );
}

/** Deep-ish clone so editor drafts never mutate the saved config. */
export function cloneConfig(config: ThemeConfig): ThemeConfig {
  return {
    primary: config.primary,
    brand: { ...config.brand },
    light: { ...config.light },
    dark: { ...config.dark },
    semantic: { ...config.semantic },
  };
}

/** Accepts unknown JSON (old saves, hand-edits) and returns a safe config. */
export function sanitizeConfig(input: unknown): ThemeConfig {
  const out = createDefaultConfig();
  if (!input || typeof input !== "object") return out;
  const raw = input as Record<string, unknown>;

  const primary = normalizeHex(String(raw.primary ?? ""));
  if (primary) out.primary = primary;

  const pick = (bucket: unknown, roles: ThemeRole[], target: Record<string, string>) => {
    if (!bucket || typeof bucket !== "object") return;
    const src = bucket as Record<string, unknown>;
    for (const role of roles) {
      const hex = normalizeHex(String(src[role.key] ?? ""));
      if (hex) target[role.key] = hex;
    }
  };
  pick(raw.brand, BRAND_ROLES, out.brand);
  pick(raw.light, MODE_ROLES, out.light);
  pick(raw.dark, MODE_ROLES, out.dark);
  pick(raw.semantic, SEMANTIC_ROLES, out.semantic);
  return out;
}

const decl = (name: string, value: string) => `${name}:${value};`;

/**
 * Turn a config into one CSS text block.
 *
 * `:root` carries the brand source variables plus light overrides;
 * `html.dark, .dark` carries dark overrides — so the modes stay independent.
 */
export function buildThemeCss(config: ThemeConfig): string {
  const brandVars = computeBrandVars(config.primary) || computeBrandVars(DEFAULT_PRIMARY)!;

  // Mode-agnostic: the brand source variables plus any brand/semantic override.
  // These must apply in BOTH modes — dark mode reads --brand-dark from here.
  let common = "";
  for (const name in brandVars) common += decl(name, brandVars[name]);
  for (const role of BRAND_ROLES) {
    const value = config.brand[role.key];
    if (!value || role.key === "primary") continue;
    common += decl(role.cssVar, value);
  }
  // An explicit primary override wins over the computed tint/fill pair.
  if (config.brand.primary) {
    common += decl("--brand-tint", config.brand.primary);
    common += decl("--brand-light", config.brand.primary);
  }
  for (const role of SEMANTIC_ROLES) {
    const value = config.semantic[role.key];
    if (value) common += decl(role.cssVar, value);
  }

  let light = "";
  for (const role of MODE_ROLES) {
    const value = config.light[role.key];
    if (value) light += decl(role.cssVar, value);
  }

  let dark = "";
  for (const role of MODE_ROLES) {
    const value = config.dark[role.key];
    if (value) dark += decl(role.cssVar, value);
  }

  // Selectors sit one step above the equivalents in tokens.css, so an override
  // wins wherever this <style> lands in <head> rather than relying on source
  // order — and the two mode blocks are mutually exclusive, so a light-only
  // override never leaks into dark mode:
  //   :root:root         (0,2,0) beats tokens' :root      (0,1,0), both modes
  //   :root:not(.dark)   (0,2,0) beats tokens' :root      (0,1,0), light only
  //   html.dark:root     (0,2,1) beats tokens' html.dark  (0,1,1)
  //   .dark.dark         (0,2,0) beats tokens' .dark      (0,1,0)
  // `.dark.dark` also covers a nested `.dark` element, which is how the editor
  // reads the values of whichever mode is not currently active.
  let css = `:root:root{${common}}`;
  if (light) css += `:root:not(.dark){${light}}`;
  if (dark) css += `html.dark:root,.dark.dark{${dark}}`;
  return css;
}

/** Brand source variables, as written by `computeBrandVars`. */
const BRAND_SOURCE_VARS = [
  "--brand-light", "--brand-light-rgb", "--brand-light-fg", "--brand-light-text",
  "--brand-light-accent", "--brand-dark", "--brand-dark-rgb", "--brand-dark-fg",
  "--brand-dark-text", "--brand-tint",
];

/**
 * Write the theme into the document. One DOM write, no React re-render.
 *
 * The stylesheet is the single mechanism, so any brand variables left inline on
 * <html> by an older build's bootstrap are cleared first — an inline custom
 * property outranks the `:root` rule here and would silently pin the old brand.
 */
export function applyThemeConfig(config: ThemeConfig): string {
  const css = buildThemeCss(config);
  if (typeof document === "undefined") return css;

  const inline = document.documentElement.style;
  for (const name of BRAND_SOURCE_VARS) {
    if (inline.getPropertyValue(name)) inline.removeProperty(name);
  }

  let el = document.getElementById(OVERRIDE_STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = OVERRIDE_STYLE_ID;
    document.head.appendChild(el);
  }
  if (el.textContent !== css) el.textContent = css;
  return css;
}

/* ── Reading the *effective* value of a role ─────────────────────────────── */

/**
 * Resolve what a role currently paints, for either mode, as "#rrggbb".
 *
 * Defaults live in CSS, so they are read back from the document rather than
 * duplicated here. A detached probe carrying `.dark` lets us read dark values
 * while the app is in light mode (and vice versa) without touching the page.
 */
export function readRoleColor(cssVar: string, mode: ThemeModeName): string {
  if (typeof document === "undefined") return "#000000";
  const host = document.createElement("div");
  host.className = mode === "dark" ? "dark" : "";
  host.style.cssText = "position:absolute;width:0;height:0;opacity:0;pointer-events:none";
  const probe = document.createElement("span");
  probe.style.color = `var(${cssVar})`;
  host.appendChild(probe);
  document.body.appendChild(host);
  const value = getComputedStyle(probe).color;
  host.remove();
  return rgbStringToHex(value);
}

/** Batched `readRoleColor` — one probe for many vars, for the editor list. */
export function readRoleColors(cssVars: string[], mode: ThemeModeName): Record<string, string> {
  const out: Record<string, string> = {};
  if (typeof document === "undefined") return out;
  const host = document.createElement("div");
  host.className = mode === "dark" ? "dark" : "";
  host.style.cssText = "position:absolute;width:0;height:0;opacity:0;pointer-events:none";
  const spans = cssVars.map((name) => {
    const span = document.createElement("span");
    span.style.color = `var(${name})`;
    host.appendChild(span);
    return span;
  });
  document.body.appendChild(host);
  cssVars.forEach((name, i) => {
    out[name] = rgbStringToHex(getComputedStyle(spans[i]).color);
  });
  host.remove();
  return out;
}

let probeCtx: CanvasRenderingContext2D | null = null;

/**
 * Any computed CSS color → "#rrggbb".
 *
 * Tokens resolve to `oklab()` and `color-mix()` as often as to `rgb()`, so
 * anything that is not already rgb is rasterized onto a 1×1 canvas and read
 * back — the browser does the color-space conversion for us.
 */
export function rgbStringToHex(value: string): string {
  const hex = (n: number) => Math.max(0, Math.min(255, n || 0)).toString(16).padStart(2, "0");

  const m = /^rgba?\(([^)]+)\)$/.exec(value.trim());
  if (m) {
    const [r, g, b] = m[1].split(/[,/\s]+/).filter(Boolean).map((n) => Math.round(parseFloat(n)));
    return `#${hex(r)}${hex(g)}${hex(b)}`;
  }

  if (typeof document === "undefined" || !value) return "#000000";
  try {
    if (!probeCtx) {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      probeCtx = canvas.getContext("2d", { willReadFrequently: true });
    }
    if (!probeCtx) return "#000000";
    probeCtx.clearRect(0, 0, 1, 1);
    // An unsupported value leaves fillStyle untouched, so seed a known color
    // first and treat "still black" as a parse failure rather than a result.
    probeCtx.fillStyle = "#000000";
    probeCtx.fillStyle = value;
    probeCtx.fillRect(0, 0, 1, 1);
    const px = probeCtx.getImageData(0, 0, 1, 1).data; // indexed: es5 target can't destructure ImageDataArray
    const r = px[0], g = px[1], b = px[2];
    return `#${hex(r)}${hex(g)}${hex(b)}`;
  } catch {
    return "#000000";
  }
}

/* ── Contrast helpers (accessibility warnings in the editor) ─────────────── */

function channel(c: number) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function contrastRatio(a: string, b: string): number {
  const toRgb = (hex: string) => {
    const h = normalizeHex(hex);
    if (!h) return null;
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const ca = toRgb(a);
  const cb = toRgb(b);
  if (!ca || !cb) return 21;
  const lum = (c: number[]) => 0.2126 * channel(c[0]) + 0.7152 * channel(c[1]) + 0.0722 * channel(c[2]);
  const la = lum(ca);
  const lb = lum(cb);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Black or white — whichever stays readable on `background`. */
export function readableOn(background: string): string {
  return contrastRatio(background, "#ffffff") >= contrastRatio(background, "#111417")
    ? "#ffffff"
    : "#111417";
}

export interface ContrastCheck {
  label: string;
  ratio: number;
  /** WCAG AA for the element: 4.5 for text, 3 for large text / UI. */
  target: number;
}

/** Foreground/background pairs worth warning about for the given mode. */
export function auditContrast(mode: ThemeModeName): ContrastCheck[] {
  const read = (v: string) => readRoleColor(v, mode);
  const pairs: Array<[string, string, string, number]> = [
    ["Body text on page", "--color-text", "--color-background", 4.5],
    ["Body text on card", "--color-text", "--color-surface", 4.5],
    ["Muted text on card", "--color-text-muted", "--color-surface", 4.5],
    ["Button label", "--color-primary-foreground", "--color-primary", 4.5],
    ["Accent text on card", "--color-primary-text", "--color-surface", 4.5],
    ["Sidebar text", "--color-sidebar-text", "--color-sidebar", 4.5],
    ["Sidebar active text", "--color-sidebar-active-text", "--color-sidebar-active-bg", 4.5],
    ["Header text", "--color-header-text", "--color-header", 4.5],
  ];
  return pairs.map(([label, fg, bg, target]) => ({
    label,
    ratio: contrastRatio(read(fg), read(bg)),
    target,
  }));
}

/**
 * SuperAdmin theme engine (ported from WA_DASHBOARD) — the single source of truth
 * for the brand color. SuperAdmin defaults to BLUE; the dashboard defaults to green.
 *
 * ONE user-selected HEX color goes in, and a small set of "source" CSS
 * variables comes out. Everything else (hover, active, tints, Tailwind
 * palettes, charts, bubbles…) is derived from these in `styles/tokens.css` with
 * `color-mix()`, so a theme change is a single style write on <html> — no
 * React re-render of the app is required.
 *
 * Source variables written on <html>:
 *   --brand-light / --brand-dark          primary FILL for light / dark mode
 *                                          (light: deepened so white labels pass AA)
 *   --brand-light-accent                   vivid brand for indicators/charts (light)
 *   --brand-tint                           the raw pick; tints neutral surfaces
 *   --brand-light-rgb / --brand-dark-rgb  "r, g, b" (for legacy rgba() usage)
 *   --brand-light-fg / --brand-dark-fg    readable text ON the primary color
 *   --brand-light-text / --brand-dark-text
 *                                          primary as TEXT on a surface,
 *                                          contrast-corrected (WCAG ≥ 4.5:1)
 *
 * IMPORTANT: `computeBrandVars` must stay self-contained (no imports, no
 * closures, ES2017 syntax only). Its source is serialized into the inline
 * brand bootstrap script in `app/layout.tsx` so the saved theme is applied before
 * first paint — that way there is exactly one implementation of the math.
 */

export const DEFAULT_PRIMARY = "#2563EB";
export const THEME_STORAGE_KEY = "soft7_superadmin_theme_primary";

export type BrandVars = Record<string, string>;

export function computeBrandVars(input: string): BrandVars | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(input || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const base = [(n >> 16) & 255, (n >> 8) & 255, n & 255];

  // Light / dark surfaces the brand must stay readable against
  const LIGHT_CANVAS = [236, 240, 237];
  const DARK_SURFACE = [22, 24, 26];
  const INK = [17, 20, 23];

  function lin(c: number) {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }
  function lum(c: number[]) {
    return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  }
  function contrast(a: number[], b: number[]) {
    const la = lum(a);
    const lb = lum(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  function mix(a: number[], b: number[], t: number) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t),
    ];
  }
  function hex(c: number[]) {
    return (
      "#" +
      c
        .map(function (v) {
          const s = Math.max(0, Math.min(255, v)).toString(16);
          return s.length === 1 ? "0" + s : s;
        })
        .join("")
    );
  }
  // Move `c` toward `target` until it reaches `ratio` contrast against `bg`
  function ensure(c: number[], bg: number[], target: number[], ratio: number) {
    let out = c;
    for (let i = 1; i <= 20 && contrast(out, bg) < ratio; i++) {
      out = mix(c, target, i / 20);
    }
    return out;
  }
  // Readable foreground on top of a filled brand surface
  function fg(c: number[]) {
    return contrast(c, [255, 255, 255]) >= contrast(c, INK) ? "#ffffff" : hex(INK);
  }

  // Light mode fill: bright brands (WhatsApp green, cyan…) look washed out on
  // an off-white canvas and cannot carry white labels. Deepen them — keeping
  // hue and saturation — until white text reads at ≥ 4.5:1. Brands that would
  // need heavy darkening to get there (yellows) keep their hue and take dark
  // ink labels instead.
  let light = base;
  if (contrast(base, [255, 255, 255]) < 4.5) {
    let deep = base;
    let steps = 0;
    while (steps < 20 && contrast(deep, [255, 255, 255]) < 4.5) {
      steps++;
      deep = mix(base, [0, 0, 0], steps / 40);
    }
    if (steps <= 16) light = deep;
  }

  // Dark mode: very dark brand colors would disappear on near-black, so lift
  // them until they are clearly visible (≥ 3:1, the WCAG UI-component bar).
  const dark = ensure(base, DARK_SURFACE, [255, 255, 255], 3);
  // Light mode accent (progress, charts, indicators): the vivid brand itself,
  // kept just visible enough against the light canvas.
  const accent = ensure(base, LIGHT_CANVAS, [0, 0, 0], 2.2);

  return {
    "--brand-light": hex(light),
    "--brand-light-rgb": light.join(", "),
    "--brand-light-fg": fg(light),
    "--brand-light-text": hex(ensure(light, LIGHT_CANVAS, [0, 0, 0], 4.5)),
    "--brand-light-accent": hex(accent),
    "--brand-dark": hex(dark),
    "--brand-dark-rgb": dark.join(", "),
    "--brand-dark-fg": fg(dark),
    "--brand-dark-text": hex(ensure(dark, DARK_SURFACE, [255, 255, 255], 4.5)),
    "--brand-tint": hex(base),
  };
}

/** Normalize user input ("25d366", "#25D366 ") to "#25d366", or null. */
export function normalizeHex(input: string): string | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(input || "").trim());
  return m ? `#${m[1].toLowerCase()}` : null;
}

export function hexToRgb(hex: string): [number, number, number] | null {
  const h = normalizeHex(hex);
  if (!h) return null;
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHsl([r, g, b]: [number, number, number]): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return [Math.round(h * 60), Math.round(s * 100), Math.round(l * 100)];
}

const cache = new Map<string, BrandVars>();

/** Memoized wrapper — derived colors are computed once per distinct HEX. */
export function getBrandVars(hex: string): BrandVars | null {
  const key = normalizeHex(hex);
  if (!key) return null;
  let vars = cache.get(key);
  if (!vars) {
    vars = computeBrandVars(key)!;
    cache.set(key, vars);
  }
  return vars;
}

/** Write the source variables on <html>; CSS derives everything else. */
export function applyBrandVars(hex: string): boolean {
  if (typeof document === "undefined") return false;
  const vars = getBrandVars(hex);
  if (!vars) return false;
  const style = document.documentElement.style;
  for (const name in vars) style.setProperty(name, vars[name]);
  return true;
}

/**
 * Inline script for <head>: paints the saved workspace theme before first
 * paint, so there is never a flash of the default brand.
 *
 * A saved ThemeConfig caches its own compiled CSS, so the fast path is a single
 * <style> injection and none of the theme engine has to be serialized here.
 * Workspaces saved before the Theme Editor existed only stored a HEX, so that
 * path still derives the brand variables inline.
 */
export const brandBootstrapScript = `(function(){try{
var CFG=${JSON.stringify("soft7_superadmin_theme_config")},SID=${JSON.stringify("soft7-superadmin-theme-overrides")};
function put(css){var el=document.getElementById(SID);
if(!el){el=document.createElement("style");el.id=SID;document.head.appendChild(el);}
el.textContent=css;}
var raw=localStorage.getItem(CFG);
if(raw){var cfg=JSON.parse(raw);if(cfg&&typeof cfg.css==="string"&&cfg.css){put(cfg.css);return;}}
var compute=${computeBrandVars.toString()};
var saved=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
var vars=(saved&&compute(saved))||compute(${JSON.stringify(DEFAULT_PRIMARY)});
if(vars){var t="";for(var k in vars){t+=k+":"+vars[k]+";"}put(":root:root{"+t+"}");}
}catch(e){}})();`;

let probeCtx: CanvasRenderingContext2D | null = null;

/**
 * Read a resolved CSS variable as an `rgba()` string usable by canvas-based
 * chart libraries (which cannot resolve `var(--x)` or `color-mix()`).
 * The computed color is rasterized onto a 1×1 canvas so any CSS color
 * syntax the browser supports (oklab, color-mix…) comes back as plain rgba.
 */
export function readCssColor(name: string, fallback = "rgba(0, 0, 0, 1)"): string {
  if (typeof window === "undefined") return fallback;
  const probe = document.createElement("span");
  probe.style.color = `var(${name})`;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  if (!value) return fallback;
  try {
    if (!probeCtx) {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      probeCtx = canvas.getContext("2d", { willReadFrequently: true });
    }
    if (!probeCtx) return value;
    probeCtx.clearRect(0, 0, 1, 1);
    probeCtx.fillStyle = value;
    probeCtx.fillRect(0, 0, 1, 1);
    const px = probeCtx.getImageData(0, 0, 1, 1).data; // indexed: es5 target can't destructure ImageDataArray
    const r = px[0], g = px[1], b = px[2], a = px[3];
    return `rgba(${r}, ${g}, ${b}, ${+(a / 255).toFixed(3)})`;
  } catch {
    return value;
  }
}

/** `readCssColor` with a custom alpha, e.g. for chart fills. */
export function withAlpha(rgba: string, alpha: number): string {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(rgba);
  return m ? `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${alpha})` : rgba;
}

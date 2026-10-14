// Runtime theme for SuperAdmin. Server components (app/layout.tsx) import
// "@/theme/bootstrap" and "@/theme/colors" directly.
export { ThemeColorProvider, useThemeColors, DEFAULT_PRIMARY } from "./ThemeColorProvider";
export {
  BRAND_ROLES,
  GROUP_LABELS,
  MODE_ROLES,
  SEMANTIC_ROLES,
  auditContrast,
  contrastRatio,
  countOverrides,
  isDefaultConfig,
  readRoleColor,
  readRoleColors,
  readableOn,
  type ContrastCheck,
  type RoleGroup,
  type ThemeConfig,
  type ThemeModeName,
  type ThemeRole,
} from "./themeConfig";
export { applyBrandVars, getBrandVars, hexToRgb, normalizeHex, readCssColor, rgbToHsl, withAlpha } from "./colors";
export { chartColors, chartTooltipStyle, seriesColor } from "./chart";
export { DEFAULT_MODE, MODE_STORAGE_KEY } from "./config";

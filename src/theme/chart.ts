/**
 * Chart colors as CSS variable references. recharts renders SVG, which
 * resolves `var()` in fill/stroke, so charts follow light/dark and the blue
 * brand automatically — no JS color values to keep in sync.
 */
export const chartColors = {
  primary: "var(--color-brand)",
  series: [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-6)",
  ],
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  error: "var(--color-error)",
  info: "var(--color-info)",
  grid: "var(--color-border-subtle)",
  axis: "var(--color-text-muted)",
  text: "var(--color-text)",
} as const;

/** Series color for index `i`, cycling through the palette. */
export const seriesColor = (i: number) => chartColors.series[i % chartColors.series.length];

/** Shared recharts <Tooltip contentStyle> */
export const chartTooltipStyle = {
  background: "var(--color-surface-raised)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  boxShadow: "var(--elevation-lg)",
  color: "var(--color-text)",
  fontSize: "0.8125rem",
} as const;

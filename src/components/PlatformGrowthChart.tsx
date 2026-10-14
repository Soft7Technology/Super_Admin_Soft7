"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import Alert from "@/components/ui/Alert";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

// ── Public types ──────────────────────────────────────────────────────────
// One bar/point per period returned by the API. `label` is whatever the
// backend gives us for that period (e.g. "Feb 2026", "Feb", "Week 3"...),
// so the x-axis always reflects the real date range instead of a fixed
// Jan–Jun window.
export interface GrowthPoint {
  label: string;
  value: number;
}

interface PlatformGrowthChartProps {
  data: GrowthPoint[];
  loading?: boolean;
  error?: string | null;
}

// SVG coordinate system — all math lives here, no DOM measurements needed
const SVG_W = 420;
const SVG_H = 180;
const PAD_LEFT = 28;
const PAD_BOTTOM = 24;
const PLOT_W = SVG_W - PAD_LEFT;
const PLOT_H = SVG_H - PAD_BOTTOM;
const MAX_BAR_W = 28;

// Rounds a max value up to a "nice" number so grid ticks look clean
// (e.g. 83 -> 100, 340 -> 400, 7 -> 10). Only used for larger scales;
// see computeGridTicks below for how small-scale counts are handled.
function niceMax(rawMax: number): number {
  if (rawMax <= 0) return 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const normalized = rawMax / magnitude;
  let niceNormalized;
  if (normalized <= 1) niceNormalized = 1;
  else if (normalized <= 2) niceNormalized = 2;
  else if (normalized <= 5) niceNormalized = 5;
  else niceNormalized = 10;
  return niceNormalized * magnitude;
}

// Builds the Y-axis scale + grid ticks without repeating a rounded value,
// and always includes the true max as the top tick.
function computeGridTicks(rawMax: number): { max: number; ticks: number[] } {
  if (rawMax <= 0) return { max: 1, ticks: [1] };

  // Small counts (e.g. companies created per month) stay as whole numbers
  const max = rawMax <= 10 ? Math.max(1, Math.ceil(rawMax)) : niceMax(rawMax);
  const tickCount = Math.min(4, max);
  const step = max / tickCount;

  const rounded = Array.from({ length: tickCount }, (_, i) => Math.round(step * (i + 1)));
  const unique = Array.from(new Set(rounded)).sort((a, b) => a - b);

  // Rounding can leave the top tick short of the true max — snap it back
  if (unique[unique.length - 1] !== max) unique[unique.length - 1] = max;

  return { max, ticks: unique };
}

// ── Component ────────────────────────────────────────────────────────────
// Renders ONLY the chart body; the card shell and title live in the parent.
// Styled like WA_ADMIN's charts: one brand color, subtle grid, inverse tooltip.
export default function PlatformGrowthChart({ data, loading = false, error = null }: PlatformGrowthChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const chartData = data ?? [];
  const N = chartData.length;

  if (loading) return <Skeleton className="h-56 w-full rounded-lg" />;
  if (error) return <Alert variant="error" message={error} />;
  if (N === 0) {
    return <EmptyState compact icon={<BarChart3 size={18} />} title="No growth data available yet." />;
  }

  const values = chartData.map((d) => d.value);
  const { max: MAX_VALUE, ticks: gridTicks } = computeGridTicks(Math.max(...values, 0));

  const SLOT_W = PLOT_W / N;
  const BAR_W = Math.min(MAX_BAR_W, SLOT_W * 0.6);

  const barX = (i: number) => PAD_LEFT + i * SLOT_W + (SLOT_W - BAR_W) / 2;
  const barCx = (i: number) => PAD_LEFT + i * SLOT_W + SLOT_W / 2;
  const barTopY = (value: number) => PLOT_H - (value / MAX_VALUE) * PLOT_H;
  const barH = (value: number) => (value / MAX_VALUE) * PLOT_H;

  const linePath = chartData.map((d, i) => `${i === 0 ? "M" : "L"} ${barCx(i)} ${barTopY(d.value)}`).join(" ");
  const areaPath =
    `M ${barCx(0)} ${PLOT_H} ` +
    chartData.map((d, i) => `L ${barCx(i)} ${barTopY(d.value)}`).join(" ") +
    ` L ${barCx(N - 1)} ${PLOT_H} Z`;

  const formatTick = (tick: number) =>
    tick >= 1000 ? `${(tick / 1000).toFixed(tick % 1000 === 0 ? 0 : 1)}k` : Math.round(tick).toString();

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="block overflow-visible"
      role="img"
      aria-label="Platform growth bar chart"
    >
      <defs>
        <linearGradient id="pgAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y-axis grid lines + labels */}
      {gridTicks.map((tick, idx) => {
        const y = barTopY(tick);
        return (
          <g key={idx}>
            <line x1={PAD_LEFT} y1={y} x2={SVG_W} y2={y} stroke="var(--color-border-subtle)" strokeWidth="1" strokeDasharray="3 3" />
            <text x={PAD_LEFT - 6} y={y + 4} textAnchor="end" fontSize="9" fill="var(--color-text-muted)">
              {formatTick(tick)}
            </text>
          </g>
        );
      })}
      <line x1={PAD_LEFT} y1={PLOT_H} x2={SVG_W} y2={PLOT_H} stroke="var(--color-border)" strokeWidth="1" />

      {/* Area + trend line */}
      <path d={areaPath} fill="url(#pgAreaGrad)" />
      <path d={linePath} fill="none" stroke="var(--color-brand)" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />

      {/* Bars */}
      {chartData.map((d, i) => {
        const x = barX(i);
        const bH = barH(d.value);
        const y = PLOT_H - bH;
        const isHov = hovered === i;
        return (
          <g key={i}>
            {/* Hover hit area (full column height) */}
            <rect
              x={PAD_LEFT + i * SLOT_W}
              y={0}
              width={SLOT_W}
              height={PLOT_H}
              fill={isHov ? "var(--color-surface-hover)" : "transparent"}
              className="cursor-pointer"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
            <rect
              x={x}
              y={y}
              width={BAR_W}
              height={bH}
              rx={4}
              ry={4}
              fill="var(--color-brand)"
              fillOpacity={hovered === null || isHov ? 1 : 0.55}
              className="pointer-events-none transition-[fill-opacity] duration-150"
            />

            {/* Tooltip */}
            {isHov && (
              <g className="pointer-events-none">
                <rect x={barCx(i) - 22} y={y - 28} width={44} height={20} rx={5} fill="var(--color-inverse)" />
                <text x={barCx(i)} y={y - 14} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--color-inverse-foreground)">
                  {d.value}
                </text>
              </g>
            )}

            {/* Period label */}
            <text
              x={barCx(i)}
              y={SVG_H - 4}
              textAnchor="middle"
              fontSize="10"
              fontWeight="500"
              fill={isHov ? "var(--color-text)" : "var(--color-text-muted)"}
            >
              {d.label}
            </text>
          </g>
        );
      })}

      {/* Trend line dots */}
      {chartData.map((d, i) => (
        <circle
          key={i}
          cx={barCx(i)}
          cy={barTopY(d.value)}
          r={hovered === i ? 4.5 : 3}
          fill="var(--color-brand)"
          stroke="var(--color-surface)"
          strokeWidth="2"
          className="pointer-events-none"
        />
      ))}
    </svg>
  );
}

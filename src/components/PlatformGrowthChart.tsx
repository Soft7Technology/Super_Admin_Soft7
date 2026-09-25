"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTheme, tokens } from "../context/ThemeContext";

function useWindowWidth() {
  const [width, setWidth] = useState<number>(1024);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return width;
}

// ── Public types ──────────────────────────────────────────────────────────
import {
  GrowthTimeRange,
  GrowthPoint,
  buildGrowthBuckets,
} from "../lib/dashboard-analytics";

export type { GrowthTimeRange, GrowthPoint };

export interface PlatformGrowthChartProps {
  data?: GrowthPoint[];
  companies?: any[];
  timeRange?: GrowthTimeRange;
  onTimeRangeChange?: (range: GrowthTimeRange) => void;
  showControls?: boolean;
  loading?: boolean;
  error?: string | null;
}

export const TIME_RANGE_OPTIONS: Array<{ value: GrowthTimeRange; label: string; badge: string; desc: string }> = [
  { value: "7D", label: "7D", badge: "Weekly (7D)", desc: "Daily breakdown for the last 7 days" },
  { value: "30D", label: "30D", badge: "Monthly (30D)", desc: "Weekly performance overview for the last 30 days" },
  { value: "90D", label: "90D", badge: "Quarterly (90D)", desc: "Quarterly performance breakdown across trailing 3 months" },
  { value: "1Y", label: "1Y", badge: "Yearly (1Y)", desc: "Yearly performance across trailing 12 months" },
  { value: "ALL", label: "ALL", badge: "All Time", desc: "All-time platform growth performance" },
];

/**
 * Calculates dynamic growth data points for any given time range.
 * Delegates to centralized buildGrowthBuckets for unified date math.
 */
export function calculateGrowthPoints(
  records: any[] = [],
  range: GrowthTimeRange = "30D"
): GrowthPoint[] {
  const now = new Date();
  const dates = (records || [])
    .map((c) => {
      const raw = c?.created_at || c?.createdAt || c?.date || c?.timestamp;
      if (!raw) return null;
      const d = new Date(raw);
      return isNaN(d.getTime()) ? null : d;
    })
    .filter((d): d is Date => d !== null);

  const earliestDate = dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : undefined;
  const buckets = buildGrowthBuckets(range, now, earliestDate);

  for (const d of dates) {
    const ms = d.getTime();
    const b = buckets.find((bucket) => ms >= bucket.startMs && ms <= bucket.endMs);
    if (b) b.value += 1;
  }

  return buckets.map(({ label, value, fullDate, breakdown }) => ({ label, value, fullDate, breakdown }));
}

const COLOR_CYCLE = ["#10b981", "#14b8a6", "#059669", "#0d9488", "#34d399", "#2dd4bf"];

// SVG coordinate system
const SVG_W = 420;
const SVG_H = 180;
const PAD_LEFT = 28;
const PAD_BOTTOM = 24;
const PLOT_W = SVG_W - PAD_LEFT;
const PLOT_H = SVG_H - PAD_BOTTOM;
const MAX_BAR_W = 28;

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

function computeGridTicks(rawMax: number): { max: number; ticks: number[] } {
  if (rawMax <= 0) return { max: 1, ticks: [1] };

  const max = rawMax <= 10 ? Math.max(1, Math.ceil(rawMax)) : niceMax(rawMax);
  const tickCount = Math.min(4, max);
  const step = max / tickCount;

  const rounded = Array.from({ length: tickCount }, (_, i) => Math.round(step * (i + 1)));
  const unique = Array.from(new Set(rounded)).sort((a, b) => a - b);

  if (unique[unique.length - 1] !== max) unique[unique.length - 1] = max;

  return { max, ticks: unique };
}

export default function PlatformGrowthChart({
  data,
  companies,
  timeRange: controlledTimeRange,
  onTimeRangeChange,
  showControls = false,
  loading = false,
  error = null,
}: PlatformGrowthChartProps) {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const [internalTimeRange, setInternalTimeRange] = useState<GrowthTimeRange>("30D");
  const [hovered, setHovered] = useState<number | null>(null);

  const activeRange = controlledTimeRange ?? internalTimeRange;
  const handleRangeChange = (range: GrowthTimeRange) => {
    if (onTimeRangeChange) {
      onTimeRangeChange(range);
    } else {
      setInternalTimeRange(range);
    }
  };

  const width = useWindowWidth();
  const isSmall = width <= 1000;
  const isMedium = width <= 1300;
  const legendFont = isSmall ? "0.72rem" : isMedium ? "0.8rem" : "0.9rem";
  const legendGap = isSmall ? "8px" : isMedium ? "10px" : "12px";
  const legendMb = isSmall ? "10px" : isMedium ? "12px" : "16px";

  // Derive dynamic chart data
  const chartData = useMemo(() => {
    if (data && data.length > 0) return data;
    if (companies) return calculateGrowthPoints(companies, activeRange);
    return [];
  }, [data, companies, activeRange]);

  const N = chartData.length;

  if (loading) {
    return (
      <div
        style={{
          height: SVG_H + 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isDark ? t.textMuted : "#94a3b8",
          fontSize: "0.85rem",
        }}
      >
        Loading platform growth…
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          height: SVG_H + 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ef4444",
          fontSize: "0.85rem",
          textAlign: "center",
          padding: "0 12px",
        }}
      >
        {error}
      </div>
    );
  }

  if (N === 0) {
    return (
      <div
        style={{
          height: SVG_H + 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isDark ? t.textMuted : "#94a3b8",
          fontSize: "0.85rem",
        }}
      >
        No growth data available for this range.
      </div>
    );
  }

  const values = chartData.map((d) => d.value);
  const { max: MAX_VALUE, ticks: gridTicks } = computeGridTicks(Math.max(...values, 0));

  const SLOT_W = PLOT_W / N;
  const BAR_W = Math.min(MAX_BAR_W, SLOT_W * (N > 8 ? 0.68 : 0.6));

  const barX = (i: number) => PAD_LEFT + i * SLOT_W + (SLOT_W - BAR_W) / 2;
  const barCx = (i: number) => PAD_LEFT + i * SLOT_W + SLOT_W / 2;
  const barTopY = (value: number) => PLOT_H - (value / MAX_VALUE) * PLOT_H;
  const barH = (value: number) => (value / MAX_VALUE) * PLOT_H;

  const linePath = chartData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${barCx(i)} ${barTopY(d.value)}`)
    .join(" ");

  const areaPath =
    `M ${barCx(0)} ${PLOT_H} ` +
    chartData.map((d, i) => `L ${barCx(i)} ${barTopY(d.value)}`).join(" ") +
    ` L ${barCx(N - 1)} ${PLOT_H} Z`;

  const colorFor = (i: number) => COLOR_CYCLE[i % COLOR_CYCLE.length];
  const formatTick = (tick: number) =>
    tick >= 1000 ? `${(tick / 1000).toFixed(tick % 1000 === 0 ? 0 : 1)}k` : Math.round(tick).toString();

  const totalPeriodGrowth = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div>
      {/* Optional Standalone Controls */}
      {showControls && (
        <div
          role="group"
          aria-label="Platform growth time range"
          style={{
            display: "inline-flex",
            alignItems: "center",
            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
            borderRadius: "10px",
            padding: "3px",
            gap: "2px",
            marginBottom: "14px",
          }}
        >
          {TIME_RANGE_OPTIONS.map((opt) => {
            const active = activeRange === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleRangeChange(opt.value)}
                aria-pressed={active}
                style={{
                  border: "none",
                  outline: "none",
                  cursor: "pointer",
                  padding: "4px 10px",
                  borderRadius: "7px",
                  fontSize: "11px",
                  fontWeight: active ? 700 : 600,
                  background: active ? "#10b981" : "transparent",
                  color: active
                    ? "#ffffff"
                    : isDark
                    ? "rgba(255,255,255,0.6)"
                    : "rgba(0,0,0,0.6)",
                  boxShadow: active ? "0 2px 8px rgba(16,185,129,0.35)" : "none",
                  transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Legend & Period Summary */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: legendGap,
          flexWrap: "wrap",
          marginBottom: legendMb,
        }}
      >
        <div style={{ display: "flex", gap: legendGap, flexWrap: "wrap", alignItems: "center" }}>
          {chartData.map((d, i) => (
            <div
              key={`${d.label}-${i}`}
              style={{ display: "flex", alignItems: "center", gap: "5px" }}
            >
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: colorFor(i),
                  boxShadow: `0 0 5px ${colorFor(i)}90`,
                }}
              />
              <span
                style={{
                  fontSize: legendFont,
                  color: isDark ? t.textMuted : "#111827",
                  fontWeight: 800,
                }}
              >
                {d.label}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.74rem",
            color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
            fontWeight: 600,
          }}
        >
          <span>
            Total:{" "}
            <strong style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}>
              {totalPeriodGrowth}
            </strong>
          </span>
          <span>•</span>
          <span>
            Peak:{" "}
            <strong style={{ color: "#10b981" }}>
              {Math.max(...values, 0)}
            </strong>
          </span>
        </div>
      </div>

      {/* SVG chart — bars + grid + trend line all in one coordinate space */}
      <svg
        width="100%"
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ overflow: "visible", display: "block" }}
        aria-label="Platform growth bar chart"
      >
        <defs>
          <linearGradient id="pgAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={isDark ? "0.2" : "0.12"} />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          {chartData.map((d, i) => (
            <linearGradient key={i} id={`pgBar${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colorFor(i)} stopOpacity={hovered === i ? "1" : "0.85"} />
              <stop offset="100%" stopColor={colorFor(i)} stopOpacity={hovered === i ? "0.75" : "0.55"} />
            </linearGradient>
          ))}
        </defs>

        {/* Y-axis grid lines + labels */}
        {gridTicks.map((tick, idx) => {
          const y = barTopY(tick);
          return (
            <g key={idx}>
              <line
                x1={PAD_LEFT}
                y1={y}
                x2={SVG_W}
                y2={y}
                stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x={PAD_LEFT - 6}
                y={y + 4}
                textAnchor="end"
                fontSize="9"
                fill={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
              >
                {formatTick(tick)}
              </text>
            </g>
          );
        })}

        {/* Area fill under trend line */}
        <path d={areaPath} fill="url(#pgAreaGrad)" />

        {/* Trend line */}
        <path
          d={linePath}
          fill="none"
          stroke={isDark ? "rgba(16,185,129,0.55)" : "rgba(16,185,129,0.48)"}
          strokeWidth="1.5"
          strokeDasharray="4 3"
          strokeLinecap="round"
        />

        {/* Bars */}
        {chartData.map((d, i) => {
          const x = barX(i);
          const bH = barH(d.value);
          const y = PLOT_H - bH;
          const isHov = hovered === i;
          const color = colorFor(i);

          const tooltipW = 76;
          const tooltipH = 28;
          const tooltipX = Math.max(PAD_LEFT + 2, Math.min(SVG_W - tooltipW - 4, barCx(i) - tooltipW / 2));
          const tooltipY = y < 35 ? y + 8 : y - tooltipH - 6;

          return (
            <g key={i}>
              {/* Hover hit area (full column height) */}
              <rect
                x={PAD_LEFT + i * SLOT_W}
                y={0}
                width={SLOT_W}
                height={PLOT_H}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />

              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={BAR_W}
                height={bH}
                rx={Math.min(6, BAR_W / 3)}
                ry={Math.min(6, BAR_W / 3)}
                fill={`url(#pgBar${i})`}
                style={{
                  filter: isHov
                    ? `drop-shadow(0 -3px 8px ${color}70)`
                    : `drop-shadow(0 -2px 4px ${color}30)`,
                  transition: "filter 0.2s",
                  transform: isHov ? `scaleX(1.08)` : "scaleX(1)",
                  transformOrigin: `${x + BAR_W / 2}px ${y + bH}px`,
                }}
              />

              {/* Shimmer on bar top */}
              <rect
                x={x + 2}
                y={y + 2}
                width={Math.max(BAR_W - 4, 0)}
                height={Math.min(bH * 0.35, 18)}
                rx={Math.min(4, BAR_W / 4)}
                fill="rgba(255,255,255,0.18)"
                style={{ pointerEvents: "none" }}
              />

              {/* Non-clipping Tooltip on hover */}
              {isHov && (
                <g pointerEvents="none">
                  <rect
                    x={tooltipX}
                    y={tooltipY}
                    width={tooltipW}
                    height={tooltipH}
                    rx={6}
                    fill={isDark ? "#111827" : "#0f172a"}
                    stroke={color}
                    strokeWidth="1"
                    style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.35))" }}
                  />
                  <text
                    x={tooltipX + tooltipW / 2}
                    y={tooltipY + 11}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="600"
                    fill="rgba(255,255,255,0.7)"
                  >
                    {d.fullDate ? (d.fullDate.length > 15 ? d.fullDate.slice(0, 15) + "…" : d.fullDate) : d.label}
                  </text>
                  <text
                    x={tooltipX + tooltipW / 2}
                    y={tooltipY + 23}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="800"
                    fill="#fff"
                  >
                    {d.value.toLocaleString()} {d.value === 1 ? "activity" : "activities"}
                  </text>
                </g>
              )}

              {/* Period label */}
              <text
                x={barCx(i)}
                y={SVG_H - 4}
                textAnchor="middle"
                fontSize={N > 8 ? "9" : "10"}
                fontWeight="600"
                fill={isHov ? color : isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)"}
                style={{ transition: "fill 0.2s" }}
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
            r={hovered === i ? 5 : 3}
            fill={colorFor(i)}
            stroke={isDark ? "#111827" : "#fff"}
            strokeWidth="2"
            style={{ transition: "r 0.15s", pointerEvents: "none" }}
          />
        ))}
      </svg>
    </div>
  );
}
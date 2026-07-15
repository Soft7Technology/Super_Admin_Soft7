"use client";

import { useState, useEffect } from "react";
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

const COLOR_CYCLE = ["#10b981", "#14b8a6", "#059669", "#0d9488", "#34d399", "#2dd4bf"];

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

// Builds the Y-axis scale + grid ticks. Fixed "max * 0.25/0.5/0.75/1"
// quarter-division breaks down on small integer counts (e.g. max = 2
// produced ticks 0.5/1/1.5/2, which round to 1/1/2/2 — visibly duplicated
// labels). This instead picks as many ticks as the scale can support
// without repeating a rounded value, and always includes the true max as
// the top tick.
function computeGridTicks(rawMax: number): { max: number; ticks: number[] } {
  if (rawMax <= 0) return { max: 1, ticks: [1] };

  // Small counts (e.g. companies created per month) stay as whole numbers
  // scaled to the smallest count that still fits the data cleanly.
  const max = rawMax <= 10 ? Math.max(1, Math.ceil(rawMax)) : niceMax(rawMax);
  const tickCount = Math.min(4, max);
  const step = max / tickCount;

  const rounded = Array.from({ length: tickCount }, (_, i) => Math.round(step * (i + 1)));
  const unique = Array.from(new Set(rounded)).sort((a, b) => a - b);

  // Rounding can occasionally leave the top tick short of the true max —
  // snap it back so bars never render above the topmost gridline.
  if (unique[unique.length - 1] !== max) unique[unique.length - 1] = max;

  return { max, ticks: unique };
}

// ── Component ────────────────────────────────────────────────────────────
// NOTE: This component renders ONLY the chart body (legend + SVG chart).
// The card shell, title, and badge live in the parent (DashboardPage).
// Data now comes entirely from props — the parent is responsible for
// fetching it from the real API and normalizing it into GrowthPoint[].
export default function PlatformGrowthChart({
  data,
  loading = false,
  error = null,
}: PlatformGrowthChartProps) {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const [hovered, setHovered] = useState<number | null>(null);
  const width = useWindowWidth();
  const isSmall = width <= 1000;
  const isMedium = width <= 1300;
  const legendFont = isSmall ? "0.72rem" : isMedium ? "0.8rem" : "0.9rem";
  const legendGap = isSmall ? "8px" : isMedium ? "10px" : "12px";
  const legendMb = isSmall ? "10px" : isMedium ? "12px" : "16px";

  const chartData = data ?? [];
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
        No growth data available yet.
      </div>
    );
  }

  const values = chartData.map((d) => d.value);
  const { max: MAX_VALUE, ticks: gridTicks } = computeGridTicks(Math.max(...values, 0));

  const SLOT_W = PLOT_W / N;
  const BAR_W = Math.min(MAX_BAR_W, SLOT_W * 0.6);

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

  return (
    <div>
      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: legendGap,
          flexWrap: "wrap",
          marginBottom: legendMb,
        }}
      >
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
                rx={6}
                ry={6}
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
                x={x + 3}
                y={y + 2}
                width={Math.max(BAR_W - 6, 0)}
                height={Math.min(bH * 0.35, 20)}
                rx={4}
                fill="rgba(255,255,255,0.18)"
                style={{ pointerEvents: "none" }}
              />

              {/* Tooltip on hover */}
              {isHov && (
                <g>
                  <rect
                    x={barCx(i) - 20}
                    y={y - 26}
                    width={40}
                    height={20}
                    rx={5}
                    fill={isDark ? "#1f2937" : "#0f172a"}
                    stroke={color}
                    strokeWidth="0.8"
                  />
                  <text
                    x={barCx(i)}
                    y={y - 12}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="#fff"
                  >
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
                fontWeight="600"
                fill={isHov ? color : isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
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
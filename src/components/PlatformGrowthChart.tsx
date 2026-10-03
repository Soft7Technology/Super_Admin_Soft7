"use client";

import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export interface GrowthPoint {
  label: string;
  value: number;
}

interface PlatformGrowthChartProps {
  data: GrowthPoint[];
  loading?: boolean;
  error?: string | null;
}

const SVG_W = 500;
const SVG_H = 205;
const PAD_LEFT = 32;
const PAD_RIGHT = 14;
const PAD_TOP = 28;
const PAD_BOTTOM = 26;
const PLOT_W = SVG_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = SVG_H - PAD_TOP - PAD_BOTTOM;
const MAX_BAR_W = 38;

function niceMax(rawMax: number): number {
  if (rawMax <= 0) return 5;
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
  if (rawMax <= 0) return { max: 5, ticks: [1, 2, 3, 4, 5] };

  const max = rawMax <= 5 ? 5 : rawMax <= 10 ? Math.max(5, Math.ceil(rawMax)) : niceMax(rawMax);
  const tickCount = Math.min(5, max);
  const step = max / tickCount;

  const rounded = Array.from({ length: tickCount }, (_, i) => Math.round(step * (i + 1)));
  const unique = Array.from(new Set(rounded)).sort((a, b) => a - b);

  if (unique[unique.length - 1] !== max) unique[unique.length - 1] = max;

  return { max, ticks: unique };
}

export default function PlatformGrowthChart({
  data,
  loading = false,
  error = null,
}: PlatformGrowthChartProps) {
  const { isDark } = useTheme();
  const [hovered, setHovered] = useState<number | null>(null);

  const chartData = data ?? [];
  const N = chartData.length;

  if (loading) {
    return (
      <div
        style={{
          height: SVG_H + 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--crm-muted, #94a3b8)",
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
          height: SVG_H + 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--crm-red, #ef4444)",
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
          height: SVG_H + 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--crm-muted, #94a3b8)",
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
  const BAR_W = Math.min(MAX_BAR_W, SLOT_W * 0.54);

  const baselineY = PAD_TOP + PLOT_H;
  const barX = (i: number) => PAD_LEFT + i * SLOT_W + (SLOT_W - BAR_W) / 2;
  const barCx = (i: number) => PAD_LEFT + i * SLOT_W + SLOT_W / 2;
  const barTopY = (value: number) => PAD_TOP + PLOT_H - (value / MAX_VALUE) * PLOT_H;
  const barH = (value: number) => (value / MAX_VALUE) * PLOT_H;

  const linePath = chartData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${barCx(i)} ${barTopY(d.value)}`)
    .join(" ");

  const areaPath =
    `M ${barCx(0)} ${baselineY} ` +
    chartData.map((d, i) => `L ${barCx(i)} ${barTopY(d.value)}`).join(" ") +
    ` L ${barCx(N - 1)} ${baselineY} Z`;

  const formatTick = (tick: number) =>
    tick >= 1000 ? `${(tick / 1000).toFixed(tick % 1000 === 0 ? 0 : 1)}k` : Math.round(tick).toString();

  return (
    <div>
      {/* Legend */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "2px",
              background: "#2563eb",
            }}
          />
          <span
            style={{
              fontSize: "12.5px",
              color: "var(--crm-text, #1e293b)",
              fontWeight: 600,
            }}
          >
            New Companies
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              width: "16px",
              height: "2px",
              background: "#3b82f6",
              borderRadius: "1px",
            }}
          />
          <span
            style={{
              fontSize: "12.5px",
              color: "var(--crm-muted, #64748b)",
              fontWeight: 500,
            }}
          >
            Growth Trend
          </span>
        </div>
      </div>

      {/* SVG Bar Chart with Dashed Trend Line */}
      <svg
        width="100%"
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ overflow: "visible", display: "block" }}
        aria-label="Platform growth bar chart"
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          {/* Subtle area gradient under trend line */}
          <linearGradient id="crmGrowthAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={isDark ? "0.16" : "0.10"} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines + Y-axis labels */}
        {gridTicks.map((tick, idx) => {
          const y = barTopY(tick);
          return (
            <g key={idx}>
              <line
                x1={PAD_LEFT}
                y1={y}
                x2={SVG_W - PAD_RIGHT}
                y2={y}
                stroke={isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0"}
                strokeWidth="1"
              />
              <text
                x={PAD_LEFT - 8}
                y={y + 3.5}
                textAnchor="end"
                fontSize="10"
                fontWeight="500"
                fill="var(--crm-muted, #64748b)"
              >
                {formatTick(tick)}
              </text>
            </g>
          );
        })}

        {/* Baseline Axis Line */}
        <line
          x1={PAD_LEFT}
          y1={baselineY}
          x2={SVG_W - PAD_RIGHT}
          y2={baselineY}
          stroke={isDark ? "rgba(255, 255, 255, 0.12)" : "#cbd5e1"}
          strokeWidth="1"
        />

        {/* Subtle area fill under trend line */}
        <path d={areaPath} fill="url(#crmGrowthAreaGrad)" pointerEvents="none" />

        {/* Clear Solid Blue Bars with rounded top corners */}
        {chartData.map((d, i) => {
          const x = barX(i);
          const bH = barH(d.value);
          const y = baselineY - bH;
          const r = Math.min(5, bH);

          // Path with flat bottom and cleanly rounded top corners
          const barPath =
            bH > 0
              ? `M ${x} ${baselineY} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} L ${x + BAR_W - r} ${y} Q ${x + BAR_W} ${y} ${x + BAR_W} ${y + r} L ${x + BAR_W} ${baselineY} Z`
              : "";

          return (
            <g key={i} pointerEvents="none">
              {/* Clear Solid Bar */}
              {bH > 0 && (
                <path
                  d={barPath}
                  fill="#2563eb"
                />
              )}

              {/* Month label */}
              <text
                x={barCx(i)}
                y={SVG_H - 6}
                textAnchor="middle"
                fontSize="11"
                fontWeight="500"
                fill="var(--crm-muted, #64748b)"
              >
                {d.label}
              </text>
            </g>
          );
        })}

        {/* Dashed Trend line */}
        <path
          d={linePath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1.8"
          strokeDasharray="4 3"
          strokeLinecap="round"
          pointerEvents="none"
        />

        {/* Trend Dots on the dashed line */}
        {chartData.map((d, i) => {
          const cx = barCx(i);
          const cy = barTopY(d.value);
          const hasValue = d.value > 0;

          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={hasValue ? 4 : 2.5}
              fill={hasValue ? (isDark ? "#0f172a" : "#ffffff") : "#3b82f6"}
              stroke="#3b82f6"
              strokeWidth={hasValue ? 2 : 1}
              pointerEvents="none"
            />
          );
        })}

        {/* Hit testing columns across each bar */}
        {chartData.map((_, i) => (
          <rect
            key={`hit-${i}`}
            x={PAD_LEFT + i * SLOT_W}
            y={0}
            width={SLOT_W}
            height={SVG_H}
            fill="transparent"
            style={{ cursor: "pointer", pointerEvents: "all" }}
            onMouseEnter={() => setHovered(i)}
            onMouseMove={() => setHovered(i)}
          />
        ))}

        {/* Floating Number Badge on Hover (No Carets, No Column Overlays) */}
        {hovered !== null && chartData[hovered] && (
          <g pointerEvents="none">
            <rect
              x={barCx(hovered) - 16}
              y={Math.max(barTopY(chartData[hovered].value) - 24, 4)}
              width={32}
              height={19}
              rx={4}
              fill={isDark ? "#1e293b" : "#0f172a"}
              stroke={isDark ? "rgba(255, 255, 255, 0.18)" : "#334155"}
              strokeWidth="1"
              style={{ filter: "drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35))" }}
            />
            <text
              x={barCx(hovered)}
              y={Math.max(barTopY(chartData[hovered].value) - 10, 18)}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#ffffff"
            >
              {chartData[hovered].value}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
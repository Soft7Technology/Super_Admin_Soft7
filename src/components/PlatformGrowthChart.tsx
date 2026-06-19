"use client";

import { useState, useEffect } from "react";
import { useTheme, tokens } from "../context/ThemeContext";

function useWindowWidth() {
  const [width, setWidth] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return width;
}

const DATA = [
  { month: "Jan", value: 38, color: "#10b981" },
  { month: "Feb", value: 52, color: "#14b8a6" },
  { month: "Mar", value: 46, color: "#059669" },
  { month: "Apr", value: 68, color: "#0d9488" },
  { month: "May", value: 61, color: "#10b981" },
  { month: "Jun", value: 79, color: "#14b8a6" },
];

const MAX_VALUE = 100;

// SVG coordinate system — all math lives here, no DOM measurements needed
const SVG_W = 420;
const SVG_H = 180;
const PAD_LEFT = 28;
const PAD_BOTTOM = 24;
const PLOT_W = SVG_W - PAD_LEFT;
const PLOT_H = SVG_H - PAD_BOTTOM;
const BAR_W = 28;
const N = DATA.length;
const SLOT_W = PLOT_W / N; // each bar slot width

function barX(i: number) {
  return PAD_LEFT + i * SLOT_W + (SLOT_W - BAR_W) / 2;
}
function barCx(i: number) {
  return PAD_LEFT + i * SLOT_W + SLOT_W / 2;
}
function barTopY(value: number) {
  return PLOT_H - (value / MAX_VALUE) * PLOT_H;
}
function barH(value: number) {
  return (value / MAX_VALUE) * PLOT_H;
}

const linePath = DATA.map((d, i) =>
  `${i === 0 ? "M" : "L"} ${barCx(i)} ${barTopY(d.value)}`
).join(" ");

const areaPath =
  `M ${barCx(0)} ${PLOT_H} ` +
  DATA.map((d, i) => `L ${barCx(i)} ${barTopY(d.value)}`).join(" ") +
  ` L ${barCx(N - 1)} ${PLOT_H} Z`;

// ── Component ────────────────────────────────────────────────────────────────
// NOTE: This component renders ONLY the chart body (legend + SVG chart).
// The card shell, title, and badge live in the parent (DashboardPage).
export default function PlatformGrowthChart() {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const [hovered, setHovered] = useState<number | null>(null);
  const width = useWindowWidth();
  const isSmall  = width <= 1000;
  const isMedium = width <= 1300;
  const legendFont = isSmall ? "0.72rem" : isMedium ? "0.8rem" : "0.9rem";
  const legendGap  = isSmall ? "8px" : isMedium ? "10px" : "12px";
  const legendMb   = isSmall ? "10px" : isMedium ? "12px" : "16px";

  const gridTicks = [25, 50, 75, 100];

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
        {DATA.map((d) => (
          <div
            key={d.month}
            style={{ display: "flex", alignItems: "center", gap: "5px" }}
          >
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: d.color,
                boxShadow: `0 0 5px ${d.color}90`,
              }}
            />
            <span
              style={{
                fontSize: legendFont,
                color: isDark ? t.textMuted : "#111827",
                fontWeight: 800,
              }}
            >
              {d.month}
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
            <stop
              offset="0%"
              stopColor="#10b981"
              stopOpacity={isDark ? "0.2" : "0.12"}
            />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          {DATA.map((d, i) => (
            <linearGradient
              key={i}
              id={`pgBar${i}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={d.color}
                stopOpacity={hovered === i ? "1" : "0.85"}
              />
              <stop
                offset="100%"
                stopColor={d.color}
                stopOpacity={hovered === i ? "0.75" : "0.55"}
              />
            </linearGradient>
          ))}
        </defs>

        {/* Y-axis grid lines + labels */}
        {gridTicks.map((tick) => {
          const y = barTopY(tick);
          return (
            <g key={tick}>
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
                {tick}
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
        {DATA.map((d, i) => {
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
                    ? `drop-shadow(0 -3px 8px ${d.color}70)`
                    : `drop-shadow(0 -2px 4px ${d.color}30)`,
                  transition: "filter 0.2s",
                  transform: isHov ? `scaleX(1.08)` : "scaleX(1)",
                  transformOrigin: `${x + BAR_W / 2}px ${y + bH}px`,
                }}
              />

              {/* Shimmer on bar top */}
              <rect
                x={x + 3}
                y={y + 2}
                width={BAR_W - 6}
                height={Math.min(bH * 0.35, 20)}
                rx={4}
                fill="rgba(255,255,255,0.18)"
                style={{ pointerEvents: "none" }}
              />

              {/* Tooltip on hover */}
              {isHov && (
                <g>
                  <rect
                    x={barCx(i) - 18}
                    y={y - 26}
                    width={36}
                    height={20}
                    rx={5}
                    fill={isDark ? "#1f2937" : "#0f172a"}
                    stroke={d.color}
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
                    {d.value}%
                  </text>
                </g>
              )}

              {/* Month label */}
              <text
                x={barCx(i)}
                y={SVG_H - 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill={
                  isHov
                    ? d.color
                    : isDark
                    ? "rgba(255,255,255,0.4)"
                    : "rgba(0,0,0,0.4)"
                }
                style={{ transition: "fill 0.2s" }}
              >
                {d.month}
              </text>
            </g>
          );
        })}

        {/* Trend line dots */}
        {DATA.map((d, i) => (
          <circle
            key={i}
            cx={barCx(i)}
            cy={barTopY(d.value)}
            r={hovered === i ? 5 : 3}
            fill={d.color}
            stroke={isDark ? "#111827" : "#fff"}
            strokeWidth="2"
            style={{ transition: "r 0.15s", pointerEvents: "none" }}
          />
        ))}
      </svg>
    </div>
  );
}

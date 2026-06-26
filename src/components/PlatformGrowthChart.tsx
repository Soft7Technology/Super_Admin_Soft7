"use client";

import { useMemo, useState, useEffect } from "react";
import { useTheme, tokens } from "../context/ThemeContext";

type GrowthDatum = {
  label: string;
  value: number;
  color: string;
};

const COLORS = ["#10b981", "#14b8a6", "#059669", "#0d9488", "#34d399", "#2dd4bf"];

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

function recordsFromGrowthResponse(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const value = data as { data?: unknown; growth?: unknown; results?: unknown; items?: unknown } | null;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.growth)) return value.growth;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.items)) return value.items;
  return [];
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function labelFromRecord(record: Record<string, unknown>, index: number): string {
  const rawLabel =
    record.month ??
    record.label ??
    record.name ??
    record.period ??
    record.date ??
    record.day ??
    record.week;

  if (typeof rawLabel === "string" && rawLabel.trim()) {
    const parsedDate = new Date(rawLabel);
    if (!Number.isNaN(parsedDate.getTime()) && rawLabel.includes("-")) {
      return parsedDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    }
    return rawLabel;
  }

  return `Point ${index + 1}`;
}

function valueFromRecord(record: Record<string, unknown>): number {
  return toNumber(
    record.value ??
      record.count ??
      record.total ??
      record.growth ??
      record.companies_count ??
      record.users_count ??
      record.total_messages ??
      record.messages ??
      record.users ??
      record.companies
  );
}

function shapeGrowthData(data: unknown): GrowthDatum[] {
  return recordsFromGrowthResponse(data)
    .map((item, index) => {
      if (typeof item === "number") {
        return { label: `Point ${index + 1}`, value: item, color: COLORS[index % COLORS.length] };
      }
      if (!item || typeof item !== "object") return null;

      const record = item as Record<string, unknown>;
      return {
        label: labelFromRecord(record, index),
        value: valueFromRecord(record),
        color: typeof record.color === "string" ? record.color : COLORS[index % COLORS.length],
      };
    })
    .filter((item): item is GrowthDatum => Boolean(item));
}

const SVG_W = 420;
const SVG_H = 180;
const PAD_LEFT = 28;
const PAD_BOTTOM = 24;
const PLOT_W = SVG_W - PAD_LEFT;
const PLOT_H = SVG_H - PAD_BOTTOM;
const BAR_W = 28;

interface Props {
  data: unknown;
  isLoading: boolean;
  rangeKey: string;
}

export default function PlatformGrowthChart({ data, isLoading, rangeKey }: Props) {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const [hovered, setHovered] = useState<number | null>(null);
  const width = useWindowWidth();
  const isSmall = width <= 1000;
  const isMedium = width <= 1300;
  const legendFont = isSmall ? "0.72rem" : isMedium ? "0.8rem" : "0.9rem";
  const legendGap = isSmall ? "8px" : isMedium ? "10px" : "12px";
  const legendMb = isSmall ? "10px" : isMedium ? "12px" : "16px";

  const chartData = useMemo(() => shapeGrowthData(data), [data]);
  const maxValue = useMemo(
    () => Math.max(1, ...chartData.map((item) => item.value)),
    [chartData]
  );
  const slotWidth = chartData.length > 0 ? PLOT_W / chartData.length : PLOT_W;

  const barX = (i: number) => PAD_LEFT + i * slotWidth + (slotWidth - BAR_W) / 2;
  const barCx = (i: number) => PAD_LEFT + i * slotWidth + slotWidth / 2;
  const barTopY = (value: number) => PLOT_H - (value / maxValue) * PLOT_H;
  const barH = (value: number) => (value / maxValue) * PLOT_H;

  const linePath = chartData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${barCx(i)} ${barTopY(d.value)}`)
    .join(" ");

  const areaPath = chartData.length
    ? `M ${barCx(0)} ${PLOT_H} ${chartData
        .map((d, i) => `L ${barCx(i)} ${barTopY(d.value)}`)
        .join(" ")} L ${barCx(chartData.length - 1)} ${PLOT_H} Z`
    : "";

  const gridTicks = [0.25, 0.5, 0.75, 1].map((tick) => Math.ceil(maxValue * tick));

  if (isLoading) {
    return <div style={{ color: isDark ? t.textMuted : "#64748b", fontSize: "0.85rem" }}>Loading chart...</div>;
  }

  if (chartData.length === 0) {
    return <div style={{ color: isDark ? t.textMuted : "#64748b", fontSize: "0.85rem" }}>No data for {rangeKey.replace("_", " ")}.</div>;
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: legendGap,
          flexWrap: "wrap",
          marginBottom: legendMb,
        }}
      >
        {chartData.map((d) => (
          <div
            key={d.label}
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
              {d.label}
            </span>
          </div>
        ))}
      </div>

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
          {chartData.map((d, i) => (
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

        <path d={areaPath} fill="url(#pgAreaGrad)" />

        <path
          d={linePath}
          fill="none"
          stroke={isDark ? "rgba(16,185,129,0.55)" : "rgba(16,185,129,0.48)"}
          strokeWidth="1.5"
          strokeDasharray="4 3"
          strokeLinecap="round"
        />

        {chartData.map((d, i) => {
          const x = barX(i);
          const height = Math.max(2, barH(d.value));
          const y = PLOT_H - height;
          const isHov = hovered === i;

          return (
            <g key={`${d.label}-${i}`}>
              <rect
                x={PAD_LEFT + i * slotWidth}
                y={0}
                width={slotWidth}
                height={PLOT_H}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />

              <rect
                x={x}
                y={y}
                width={BAR_W}
                height={height}
                rx={6}
                ry={6}
                fill={`url(#pgBar${i})`}
                style={{
                  filter: isHov
                    ? `drop-shadow(0 -3px 8px ${d.color}70)`
                    : `drop-shadow(0 -2px 4px ${d.color}30)`,
                  transition: "filter 0.2s",
                  transform: isHov ? "scaleX(1.08)" : "scaleX(1)",
                  transformOrigin: `${x + BAR_W / 2}px ${y + height}px`,
                }}
              />

              <rect
                x={x + 3}
                y={y + 2}
                width={BAR_W - 6}
                height={Math.min(height * 0.35, 20)}
                rx={4}
                fill="rgba(255,255,255,0.18)"
                style={{ pointerEvents: "none" }}
              />

              {isHov && (
                <g>
                  <rect
                    x={barCx(i) - 24}
                    y={Math.max(0, y - 26)}
                    width={48}
                    height={20}
                    rx={5}
                    fill={isDark ? "#1f2937" : "#0f172a"}
                    stroke={d.color}
                    strokeWidth="0.8"
                  />
                  <text
                    x={barCx(i)}
                    y={Math.max(14, y - 12)}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="#fff"
                  >
                    {d.value.toLocaleString()}
                  </text>
                </g>
              )}

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
                {d.label}
              </text>
            </g>
          );
        })}

        {chartData.map((d, i) => (
          <circle
            key={`${d.label}-dot-${i}`}
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

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as Select from "@radix-ui/react-select";
import { useTheme, tokens } from "../context/ThemeContext";
import {
  SubscriptionAnalyticsRange,
  useSubscriptionAnalytics,
} from "../hooks/useSubscriptionAnalytics";

type GroupUnit = "hour" | "day" | "week" | "month" | "year";

interface DrawPoint {
  date: string;
  label: string;
  count: number;
}

const RANGE_OPTIONS: Array<{ value: SubscriptionAnalyticsRange; label: string }> = [
  { value: "yesterday", label: "Yesterday" },
  { value: "today", label: "Today" },
  { value: "7days", label: "Last 7 Days" },
  { value: "1month", label: "1 Month" },
  { value: "3months", label: "3 Months" },
  { value: "6months", label: "6 Months" },
  { value: "1year", label: "1 Year" },
  { value: "all", label: "All Time" },
];

const GROUP_BY_RANGE: Record<SubscriptionAnalyticsRange, GroupUnit> = {
  yesterday: "hour",
  today: "hour",
  "7days": "day",
  "1month": "day",
  "3months": "week",
  "6months": "month",
  "1year": "month",
  all: "year",
};

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function parseBucketDate(rawDate: string, groupBy: GroupUnit): Date {
  if (!rawDate) {
    return new Date(1970, 0, 1, 0, 0, 0, 0);
  }

  const safeFromYmd = (datePart: string, fallbackHour = 0) => {
    const [y, m, d] = datePart.split("-").map(Number);

    const year = Number.isFinite(y) && y > 0 ? y : 1970;
    const month = Number.isFinite(m) && m >= 1 && m <= 12 ? m - 1 : 0;
    const day = Number.isFinite(d) && d >= 1 && d <= 31 ? d : 1;

    return new Date(year, month, day, fallbackHour, 0, 0, 0);
  };

  if (groupBy === "hour") {
    const [datePart, hourPart = "00:00"] = rawDate.split(" ");
    const parsedHour = Number(hourPart.split(":")[0]);
    const hour = Number.isFinite(parsedHour) && parsedHour >= 0 && parsedHour <= 23 ? parsedHour : 0;
    return safeFromYmd(datePart, hour);
  }

  if (groupBy === "day" || groupBy === "week") {
    return safeFromYmd(rawDate, 0);
  }

  if (groupBy === "month") {
    const [yearRaw, monthRaw] = rawDate.split("-").map(Number);
    const year = Number.isFinite(yearRaw) && yearRaw > 0 ? yearRaw : 1970;
    const month = Number.isFinite(monthRaw) && monthRaw >= 1 && monthRaw <= 12 ? monthRaw - 1 : 0;
    return new Date(year, month, 1, 0, 0, 0, 0);
  }

  const parsedYear = Number(rawDate);
  const year = Number.isFinite(parsedYear) && parsedYear > 0 ? parsedYear : 1970;
  return new Date(year, 0, 1, 0, 0, 0, 0);
}

function axisLabel(rawDate: string, groupBy: GroupUnit): string {
  const value = parseBucketDate(rawDate, groupBy);

  if (groupBy === "hour") {
    return `${String(value.getHours()).padStart(2, "0")}:00`;
  }

  if (groupBy === "day") {
    return `${MONTH_SHORT[value.getMonth()]} ${value.getDate()}`;
  }

  if (groupBy === "week") {
    return `Wk ${MONTH_SHORT[value.getMonth()]} ${value.getDate()}`;
  }

  if (groupBy === "month") {
    return `${MONTH_SHORT[value.getMonth()]} '${String(value.getFullYear()).slice(-2)}`;
  }

  return String(value.getFullYear());
}

function tooltipLabel(rawDate: string, groupBy: GroupUnit): string {
  const value = parseBucketDate(rawDate, groupBy);

  if (groupBy === "hour") {
    return `${MONTH_SHORT[value.getMonth()]} ${value.getDate()}, ${String(value.getHours()).padStart(2, "0")}:00`;
  }

  if (groupBy === "day") {
    return `${MONTH_SHORT[value.getMonth()]} ${value.getDate()}, ${value.getFullYear()}`;
  }

  if (groupBy === "week") {
    return `Week of ${MONTH_SHORT[value.getMonth()]} ${value.getDate()}, ${value.getFullYear()}`;
  }

  if (groupBy === "month") {
    return `${MONTH_SHORT[value.getMonth()]} ${value.getFullYear()}`;
  }

  return String(value.getFullYear());
}

export default function SubscriptionChart() {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const color = isDark ? "#4dabf7" : "#2563eb";

  const { range, setRange, data, loading, error } = useSubscriptionAnalytics("1year");

  const groupBy = GROUP_BY_RANGE[range];
  const totalSubscriptions = useMemo(
    () => data.reduce((sum, item) => sum + item.count, 0),
    [data]
  );

  const drawData = useMemo<DrawPoint[]>(() => {
    if (data.length === 0) {
      return [
        { date: "", label: "", count: 0 },
        { date: "", label: "", count: 0 },
      ];
    }

    return data.map((item) => ({
      date: item.date,
      label: axisLabel(item.date, groupBy),
      count: item.count,
    }));
  }, [data, groupBy]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const pL = 48;
    const pR = 20;
    const pT = 20;
    const pB = 36;

    ctx.clearRect(0, 0, width, height);

    const maxValue = Math.max(...drawData.map((item) => item.count), 1);
    const steps = Math.max(drawData.length - 1, 1);
    const xAt = (index: number) => pL + (index / steps) * (width - pL - pR);
    const yAt = (value: number) => pT + (1 - value / maxValue) * (height - pT - pB);

    ctx.strokeStyle = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    for (let i = 0; i <= 4; i += 1) {
      const y = pT + (i / 4) * (height - pT - pB);
      ctx.beginPath();
      ctx.moveTo(pL, y);
      ctx.lineTo(width - pR, y);
      ctx.stroke();

      ctx.fillStyle = isDark ? "#4b5563" : "#94a3b8";
      ctx.font = "11px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(String(Math.round(maxValue - (i / 4) * maxValue)), pL - 8, y + 4);
    }

    ctx.setLineDash([]);
    ctx.strokeStyle = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pL, pT);
    ctx.lineTo(pL, height - pB);
    ctx.lineTo(width - pR, height - pB);
    ctx.stroke();

    const grad = ctx.createLinearGradient(pL, pT, pL, height - pB);
    grad.addColorStop(0, `${color}30`);
    grad.addColorStop(1, `${color}00`);

    ctx.beginPath();
    ctx.moveTo(xAt(0), height - pB);
    drawData.forEach((point, index) => {
      ctx.lineTo(xAt(index), yAt(point.count));
    });
    ctx.lineTo(xAt(drawData.length - 1), height - pB);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    drawData.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(xAt(index), yAt(point.count));
      } else {
        ctx.lineTo(xAt(index), yAt(point.count));
      }
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke();

    drawData.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(xAt(index), yAt(point.count), 4, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? "#0d1117" : "#fff";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.fillStyle = isDark ? "#4b5563" : "#94a3b8";
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "center";

    const xLabelStep = drawData.length > 12 ? Math.ceil(drawData.length / 8) : 1;
    drawData.forEach((point, index) => {
      if (index % xLabelStep === 0 || index === drawData.length - 1) {
        ctx.fillText(point.label, xAt(index), height - 6);
      }
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      draw();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [isDark, drawData]);

  const onMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);

    const pL = 48;
    const pR = 20;
    const steps = Math.max(drawData.length - 1, 1);
    const xAt = (index: number) => pL + (index / steps) * (canvas.width - pL - pR);

    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    drawData.forEach((_, index) => {
      const distance = Math.abs(xAt(index) - mouseX);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    if (nearestDistance > 30) {
      setTip(null);
      return;
    }

    const maxValue = Math.max(...drawData.map((item) => item.count), 1);
    const yAt = (value: number) => 20 + (1 - value / maxValue) * (canvas.height - 56);
    const target = drawData[nearestIndex];

    setTip({
      x: xAt(nearestIndex) * (rect.width / canvas.width),
      y: yAt(target.count) * (rect.height / canvas.height),
      label: tooltipLabel(target.date, groupBy),
      value: target.count,
    });
  };

  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "14px", overflow: "hidden", display: "flex", flexDirection: "column", transition: "background 0.3s,border-color 0.3s" }}>
      <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: t.text }}>Subscription Status</span>
          <span style={{ background: "rgba(74,222,128,0.1)", color: "#16a34a", fontSize: "0.7rem", fontWeight: 600, padding: "2px 8px", borderRadius: "20px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#4ade80" }} />
            {totalSubscriptions.toLocaleString()} subscriptions
          </span>
        </div>

        <Select.Root value={range} onValueChange={(value) => setRange(value as SubscriptionAnalyticsRange)}>
          <Select.Trigger
            aria-label="Filter analytics range"
            style={{
              minWidth: "170px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              padding: "6px 10px",
              borderRadius: "8px",
              border: `1px solid ${t.border}`,
              background: t.surface2,
              color: t.textSub,
              fontSize: "0.8rem",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            <Select.Value />
            <Select.Icon>▾</Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              position="popper"
              sideOffset={6}
              style={{
                borderRadius: "10px",
                border: `1px solid ${t.border}`,
                background: t.surface,
                boxShadow: `0 8px 24px ${t.shadow}`,
                zIndex: 50,
                overflow: "hidden",
              }}
            >
              <Select.Viewport style={{ padding: "4px" }}>
                {RANGE_OPTIONS.map((option) => (
                  <Select.Item
                    key={option.value}
                    value={option.value}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      color: t.textSub,
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <Select.ItemText>{option.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      <div ref={containerRef} style={{ position: "relative", minHeight: "220px", padding: "12px 8px 4px" }}>
        <canvas
          ref={canvasRef}
          onMouseMove={onMove}
          onMouseLeave={() => setTip(null)}
          style={{ display: "block", width: "100%", height: "100%", cursor: "crosshair" }}
        />

        {loading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: t.textFaint, fontSize: "0.85rem", pointerEvents: "none" }}>
            Loading subscription analytics…
          </div>
        )}

        {!loading && error && (
          <div style={{ position: "absolute", left: "12px", top: "10px", color: "#dc2626", fontSize: "0.78rem", background: t.surface, border: `1px solid ${t.border}`, borderRadius: "6px", padding: "4px 8px" }}>
            {error}
          </div>
        )}

        {tip && (
          <div style={{ position: "absolute", left: tip.x, top: tip.y - 44, transform: "translateX(-50%)", background: t.surface2, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "6px 12px", pointerEvents: "none", zIndex: 10, whiteSpace: "nowrap", boxShadow: `0 4px 16px ${t.shadow}` }}>
            <div style={{ fontSize: "0.72rem", color: t.textFaint }}>{tip.label}</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: t.text }}>{tip.value} subscriptions</div>
          </div>
        )}
      </div>
    </div>
  );
}

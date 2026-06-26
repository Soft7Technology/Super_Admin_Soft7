// components/DateRangePicker.tsx
"use client";
import { DATE_RANGE_OPTIONS, DateRangeKey } from "@/lib/dateRanges";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  value: DateRangeKey;
  onChange: (v: DateRangeKey) => void;
}

export default function DateRangePicker({ value, onChange }: Props) {
  const { isDark } = useTheme();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as DateRangeKey)}
      style={{
        padding: "8px 36px 8px 14px",
        borderRadius: "10px",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
        background: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
        color: isDark ? "#f1f5f9" : "#0f172a",
        fontSize: "0.85rem",
        fontWeight: 600,
        cursor: "pointer",
        outline: "none",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        minWidth: "140px",
      }}
    >
      {DATE_RANGE_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
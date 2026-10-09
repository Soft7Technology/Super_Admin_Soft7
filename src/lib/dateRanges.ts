// lib/dateRanges.ts

export type DateRangeKey = "today" | "yesterday" | "last_week" | "this_month" | "this_year";

export interface DateRange {
  from: string; // ISO date string
  to: string;
}

export function getDateRange(key: DateRangeKey): DateRange {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0]; // "YYYY-MM-DD"

  switch (key) {
    case "today": {
      const s = fmt(now);
      return { from: s, to: s };
    }
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const s = fmt(y);
      return { from: s, to: s };
    }
    case "last_week": {
      const to = new Date(now);
      to.setDate(to.getDate() - 1);
      const from = new Date(to);
      from.setDate(from.getDate() - 6);
      return { from: fmt(from), to: fmt(to) };
    }
    case "this_month": {
      return {
        from: fmt(new Date(now.getFullYear(), now.getMonth(), 1)),
        to: fmt(now),
      };
    }
    case "this_year": {
      return {
        from: fmt(new Date(now.getFullYear(), 0, 1)),
        to: fmt(now),
      };
    }
  }
}

export const DATE_RANGE_OPTIONS: { label: string; value: DateRangeKey }[] = [
  { label: "Today",      value: "today"      },
  { label: "Yesterday",  value: "yesterday"  },
  { label: "Last Week",  value: "last_week"  },
  { label: "This Month", value: "this_month" },
  { label: "This Year",  value: "this_year"  },
];
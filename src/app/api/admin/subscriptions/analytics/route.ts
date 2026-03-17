import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "../../../../../lib/prisma";
import { getPrismaConnectionErrorMessage } from "../../../../../lib/prisma-errors";

export const dynamic = "force-dynamic";

export type SubscriptionAnalyticsRange =
  | "yesterday"
  | "today"
  | "7days"
  | "1month"
  | "3months"
  | "6months"
  | "1year"
  | "all";

type GroupUnit = "hour" | "day" | "week" | "month" | "year";

interface AnalyticsPoint {
  date: string;
  count: number;
}

const VALID_RANGES = new Set<SubscriptionAnalyticsRange>([
  "yesterday",
  "today",
  "7days",
  "1month",
  "3months",
  "6months",
  "1year",
  "all",
]);

export async function GET(request: NextRequest) {
  const rawRange = (request.nextUrl.searchParams.get("range") ?? "1year") as SubscriptionAnalyticsRange;

  if (!VALID_RANGES.has(rawRange)) {
    return NextResponse.json(
      { error: "Invalid range parameter.", data: [] as AnalyticsPoint[] },
      { status: 400 }
    );
  }

  const now = new Date();
  const config = getRangeConfig(rawRange, now);

  try {
    const where: Prisma.UserWhereInput = config.start
      ? {
          subscriptionStart: {
            gte: config.start,
            lt: config.endExclusive,
          },
        }
      : {
          subscriptionStart: {
            not: null,
            lt: config.endExclusive,
          },
        };

    const records = await prisma.user.findMany({
      where,
      select: { subscriptionStart: true },
      orderBy: { subscriptionStart: "asc" },
    });

    const points = buildAnalyticsPoints(records, config, now);

    return NextResponse.json({
      range: rawRange,
      grouping: config.groupBy,
      data: points,
      error: null,
    });
  } catch (error) {
    const connectionMessage = getPrismaConnectionErrorMessage(error);

    if (connectionMessage) {
      console.warn(`[admin/subscriptions/analytics] ${connectionMessage}`);
      return NextResponse.json({ range: rawRange, data: [] as AnalyticsPoint[], error: connectionMessage });
    }

    console.error("[admin/subscriptions/analytics] error:", error);
    return NextResponse.json(
      { range: rawRange, data: [] as AnalyticsPoint[], error: "Failed to fetch subscription analytics." },
      { status: 500 }
    );
  }
}

function getRangeConfig(range: SubscriptionAnalyticsRange, now: Date): {
  start: Date | null;
  endExclusive: Date;
  groupBy: GroupUnit;
} {
  const todayStart = startOfDay(now);
  const tomorrowStart = addDays(todayStart, 1);

  switch (range) {
    case "yesterday":
      return {
        start: addDays(todayStart, -1),
        endExclusive: todayStart,
        groupBy: "hour",
      };
    case "today":
      return {
        start: todayStart,
        endExclusive: tomorrowStart,
        groupBy: "hour",
      };
    case "7days":
      return {
        start: addDays(todayStart, -6),
        endExclusive: tomorrowStart,
        groupBy: "day",
      };
    case "1month":
      return {
        start: addMonths(todayStart, -1),
        endExclusive: tomorrowStart,
        groupBy: "day",
      };
    case "3months":
      return {
        start: addMonths(todayStart, -3),
        endExclusive: tomorrowStart,
        groupBy: "week",
      };
    case "6months":
      return {
        start: addMonths(todayStart, -6),
        endExclusive: tomorrowStart,
        groupBy: "month",
      };
    case "1year":
      return {
        start: addYears(todayStart, -1),
        endExclusive: tomorrowStart,
        groupBy: "month",
      };
    case "all":
      return {
        start: null,
        endExclusive: tomorrowStart,
        groupBy: "year",
      };
    default:
      return {
        start: addYears(todayStart, -1),
        endExclusive: tomorrowStart,
        groupBy: "month",
      };
  }
}

function buildAnalyticsPoints(
  records: Array<{ subscriptionStart: Date | null }>,
  config: { start: Date | null; endExclusive: Date; groupBy: GroupUnit },
  now: Date
): AnalyticsPoint[] {
  const validDates = records
    .map((row) => row.subscriptionStart)
    .filter((value): value is Date => value !== null);

  const inferredStart =
    config.start ??
    (validDates.length > 0
      ? startOfYear(validDates[0])
      : startOfYear(now));

  const buckets = buildBucketKeys(inferredStart, config.endExclusive, config.groupBy);
  const counts = new Map<string, number>();

  for (const date of validDates) {
    const key = bucketKey(date, config.groupBy);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return buckets.map((key) => ({
    date: key,
    count: counts.get(key) ?? 0,
  }));
}

function buildBucketKeys(start: Date, endExclusive: Date, groupBy: GroupUnit): string[] {
  const keys: string[] = [];

  if (groupBy === "hour") {
    let cursor = startOfHour(start);
    while (cursor < endExclusive) {
      keys.push(bucketKey(cursor, "hour"));
      cursor = addHours(cursor, 1);
    }
    return keys;
  }

  if (groupBy === "day") {
    let cursor = startOfDay(start);
    while (cursor < endExclusive) {
      keys.push(bucketKey(cursor, "day"));
      cursor = addDays(cursor, 1);
    }
    return keys;
  }

  if (groupBy === "week") {
    let cursor = startOfWeek(start);
    while (cursor < endExclusive) {
      keys.push(bucketKey(cursor, "week"));
      cursor = addDays(cursor, 7);
    }
    return keys;
  }

  if (groupBy === "month") {
    let cursor = startOfMonth(start);
    while (cursor < endExclusive) {
      keys.push(bucketKey(cursor, "month"));
      cursor = addMonths(cursor, 1);
    }
    return keys;
  }

  let cursor = startOfYear(start);
  while (cursor < endExclusive) {
    keys.push(bucketKey(cursor, "year"));
    cursor = addYears(cursor, 1);
  }
  return keys;
}

function bucketKey(value: Date, groupBy: GroupUnit): string {
  if (groupBy === "hour") {
    return `${formatDate(startOfDay(value))} ${pad(value.getHours())}:00`;
  }

  if (groupBy === "day") {
    return formatDate(startOfDay(value));
  }

  if (groupBy === "week") {
    return formatDate(startOfWeek(value));
  }

  if (groupBy === "month") {
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}`;
  }

  return String(value.getFullYear());
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function startOfHour(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), 0, 0, 0);
}

function startOfWeek(date: Date): Date {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const weekStart = addDays(startOfDay(date), mondayOffset);
  return startOfDay(weekStart);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
}

function addHours(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setHours(next.getHours() + amount);
  return next;
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function addMonths(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return next;
}

function addYears(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + amount);
  return next;
}

function formatDate(value: Date): string {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

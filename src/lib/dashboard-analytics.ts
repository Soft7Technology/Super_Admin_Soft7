import { PrismaClient } from "@prisma/client";

export type GrowthTimeRange = "7D" | "30D" | "90D" | "1Y" | "ALL";

export interface MetricCardAnalytics {
  current: number;
  previous: number;
  change: string;
  changeType: "up" | "down" | "neutral";
  dateRange: string;
  comparisonPeriod: string;
}

export interface GrowthPoint {
  label: string;
  value: number;
  fullDate: string;
  breakdown?: {
    campaigns: number;
    users: number;
    chatbots: number;
    messages: number;
    companies: number;
  };
}

export interface DashboardDateBoundaries {
  range: GrowthTimeRange;
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date;
  previousEnd: Date;
  dateRangeLabel: string;
  comparisonLabel: string;
}

export interface DashboardAnalyticsPayload {
  timeRange: GrowthTimeRange;
  dateRange: string;
  comparisonPeriod: string;
  metrics: {
    campaigns: MetricCardAnalytics;
    users: MetricCardAnalytics;
    chatbots: MetricCardAnalytics;
    messages: MetricCardAnalytics;
  };
  growth: GrowthPoint[];
  totalCompanies: number;
  activeUsers: number;
  activeSubscriptions: number;
  auditLogCount: number;
  companyChange: string;
  userChange: string;
  companies: any[];
  users: any[];
  logs: any[];
  error: string | null;
}

const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const MONTH_NAMES_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function getShortMonth(d: Date): string {
  return MONTH_NAMES_SHORT[d.getMonth()] || d.toLocaleDateString("en-US", { month: "short" });
}

export function getLongMonth(d: Date): string {
  return MONTH_NAMES_LONG[d.getMonth()] || d.toLocaleDateString("en-US", { month: "long" });
}

export function formatDayMonth(d: Date): string {
  return `${d.getDate()} ${getShortMonth(d)}`;
}

/**
 * Calculates dynamic percentage change between current and previous periods.
 * Formula: ((current - previous) / previous) * 100
 * Handles all edge cases (zero division, identical values, etc.)
 */
export function calculatePercentageChange(current: number, previous: number): {
  change: string;
  changeType: "up" | "down" | "neutral";
} {
  if (previous <= 0) {
    if (current > 0) {
      return { change: "+100%", changeType: "up" };
    }
    return { change: "0.0%", changeType: "neutral" };
  }

  const diff = current - previous;
  const pct = (diff / previous) * 100;

  if (Math.abs(pct) < 0.05) {
    return { change: "0.0%", changeType: "neutral" };
  }

  const sign = pct > 0 ? "+" : "";
  const formatted = pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(1);

  return {
    change: `${sign}${formatted}%`,
    changeType: pct > 0 ? "up" : "down",
  };
}

/**
 * Returns dynamic comparison label for any range.
 */
export function getComparisonPeriodLabel(range: GrowthTimeRange): string {
  switch (range) {
    case "7D":
      return "vs previous 7 days";
    case "30D":
      return "vs previous 30 days";
    case "90D":
      return "vs previous 90 days";
    case "1Y":
      return "vs previous year";
    case "ALL":
      return "vs previous period";
    default:
      return "vs previous period";
  }
}

/**
 * Calculates the exact start and end date boundaries for both
 * the current period and previous equivalent comparison period.
 */
export function getDateRangeBoundaries(
  range: GrowthTimeRange,
  now = new Date(),
  earliestDate?: Date
): DashboardDateBoundaries {
  const currentEnd = new Date(now);
  let currentStart: Date;
  let prevStart: Date;
  let prevEnd: Date;
  let dateRangeLabel: string;
  const comparisonLabel = getComparisonPeriodLabel(range);

  if (range === "7D") {
    currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
    prevEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 23, 59, 59, 999);
    prevStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13, 0, 0, 0, 0);
    dateRangeLabel = `${formatDayMonth(currentStart)} – ${formatDayMonth(currentEnd)}`;
  } else if (range === "30D") {
    currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
    prevEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 23, 59, 59, 999);
    prevStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 59, 0, 0, 0, 0);
    dateRangeLabel = `${formatDayMonth(currentStart)} – ${formatDayMonth(currentEnd)}`;
  } else if (range === "90D") {
    currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 89, 0, 0, 0, 0);
    prevEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90, 23, 59, 59, 999);
    prevStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 179, 0, 0, 0, 0);
    dateRangeLabel = `${formatDayMonth(currentStart)} – ${formatDayMonth(currentEnd)}`;
  } else if (range === "1Y") {
    currentStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    prevEnd = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), 23, 59, 59, 999);
    prevStart = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    dateRangeLabel = `${formatDayMonth(currentStart)} ${currentStart.getFullYear()} – ${formatDayMonth(currentEnd)} ${currentEnd.getFullYear()}`;
  } else {
    currentStart = earliestDate ? new Date(earliestDate) : new Date(0);
    prevStart = new Date(0);
    prevEnd = new Date(0);
    dateRangeLabel = earliestDate
      ? `${formatDayMonth(earliestDate)} ${earliestDate.getFullYear()} – ${formatDayMonth(currentEnd)} ${currentEnd.getFullYear()}`
      : "All Time";
  }

  return {
    range,
    currentStart,
    currentEnd,
    previousStart: prevStart,
    previousEnd: prevEnd,
    dateRangeLabel,
    comparisonLabel,
  };
}

/**
 * Builds dynamic interval buckets for chart aggregation.
 */
export function buildGrowthBuckets(
  range: GrowthTimeRange,
  now = new Date(),
  earliestDate?: Date
): Array<{
  key: string;
  label: string;
  fullDate: string;
  startMs: number;
  endMs: number;
  value: number;
  breakdown: {
    campaigns: number;
    users: number;
    chatbots: number;
    messages: number;
    companies: number;
  };
}> {
  const buckets: Array<{
    key: string;
    label: string;
    fullDate: string;
    startMs: number;
    endMs: number;
    value: number;
    breakdown: {
      campaigns: number;
      users: number;
      chatbots: number;
      messages: number;
      companies: number;
    };
  }> = [];

  const emptyBreakdown = () => ({
    campaigns: 0,
    users: 0,
    chatbots: 0,
    messages: 0,
    companies: 0,
  });

  if (range === "7D") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      buckets.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
        label: `${d.getDate()} ${getShortMonth(d)}`,
        fullDate: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
        startMs: start.getTime(),
        endMs: end.getTime(),
        value: 0,
        breakdown: emptyBreakdown(),
      });
    }
  } else if (range === "30D") {
    const weekDefs = [
      { startDay: 29, endDay: 23, label: "Week 1" },
      { startDay: 22, endDay: 16, label: "Week 2" },
      { startDay: 15, endDay: 8,  label: "Week 3" },
      { startDay: 7,  endDay: 0,  label: "Week 4" },
    ];
    for (const w of weekDefs) {
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - w.startDay, 0, 0, 0, 0);
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - w.endDay, 23, 59, 59, 999);
      buckets.push({
        key: w.label,
        label: w.label,
        fullDate: `${formatDayMonth(startDate)} – ${formatDayMonth(endDate)}`,
        startMs: startDate.getTime(),
        endMs: endDate.getTime(),
        value: 0,
        breakdown: emptyBreakdown(),
      });
    }
  } else if (range === "90D") {
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      buckets.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: getShortMonth(d),
        fullDate: `${getLongMonth(d)} ${d.getFullYear()}`,
        startMs: start.getTime(),
        endMs: end.getTime(),
        value: 0,
        breakdown: emptyBreakdown(),
      });
    }
  } else if (range === "1Y") {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      buckets.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: getShortMonth(d),
        fullDate: `${getLongMonth(d)} ${d.getFullYear()}`,
        startMs: start.getTime(),
        endMs: end.getTime(),
        value: 0,
        breakdown: emptyBreakdown(),
      });
    }
  } else {
    // ALL
    const earliest = earliestDate || new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const startYear = earliest.getFullYear();
    const yearDiff = now.getFullYear() - startYear;

    if (yearDiff >= 2) {
      for (let y = startYear; y <= now.getFullYear(); y++) {
        const start = new Date(y, 0, 1, 0, 0, 0, 0);
        const end = new Date(y, 11, 31, 23, 59, 59, 999);
        buckets.push({
          key: String(y),
          label: String(y),
          fullDate: `Year ${y}`,
          startMs: start.getTime(),
          endMs: end.getTime(),
          value: 0,
          breakdown: emptyBreakdown(),
        });
      }
    } else {
      const startMonth = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
      const totalMonths = (now.getFullYear() - startMonth.getFullYear()) * 12 + (now.getMonth() - startMonth.getMonth()) + 1;
      const count = Math.max(3, Math.min(12, totalMonths));
      for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
        buckets.push({
          key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
          label: getShortMonth(d),
          fullDate: `${getLongMonth(d)} ${d.getFullYear()}`,
          startMs: start.getTime(),
          endMs: end.getTime(),
          value: 0,
          breakdown: emptyBreakdown(),
        });
      }
    }
  }

  return buckets;
}

const COMPANY_COLORS = [
  "linear-gradient(135deg,#3b5bdb,#6741d9)",
  "linear-gradient(135deg,#0ca678,#2f9e44)",
  "linear-gradient(135deg,#f59f00,#e67700)",
  "linear-gradient(135deg,#e03131,#c92a2a)",
  "linear-gradient(135deg,#6741d9,#862e9c)",
];

const USER_COLORS = [
  "linear-gradient(135deg,#3b5bdb,#6741d9)",
  "linear-gradient(135deg,#0ca678,#2f9e44)",
  "linear-gradient(135deg,#f59f00,#e67700)",
  "linear-gradient(135deg,#6741d9,#862e9c)",
  "linear-gradient(135deg,#e03131,#c92a2a)",
];

function initials(value: string): string {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatRole(role: string): string {
  return role === "ADMIN"
    ? "Admin"
    : role.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function toLogSeverity(status: string): "danger" | "success" | "warn" {
  if (status === "IN_PROGRESS") return "danger";
  if (status === "RESOLVED") return "success";
  return "warn";
}

function countRecordsInRange(
  records: Array<{ createdAt: Date }>,
  startMs: number,
  endMs: number,
  isAll: boolean
): number {
  if (isAll) return records.length;
  return records.filter((r) => {
    const t = r.createdAt.getTime();
    return t >= startMs && t <= endMs;
  }).length;
}

/**
 * Centralized, optimized function to fetch and calculate all dashboard analytics
 * directly from Prisma database for the given time range.
 */
export async function getDashboardAnalytics(
  range: GrowthTimeRange = "30D",
  prisma: PrismaClient
): Promise<DashboardAnalyticsPayload> {
  const now = new Date();

  // Query raw entity timestamps in parallel batch
  const [
    campaignRecords,
    userRecords,
    chatbotRecords,
    messageRecords,
    companyRecords,
    ticketRecords,
    recentCompanies,
    recentUsers,
    recentTickets,
  ] = await Promise.all([
    prisma.campaign.findMany({ select: { id: true, createdAt: true } }),
    prisma.user.findMany({ select: { id: true, name: true, role: true, status: true, subscriptionPlan: true, createdAt: true, updatedAt: true } }),
    prisma.chatbot.findMany({ select: { id: true, createdAt: true } }),
    prisma.message.findMany({ select: { id: true, createdAt: true } }),
    prisma.company.findMany({ select: { id: true, createdAt: true } }),
    prisma.support_tickets.findMany({ select: { id: true, createdAt: true } }),
    prisma.company.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        _count: { select: { users: true } },
        subscription_plans: {
          select: { name: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.user.findMany({
      select: { id: true, name: true, role: true, status: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.support_tickets.findMany({
      select: { id: true, name: true, message: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // Determine earliest date across all real database data
  const allTimestamps: Array<{ type: "campaign" | "user" | "chatbot" | "message" | "company"; date: Date }> = [
    ...campaignRecords.map((r) => ({ type: "campaign" as const, date: r.createdAt })),
    ...userRecords.map((r) => ({ type: "user" as const, date: r.createdAt })),
    ...chatbotRecords.map((r) => ({ type: "chatbot" as const, date: r.createdAt })),
    ...messageRecords.map((r) => ({ type: "message" as const, date: r.createdAt })),
    ...companyRecords.map((r) => ({ type: "company" as const, date: r.createdAt })),
  ];

  const earliestDate = allTimestamps.length > 0
    ? new Date(Math.min(...allTimestamps.map((item) => item.date.getTime())))
    : undefined;

  const boundaries = getDateRangeBoundaries(range, now, earliestDate);
  const curStartMs = boundaries.currentStart.getTime();
  const curEndMs = boundaries.currentEnd.getTime();
  const prevStartMs = boundaries.previousStart.getTime();
  const prevEndMs = boundaries.previousEnd.getTime();
  const isAll = range === "ALL";

  // Calculate current counts
  const campaignsCount = countRecordsInRange(campaignRecords, curStartMs, curEndMs, isAll);
  const usersCount = countRecordsInRange(userRecords, curStartMs, curEndMs, isAll);
  const chatbotsCount = countRecordsInRange(chatbotRecords, curStartMs, curEndMs, isAll);
  const messagesCount = countRecordsInRange(messageRecords, curStartMs, curEndMs, isAll);

  // Calculate previous comparison counts
  const prevCampaignsCount = isAll ? 0 : countRecordsInRange(campaignRecords, prevStartMs, prevEndMs, false);
  const prevUsersCount = isAll ? 0 : countRecordsInRange(userRecords, prevStartMs, prevEndMs, false);
  const prevChatbotsCount = isAll ? 0 : countRecordsInRange(chatbotRecords, prevStartMs, prevEndMs, false);
  const prevMessagesCount = isAll ? 0 : countRecordsInRange(messageRecords, prevStartMs, prevEndMs, false);

  // Dynamic percentage changes
  const campaignTrend = calculatePercentageChange(campaignsCount, prevCampaignsCount);
  const userTrend = calculatePercentageChange(usersCount, prevUsersCount);
  const chatbotTrend = calculatePercentageChange(chatbotsCount, prevChatbotsCount);
  const messageTrend = calculatePercentageChange(messagesCount, prevMessagesCount);

  // Filter timestamps for active range to aggregate into growth buckets
  const activeTimestamps = isAll
    ? allTimestamps
    : allTimestamps.filter((item) => {
        const ms = item.date.getTime();
        return ms >= curStartMs && ms <= curEndMs;
      });

  const buckets = buildGrowthBuckets(range, now, earliestDate);
  for (const item of activeTimestamps) {
    const ms = item.date.getTime();
    const b = buckets.find((bucket) => ms >= bucket.startMs && ms <= bucket.endMs);
    if (b) {
      b.value += 1;
      if (item.type === "campaign") b.breakdown.campaigns += 1;
      else if (item.type === "user") b.breakdown.users += 1;
      else if (item.type === "chatbot") b.breakdown.chatbots += 1;
      else if (item.type === "message") b.breakdown.messages += 1;
      else if (item.type === "company") b.breakdown.companies += 1;
    }
  }

  const growth: GrowthPoint[] = buckets.map(({ label, value, fullDate, breakdown }) => ({
    label,
    value,
    fullDate,
    breakdown,
  }));

  // Overview metrics
  const totalCompanies = companyRecords.length;
  const activeUsers = userRecords.filter((u) => u.status === "ACTIVE").length;
  const activeSubscriptions = userRecords.filter((u) => u.subscriptionPlan !== null).length;
  const auditLogCount = ticketRecords.length;

  const prevMonthCompanies = companyRecords.filter((c) => c.createdAt.getTime() < prevEndMs).length;
  const prevMonthUsers = userRecords.filter((u) => u.status === "ACTIVE" && u.createdAt.getTime() < prevEndMs).length;

  const companyChange = prevMonthCompanies > 0
    ? (((totalCompanies - prevMonthCompanies) / prevMonthCompanies) * 100).toFixed(1)
    : "0";

  const userChange = prevMonthUsers > 0
    ? (((activeUsers - prevMonthUsers) / prevMonthUsers) * 100).toFixed(1)
    : "0";

  return {
    timeRange: range,
    dateRange: boundaries.dateRangeLabel,
    comparisonPeriod: boundaries.comparisonLabel,
    metrics: {
      campaigns: {
        current: campaignsCount,
        previous: prevCampaignsCount,
        change: campaignTrend.change,
        changeType: campaignTrend.changeType,
        dateRange: boundaries.dateRangeLabel,
        comparisonPeriod: boundaries.comparisonLabel,
      },
      users: {
        current: usersCount,
        previous: prevUsersCount,
        change: userTrend.change,
        changeType: userTrend.changeType,
        dateRange: boundaries.dateRangeLabel,
        comparisonPeriod: boundaries.comparisonLabel,
      },
      chatbots: {
        current: chatbotsCount,
        previous: prevChatbotsCount,
        change: chatbotTrend.change,
        changeType: chatbotTrend.changeType,
        dateRange: boundaries.dateRangeLabel,
        comparisonPeriod: boundaries.comparisonLabel,
      },
      messages: {
        current: messagesCount,
        previous: prevMessagesCount,
        change: messageTrend.change,
        changeType: messageTrend.changeType,
        dateRange: boundaries.dateRangeLabel,
        comparisonPeriod: boundaries.comparisonLabel,
      },
    },
    growth,
    totalCompanies,
    activeUsers,
    activeSubscriptions,
    auditLogCount,
    companyChange: `${companyChange}%`,
    userChange: `${userChange}%`,
    companies: recentCompanies.map((company, index) => ({
      id: String(company.id),
      name: company.name,
      ini: initials(company.name),
      col: COMPANY_COLORS[index % COMPANY_COLORS.length],
      status: company.status === "ACTIVE" ? "Active" : "Inactive",
      plan: company.subscription_plans[0]?.name ?? "—",
      users: company._count.users,
    })),
    users: recentUsers.map((user, index) => ({
      id: String(user.id),
      un: user.name.toLowerCase().replace(/\s+/g, "_"),
      role: formatRole(user.role),
      status: user.status,
      av: initials(user.name),
      col: USER_COLORS[index % USER_COLORS.length],
    })),
    logs: recentTickets.map((ticket) => ({
      id: String(ticket.id),
      msg: ticket.message.length > 80 ? `${ticket.message.slice(0, 80)}…` : ticket.message,
      actor: ticket.name,
      time: formatRelative(ticket.createdAt),
      sev: toLogSeverity(ticket.status),
    })),
    error: null,
  };
}

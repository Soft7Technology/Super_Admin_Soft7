import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getPrismaConnectionErrorMessage } from "../../../../lib/prisma-errors";

export const dynamic = "force-dynamic";

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

function defaultPayload(error: string | null = null) {
  return {
    totalCompanies: 0,
    activeUsers: 0,
    activeSubscriptions: 0,
    auditLogCount: 0,
    companyChange: "0%",
    userChange: "0%",
    companies: [],
    users: [],
    logs: [],
    error,
  };
}

function initials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatRole(role: string) {
  return role === "ADMIN"
    ? "Admin"
    : role.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatRelative(date: Date) {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function toLogSeverity(status: string) {
  if (status === "IN_PROGRESS") return "danger";
  if (status === "RESOLVED") return "success";
  return "warn";
}

export async function GET() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  try {
    const [
      totalCompanies,
      activeUsers,
      activeSubscriptions,
      auditLogCount,
      prevMonthCompanies,
      prevMonthUsers,
      companies,
      recentUsers,
      recentTickets,
    ] = await prisma.$transaction([
      prisma.company.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({
        where: {
          subscriptionPlan: { not: null },
        },
      }),
      prisma.support_tickets.count(),
      prisma.company.count({
        where: { createdAt: { lt: thirtyDaysAgo } },
      }),
      prisma.user.count({
        where: {
          status: "ACTIVE",
          createdAt: { lt: thirtyDaysAgo },
        },
      }),
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
        select: {
          id: true,
          name: true,
          role: true,
          status: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.support_tickets.findMany({
        select: {
          id: true,
          name: true,
          message: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const companyChange = prevMonthCompanies > 0
      ? (((totalCompanies - prevMonthCompanies) / prevMonthCompanies) * 100).toFixed(1)
      : "0";

    const userChange = prevMonthUsers > 0
      ? (((activeUsers - prevMonthUsers) / prevMonthUsers) * 100).toFixed(1)
      : "0";

    return NextResponse.json({
      totalCompanies,
      activeUsers,
      activeSubscriptions,
      auditLogCount,
      companyChange: `${companyChange}%`,
      userChange: `${userChange}%`,
      companies: companies.map((company, index) => ({
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
    });
  } catch (error) {
    const connectionMessage = getPrismaConnectionErrorMessage(error);

    if (connectionMessage) {
      console.warn(`[admin/dashboard] ${connectionMessage}`);
      return NextResponse.json(defaultPayload(connectionMessage));
    }

    console.error("[admin/dashboard] error:", error);
    return NextResponse.json(defaultPayload("Failed to fetch dashboard data."), { status: 500 });
  }
}

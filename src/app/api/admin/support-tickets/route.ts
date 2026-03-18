import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { sendSupportTicketReplyEmail } from "../../../../lib/support-ticket-email";

export const dynamic = "force-dynamic";
const FORWARD_LOG_PREFIX = "[FORWARDED_TO_SUPER_ADMIN]";

type UiTicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "WAITING";
type DbTicketStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED";

const UI_TO_DB_STATUS: Record<UiTicketStatus, DbTicketStatus> = {
  OPEN: "PENDING",
  WAITING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "RESOLVED",
};

const ticketInclude = {
  User: { include: { company: true } },
  replies: { orderBy: { createdAt: "asc" as const } },
};

const COMPANY_COLORS = [
  "#FDCB6E", "#A29BFE", "#00B894", "#6C5CE7", "#00CBA4",
  "#FF6B6B", "#E17055", "#FD79A8", "#74B9FF", "#0984E3",
];

function mapStatus(s: DbTicketStatus): UiTicketStatus {
  if (s === "IN_PROGRESS") return "IN_PROGRESS";
  if (s === "RESOLVED") return "RESOLVED";
  return "OPEN"; // PENDING → OPEN
}

function fmtDate(d: Date): string {
  return new Date(d).toLocaleString("en-IN", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function timeAgo(d: Date): string {
  const sec = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (sec < 60)    return "Just now";
  if (sec < 3600)  return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  const days = Math.floor(sec / 86400);
  return days < 7 ? `${days}d ago` : fmtDate(d);
}

function initials(name: string): string {
  return (
    name.split(" ").map(w => w[0] ?? "").join("").substring(0, 2).toUpperCase() || "??"
  );
}

function parseTicketId(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

function toUiTicket(t: any) {
  const company = t.User?.company?.name ?? "Unknown Company";
  const logo =
    company
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "??";

  const visibleReplies = (t.replies ?? []).filter(
    (r: { message: string }) => !r.message.startsWith(FORWARD_LOG_PREFIX)
  );

  const messages = [
    {
      id: 0,
      sender: "USER" as const,
      name: t.name,
      avatar: initials(t.name),
      content: t.message,
      time: fmtDate(t.createdAt),
      read: true,
    },
    ...visibleReplies.map((r: { id: number; message: string; createdAt: Date }) => ({
      id: r.id,
      sender: "ADMIN" as const,
      name: "Support Team",
      avatar: "ST",
      content: r.message,
      time: fmtDate(r.createdAt),
      read: true,
    })),
  ];

  return {
    id: t.id,
    subject: t.message.length > 90 ? `${t.message.substring(0, 90)}…` : t.message,
    company,
    companyLogo: logo,
    companyCol: COMPANY_COLORS[t.id % COMPANY_COLORS.length],
    user: t.name,
    userEmail: t.email,
    status: mapStatus(t.status),
    priority: "MEDIUM" as const,
    category: "Other",
    created: fmtDate(t.createdAt),
    updated: timeAgo(t.updatedAt),
    messages,
    unread: 0,
  };
}

export async function GET(_req: NextRequest) {
  try {
    const dbTickets = await prisma.support_tickets.findMany({
      where: {
        replies: {
          some: {
            message: {
              startsWith: FORWARD_LOG_PREFIX,
            },
          },
        },
      },
      include: ticketInclude,
      orderBy: { createdAt: "desc" },
    });

    const mapped = dbTickets.map(toUiTicket);

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("[GET /api/admin/support-tickets]", err);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as {
      ticketId?: number | string;
      status?: UiTicketStatus;
    } | null;

    const ticketId = parseTicketId(body?.ticketId);
    const status = body?.status;

    if (!ticketId || !status || !(status in UI_TO_DB_STATUS)) {
      return NextResponse.json({ error: "Invalid ticket update payload" }, { status: 400 });
    }

    const dbStatus = UI_TO_DB_STATUS[status];
    const now = new Date();

    await prisma.support_tickets.update({
      where: { id: ticketId },
      data: {
        status: dbStatus,
        resolvedAt: dbStatus === "RESOLVED" ? now : null,
        updatedAt: now,
      },
    });

    const updated = await prisma.support_tickets.findUnique({
      where: { id: ticketId },
      include: ticketInclude,
    });

    if (!updated) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket: toUiTicket(updated) });
  } catch (err) {
    console.error("[PATCH /api/admin/support-tickets]", err);
    return NextResponse.json({ error: "Failed to update ticket status" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as {
      ticketId?: number | string;
      message?: string;
    } | null;

    const ticketId = parseTicketId(body?.ticketId);
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!ticketId || !message) {
      return NextResponse.json({ error: "Ticket id and message are required" }, { status: 400 });
    }

    const existing = await prisma.support_tickets.findUnique({
      where: { id: ticketId },
      include: ticketInclude,
    });

    if (!existing) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const now = new Date();

    await prisma.$transaction([
      prisma.support_ticket_replies.create({
        data: {
          ticketId,
          message,
        },
      }),
      prisma.support_tickets.update({
        where: { id: ticketId },
        data: {
          status: "IN_PROGRESS",
          reply: message,
          repliedAt: now,
          updatedAt: now,
        },
      }),
    ]);

    let emailSent = true;
    let emailError: string | null = null;

    try {
      await sendSupportTicketReplyEmail({
        to: existing.email,
        recipientName: existing.name,
        ticketId: existing.id,
        originalMessage: existing.message,
        replyMessage: message,
      });
    } catch (emailErr) {
      emailSent = false;
      emailError = "Reply was saved, but email delivery failed. Please verify SMTP settings.";
      console.error("[POST /api/admin/support-tickets] email error", emailErr);
    }

    const updated = await prisma.support_tickets.findUnique({
      where: { id: ticketId },
      include: ticketInclude,
    });

    if (!updated) {
      return NextResponse.json({ error: "Ticket not found after update" }, { status: 500 });
    }

    return NextResponse.json({
      ticket: toUiTicket(updated),
      emailSent,
      emailError,
    });
  } catch (err) {
    console.error("[POST /api/admin/support-tickets]", err);
    return NextResponse.json({ error: "Failed to send ticket reply" }, { status: 500 });
  }
}

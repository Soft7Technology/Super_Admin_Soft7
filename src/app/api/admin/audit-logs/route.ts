import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getPrismaConnectionErrorMessage } from "../../../../lib/prisma-errors";

export const dynamic = "force-dynamic";

// Map ticket status/priority to a severity level for display
function toSeverity(status: string | null): string {
  if (status === "PENDING") return "warn";
  if (status === "RESOLVED" || status === "CLOSED") return "success";
  return "info";
}

function formatRelative(d: Date): string {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

export async function GET() {
  try {
    const tickets = await prisma.support_tickets.findMany({
      select: {
        id:           true,
        message:      true,
        name:         true,
        status:       true,
        createdAt:    true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const logs = tickets.map((t) => ({
      id:    String(t.id),
      msg:   t.message.length > 80 ? t.message.slice(0, 80) + "…" : t.message,
      actor: t.name,
      time:  formatRelative(t.createdAt),
      sev:   toSeverity(t.status),
    }));

    return NextResponse.json({ logs, error: null });
  } catch (error) {
    const connectionMessage = getPrismaConnectionErrorMessage(error);

    if (connectionMessage) {
      console.warn(`[admin/audit-logs] ${connectionMessage}`);
      return NextResponse.json({ logs: [], error: connectionMessage });
    }

    console.error("[admin/audit-logs] error:", error);
    return NextResponse.json({ logs: [], error: "Failed to fetch audit logs." }, { status: 500 });
  }
}

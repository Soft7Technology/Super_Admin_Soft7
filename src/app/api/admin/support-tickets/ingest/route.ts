import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/support-tickets/ingest
 *
 * Accepts forwarded ticket payloads from WA_Dashboard.
 * Both apps share the same PostgreSQL database, so the ticket is already
 * in the DB by the time this endpoint is called. We simply acknowledge receipt
 * so WA_Dashboard can log the forward and update the ticket status.
 */
export async function POST(_req: NextRequest) {
  const expectedToken = process.env.SUPER_ADMIN_SUPPORT_TICKET_TOKEN?.trim();

  if (expectedToken) {
    const auth = _req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";

    if (token !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.json(
    { ok: true, message: "Ticket received" },
    { status: 200 }
  );
}

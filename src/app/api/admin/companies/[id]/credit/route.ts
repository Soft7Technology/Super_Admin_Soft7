import { NextRequest, NextResponse } from "next/server";
import { POST as handleAddCredit } from "@/app/api/admin/credits/add/route";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const companyId = Number(id);

  if (!companyId || isNaN(companyId)) {
    return NextResponse.json(
      { success: false, error: "Invalid company ID" },
      { status: 400 }
    );
  }

  // Clone request with company_id injected if missing
  const body = await req.json().catch(() => ({}));
  const enrichedBody = { ...body, company_id: companyId };

  const enrichedReq = new NextRequest(req.url, {
    method: "POST",
    headers: req.headers,
    body: JSON.stringify(enrichedBody),
  });

  return handleAddCredit(enrichedReq);
}

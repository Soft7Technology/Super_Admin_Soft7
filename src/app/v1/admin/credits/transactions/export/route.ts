import { NextRequest } from "next/server";
import { GET as handleExport } from "@/app/api/admin/credits/transactions/export/route";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleExport(req);
}

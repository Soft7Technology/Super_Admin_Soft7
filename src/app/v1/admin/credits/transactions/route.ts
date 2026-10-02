import { NextRequest } from "next/server";
import { GET as handleGetTransactions } from "@/app/api/admin/credits/transactions/route";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleGetTransactions(req);
}

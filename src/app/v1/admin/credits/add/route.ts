import { NextRequest } from "next/server";
import { POST as handleAddCredit } from "@/app/api/admin/credits/add/route";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return handleAddCredit(req);
}

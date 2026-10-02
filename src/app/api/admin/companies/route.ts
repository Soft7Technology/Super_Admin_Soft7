import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    let formatted: any[] = [];

    try {
      const companies = await prisma.company.findMany({
        select: {
          id: true,
          name: true,
          domain: true,
          status: true,
          _count: { select: { users: true } },
          subscription_plans: {
            select: { name: true },
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      formatted = companies.map((c) => ({
        id: String(c.id),
        name: c.name,
        domain: c.domain,
        status: c.status,
        plan: c.subscription_plans[0]?.name || "Starter", 
        users: c._count.users,
      }));
    } catch (dbErr) {
      // Prisma error / column missing - fallback to remote
    }

    if (formatted.length > 0) {
      return NextResponse.json(formatted);
    }

    // Fallback: fetch from hostapi
    const authHeader = req.headers.get("authorization");
    const cookieHeader = req.headers.get("cookie") || "";
    let token = "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    } else {
      const match = cookieHeader.match(/(?:accessToken|token)=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]).replace(/^"|"$/g, "");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const hostRes = await fetch("https://hostapi.soft7.in/v1/admin/companies?limit=100", {
      headers,
      signal: AbortSignal.timeout(4000),
    }).catch(() => null);

    if (hostRes && hostRes.ok) {
      const json = await hostRes.json().catch(() => null);
      const rawComps = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.data?.companies)
        ? json.data.companies
        : Array.isArray(json?.companies)
        ? json.companies
        : [];

      formatted = rawComps.map((c: any) => ({
        id: String(c.id),
        name: c.name || "Unknown Company",
        domain: c.domain || null,
        status: c.status || "ACTIVE",
        plan: c.plan || c.subscription_plans?.[0]?.name || "Starter",
        users: typeof c.users === "number" ? c.users : c._count?.users || 0,
      }));
    }

    return NextResponse.json(formatted);

  } catch (error) {
    console.error("GET companies error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, domain, adminEmail, status, plan } = body;

    if (!name || !adminEmail) {
      return NextResponse.json(
        { message: "Name and Admin Email are required" },
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name,
        domain,
        adminEmail,
        status: status || "ACTIVE",
        subscription_plans: {
          create: [
            {
              name:plan || "Starter",
               price: 0, 
      updatedAt: new Date(),
            },
          ],
        },
      },
      include: {
        subscription_plans: true,
      },
    });

    return NextResponse.json(company, { status: 201 });

  } catch (err) {
    console.log("Error", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}



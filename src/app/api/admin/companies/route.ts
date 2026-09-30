import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
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

    const formatted = companies.map((c) => ({
      id: String(c.id),
      name: c.name,
      domain: c.domain,
      status: c.status,
      plan: c.subscription_plans[0]?.name || "Starter", 
      users: c._count.users,
    }));

    return NextResponse.json(formatted);

  } catch (error) {
    console.error("GET companies error:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
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



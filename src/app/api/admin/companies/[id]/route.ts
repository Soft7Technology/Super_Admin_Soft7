import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getPrismaConnectionErrorMessage } from "../../../../../lib/prisma-errors";

export const dynamic = "force-dynamic";

function parseCompanyId(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const idSegment = segments[segments.length - 1];
  const parsed = Number(idSegment);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export async function GET(req: NextRequest) {
  const companyId = parseCompanyId(req.nextUrl.pathname);

  if (!companyId) {
    return NextResponse.json({ company: null, error: "Invalid company id." }, { status: 400 });
  }

  try {
    const [company, activeUsers, inactiveUsers, activeSubscriptions, expiredSubscriptions, cancelledSubscriptions, trialSubscriptions] = await prisma.$transaction([
      prisma.companies.findUnique({
        where: { id: companyId },
        select: {
          id: true,
          name: true,
          domain: true,
          status: true,
          logo: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              users: true,
              subscription_plans: true,
              UserSubscription: true,
            },
          },
          subscription_plans: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              billingCycle: true,
              isActive: true,
              isPopular: true,
              displayOrder: true,
              createdAt: true,
              updatedAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      }),
      prisma.user.count({ where: { companyId, status: "ACTIVE" } }),
      prisma.user.count({ where: { companyId, status: { not: "ACTIVE" } } }),
      prisma.userSubscription.count({ where: { companyId, status: "ACTIVE" } }),
      prisma.userSubscription.count({ where: { companyId, status: "EXPIRED" } }),
      prisma.userSubscription.count({ where: { companyId, status: "CANCELLED" } }),
      prisma.userSubscription.count({ where: { companyId, status: "TRIAL" } }),
    ]);

    if (!company) {
      return NextResponse.json({ company: null, error: "Company not found." }, { status: 404 });
    }

    const latestPlan = company.subscription_plans[0] ?? null;

    return NextResponse.json({
      company: {
        id: String(company.id),
        name: company.name,
        domain: company.domain,
        status: company.status,
        logo: company.logo,
        createdAt: company.createdAt.toISOString(),
        updatedAt: company.updatedAt.toISOString(),
        counts: {
          users: company._count.users,
          activeUsers,
          inactiveUsers,
          plans: company._count.subscription_plans,
          subscriptions: company._count.UserSubscription,
          activeSubscriptions,
          expiredSubscriptions,
          cancelledSubscriptions,
          trialSubscriptions,
        },
        latestPlan: latestPlan
          ? {
              id: String(latestPlan.id),
              name: latestPlan.name,
              description: latestPlan.description,
              price: latestPlan.price,
              billingCycle: latestPlan.billingCycle,
              isActive: latestPlan.isActive,
              isPopular: latestPlan.isPopular,
              displayOrder: latestPlan.displayOrder,
              createdAt: latestPlan.createdAt.toISOString(),
              updatedAt: latestPlan.updatedAt.toISOString(),
            }
          : null,
        plans: company.subscription_plans.map((plan) => ({
          id: String(plan.id),
          name: plan.name,
          description: plan.description,
          price: plan.price,
          billingCycle: plan.billingCycle,
          isActive: plan.isActive,
          isPopular: plan.isPopular,
          displayOrder: plan.displayOrder,
          createdAt: plan.createdAt.toISOString(),
          updatedAt: plan.updatedAt.toISOString(),
        })),
      },
      error: null,
    });
  } catch (error) {
    const connectionMessage = getPrismaConnectionErrorMessage(error);

    if (connectionMessage) {
      console.warn(`[admin/companies/${companyId}] ${connectionMessage}`);
      return NextResponse.json({ company: null, error: connectionMessage });
    }

    console.error(`[admin/companies/${companyId}] error:`, error);
    return NextResponse.json({ company: null, error: "Failed to fetch company details." }, { status: 500 });
  }
}

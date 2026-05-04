import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, email, phone, plan, companyId } = body;

    const updatedUser = await prisma.user.update({
  where: { id: userId },
  data: {
    ...(name && { name }),
    ...(email && { email }),
    ...(phone && { phone }),
    ...(plan && { subscriptionPlan: plan }),
  },
});
    return NextResponse.json({
      success: true,
      user: updatedUser,
    });

  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}
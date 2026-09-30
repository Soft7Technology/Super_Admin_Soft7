import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validatePhoneNumber } from "@/lib/phone";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        subscriptionPlan: true,
        isPremium: true,
        createdAt: true,
        company: {
          select: { id: true, name: true, domain: true },
        },
        _count: {
          select: {
            messages: true,
            campaigns: true,
            chatbots: true,
            contacts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        role: user.role === "ADMIN" ? "Admin" : "User",
        status: user.status as string,
        company: user.company?.name ?? "—",
        company_name: user.company?.name ?? "—",
        company_id: user.company?.id ? String(user.company.id) : null,
        companyDomain: user.company?.domain ?? "",
        plan: user.subscriptionPlan ?? "Starter",
        joined: user.createdAt.toISOString(),
        messages: user._count.messages,
        campaigns: user._count.campaigns,
        contacts: user._count.contacts,
      },
    });
  } catch (error: any) {
    console.error("GET USER ERROR:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch user details" },
      { status: 500 }
    );
  }
}

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

    const body = await req.json().catch(() => ({}));
    const { name, email, phone, plan, companyId, status, role } = body;

    const dataToUpdate: Record<string, any> = {};

    if (name) dataToUpdate.name = String(name).trim();

    if (email) {
      const lowerEmail = String(email).trim().toLowerCase();
      const existingEmail = await prisma.user.findFirst({
        where: {
          email: lowerEmail,
          NOT: { id: userId },
        },
      });
      if (existingEmail) {
        return NextResponse.json(
          {
            success: false,
            error: "Duplicate Error",
            message: "A user with this email already exists.",
          },
          { status: 409 }
        );
      }
      dataToUpdate.email = lowerEmail;
    }

    if (phone !== undefined) {
      if (phone && String(phone).trim()) {
        const phoneValidation = validatePhoneNumber(phone);
        if (!phoneValidation.isValid) {
          return NextResponse.json(
            {
              success: false,
              error: "Validation Error",
              message: phoneValidation.error || "Please enter a valid international phone number.",
            },
            { status: 400 }
          );
        }
        const normalizedPhone = phoneValidation.e164!;

        const existingPhone = await prisma.user.findFirst({
          where: {
            phone: normalizedPhone,
            NOT: { id: userId },
          },
        });
        if (existingPhone) {
          return NextResponse.json(
            {
              success: false,
              error: "Duplicate Error",
              message: "A user with this phone number already exists.",
            },
            { status: 409 }
          );
        }
        dataToUpdate.phone = normalizedPhone;
      } else {
        dataToUpdate.phone = null;
      }
    }
    if (plan) dataToUpdate.subscriptionPlan = String(plan).trim();
    if (companyId !== undefined) {
      const parsedCompanyId = Number(companyId);
      dataToUpdate.companyId =
        !isNaN(parsedCompanyId) && parsedCompanyId > 0 ? parsedCompanyId : null;
    }

    if (status) {
      const rawStatus = String(status).toUpperCase();
      dataToUpdate.status =
        rawStatus === "SUSPENDED"
          ? "SUSPENDED"
          : rawStatus === "INACTIVE"
          ? "PENDING"
          : "ACTIVE";
      dataToUpdate.isActive = rawStatus === "ACTIVE";
    }

    if (role) {
      dataToUpdate.role = String(role).toUpperCase() === "ADMIN" ? "ADMIN" : "USER";
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        subscriptionPlan: true,
        company: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: {
        id: String(updatedUser.id),
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone ?? "",
        role: updatedUser.role === "ADMIN" ? "Admin" : "User",
        status: updatedUser.status as string,
        company: updatedUser.company?.name ?? "—",
        plan: updatedUser.subscriptionPlan ?? "Starter",
      },
    });
  } catch (error: any) {
    console.error("UPDATE ERROR:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
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

    // Clean up foreign key references if not cascading
    await prisma.walletTransaction.deleteMany({ where: { userId } }).catch(() => null);
    await prisma.message.deleteMany({ where: { userId } }).catch(() => null);
    await prisma.contact.deleteMany({ where: { userId } }).catch(() => null);
    await prisma.lead.deleteMany({ where: { userId } }).catch(() => null);
    await prisma.conversation.deleteMany({ where: { userId } }).catch(() => null);

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE USER ERROR:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getCurrentUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = Number(authUser.id);
    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: "Invalid user authentication" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        admin_profile_meta: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const profileData = {
      id: String(user.id),
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      role: user.role,
      status: String(user.status || "ACTIVE").toLowerCase(),
      avatar: user.image ?? null,
      last_login_at: user.updatedAt ? new Date(user.updatedAt).toISOString() : null,
      created_at: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
      settings: user.admin_profile_meta ?? null,
    };

    return NextResponse.json({
      success: true,
      data: profileData,
    });
  } catch (error: any) {
    console.error("[profile GET] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await getCurrentUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = Number(authUser.id);
    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: "Invalid user authentication" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, phone, bio, location, website, timezone, language, weekStart, emailNotifications, smsNotifications, darkMode, compactUI } = body;

    // Update user basic info
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(phone !== undefined && { phone: String(phone).trim() }),
        updatedAt: new Date(),
      },
    });

    // Update or create meta settings if any provided
    const hasMeta = bio !== undefined || location !== undefined || website !== undefined || timezone !== undefined ||
      language !== undefined || weekStart !== undefined || emailNotifications !== undefined ||
      smsNotifications !== undefined || darkMode !== undefined || compactUI !== undefined;

    let metaRecord = null;
    if (hasMeta) {
      metaRecord = await prisma.admin_profile_meta.upsert({
        where: { userId },
        create: {
          userId,
          bio: bio !== undefined ? String(bio) : null,
          location: location !== undefined ? String(location) : null,
          website: website !== undefined ? String(website) : null,
          timezone: timezone !== undefined ? String(timezone) : "Asia/Kolkata",
          language: language !== undefined ? String(language) : "en",
          weekStart: weekStart !== undefined ? String(weekStart) : "Mon",
          emailNotifications: emailNotifications !== undefined ? Boolean(emailNotifications) : true,
          smsNotifications: smsNotifications !== undefined ? Boolean(smsNotifications) : false,
          darkMode: darkMode !== undefined ? Boolean(darkMode) : true,
          compactUI: compactUI !== undefined ? Boolean(compactUI) : false,
        },
        update: {
          ...(bio !== undefined && { bio: String(bio) }),
          ...(location !== undefined && { location: String(location) }),
          ...(website !== undefined && { website: String(website) }),
          ...(timezone !== undefined && { timezone: String(timezone) }),
          ...(language !== undefined && { language: String(language) }),
          ...(weekStart !== undefined && { weekStart: String(weekStart) }),
          ...(emailNotifications !== undefined && { emailNotifications: Boolean(emailNotifications) }),
          ...(smsNotifications !== undefined && { smsNotifications: Boolean(smsNotifications) }),
          ...(darkMode !== undefined && { darkMode: Boolean(darkMode) }),
          ...(compactUI !== undefined && { compactUI: Boolean(compactUI) }),
          updatedAt: new Date(),
        },
      });
    } else {
      metaRecord = await prisma.admin_profile_meta.findUnique({
        where: { userId },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: String(updatedUser.id),
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone ?? "",
        role: updatedUser.role,
        status: String(updatedUser.status || "ACTIVE").toLowerCase(),
        avatar: updatedUser.image ?? null,
        last_login_at: updatedUser.updatedAt ? new Date(updatedUser.updatedAt).toISOString() : null,
        created_at: updatedUser.createdAt ? new Date(updatedUser.createdAt).toISOString() : new Date().toISOString(),
        settings: metaRecord,
      },
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    console.error("[profile PUT] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

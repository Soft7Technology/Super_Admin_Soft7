import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getPrismaConnectionErrorMessage } from "../../../../lib/prisma-errors";
import bcrypt from "bcryptjs";
import { validatePhoneNumber } from "@/lib/phone";

export const dynamic = "force-dynamic";

// Palette used for avatar background colours (deterministic per user id)
const AVATAR_PALETTE = [
  "#6C5CE7", "#00CBA4", "#FF6B6B", "#FDCB6E", "#74B9FF",
  "#A29BFE", "#FD79A8", "#00B894", "#E17055", "#0984E3",
];

function avatarColor(id: number) {
  return AVATAR_PALETTE[id % AVATAR_PALETTE.length];
}

function parseTake(limit: string | null, fallback: number) {
  if (!limit) {
    return fallback;
  }

  if (limit.toLowerCase() === "all") {
    return undefined;
  }

  const parsed = Number(limit);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.min(Math.floor(parsed), 5000);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "ALL";
    const role   = searchParams.get("role")   ?? "ALL";
    const sort   = searchParams.get("sort")   ?? "name";
    const take   = parseTake(searchParams.get("limit"), 500);

    // ── Build WHERE clause ──────────────────────────────────────────────────
    const where: Record<string, unknown> = {};

    if (status !== "ALL") {
      where.status = status;
    }

    // role field in DB is stored as "USER", "ADMIN" etc.
    if (role !== "ALL") {
      where.role = role.toUpperCase();
    }

    if (search.trim()) {
      where.OR = [
        { name:    { contains: search, mode: "insensitive" } },
        { email:   { contains: search, mode: "insensitive" } },
        { company: { is: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }

    // ── Fetch users with relations ──────────────────────────────────────────
    const [users, totalUsers, activeUsers, adminUsers, premiumUsers] = await prisma.$transaction([
      prisma.user.findMany({
        where,
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
          updatedAt: true,
          company: {
            select: { id: true, name: true, domain: true },
          },
          _count: {
            select: {
              messages: true,
              campaigns: true,
              chatbots: true,
            },
          },
        },
        orderBy: sort === "msgs"
          ? { messages: { _count: "desc" } }
          : { name: "asc" },
        ...(typeof take === "number" ? { take } : {}),
      }),
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { isPremium: true } }),
    ]);

    // ── Serialize ───────────────────────────────────────────────────────────
    const serialized = users.map((u) => ({
      id:            String(u.id),
      name:          u.name,
      email:         u.email,
      phone:         u.phone ?? "",
      role:          u.role === "ADMIN" ? "Admin" : "User",
      status:        u.status as string,
      company:       u.company?.name ?? "—",
      companyId:     u.company?.id ? String(u.company.id) : undefined,
      companyDomain: u.company?.domain ?? "",
      plan:          u.subscriptionPlan ?? "Starter",
      av:            avatarColor(u.id),
      login:         formatRelative(u.updatedAt),
      joined:        formatDate(u.createdAt),
      msgs:          u._count.messages,
      campaigns:     u._count.campaigns,
      chatbots:      u._count.chatbots,
      pro:           u.isPremium,
    }));

    return NextResponse.json({
      users: serialized,
      stats: { totalUsers, activeUsers, adminUsers, premiumUsers },
      error: null,
    });
  } catch (error) {
    const connectionMessage = getPrismaConnectionErrorMessage(error);

    if (connectionMessage) {
      console.warn(`[admin/users] ${connectionMessage}`);
      return NextResponse.json({
        users: [],
        stats: { totalUsers: 0, activeUsers: 0, adminUsers: 0, premiumUsers: 0 },
        error: connectionMessage,
      });
    }

    console.error("[admin/users] error:", error);
    return NextResponse.json(
      {
        users: [],
        stats: { totalUsers: 0, activeUsers: 0, adminUsers: 0, premiumUsers: 0 },
        error: "Failed to fetch users.",
      },
      { status: 500 }
    );
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatRelative(d: Date): string {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, phone, password, role, status, plan, companyId } = body;

    // 1. Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Validation Error", message: "Full name is required." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Validation Error", message: "Email is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: "Validation Error", message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Validation Error", message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const lowerEmail = email.trim().toLowerCase();

    // 2. Duplicate Email Check
    const existing = await prisma.user.findUnique({
      where: { email: lowerEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Duplicate Error", message: "A user with this email already exists." },
        { status: 409 }
      );
    }

    // 3. International Phone Validation & E.164 Normalization
    let normalizedPhone: string | null = null;
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
      normalizedPhone = phoneValidation.e164!;

      // Duplicate Phone Check on normalized E.164
      const existingPhone = await prisma.user.findFirst({
        where: { phone: normalizedPhone },
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
    }

    // 4. Password Hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Status and Role Normalization
    const rawStatus = String(status || "ACTIVE").toUpperCase();
    const prismaStatus =
      rawStatus === "SUSPENDED"
        ? "SUSPENDED"
        : rawStatus === "INACTIVE"
        ? "PENDING"
        : "ACTIVE";

    const finalRole = String(role || "USER").toUpperCase() === "ADMIN" ? "ADMIN" : "USER";

    const parsedCompanyId =
      companyId !== null && companyId !== undefined && companyId !== ""
        ? Number(companyId)
        : null;

    // 6. Database Persistence
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: lowerEmail,
        phone: normalizedPhone,
        password: hashedPassword,
        role: finalRole,
        status: prismaStatus as any,
        isActive: rawStatus === "ACTIVE",
        subscriptionPlan: plan ? String(plan).trim() : "Starter",
        companyId: parsedCompanyId && !isNaN(parsedCompanyId) && parsedCompanyId > 0 ? parsedCompanyId : null,
        memberSince: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        subscriptionPlan: true,
        createdAt: true,
        company: {
          select: { id: true, name: true, domain: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        id: String(newUser.id),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone ?? "",
        role: newUser.role === "ADMIN" ? "Admin" : "User",
        status: rawStatus,
        company: newUser.company?.name ?? "—",
        companyId: newUser.company?.id ? String(newUser.company.id) : undefined,
        companyDomain: newUser.company?.domain ?? "",
        plan: newUser.subscriptionPlan ?? "Starter",
      },
    });
  } catch (error: any) {
    console.error("[admin/users POST] error:", error);
    return NextResponse.json(
      { success: false, error: "Server Error", message: error?.message || "Failed to create user." },
      { status: 500 }
    );
  }
}


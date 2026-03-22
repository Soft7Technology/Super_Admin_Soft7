/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  parsePhoneNumber,
  getCountries,
  getCountryCallingCode,
} from "libphonenumber-js/max";
import type { CountryCode } from "libphonenumber-js/max";
import * as nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendWelcomeEmail(to: string, name: string) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: "Welcome to Soft7!",
    html: `<p>Hi <b>${name}</b>,</p><p>Thank you for registering on Soft7!</p>`,
  });
}

export async function POST(req: Request) {
  try {
    const {
      name,
      email,
      phone,
      password,
      countryCode,
    } = await req.json();

    const trimmedName = String(name || "").trim();
    const lowerEmail = String(email || "").toLowerCase().trim();
    const trimmedPhone = String(phone || "").trim();
    const inputCode = String(countryCode || "").trim();
    const trimmedPassword = String(password || "").trim();
    const finalRole = "SUPER ADMIN";

    const fieldErrors: Record<string, string> = {};

    // Country code processing
    let rawCountryCode: CountryCode | undefined;
    if (inputCode.startsWith("+")) {
      const dial = inputCode.replace("+", "");
      rawCountryCode = getCountries().find(
        (c) => getCountryCallingCode(c) === dial,
      ) as CountryCode | undefined;
    } else rawCountryCode = inputCode.toUpperCase() as CountryCode;

    // Global empty check
    if (!trimmedName && !lowerEmail && !trimmedPhone && !inputCode && !trimmedPassword) {
      return NextResponse.json(
        {
          error: "Please fill all required fields",
          fieldErrors: {
            name: "Name is required",
            email: "Email is required",
            phone: "Phone is required",
            countryCode: "Country code is required",
            password: "Password is required",
          },
        },
        { status: 400 },
      );
    }

    // Individual validations
    if (!trimmedName) fieldErrors.name = "Name is required";
    else if (trimmedName.length < 2) fieldErrors.name = "Name must be at least 2 characters";

    if (!lowerEmail) fieldErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lowerEmail))
      fieldErrors.email = "Invalid email format";

    if (!inputCode) fieldErrors.countryCode = "Country code is required";
    if (!rawCountryCode) fieldErrors.countryCode = "Invalid country code";

    if (!trimmedPhone) fieldErrors.phone = "Phone number is required";
    else if (rawCountryCode) {
      try {
        const pn = parsePhoneNumber(trimmedPhone, rawCountryCode);
        if (!pn?.isValid()) fieldErrors.phone = `Invalid phone for ${rawCountryCode}`;
      } catch {
        fieldErrors.phone = "Invalid phone format";
      }
    }

    if (!trimmedPassword) fieldErrors.password = "Password is required";
    else if (trimmedPassword.length < 8) fieldErrors.password = "Min 8 characters required";
    else {
      const hasUpper = /[A-Z]/.test(trimmedPassword);
      const hasLower = /[a-z]/.test(trimmedPassword);
      const hasNumber = /[0-9]/.test(trimmedPassword);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(trimmedPassword);
      if (!hasUpper || !hasLower || !hasNumber || !hasSpecial)
        fieldErrors.password = "Must include uppercase, lowercase, number & special character";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json({ error: "Fix the errors", fieldErrors }, { status: 400 });
    }

    // Format phone number
    const pn = parsePhoneNumber(trimmedPhone, rawCountryCode as CountryCode);
    const fullPhoneNumber = pn!.number;

    // Check duplicates
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: lowerEmail }, { phone: fullPhoneNumber }] },
    });
    if (existingUser) {
      const dup: Record<string, string> = {};
      if (existingUser.email === lowerEmail) dup.email = "Email already exists";
      if (existingUser.phone === fullPhoneNumber) dup.phone = "Phone already exists";
      return NextResponse.json({ error: "User already exists", fieldErrors: dup }, { status: 409 });
    }

    const now = new Date();
    const trialEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Hash password
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    // Save user
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: lowerEmail,
        phone: fullPhoneNumber,
        password: hashedPassword,
        role: finalRole,
        status: "ACTIVE",
        hasUsedTrial: true,
        trialStartAt: now,
        trialEndAt: trialEnd,
      },
      select: { id: true, name: true, email: true, phone: true, role: true, memberSince: true },
    });

    // Send welcome email (non-blocking)
    try {
      await sendWelcomeEmail(lowerEmail, trimmedName);
    } catch (emailErr) {
      console.warn("Registration: welcome email failed:", emailErr);
    }

    return NextResponse.json(
      { success: true, message: "Registration successful", user },
      { status: 201 },
    );
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Server error, try again later" }, { status: 500 });
  }
}

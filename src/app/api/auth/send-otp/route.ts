/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import * as nodemailer from "nodemailer";
import redis from "@/lib/redisConnection";
import twilio from "twilio";
import { prisma } from "@/lib/prisma";

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email, phone, channel } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (channel === "whatsapp" && !phone) {
      return NextResponse.json(
        { error: "Phone number is required for WhatsApp" },
        { status: 400 }
      );
    }

    if (channel === "whatsapp" && !phone.startsWith("+")) {
      return NextResponse.json(
        { error: "Phone number must include country code (e.g., +919876543210)" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    const otp = generateOTP();

    // Store OTP (5 minutes)
    await redis.set(`otp:${normalizedEmail}`, otp, "EX", 300);

    // EMAIL OTP
    if (channel === "email") {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: normalizedEmail,
        subject: "Password Reset OTP",
        html: `<h2>Your OTP is <b>${otp}</b></h2><p>Valid for 5 minutes</p>`,
      });
    }

    // WHATSAPP OTP
    if (channel === "whatsapp") {
      await twilioClient.messages.create({
        body: `🔐 Your password reset OTP is ${otp}. Valid for 5 minutes.`,
        from: process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886",
        to: `whatsapp:${phone.trim()}`,
      });
    }

    return NextResponse.json(
      { success: true, message: `OTP sent successfully via ${channel}` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send OTP" },
      { status: 500 }
    );
  }
}

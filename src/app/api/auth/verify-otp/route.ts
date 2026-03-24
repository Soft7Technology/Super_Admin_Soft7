import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import redis from "@/lib/redisConnection";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const storedOtp = await redis.get(`otp:${normalizedEmail}`);

    if (!storedOtp) {
      return NextResponse.json(
        { error: "OTP expired or not found. Please request a new one." },
        { status: 400 }
      );
    }

    // WRONG OTP
    if (storedOtp !== String(otp).trim()) {
      return NextResponse.json(
        { error: "Invalid OTP. Please try again." },
        { status: 400 }
      );
    }

    // OTP VERIFIED → allow password reset (valid for 10 minutes)
    await redis.set(`otp_verified:${normalizedEmail}`, "true", "EX", 600);

    // Remove OTP so it can't be reused
    await redis.del(`otp:${normalizedEmail}`);

    return NextResponse.json(
      { success: true, message: "OTP verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP. Please try again." },
      { status: 500 }
    );
  }
}

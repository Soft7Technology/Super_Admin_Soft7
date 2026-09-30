import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

async function uploadToCloudinaryServer(buffer: Buffer, mimeType: string, _filename: string): Promise<string | null> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset || cloudName === "your_cloud_name") {
    return null;
  }

  const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;
  const formData = new FormData();
  formData.append("file", base64Data);
  formData.append("upload_preset", uploadPreset);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.secure_url || json.url || null;
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getCurrentUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in again." },
        { status: 401 }
      );
    }

    let fileBuffer: Buffer | null = null;
    let mimeType = "";
    let originalName = "avatar.png";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = (formData.get("file") || formData.get("image") || formData.get("avatar")) as File | null;

      if (!file || typeof file === "string") {
        return NextResponse.json(
          { success: false, error: "No image file provided." },
          { status: 400 }
        );
      }

      mimeType = file.type || "image/jpeg";
      originalName = file.name || "avatar.png";

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, error: "Image size exceeds the maximum limit of 10MB." },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else if (contentType.includes("application/json")) {
      const json = await req.json();
      const base64Str = json.image || json.avatar || json.file;

      if (!base64Str || typeof base64Str !== "string") {
        return NextResponse.json(
          { success: false, error: "No image data provided." },
          { status: 400 }
        );
      }

      const match = base64Str.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        fileBuffer = Buffer.from(match[2], "base64");
      } else {
        mimeType = "image/png";
        fileBuffer = Buffer.from(base64Str, "base64");
      }

      if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, error: "Image size exceeds the maximum limit of 10MB." },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported content type. Send multipart/form-data or json." },
        { status: 400 }
      );
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json(
        { success: false, error: "Empty image file received." },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Please upload a valid image (JPEG, PNG, WebP, GIF, or SVG).",
        },
        { status: 400 }
      );
    }

    // 1. Try Cloudinary storage first (project's existing upload service)
    let avatarUrl: string | null = await uploadToCloudinaryServer(fileBuffer, mimeType, originalName);

    // 2. If Cloudinary is not configured or failed, save locally in public/uploads/avatars/
    if (!avatarUrl) {
      try {
        const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : mimeType === "image/gif" ? "gif" : "jpg";
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const fileName = `admin_${authUser.id}_${Date.now()}.${ext}`;
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, fileBuffer);
        avatarUrl = `/uploads/avatars/${fileName}`;
      } catch (saveErr) {
        console.error("Local file save error, falling back to data URL:", saveErr);
        // Fallback to data URI if file system write fails
        avatarUrl = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
      }
    }

    // 3. Update database record for the authenticated admin
    await prisma.user.update({
      where: { id: authUser.id },
      data: {
        image: avatarUrl,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        avatar: avatarUrl,
      },
      message: "Profile picture uploaded successfully.",
    });
  } catch (error: any) {
    console.error("[upload-avatar] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload profile picture. Please try again." },
      { status: 500 }
    );
  }
}

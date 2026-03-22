import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET || "access_secret",
);

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) return null;
  try {
    const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
    return payload as { id: number; email: string; role: string; companyId: number };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

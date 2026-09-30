import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || "access_secret",
);

const JWT_SECRET = process.env.JWT_SECRET ? new TextEncoder().encode(process.env.JWT_SECRET) : null;

export async function getCurrentUser(req?: Request | { headers?: Headers | Record<string, string | string[] | undefined> }) {
  let token: string | undefined;

  // 1. Check Authorization header
  if (req && "headers" in req && req.headers) {
    let authHeader: string | null | undefined;
    if (typeof (req.headers as any).get === "function") {
      authHeader = (req.headers as Headers).get("authorization");
    } else {
      const raw = (req.headers as Record<string, any>)["authorization"] || (req.headers as Record<string, any>)["Authorization"];
      authHeader = Array.isArray(raw) ? raw[0] : raw;
    }
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  // 2. Check cookies
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("accessToken")?.value || cookieStore.get("token")?.value;
    } catch {
      // Cookies not accessible in some execution contexts
    }
  }

  if (!token) return null;
  if (token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
  }

  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload as { id: number; email: string; role: string; companyId?: number };
  } catch {
    if (JWT_SECRET) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as { id: number; email: string; role: string; companyId?: number };
      } catch {
        // Fall through
      }
    }
    return null;
  }
}

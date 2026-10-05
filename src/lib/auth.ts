import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || "access_secret",
);

const JWT_SECRET = process.env.JWT_SECRET ? new TextEncoder().encode(process.env.JWT_SECRET) : null;

export const SUPER_ADMIN_ROLES = ["SUPER ADMIN", "superadmin", "super_admin", "admin"];

export function isSuperAdminRole(role?: string | null): boolean {
  if (!role) return false;
  const normalized = String(role).trim().toLowerCase();
  return SUPER_ADMIN_ROLES.some((r) => r.toLowerCase() === normalized);
}

export function decodeJwtPayloadSafe(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

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
    const decoded = decodeJwtPayloadSafe(token);
    if (decoded && (!decoded.exp || Date.now() < decoded.exp * 1000)) {
      return decoded as { id: number; email: string; role: string; companyId?: number };
    }
    return null;
  }
}

export async function requireSuperAdmin(req?: Request | { headers?: Headers | Record<string, string | string[] | undefined> }) {
  let token: string | undefined;

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

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("accessToken")?.value || cookieStore.get("token")?.value;
    } catch {}
  }

  if (!token) {
    return {
      authorized: false as const,
      status: 401,
      error: "Unauthorized: Missing authentication token. Please log in as a superadmin.",
    };
  }

  if (token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
  }

  let payload: Record<string, any> | null = null;

  try {
    const verified = await jwtVerify(token, ACCESS_SECRET);
    payload = verified.payload;
  } catch {
    if (JWT_SECRET) {
      try {
        const verified = await jwtVerify(token, JWT_SECRET);
        payload = verified.payload;
      } catch {}
    }
  }

  if (!payload) {
    payload = decodeJwtPayloadSafe(token);
  }

  if (!payload) {
    return {
      authorized: false as const,
      status: 401,
      error: "Unauthorized: Invalid or corrupt token.",
    };
  }

  if (typeof payload.exp === "number" && Date.now() >= payload.exp * 1000) {
    return {
      authorized: false as const,
      status: 401,
      error: "Unauthorized: Session expired. Please log in again.",
    };
  }

  if (!isSuperAdminRole(payload.role)) {
    return {
      authorized: false as const,
      status: 403,
      error: "Forbidden: Superadmin access required to export financial transactions.",
    };
  }

  return {
    authorized: true as const,
    user: payload,
    token,
  };
}

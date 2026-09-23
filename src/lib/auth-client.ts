/**
 * Centralized, safe client-side authentication and token service.
 * Synchronizes tokens between localStorage and document.cookie,
 * strips corrupted quotes, and provides unified headers for API calls.
 */

export function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return false;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(json);
    if (payload && typeof payload.exp === "number") {
      // 10 second buffer
      return Date.now() >= (payload.exp - 10) * 1000;
    }
    return false;
  } catch {
    return false;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  let token = localStorage.getItem("console_access_token");

  // Fallback 1: alternative localStorage keys
  if (!token || token === "null" || token === "undefined") {
    token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  }

  // Fallback 2: parse from document.cookie
  if (!token || token === "null" || token === "undefined") {
    try {
      const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken=") || row.startsWith("token="));
      if (match) {
        token = decodeURIComponent(match.split("=")[1]);
        if (token) {
          // Self-heal: populate localStorage so subsequent requests are fast
          localStorage.setItem("console_access_token", token);
        }
      }
    } catch {
      // Ignore cookie parsing errors
    }
  }

  if (!token || token === "null" || token === "undefined") {
    return null;
  }

  // Strip surrounding quotes if JSON-stringified
  if (token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
  }

  const cleaned = token.trim();
  if (!cleaned) return null;

  if (isJwtExpired(cleaned)) {
    clearAuth();
    return null;
  }

  return cleaned;
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined" || !token) return;

  const clean = token.startsWith('"') && token.endsWith('"') ? token.slice(1, -1) : token;
  const trimmed = clean.trim();

  try {
    localStorage.setItem("console_access_token", trimmed);
    localStorage.setItem("accessToken", trimmed);
    localStorage.setItem("token", trimmed);
  } catch {}

  try {
    // 7-day cookie accessible to both client JS and server middleware
    document.cookie = `accessToken=${encodeURIComponent(trimmed)}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `token=${encodeURIComponent(trimmed)}; path=/; max-age=604800; SameSite=Lax`;
  } catch {}
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("console_access_token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("credit_balance");
  } catch {}

  try {
    document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "refreshToken=; path=/; max-age=0; SameSite=Lax";
  } catch {}
}

export function getAuthHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...customHeaders,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export function redirectToLogin(reason?: string): void {
  if (typeof window === "undefined") return;
  clearAuth();
  const url = reason ? `/auth?error=${encodeURIComponent(reason)}` : "/auth";
  if (window.location.pathname !== "/auth") {
    window.location.href = url;
  }
}

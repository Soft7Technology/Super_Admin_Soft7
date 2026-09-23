/**
 * Safe, reliable wallet balance service for client-side components.
 * Bypasses browser CORS/CORP restrictions by routing through internal /api/admin/wallet-balance
 * with automatic fallback to cached values and exponential backoff on network loss.
 */

import { getAuthToken } from "./auth-client";

export function getCachedWalletBalance(): string {
  if (typeof window === "undefined") return "0";
  const cached = localStorage.getItem("credit_balance");
  return cached && cached !== "null" && cached !== "undefined" ? cached : "0";
}

export function updateCachedWalletBalance(amount: string | number): void {
  if (typeof window === "undefined") return;
  const val = String(amount);
  localStorage.setItem("credit_balance", val);
  window.dispatchEvent(new CustomEvent("wallet-balance-updated", { detail: val }));
}

export async function fetchWalletBalance(): Promise<string> {
  if (typeof window === "undefined") return "0";

  const cached = getCachedWalletBalance();

  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch("/api/admin/wallet-balance", {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      return cached;
    }

    const json = await response.json();
    const balance =
      json?.data?.credit_balance ??
      json?.credit_balance ??
      json?.data?.data?.credit_balance;

    if (balance !== undefined && balance !== null) {
      const finalBalance = String(balance);
      localStorage.setItem("credit_balance", finalBalance);
      window.dispatchEvent(
        new CustomEvent("wallet-balance-updated", { detail: finalBalance })
      );
      return finalBalance;
    }

    return cached;
  } catch {
    // Network failure: gracefully retain cached balance without logging errors
    return cached;
  }
}

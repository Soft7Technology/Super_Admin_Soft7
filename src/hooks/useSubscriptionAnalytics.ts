"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axiosInstance";

export type SubscriptionAnalyticsRange =
  | "yesterday"
  | "today"
  | "7days"
  | "1month"
  | "3months"
  | "6months"
  | "1year"
  | "all";

export interface SubscriptionAnalyticsPoint {
  date: string;
  count: number;
}

interface ApiResponse {
  data?: SubscriptionAnalyticsPoint[];
  error?: string | null;
}

export function useSubscriptionAnalytics(initialRange: SubscriptionAnalyticsRange = "1year") {
  const [range, setRange] = useState<SubscriptionAnalyticsRange>(initialRange);
  const [data, setData] = useState<SubscriptionAnalyticsPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchAnalytics() {
      setLoading(true);
      setError(null);

      try {
        const { data: payload } = await axiosInstance.get<ApiResponse>("/api/admin/subscriptions/analytics", {
          params: { range },
          signal: controller.signal,
        });

        setData(payload.data ?? []);
        setError(payload.error ?? null);
      } catch (err) {
        if ((err as { code?: string }).code === "ERR_CANCELED") {
          return;
        }

        setData([]);
        setError(err instanceof Error ? err.message : "Failed to load subscription analytics.");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();

    return () => {
      controller.abort();
    };
  }, [range]);

  return {
    range,
    setRange,
    data,
    loading,
    error,
  };
}

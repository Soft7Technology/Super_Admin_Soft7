"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/context/ThemeContext";
import ThemeDrawer from "@/components/shell/ThemeDrawer";

export function Providers({ children }: { children: React.ReactNode }) {
  // One QueryClient per app lifetime (not per render)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 1000 * 60 * 5, gcTime: 1000 * 60 * 10, retry: 1 },
          mutations: { retry: 1 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        <ThemeDrawer />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

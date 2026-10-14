"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    // Check if accessToken cookie exists
    const hasToken = document.cookie.split(";").some((c) => c.trim().startsWith("accessToken="));
    if (hasToken) {
      router.replace("/user/dashboard");
    } else {
      router.replace("/auth");
    }
  }, [router]);
  return (
    <div className="flex h-dvh items-center justify-center bg-background">
      <Spinner size="lg" />
    </div>
  );
}

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { axiosInstance } from "@/lib/axiosInstance";
import { AUTH_BASE, type LoginPayload } from "../types/auth.types";

function getHeaders() {
  let token =
    typeof window !== "undefined"
      ? localStorage.getItem("console_access_token")
      : null;
  if (token?.startsWith('"') && token?.endsWith('"')) token = token.slice(1, -1);
  return {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await axiosInstance.post(`${AUTH_BASE}/login`, payload, {
        headers: getHeaders(),
        withCredentials: false,
      });
      return data;
    },
    onMutate: () => setErrors({}),
    onError: (error: any) => {
      const data = error?.response?.data;
      if (data?.fieldErrors) setErrors(data.fieldErrors);
      else setErrors({ general: data?.error || data?.message || "Login failed" });
    },
    onSuccess: (data) => {
      const token =
        data?.token ?? data?.accessToken ?? data?.access_token ??
        data?.data?.token ?? data?.data?.accessToken ?? data?.data?.access_token;

      if (!token) {
        setErrors({ general: data?.message || "No token returned" });
        return;
      }

      localStorage.setItem("console_access_token", token);
     // document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;

      if (data?.success !== false) {
        router.replace("/user/dashboard");
        queryClient.invalidateQueries({ queryKey: ["user-role"] });
       toast.success("Signed in successfully", { id: "login-success" });
      } else {
        setErrors({ general: data?.message || "Login failed" });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const rawIdentifier = String(form.get("identifier") || "").trim();
    const identifier = rawIdentifier.includes("@")
      ? rawIdentifier.toLowerCase()
      : rawIdentifier.replace(/\s+/g, "");
    const password = String(form.get("password") || "").trim();

    const newErrors: Record<string, string> = {};
    if (!identifier) newErrors.identifier = "Email or phone is required";
    if (!password) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    mutation.mutate({ identifier, password });
  };

  return { handleSubmit, errors, setErrors, isPending: mutation.isPending };
}

"use client";

import { Mail, Lock, User, Phone, UserPlus } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Theme } from "../types/auth.types";
import { AuthShell } from "./AuthShell";

interface RegisterFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  isPending: boolean;
  onLogin: () => void;
  theme: Theme;
  isMobile: boolean;
}

export function RegisterForm({
  onSubmit,
  errors,
  setErrors,
  isPending,
  onLogin,
}: RegisterFormProps) {
  const clearError = (field: string) => {
    const next = { ...errors };
    delete next[field];
    setErrors(next);
  };

  return (
    <AuthShell
      icon={<UserPlus className="h-7 w-7 text-primary-foreground" />}
      title="Create account"
      subtitle="Register to access the super admin dashboard"
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {errors.general && <Alert variant="error" message={errors.general} />}

        <Input
          label="Full name"
          type="text"
          name="name"
          placeholder="Your full name"
          autoComplete="name"
          onChange={() => clearError("name")}
          leftIcon={<User size={16} />}
          error={errors.name}
        />

        <Input
          label="Email address"
          type="email"
          name="email"
          placeholder="you@example.com"
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="email"
          onChange={() => clearError("email")}
          leftIcon={<Mail size={16} />}
          error={errors.email}
        />

        <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3">
          <Input
            label="Country code"
            type="text"
            name="countryCode"
            placeholder="+91"
            onChange={() => clearError("countryCode")}
            error={errors.countryCode}
          />
          <Input
            label="Phone number"
            type="tel"
            name="phone"
            placeholder="9876543210"
            autoComplete="tel-national"
            onChange={() => clearError("phone")}
            leftIcon={<Phone size={16} />}
            error={errors.phone}
          />
        </div>

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Create a secure password"
          autoComplete="new-password"
          onChange={() => clearError("password")}
          leftIcon={<Lock size={16} />}
          error={errors.password}
        />

        <Button type="submit" size="lg" className="w-full" isLoading={isPending}>
          {isPending ? "Registering…" : "Create account"}
        </Button>
      </form>

      <p className="mt-5 text-center text-[0.8125rem] text-muted-foreground">
        Already have an account?{" "}
        <button type="button" onClick={onLogin} className="font-semibold text-primary-text hover:underline">
          Sign in
        </button>
      </p>
    </AuthShell>
  );
}

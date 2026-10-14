"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Theme } from "../types/auth.types";
import { AuthShell } from "./AuthShell";

interface LoginFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  isPending: boolean;
  onForgot: () => void;
  onRegister?: () => void;
  theme: Theme;
  isMobile: boolean;
}

export function LoginForm({
  onSubmit,
  errors,
  setErrors,
  isPending,
  onForgot,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const clearError = (field: string) => {
    const next = { ...errors };
    delete next[field];
    setErrors(next);
  };

  return (
    <AuthShell
      icon={<ShieldCheck className="h-7 w-7 text-primary-foreground" />}
      title="Sign in"
      subtitle="Sign in to super admin to continue"
      footnote="This is a secure admin area. All activities are logged."
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {errors.general && <Alert variant="error" message={errors.general} />}

        {/* Email / Phone */}
        <Input
          label="Email or phone"
          type="text"
          name="identifier"
          placeholder="you@example.com"
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="username"
          size="lg"
          value={identifier}
          onChange={(e) => { setIdentifier(e.target.value); clearError("identifier"); clearError("email"); }}
          leftIcon={<Mail size={16} />}
          error={errors.identifier || errors.email}
        />

        {/* Password */}
        <div>
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            size="lg"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
            leftIcon={<Lock size={16} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="pointer-events-auto flex items-center text-muted-foreground hover:text-secondary-foreground"
              >
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            }
            error={errors.password}
          />

          {/* Forgot */}
          <div className="mt-2 text-right">
            <button
              type="button"
              onClick={onForgot}
              className="text-[0.8125rem] font-medium text-primary-text hover:underline"
            >
              Forgot password?
            </button>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isPending}
          rightIcon={isPending ? undefined : <ArrowRight size={16} strokeWidth={2.5} />}
        >
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}

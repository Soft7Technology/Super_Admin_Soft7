// src/app/auth/types/auth.types.ts

export type Theme = "light" | "dark";

export type AuthView = "login" | "register" | "forgot";
export type ForgotStep = "request" | "verify" | "reset";

export const AUTH_BASE = "https://hostapi.soft7.in/v1/auth";

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  countryCode: string;
}

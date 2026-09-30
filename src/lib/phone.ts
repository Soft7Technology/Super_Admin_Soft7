import {
  parsePhoneNumberFromString,
  CountryCode as LibCountryCode,
} from "libphonenumber-js/max";

export type CountryCode = LibCountryCode;

export interface PhoneValidationResult {
  isValid: boolean;
  formattedNumber?: string;
  e164?: string;
  countryCode?: CountryCode;
  error?: string;
}

export function parsePhoneNumber(rawPhone: string, defaultCountry?: string) {
  if (!rawPhone) return null;
  const str = String(rawPhone).trim();
  const country = (defaultCountry ? defaultCountry.toUpperCase() : undefined) as CountryCode | undefined;
  return parsePhoneNumberFromString(str, country) || null;
}

export function formatPhoneNumber(rawPhone?: string | null, defaultCountry?: string): string {
  if (!rawPhone) return "—";
  const str = String(rawPhone).trim();
  const parsed = parsePhoneNumber(str, defaultCountry);
  if (parsed && parsed.isValid()) {
    return parsed.formatInternational();
  }
  return str.startsWith("+") ? str : `+${str}`;
}

export function normalizePhoneNumber(rawPhone: string, defaultCountry?: string): string {
  if (!rawPhone) return "";
  const str = String(rawPhone).trim();
  const parsed = parsePhoneNumber(str, defaultCountry);
  if (parsed && parsed.isValid()) {
    return parsed.number;
  }
  return str.startsWith("+") ? str : `+${str}`;
}

export function getCountryFromPhoneNumber(rawPhone?: string | null): string {
  if (!rawPhone) return "us";
  const str = String(rawPhone).trim();
  const parsed = parsePhoneNumber(str);
  if (parsed && parsed.country) {
    return parsed.country.toLowerCase();
  }
  return "us";
}

export function validatePhoneNumber(rawPhone: string, defaultCountry?: string): PhoneValidationResult {
  if (!rawPhone || !rawPhone.trim()) {
    return { isValid: false, error: "Phone number is required." };
  }
  const parsed = parsePhoneNumber(rawPhone, defaultCountry);
  if (!parsed || !parsed.isValid()) {
    return { isValid: false, error: "Please enter a valid phone number." };
  }
  return {
    isValid: true,
    formattedNumber: parsed.formatInternational(),
    e164: parsed.number,
    countryCode: parsed.country,
  };
}

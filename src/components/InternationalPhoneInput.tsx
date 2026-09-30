"use client";

import React, { useMemo } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./international-phone-input.css";
import {
  parsePhoneNumber,
  getCountryFromPhoneNumber,
  type CountryCode,
} from "@/lib/phone";

export interface PhoneChangeDetails {
  countryCode: string;
  dialCode: string;
  isValid: boolean;
  e164: string | null;
  formatted: string;
}

export interface InternationalPhoneInputProps {
  value: string;
  onChange: (value: string, details?: PhoneChangeDetails) => void;
  defaultCountry?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string | null;
  required?: boolean;
  id?: string;
  name?: string;
  className?: string;
  autoFocus?: boolean;
}

export function InternationalPhoneInput({
  value,
  onChange,
  defaultCountry = "us",
  placeholder = "Enter phone number",
  disabled = false,
  error = null,
  id,
  name,
  className = "",
  autoFocus = false,
}: InternationalPhoneInputProps) {
  // Infer country from initial value if present, else fallback to defaultCountry
  const initialCountry = useMemo(() => {
    if (value) {
      const detected = getCountryFromPhoneNumber(value);
      if (detected) return detected.toLowerCase();
    }
    return defaultCountry.toLowerCase();
  }, [value, defaultCountry]);

  // Clean value for react-phone-input-2 (strip leading '+' for display if needed)
  const cleanDisplayValue = useMemo(() => {
    if (!value) return "";
    return value.startsWith("+") ? value.slice(1) : value;
  }, [value]);

  const handleChange = (
    rawVal: string,
    data: any,
    _event: React.ChangeEvent<HTMLInputElement>,
    formattedValue: string
  ) => {
    const dialCode = data?.dialCode ? `+${data.dialCode}` : "";
    const countryIso = (data?.countryCode || defaultCountry).toUpperCase() as CountryCode;

    // Check if user entered numbers
    const cleanDigits = String(rawVal || "").replace(/\D/g, "");
    if (!cleanDigits) {
      onChange("", {
        countryCode: countryIso,
        dialCode,
        isValid: false,
        e164: null,
        formatted: "",
      });
      return;
    }

    // Determine normalized E.164 with '+'
    const numberWithPlus = `+${cleanDigits}`;
    const parsed = parsePhoneNumber(numberWithPlus, countryIso);

    const isVal = Boolean(parsed && (typeof (parsed as any).isValid === "function" ? (parsed as any).isValid() : (parsed as any).isValid));
    const e164Val = parsed ? ((parsed as any).number || (parsed as any).e164 || numberWithPlus) : numberWithPlus;
    const formattedVal = parsed ? ((parsed as any).international || (typeof (parsed as any).formatInternational === "function" ? (parsed as any).formatInternational() : "") || formattedValue || numberWithPlus) : (formattedValue || numberWithPlus);

    const finalE164 = isVal ? e164Val : numberWithPlus;

    onChange(finalE164, {
      countryCode: (parsed?.country || countryIso) as string,
      dialCode,
      isValid: isVal,
      e164: isVal ? e164Val : null,
      formatted: formattedVal,
    });
  };

  return (
    <div className={`intl-phone-wrapper ${error ? "intl-phone-wrapper--error" : ""} ${className}`}>
      <PhoneInput
        country={initialCountry}
        value={cleanDisplayValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        enableSearch
        searchPlaceholder="Search country or calling code..."
        searchNotFound="No country found"
        inputProps={{
          id,
          name,
          autoFocus,
          autoComplete: "tel",
          "aria-invalid": !!error,
        }}
      />
      {error && <div className="intl-phone-error-text">{error}</div>}
    </div>
  );
}

export default InternationalPhoneInput;

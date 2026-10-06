"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { axiosInstance } from "@/lib/axiosInstance";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  Check,
  Circle,
} from "lucide-react";

import "../manage-companies.css";

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

type FieldKey =
  | "name"
  | "email"
  | "phone"
  | "reason"
  | "adminName"
  | "adminEmail"
  | "adminPhone"
  | "password";

type FormState = {
  name: string;
  email: string;
  phone: string;
  phoneDial: string;
  reason: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  adminPhoneDial: string;
  password: string;
};

type Errors = Partial<Record<FieldKey, string>>;

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  phoneDial: "91",
  reason: "",
  adminName: "",
  adminEmail: "",
  adminPhone: "",
  adminPhoneDial: "91",
  password: "",
};

const FIELD_ORDER: FieldKey[] = [
  "name",
  "email",
  "phone",
  "reason",
  "adminName",
  "adminEmail",
  "adminPhone",
  "password",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  {
    label: "One special character (@$!%*?&)",
    test: (p: string) => /[@$!%*?&]/.test(p),
  },
];

/* ------------------------------------------------------------------ */
/* Validation        */
/* ------------------------------------------------------------------ */

function validatePhone(value: string, dialCode: string, label: string) {
  const digits = value.replace(/\D/g, "");
  const hasDial = digits.startsWith(dialCode);
  const national = hasDial ? digits.slice(dialCode.length) : digits;

  if (!national) return `${label} phone is required.`;
  if (!hasDial) return "Select a country code and enter the number after it.";

  if (dialCode === "91") {
    if (!/^[6-9]\d{9}$/.test(national))
      return "Enter a valid 10-digit Indian mobile number (starts with 6–9, no leading 0).";
  } else if (national.length < 6 || national.length > 14) {
    return "Enter a valid phone number for the selected country.";
  }
  return "";
}

function validateField(key: FieldKey, f: FormState): string {
  switch (key) {
    case "name":
      return f.name.trim() ? "" : "Company name is required.";

    case "email":
      if (!f.email.trim()) return "Company email is required.";
      return EMAIL_REGEX.test(f.email.trim())
        ? ""
        : "Enter a valid email address, e.g. company@example.com.";

    case "phone":
      return validatePhone(f.phone, f.phoneDial, "Company");


    case "reason":
      return f.reason.trim() ? "" : "Reason is required.";

    case "adminName":
      return f.adminName.trim() ? "" : "Admin name is required.";

    case "adminEmail":
      if (!f.adminEmail.trim()) return "Admin email is required.";
      return EMAIL_REGEX.test(f.adminEmail.trim())
        ? ""
        : "Enter a valid email address, e.g. admin@example.com.";

    case "adminPhone":
      return validatePhone(f.adminPhone, f.adminPhoneDial, "Admin");

    case "password": {
      if (!f.password) return "Password is required.";
      const missing = PASSWORD_RULES.some((r) => !r.test(f.password));
      return missing ? "Password doesn't meet all the requirements below." : "";
    }

    default:
      return "";
  }
}

/* ------------------------------------------------------------------ */
/* Small presentational helper                                         */
/* ------------------------------------------------------------------ */

function FieldError({ id, message }: { id: FieldKey; message?: string }) {
  if (!message) return null;
  return (
    <div id={`err-${id}`} className="mc-field__error" role="alert">
      <AlertCircle size={13} />
      <span>{message}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function CreateCompanyPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const [serverErr, setServerErr] = useState<string | null>(null);

  /* ---------- helpers ---------- */

  const setErrorFor = (key: FieldKey, message: string) =>
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[key] = message;
      else delete next[key];
      return next;
    });

  const setField = (
    key: FieldKey,
    value: string,
    extra: Partial<FormState> = {},
  ) => {
    const next = { ...form, [key]: value, ...extra } as FormState;
    setForm(next);
    if (errors[key]) setErrorFor(key, validateField(key, next));
    if (serverErr) setServerErr(null);
  };

  const handleBlur = (key: FieldKey) =>
    setErrorFor(key, validateField(key, form));

  const focusField = (key: FieldKey) => {
    const el = document.getElementById(`field-${key}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    setTimeout(() => (el as HTMLElement).focus({ preventScroll: true }), 250);
  };

  const inputClass = (key: FieldKey) =>
    `mc-input${errors[key] ? " mc-input--error" : ""}`;

  const formRef = useRef(form);
  formRef.current = form;

  const phoneProps = (
    key: "phone" | "adminPhone",
    dialKey: "phoneDial" | "adminPhoneDial",
  ) => ({
    country: "in",
    value: form[key],
    onChange: (value: string, country: any) =>
      setField(key, value, { [dialKey]: country?.dialCode ?? form[dialKey] }),

    countryCodeEditable: false,
    enableSearch: true,
    disableSearchIcon: true,
    searchPlaceholder: "Search country...",
    placeholder: "Enter phone number",
    containerClass: `mc-phone${errors[key] ? " mc-phone--error" : ""}`,
    inputClass: "mc-input mc-phone__input",
    buttonClass: "mc-phone__button",
    dropdownClass: "mc-phone__dropdown",
    searchClass: "mc-phone__search",
    inputProps: { id: `field-${key}`, autoComplete: "off" },

    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      const container = e.currentTarget.closest(".react-tel-input");
      setTimeout(() => {
        if (container && container.contains(document.activeElement)) return;
        setErrorFor(key, validateField(key, formRef.current));
      }, 150);
    },
  });

  /* ---------- submit ---------- */

  const passwordValid = PASSWORD_RULES.every((r) => r.test(form.password));

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (saving || !passwordValid) return;
    setServerErr(null);

    const nextErrors: Errors = {};
    FIELD_ORDER.forEach((key) => {
      const msg = validateField(key, form);
      if (msg) nextErrors[key] = msg;
    });
    setErrors(nextErrors);

    const firstInvalid = FIELD_ORDER.find((k) => nextErrors[k]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      business_id: form.businessId.trim(),
      user: {
        name: form.adminName.trim(),
        email: form.adminEmail.trim(),
        phone: form.adminPhone.trim(),
        password: form.password,
      },
      reason: form.reason.trim(),
    };

    try {
      setSaving(true);

      const response = await axiosInstance.post(
        "/v1/super-admin/companies",
        payload,
        { headers: { "Content-Type": "application/json" } },
      );

      const data = response.data;

      if (!data?.success) {
        setServerErr(
          data?.error?.message || data?.message || "Failed to create company.",
        );
        return;
      }

      toast.success("Company created successfully");

      setTimeout(() => {
        router.push("/user/manage-companies");
      }, 700);
    } catch (error: any) {
      console.error("CREATE COMPANY ERROR =>", error);

      setServerErr(
        error?.response?.data?.message ||
          error?.response?.data?.error?.message ||
          error?.message ||
          "Failed to create company.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* ---------- render ---------- */

  const errorCount = Object.keys(errors).length;

  return (
    <div className="mc-root">
      <div className="mc-create-page">
        {/* HEADER */}
        <div className="mc-create-header">
          <div>
            <button
              type="button"
              className="mc-create-back"
              onClick={() => router.back()}
            >
              <ArrowLeft size={16} />
              Back to Companies
            </button>

            <h1 className="mc-create-title">Create Company</h1>

            <p className="mc-create-subtitle">
              Create a new company and its administrator.
            </p>
          </div>
        </div>

        <form noValidate onSubmit={handleSubmit}>
          {/* COMPANY DETAILS */}
          <section className="mc-create-card">
            <div className="mc-create-card__header">
              <div>
                <div className="mc-create-card__title">Company Details</div>
                <div className="mc-create-card__subtitle">
                  Enter the basic company information.
                </div>
              </div>
            </div>

            <div className="mc-create-card__body">
              <div className="mc-create-grid">
                <div className="mc-field">
                  <label htmlFor="field-name" className="mc-field__label">
                    COMPANY NAME *
                  </label>
                  <input
                    id="field-name"
                    className={inputClass("name")}
                    placeholder="Example Company"
                    autoComplete="organization"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "err-name" : undefined}
                  />
                  <FieldError id="name" message={errors.name} />
                </div>

                <div className="mc-field">
                  <label htmlFor="field-email" className="mc-field__label">
                    COMPANY EMAIL *
                  </label>
                  <input
                    id="field-email"
                    className={inputClass("email")}
                    type="email"
                    placeholder="company@example.com"
                    autoComplete="off"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "err-email" : undefined}
                  />
                  <FieldError id="email" message={errors.email} />
                </div>

                <div className="mc-field">
                  <label htmlFor="field-phone" className="mc-field__label">
                    COMPANY PHONE *
                  </label>
                  <PhoneInput {...phoneProps("phone", "phoneDial")} />
                  <FieldError id="phone" message={errors.phone} />
                </div>

                <div className="mc-field">
                  <label htmlFor="field-businessId" className="mc-field__label">
                    BUSINESS ID *
                  </label>
                  <input
                    id="field-businessId"
                    className={inputClass("businessId")}
                    placeholder="BUSINESS123"
                    autoComplete="off"
                    value={form.businessId}
                    onChange={(e) => setField("businessId", e.target.value)}
                    onBlur={() => handleBlur("businessId")}
                    aria-invalid={!!errors.businessId}
                    aria-describedby={
                      errors.businessId ? "err-businessId" : undefined
                    }
                  />
                  <FieldError id="businessId" message={errors.businessId} />
                </div>
              </div>

              <div className="mc-field mc-create-field--full">
                <label htmlFor="field-reason" className="mc-field__label">
                  REASON *
                </label>
                <textarea
                  id="field-reason"
                  className={inputClass("reason")}
                  placeholder="Approved company onboarding"
                  value={form.reason}
                  onChange={(e) => setField("reason", e.target.value)}
                  onBlur={() => handleBlur("reason")}
                  rows={4}
                  style={{ resize: "vertical", minHeight: 100 }}
                  aria-invalid={!!errors.reason}
                  aria-describedby={errors.reason ? "err-reason" : undefined}
                />
                <FieldError id="reason" message={errors.reason} />
              </div>
            </div>
          </section>

          {/* COMPANY ADMIN */}
          <section className="mc-create-card">
            <div className="mc-create-card__header">
              <div>
                <div className="mc-create-card__title">Company Admin</div>
                <div className="mc-create-card__subtitle">
                  Create the administrator account for this company.
                </div>
              </div>
            </div>

            <div className="mc-create-card__body">
              <div className="mc-create-grid">
                <div className="mc-field">
                  <label htmlFor="field-adminName" className="mc-field__label">
                    ADMIN NAME *
                  </label>
                  <input
                    id="field-adminName"
                    className={inputClass("adminName")}
                    placeholder="Company Admin"
                    autoComplete="off"
                    value={form.adminName}
                    onChange={(e) => setField("adminName", e.target.value)}
                    onBlur={() => handleBlur("adminName")}
                    aria-invalid={!!errors.adminName}
                    aria-describedby={
                      errors.adminName ? "err-adminName" : undefined
                    }
                  />
                  <FieldError id="adminName" message={errors.adminName} />
                </div>

                <div className="mc-field">
                  <label htmlFor="field-adminEmail" className="mc-field__label">
                    ADMIN EMAIL *
                  </label>
                  <input
                    id="field-adminEmail"
                    className={inputClass("adminEmail")}
                    type="email"
                    placeholder="admin@example.com"
                    autoComplete="off"
                    value={form.adminEmail}
                    onChange={(e) => setField("adminEmail", e.target.value)}
                    onBlur={() => handleBlur("adminEmail")}
                    aria-invalid={!!errors.adminEmail}
                    aria-describedby={
                      errors.adminEmail ? "err-adminEmail" : undefined
                    }
                  />
                  <FieldError id="adminEmail" message={errors.adminEmail} />
                </div>

                <div className="mc-field">
                  <label htmlFor="field-adminPhone" className="mc-field__label">
                    ADMIN PHONE *
                  </label>
                  <PhoneInput {...phoneProps("adminPhone", "adminPhoneDial")} />
                  <FieldError id="adminPhone" message={errors.adminPhone} />
                </div>

                <div className="mc-field mc-create-field--full">
                  <label htmlFor="field-password" className="mc-field__label">
                    PASSWORD *
                  </label>

                  <div style={{ position: "relative" }}>
                    <input
                      id="field-password"
                      className={inputClass("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 8 characters"
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) => setField("password", e.target.value)}
                      onBlur={() => handleBlur("password")}
                      style={{ paddingRight: 48 }}
                      aria-invalid={!!errors.password}
                      aria-describedby={
                        errors.password ? "err-password" : undefined
                      }
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        border: "none",
                        background: "transparent",
                        color: "#9ca3af",
                        cursor: "pointer",
                      }}
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>

                  <FieldError id="password" message={errors.password} />

                  {/* Live checklist: users see what's missing as they type */}
                  <ul className="mc-pw-rules">
                    {PASSWORD_RULES.map((rule) => {
                      const ok = rule.test(form.password);
                      return (
                        <li
                          key={rule.label}
                          className={ok ? "mc-pw-rules__ok" : ""}
                        >
                          {ok ? <Check size={13} /> : <Circle size={13} />}
                          {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              <div className="mc-create-divider" />

              {serverErr && (
                <div
                  className="mc-error-banner"
                  role="alert"
                  style={{ marginBottom: 12 }}
                >
                  <AlertCircle size={18} className="mc-error-banner__icon" />
                  <span className="mc-error-banner__text">{serverErr}</span>
                  <button
                    type="button"
                    className="mc-error-banner__close"
                    onClick={() => setServerErr(null)}
                    aria-label="Dismiss error"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="mc-create-actions">
                {errorCount > 0 && (
                  <span className="mc-actions__hint">
                    {errorCount}{" "}
                    {errorCount === 1 ? "field needs" : "fields need"} attention
                  </span>
                )}

                <button
                  type="button"
                  className="mc-btn mc-btn--ghost"
                  onClick={() => router.back()}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="mc-btn mc-btn--primary"
                  disabled={saving || !passwordValid}
                  title={
                    passwordValid
                      ? undefined
                      : "Password must meet all the listed requirements"
                  }
                >
                  {saving ? "Creating…" : "Create Company"}
                </button>
              </div>
            </div>
          </section>
        </form>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

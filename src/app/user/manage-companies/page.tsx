"use client";

import {
  useState,
  useEffect,
  useRef,
  type ChangeEvent,
  type Dispatch,
  type DragEvent,
  type MouseEventHandler,
  type MutableRefObject,
  type ReactNode,
  type SetStateAction,
} from "react";
import "./manage-companies.css";
import { axiosInstance } from "@/lib/axiosInstance";
import { useTheme } from "../../../context/ThemeContext";
import { uploadToCloudinary } from "@/lib/cloudinary";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const COMPANIES_API = "/v1/admin/companies";

// ─── TYPES ────────────────────────────────────────────────────────────────────


type Status = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "TRIAL";
type Plan   = "Starter" | "Basic" | "Pro" | "Enterprise";

interface RawCompany {
  id: string | number;
  name: string;
  email?: string;
  adminEmail?: string;
  phone: string | null;
  domain: string | null;
  logo: string | null;
  favicon: string | null; // add
  status: string;
  credit_balance: string;
  created_at: string;
  updated_at: string;
  business_id: string | null;
  api_key: string | null;
  webhook_url: string | null;
  webhook_verify_token: string | null;
  meta_config: unknown;
  settings: unknown;
  deleted_at: string | null;
}

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  domain: string;
  logo: string | null;
  favicon: string | null; // add
  initials: string;
  col: string;
  status: Status;
  plan: Plan;
  users: number;
  mrr: number;
  end: string;
  creditBalance: string;
  createdAt: string;
  apiKey: string | null;
}

interface FileState {
  file: File | null;
  preview: string | null;
  dragging: boolean;
}

const emptyFile = (): FileState => ({ file: null, preview: null, dragging: false });

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "#6C5CE7", "#0d9462", "#f59e0b", "#3b82f6",
  "#ec4899", "#14b871", "#8b5cf6", "#ef4444",
];

function avatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function normaliseStatus(raw: string): Status {
  const map: Record<string, Status> = {
    active: "ACTIVE", inactive: "INACTIVE",
    suspended: "SUSPENDED", trial: "TRIAL",
  };
  return map[raw?.toLowerCase()] ?? "ACTIVE";
}

function enrichCompany(raw: RawCompany): Company {
  const email = raw.email || raw.adminEmail || "";

  return {
    id: String(raw.id),
    name: raw.name || "Unnamed",
    email,
    phone: raw.phone || "—",
    domain: raw.domain || email.split("@")[1] || "—",

    // Use URLs returned by the backend
    logo: raw.logo || null,
    favicon: raw.favicon || null,

    // Keep initials only as fallback
    initials: (raw.name || "??").slice(0, 2).toUpperCase(),

    col: avatarColor(String(raw.id)),
    status: normaliseStatus(raw.status),
    plan: "Starter",
    users: 0,
    mrr: 0,
    end: "N/A",
    creditBalance: raw.credit_balance ?? "0.00",
    createdAt: raw.created_at
      ? new Date(raw.created_at).toLocaleDateString()
      : "—",
    apiKey: raw.api_key,
  };
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Badge({ status }: { status: Status }) {
  return (
    <span className={`mc-badge mc-badge--${status}`}>
      <span className="mc-badge__dot" />
      {status[0] + status.slice(1).toLowerCase()}
    </span>
  );
}

function KPI({
  label, value, icon, color,
}: {
  label: string; value: string; icon: string; color: string;
}) {
  return (
    <div className="mc-kpi">
      <div className="mc-kpi__orb" style={{ background: `${color}10` }} />
      <div className="mc-kpi__top">
        <span className="mc-kpi__label">{label}</span>
        <div className="mc-kpi__icon" style={{ background: `${color}18` }}>{icon}</div>
      </div>
      <div className="mc-kpi__value">{value}</div>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "11px 22px",
        borderRadius: "10px",
        fontSize: "0.85rem",
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        border: "1px solid #10b981",
        background: disabled ? "#4b5563" : hovered ? "#059669" : "#10b981",
        color: "#fff",
        boxShadow:
          disabled
            ? "none"
            : hovered
            ? "0 8px 24px rgba(16,185,129,0.38)"
            : "0 4px 14px rgba(16,185,129,0.24)",
        transition: "all 0.15s ease",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

// ─── DELETE CONFIRM MODAL ─────────────────────────────────────────────────────
function DeleteConfirmModal({
  companies,
  onClose,
  onConfirm,
  deleting,
}: {
  companies: Company[];
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  const isSingle = companies.length === 1;

  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div className="mc-modal mc-modal--danger" onClick={(e) => e.stopPropagation()}>
        <div className="mc-modal__header">
          <div>
            <div className="mc-modal__title">
              {isSingle ? "Delete Company" : `Delete ${companies.length} Companies`}
            </div>
            <div className="mc-modal__sub">This action cannot be undone.</div>
          </div>
          <button className="mc-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="mc-modal__body">
          <div className="mc-delete-warning">
            <div className="mc-delete-warning__icon">⚠️</div>
            <div className="mc-delete-warning__text">
              {isSingle ? (
                <>
                  You are about to permanently delete{" "}
                  <strong>{companies[0].name}</strong>. All associated data will be lost.
                </>
              ) : (
                <>
                  You are about to permanently delete{" "}
                  <strong>{companies.length} companies</strong>. All associated data will be lost.
                </>
              )}
            </div>
          </div>

          {!isSingle && (
            <div className="mc-delete-list">
              {companies.slice(0, 5).map((c) => (
                <div key={c.id} className="mc-delete-list__item">
                  <div
                    className="mc-delete-list__logo"
                    style={{ background: c.col }}
                  >
                    {c.logo}
                  </div>
                  <div>
                    <div className="mc-delete-list__name">{c.name}</div>
                    <div className="mc-delete-list__email">{c.email}</div>
                  </div>
                </div>
              ))}
              {companies.length > 5 && (
                <div className="mc-delete-list__more">
                  +{companies.length - 5} more companies
                </div>
              )}
            </div>
          )}

          <div className="mc-modal__divider" />
          <div className="mc-modal__actions">
            <button
              className="mc-btn mc-btn--danger"
              onClick={onConfirm}
              disabled={deleting}
            >
              {deleting
                ? "Deleting…"
                : isSingle
                ? "Delete Company"
                : `Delete ${companies.length} Companies`}
            </button>
            <button className="mc-btn mc-btn--ghost" onClick={onClose} disabled={deleting}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADD / EDIT MODAL ─────────────────────────────────────────────────────────
function AddCompanyModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { isDark } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [initialCredit, setInitialCredit] = useState<number | string>(1000);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [logo, setLogo] = useState<FileState>(emptyFile());
  const [favicon, setFavicon] = useState<FileState>(emptyFile());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const logoRef = useRef<HTMLInputElement | null>(null);
  const faviconRef = useRef<HTMLInputElement | null>(null);

  const readFile = (file: File, setFile: Dispatch<SetStateAction<FileState>>) => {
    const reader = new FileReader();
    reader.onload = () => setFile({ file, preview: reader.result as string, dragging: false });
    reader.readAsDataURL(file);
  };

  const onFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    setFile: Dispatch<SetStateAction<FileState>>,
  ) => {
    const file = event.target.files?.[0];
    if (file) readFile(file, setFile);
  };

  const onDrop = (
    event: DragEvent,
    setFile: Dispatch<SetStateAction<FileState>>,
  ) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) readFile(file, setFile);
  };

  const clearError = (key: string) => {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Company name is required";
    if (!email.trim()) nextErrors.email = "Email is required";
    if (!phone.trim()) nextErrors.phone = "Phone is required";
    if (!adminName.trim()) nextErrors.adminName = "Admin name is required";
    if (!adminEmail.trim()) nextErrors.adminEmail = "Admin email is required";
    if (!adminPassword.trim()) nextErrors.adminPassword = "Admin password is required";
    if (!logo.file) nextErrors.logo = "Please upload a company logo";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
const handleSave = async () => {
  setFormError(null);

  if (!validate()) return;

  setSaving(true);

  try {
    // Upload images to Cloudinary first
    const logoUrl = logo.file
      ? await uploadToCloudinary(logo.file)
      : "";

    const faviconUrl = favicon.file
      ? await uploadToCloudinary(favicon.file)
      : "";

    const formData = new FormData();

    formData.append("name", name.trim());
    formData.append("email", email.trim());
    formData.append("phone", phone.trim());
    formData.append("business_id", businessId.trim());
    formData.append("webhook_url", webhookUrl.trim());
    formData.append(
      "initial_credit",
      String(Number(initialCredit) || 0)
    );

    // Send URL strings, not files
    formData.append("logo", logoUrl);

    if (faviconUrl) {
      formData.append("favicon", faviconUrl);
    }

    formData.append("user[name]", adminName.trim());
    formData.append("user[email]", adminEmail.trim());
    formData.append("user[password]", adminPassword);

    // Useful for checking exactly what is sent
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const { data } = await axiosInstance.post(
      COMPANIES_API,
      formData
    );

    if (data?.success === false) {
      setFormError(
        data?.error?.message ||
        data?.message ||
        "Failed to save company."
      );
      return;
    }

    setSaved(true);
    await onSuccess();
    window.setTimeout(onClose, 700);
  } catch (e: any) {
    console.error(
      "Create company failed:",
      e?.response?.data || e
    );

    setFormError(
      e?.response?.data?.error?.message ||
      e?.response?.data?.message ||
      e?.message ||
      "Error saving company."
    );
  } finally {
    setSaving(false);
  }
};

  const C = {
    pageBg: isDark ? "#070b14" : "#f1f5f9",
    cardBg: isDark ? "#0d1117" : "#ffffff",
    border: isDark ? "#1c2333" : "#e2e8f0",
    heading: isDark ? "#f1f5f9" : "#0f172a",
    label: isDark ? "#e2e8f0" : "#1e293b",
    hint: isDark ? "#94a3b8" : "#64748b",
    inputBg: isDark ? "#161b27" : "#f8fafc",
    inputClr: isDark ? "#e2e8f0" : "#1e293b",
    divider: isDark ? "#1c2333" : "#f0f4f8",
    dropText: isDark ? "#94a3b8" : "#475569",
    dropSub: isDark ? "#4b5563" : "#94a3b8",
    prevBox: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
    prevLbl: isDark ? "#6b7280" : "#94a3b8",
  };

  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(760px, calc(100vw - 32px))",
          maxHeight: "calc(100vh - 40px)",
          overflowY: "auto",
          background: C.pageBg,
          borderRadius: 20,
          padding: "24px",
          boxShadow: "0 24px 70px rgba(0,0,0,.45)",
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        }}
      >
        <div style={{ width: "100%", marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
                  🏢
                </div>
                <h2 style={{ margin: 0, fontWeight: 800, fontSize: "1.55rem", color: C.heading, letterSpacing: "-0.02em" }}>
                  Add Company
                </h2>
              </div>
              <p style={{ margin: 0, paddingLeft: 56, fontSize: "0.875rem", color: C.hint }}>
                Register a new company on the platform.
              </p>
            </div>
            <button className="mc-modal__close" onClick={onClose} aria-label="Close add company modal">
              ×
            </button>
          </div>
        </div>

        {saved && (
          <div style={{ marginBottom: 18, padding: "12px 18px", borderRadius: 10, background: "rgba(34,197,94,.12)", border: "1px solid rgba(34,197,94,.3)", color: "#16a34a", fontSize: "0.875rem", fontWeight: 600 }}>
            Company saved.
          </div>
        )}

        {formError && (
          <div style={{ marginBottom: 18, padding: "12px 18px", borderRadius: 10, background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.28)", color: "#ef4444", fontSize: "0.875rem", fontWeight: 600 }}>
            {formError}
          </div>
        )}

        <div style={{ width: "100%", background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 18, overflow: "hidden", boxShadow: isDark ? "0 8px 36px rgba(0,0,0,.45)" : "0 8px 36px rgba(0,0,0,.09)" }}>
          <div style={{ height: 4, background: "linear-gradient(90deg,#059669,#10b981,#34d399)" }} />
          <div style={{ padding: "32px 36px 36px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              <TextInput label="Company Name" required value={name} onChange={(e) => { setName(e.target.value); clearError("name"); }} error={errors.name} C={C} placeholder="e.g. Acme Corporation" />
              <TextInput label="Company Email" required value={email} onChange={(e) => { setEmail(e.target.value); clearError("email"); }} error={errors.email} C={C} placeholder="hello@acme.com" type="email" />
              <TextInput label="Company Phone" required value={phone} onChange={(e) => { setPhone(e.target.value); clearError("phone"); }} error={errors.phone} C={C} placeholder="e.g. +1 234 567 890" />
              <TextInput label="Business ID" value={businessId} onChange={(e) => setBusinessId(e.target.value)} C={C} placeholder="e.g. BIZ-123" />
              <TextInput label="Webhook URL" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} C={C} placeholder="https://..." />
              <TextInput label="Initial Credit" value={initialCredit} onChange={(e) => setInitialCredit(e.target.value)} C={C} placeholder="1000" type="number" />
            </div>

            <div style={{ height: 1, background: C.divider, margin: "10px 0 26px" }} />

            <h3 style={{ margin: "0 0 16px", fontSize: "1.05rem", color: C.heading }}>Admin User Details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              <TextInput label="Admin Name" required value={adminName} onChange={(e) => { setAdminName(e.target.value); clearError("adminName"); }} error={errors.adminName} C={C} placeholder="Admin Name" />
              <TextInput label="Admin Email" required value={adminEmail} onChange={(e) => { setAdminEmail(e.target.value); clearError("adminEmail"); }} error={errors.adminEmail} C={C} placeholder="admin@acme.com" type="email" />
              <TextInput label="Admin Password" required value={adminPassword} onChange={(e) => { setAdminPassword(e.target.value); clearError("adminPassword"); }} error={errors.adminPassword} C={C} placeholder="••••••••" type="password" />
            </div>

            <div style={{ height: 1, background: C.divider, margin: "10px 0 26px" }} />

            <div style={{ marginBottom: 26 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: "0.9rem", color: C.label }}>Company Logo</span>
                <span style={{ color: "#f87171" }}>*</span>
              </div>
              <p style={{ margin: "2px 0 12px", fontSize: "0.75rem", color: C.hint }}>PNG, JPG, SVG up to 5MB · Recommended 200x200px</p>
              <UploadZone
                state={logo}
                C={C}
                isDark={isDark}
                label="logo"
                icon="🏢"
                previewSize={80}
                error={!!errors.logo}
                inputRef={logoRef}
                accept="image/*"
                onChange={(e) => { onFileChange(e, setLogo); clearError("logo"); }}
                onDrop={(e) => { onDrop(e, setLogo); clearError("logo"); }}
                onDragOver={(e) => { e.preventDefault(); setLogo((prev) => ({ ...prev, dragging: true })); }}
                onDragLeave={() => setLogo((prev) => ({ ...prev, dragging: false }))}
                onRemove={() => { setLogo(emptyFile()); if (logoRef.current) logoRef.current.value = ""; }}
              />
              {errors.logo && <p style={{ margin: "6px 0 0", fontSize: "0.75rem", color: "#f87171" }}>⚠ {errors.logo}</p>}
            </div>

            <div style={{ height: 1, background: C.divider, marginBottom: 26 }} />

            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: "0.9rem", color: C.label }}>Favicon</span>
                <span style={{ fontSize: "0.72rem", color: C.hint }}>(optional)</span>
              </div>
              <p style={{ margin: "2px 0 12px", fontSize: "0.75rem", color: C.hint }}>ICO, PNG up to 1MB · Recommended 32x32px</p>
              <UploadZone
                state={favicon}
                C={C}
                isDark={isDark}
                label="favicon"
                icon="🌐"
                previewSize={48}
                error={false}
                inputRef={faviconRef}
                accept=".ico,image/png,image/x-icon"
                onChange={(e) => onFileChange(e, setFavicon)}
                onDrop={(e) => onDrop(e, setFavicon)}
                onDragOver={(e) => { e.preventDefault(); setFavicon((prev) => ({ ...prev, dragging: true })); }}
                onDragLeave={() => setFavicon((prev) => ({ ...prev, dragging: false }))}
                onRemove={() => { setFavicon(emptyFile()); if (faviconRef.current) faviconRef.current.value = ""; }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <AddCancelButton onClick={onClose} C={C} />
              <AddSaveButton onClick={handleSave} saving={saving} />
            </div>
          </div>
        </div>

        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}

interface UploadZoneProps {
  state: FileState;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: () => void;
  onRemove: () => void;
  inputRef: MutableRefObject<HTMLInputElement | null>;
  accept: string;
  label: string;
  icon: string;
  isDark: boolean;
  error: boolean;
  previewSize: number;
  C: Record<string, string>;
}

function UploadZone({
  state,
  onChange,
  onDrop,
  onDragOver,
  onDragLeave,
  onRemove,
  inputRef,
  accept,
  label,
  icon,
  isDark,
  error,
  previewSize,
  C,
}: UploadZoneProps) {
  const zoneBorder = error ? "#f87171" : state.dragging ? "#3b5bdb" : C.border;
  const zoneBg = state.dragging
    ? isDark ? "rgba(59,91,219,.1)" : "rgba(59,91,219,.05)"
    : isDark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.01)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        style={{ flex: 1, minWidth: 200, minHeight: 110, border: `2px dashed ${zoneBorder}`, borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", background: zoneBg, transition: "all .2s" }}
      >
        <span style={{ fontSize: "1.8rem", opacity: .5 }}>📂</span>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: C.dropText }}>
            Drag & drop or <span style={{ color: "#34c38a", textDecoration: "underline" }}>choose file</span>
          </p>
          <p style={{ margin: "3px 0 0", fontSize: "0.72rem", color: C.dropSub }}>for {label}</p>
        </div>
        <input ref={inputRef} type="file" accept={accept} onChange={onChange} style={{ display: "none" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "0.68rem", fontWeight: 700, color: C.prevLbl, letterSpacing: "0.08em", textTransform: "uppercase" }}>Preview</span>
        <div style={{ width: previewSize + 20, height: previewSize + 20, borderRadius: previewSize <= 48 ? 9 : 14, border: `1.5px solid ${C.border}`, background: C.prevBox, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", transition: "all .3s" }}>
          {state.preview ? (
            <>
              <img src={state.preview} alt="preview" style={{ width: previewSize, height: previewSize, objectFit: "contain" }} />
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                style={{ position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: "50%", background: "rgba(239,68,68,.9)", border: "none", color: "#fff", fontSize: "0.5rem", cursor: "pointer", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                ×
              </button>
            </>
          ) : (
            <span style={{ fontSize: previewSize <= 48 ? "1.4rem" : "2rem", opacity: .15 }}>{icon}</span>
          )}
        </div>
        {state.file && <span style={{ fontSize: "0.68rem", color: C.hint, maxWidth: 110, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{state.file.name}</span>}
      </div>
    </div>
  );
}

function AddCancelButton({ onClick, C }: { onClick: () => void; C: Record<string, string> }) {
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "10px 26px",
        borderRadius: 10,
        fontSize: "0.875rem",
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: hov ? "rgba(16,185,129,0.08)" : "transparent",
        border: `1.5px solid ${hov ? "#10b981" : C.border}`,
        color: hov ? "#10b981" : C.label,
        transition: "all .18s ease",
      }}
    >
      Cancel
    </button>
  );
}

function AddSaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={saving}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "10px 28px",
        borderRadius: 10,
        fontSize: "0.875rem",
        fontWeight: 700,
        cursor: saving ? "not-allowed" : "pointer",
        border: "none",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        gap: 8,
        transition: "all .18s ease",
        background: saving ? "#4b5563" : hov ? "linear-gradient(135deg,#059669,#10b981)" : "linear-gradient(135deg,#10b981,#34d399)",
        boxShadow: saving ? "none" : hov ? "0 10px 24px rgba(16,185,129,0.35)" : "0 6px 18px rgba(16,185,129,0.24)",
        transform: hov && !saving ? "translateY(-1px)" : "translateY(0)",
      }}
    >
      {saving ? (
        <>
          <span style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTop: "2px solid #fff", display: "inline-block", animation: "spin .8s linear infinite" }} />
          Saving...
        </>
      ) : (
        <>💾 Save Company</>
      )}
    </button>
  );
}

function TextInput({
  label,
  required = false,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  C,
}: {
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  C: Record<string, string>;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
        <span style={{ fontWeight: 700, fontSize: "0.9rem", color: C.label }}>{label}</span>
        {required && <span style={{ color: "#f87171" }}>*</span>}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 9, border: `1.5px solid ${error ? "#f87171" : focus ? "#3b5bdb" : C.border}`, background: C.inputBg, color: C.inputClr, fontSize: "0.9rem", fontFamily: "'Inter', sans-serif", outline: "none", transition: "border .2s" }}
      />
      {error && <p style={{ margin: "5px 0 0", fontSize: "0.75rem", color: "#f87171" }}>⚠ {error}</p>}
    </div>
  );
}

function EditCompanyModal({
  company, onClose, onSuccess,
}: {
  company: Company;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name,     setName]     = useState(company?.name   || "");
  const [email,    setEmail]    = useState(company?.email  || "");
  const [phone,    setPhone]    = useState(company?.phone === "—" ? "" : company?.phone || "");
  const [status,   setStatus]   = useState<Status>(company?.status || "ACTIVE");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState<string | null>(null);

  useEffect(() => {
    setName(company?.name   || "");
    setEmail(company?.email || "");
    setPhone(company?.phone === "—" ? "" : company?.phone || "");
    setStatus(company?.status || "ACTIVE");
    setLogoFile(null);
    setLogoPreview(null);
    setErr(null);
  }, [company]);

<<<<<<< HEAD
  const handleSubmit = async () => {
    setErr(null);
    if (!name.trim())  return setErr("Company name is required.");
    if (!email.trim()) return setErr("Email is required.");
=======
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
    }
  };

 const handleSubmit = async () => {
  setErr(null);
>>>>>>> 6e5414de11042f7cc7b94d5fa91a3a91e576b835

    setSaving(true);
    try {
      const url = `${COMPANIES_API}/${company.id}`;

<<<<<<< HEAD
      let body: any = {};
      body = {
        name,
        email,
        phone,
        status: status.toLowerCase(),
        user: { name, email, phone },
      };

      console.log("REQUEST BODY =>", body);
      const { data } = await axiosInstance.request({
        url,
        method: "PUT",
        data: body,
      });
      console.log("COMPANY RESPONSE =>", data);

      if (!data.success) {
        if (data?.message?.toLowerCase().includes("already exists")) {
          setErr("⚠️ Company with this email already exists");
          return;
        }
        setErr(data?.error?.message || data?.message || "Company request failed");
        return;
      }

      await onSuccess();
      onClose();
    } catch (e: any) {
      console.error(e);
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };
=======
  if (!email.trim()) {
    return setErr("Email is required.");
  }

  if (!company && !password.trim()) {
    return setErr("Password is required.");
  }

  setSaving(true);

  try {
    const isEdit = !!company;

    const url = isEdit
      ? `${COMPANIES_API}/${company.id}`
      : COMPANIES_API;

    // Always use FormData so the image file can be included
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    if (phone) formData.append("phone", phone);

    if (isEdit) {
      formData.append("status", status.toLowerCase());
    } else {
      // Wrap user object as JSON string (backend parses it)
      formData.append("user", JSON.stringify({
        name,
        email,
        phone: phone || undefined,
        password,
      }));
    }

    if (logoFile) {
      formData.append("file", logoFile);
    }

    console.log("REQUEST BODY =>", Object.fromEntries(formData.entries()));

    const { data } = await axiosInstance.request({
      url,
      method: isEdit ? "PUT" : "POST",
      data: formData,
    });

    console.log("COMPANY RESPONSE =>", data);

   if (!data.success) {

  // EMAIL ALREADY EXISTS
  if (
    data?.message?.toLowerCase().includes("already exists")
  ) {
    setErr("⚠️ Company with this email already exists");
    return;
  }

  // GENERAL ERROR
  setErr(
    data?.error?.message ||
    data?.message ||
    "Company request failed"
  );

  return;
}
    // REFRESH COMPANY LIST
    await onSuccess();

    // CLOSE MODAL
    onClose();

 } catch (e: any) {
  console.error(e);

  if (e instanceof Error) {
    setErr(e.message);
  } else {
    setErr("Something went wrong");
  }
} finally {
  setSaving(false);
}
};
>>>>>>> 6e5414de11042f7cc7b94d5fa91a3a91e576b835

  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div className="mc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mc-modal__header">
          <div>
            <div className="mc-modal__title">Edit Company</div>
            <div className="mc-modal__sub">Editing {company.name}</div>
          </div>
          <button className="mc-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="mc-modal__body">
          {err && <div className="mc-error-banner">⚠️ {err}</div>}

          <div className="mc-field">
            <div className="mc-field__label">COMPANY NAME *</div>
            <input
              className="mc-input"
              placeholder="e.g. Acme Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mc-field">
            <div className="mc-field__label">EMAIL *</div>
            <input
              className="mc-input"
              type="email"
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mc-field">
            <div className="mc-field__label">PHONE</div>
            <input
              className="mc-input"
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="mc-field">
<<<<<<< HEAD
            <div className="mc-field__label">STATUS</div>
            <select
              className="mc-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="TRIAL">Trial</option>
            </select>
          </div>
=======
            <div className="mc-field__label">COMPANY LOGO</div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
              }}
            >
              {/* Preview circle */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2px dashed var(--mc-border, #333)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: "var(--mc-surface, #1a1a2e)",
                  fontSize: 20,
                }}
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  "🏢"
                )}
              </div>
              <div>
                <div
                  className="mc-input"
                  style={{
                    padding: "8px 14px",
                    cursor: "pointer",
                    display: "inline-block",
                    fontSize: 13,
                  }}
                >
                  {logoFile ? logoFile.name : "Choose image…"}
                </div>
                <div style={{ fontSize: 11, color: "var(--mc-muted)", marginTop: 4 }}>
                  PNG, JPG or WEBP — max 2MB
                </div>
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                style={{ display: "none" }}
                onChange={handleLogoChange}
              />
            </label>
          </div>

          {/* Password only shown when creating */}
          {!company && (
            <div className="mc-field">
              <div className="mc-field__label">PASSWORD *</div>
              <input
                className="mc-input"
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          {/* Status only shown when editing */}
          {company && (
            <div className="mc-field">
              <div className="mc-field__label">STATUS</div>
              <select
                className="mc-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="TRIAL">Trial</option>
              </select>
            </div>
          )}
>>>>>>> 6e5414de11042f7cc7b94d5fa91a3a91e576b835

          <div className="mc-modal__divider" />
          <div className="mc-modal__actions">
            <PrimaryButton onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </PrimaryButton>
            <button className="mc-btn mc-btn--ghost" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────
function CompanyDetailModal({
  company, onClose, onEdit, onDelete,
}: {
  company: Company;
  onClose: () => void;
  onEdit: (c: Company) => void;
  onDelete: (c: Company) => void;
}) {
  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div className="mc-modal mc-detail" onClick={(e) => e.stopPropagation()}>
        <div className="mc-detail__header">
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div
              className="mc-card__logo"
              style={{
                background: company.logo ? "#ffffff" : company.col,
                width: 42,
                height: 42,
                boxShadow: `0 4px 14px ${company.col}50`,
                overflow: "hidden",
              }}
            >
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                company.initials
              )}
            </div>
            <div>
              <div className="mc-card__name">
              {company.favicon && (
                <img
                  src={company.favicon}
                  alt=""
                  style={{
                    width: 16,
                    height: 16,
                    objectFit: "contain",
                    marginRight: 7,
                    verticalAlign: "middle",
                  }}
                />
              )}

              {company.name}
            </div>
              <div className="mc-detail__domain">{company.email}</div>
              <div style={{ marginTop: 6 }}>
                <Badge status={company.status} />
              </div>
            </div>
          </div>
          <button className="mc-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="mc-detail__divider" />

        <div className="mc-detail__metrics">
          {([
            ["Domain",         company.domain,            "var(--mc-accent2)"],
            ["Phone",          company.phone,             "var(--mc-success)"],
            ["Credit Balance", `₹${company.creditBalance}`,"var(--mc-warn)"],
            ["Member Since",   company.createdAt,         "var(--mc-accent2)"],
          ] as [string, string, string][]).map(([l, v, c]) => (
            <div key={l} className="mc-detail__cell">
              <div className="mc-detail__cell-key">{l.toUpperCase()}</div>
              <div className="mc-detail__cell-val" style={{ color: c }}>{v}</div>
            </div>
          ))}
        </div>


        <div className="mc-detail__actions">
          <PrimaryButton onClick={() => { onClose(); onEdit(company); }}>
            ✏️ Edit 
          </PrimaryButton>
          <button className="mc-btn mc-btn--ghost" onClick={onClose}>
            Close
          </button>
          <button
            className="mc-btn mc-btn--danger"
            onClick={() => { onDelete(company.id); onClose(); }}
          >
            🗑️ Delete
          </button>
          {company.status !== "SUSPENDED"
            ? <button className="mc-btn mc-btn--danger" onClick={() => { onStatusChange(company.id, "SUSPENDED"); onClose(); }}>⛔ Suspend</button>
            : <button className="mc-btn mc-btn--ghost"  onClick={() => { onStatusChange(company.id, "ACTIVE"); onClose(); }}>✅ Restore</button>
          }
          <button
            className="mc-btn mc-btn--danger"
            onClick={() => { onClose(); onDelete(company); }}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COMPANY CARD ─────────────────────────────────────────────────────────────
function CompanyCard({
  company, onEdit, onView, onDelete, selected, onToggleSelect, selectMode,
}: {
  company: Company;
  onEdit: (c: Company) => void;
  onView: (c: Company) => void;
  onDelete: (c: Company) => void;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  selectMode: boolean;
}) {
  return (
    <div
      className={`mc-card ${selected ? "mc-card--selected" : ""}`}
      onClick={() => selectMode && onToggleSelect(company.id)}
    >
      {/* Checkbox overlay */}
      <div
        className="mc-card__checkbox"
        onClick={(e) => { e.stopPropagation(); onToggleSelect(company.id); }}
      >
        <div className={`mc-checkbox ${selected ? "mc-checkbox--checked" : ""}`}>
          {selected && <span className="mc-checkbox__tick">✓</span>}
        </div>
      </div>

      <div className="mc-card__top">
        <div className="mc-card__left">
          <div
            className="mc-card__logo"
            style={{
              background: company.col,
              width: 42, height: 42,
              boxShadow: `0 4px 14px ${company.col}50`,
            }}
          >
            {company.logo}
          </div>
          <div>
            <div className="mc-card__name">{company.name}</div>
            <div className="mc-card__domain">{company.domain}</div>
          </div>
        </div>
        <Badge status={company.status} />
      </div>

      <div className="mc-card__div" />

      <div className="mc-card__metrics">
        {([
          ["EMAIL",  company.email,              "📧"],
          ["PHONE",  company.phone,              "📞"],
          ["CREDIT", `₹${company.creditBalance}`,"💰"],
          ["JOINED", company.createdAt,          "📅"],
        ] as [string, string, string][]).map(([label, value, icon]) => (
          <div key={label} className="mc-metric">
            <div className="mc-metric__label">{icon} {label}</div>
            <div className="mc-metric__value">{value}</div>
          </div>
        ))}
      </div>

      <div className="mc-card__actions">
        <button
          className="mc-btn mc-btn--ghost mc-btn--small"
          onClick={(e) => { e.stopPropagation(); onEdit(company); }}
        >
          ✏️Edit 
        </button>
        <button
          className="mc-btn mc-btn--ghost mc-btn--small"
          onClick={(e) => { e.stopPropagation(); onView(company); }}
        >
          👁View
        </button>
        <button
          className="mc-btn mc-btn--danger mc-btn--small"
          onClick={(e) => { e.stopPropagation(); onDelete(company.id); }}
        >
          🗑️ Delete
        </button>
        {company.status !== "SUSPENDED"
          ? <button className="mc-btn mc-btn--danger mc-btn--small" onClick={(e) => e.stopPropagation()}>⛔Suspend </button>
          : <button className="mc-btn mc-btn--ghost  mc-btn--small" onClick={(e) => e.stopPropagation()}>✅ Restore</button>
        }
        <button
          className="mc-btn mc-btn--danger mc-btn--small"
          onClick={(e) => { e.stopPropagation(); onDelete(company); }}
        >
          🗑️Delete
        </button>
      </div>
    </div>
  );
}

// ─── BULK ACTION BAR ──────────────────────────────────────────────────────────
function BulkActionBar({
  count,
  total,
  onSelectAll,
  onClearAll,
  onDelete,
}: {
  count: number;
  total: number;
  onSelectAll: () => void;
  onClearAll: () => void;
  onDelete: () => void;
}) {
  if (count === 0) return null;

  return (
    <div className="mc-bulk-bar">
      <div className="mc-bulk-bar__left">
        <div className="mc-bulk-bar__count">
          <span className="mc-bulk-bar__num">{count}</span>
          <span className="mc-bulk-bar__label">
            {count === 1 ? "company" : "companies"} selected
          </span>
        </div>
       
        <button className="mc-bulk-bar__link mc-bulk-bar__link--muted" onClick={onClearAll}>
          Clear selection
        </button>
      </div>
      <button className="mc-btn mc-btn--danger" onClick={onDelete}>
        🗑️ Delete {count} {count === 1 ? "Company" : "Companies"}
      </button>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function ManageCompanies() {
  const [search,        setSearch]        = useState("");
  const [filter,        setFilter]        = useState<"ALL" | Status>("ALL");
  const [showAddModal,  setShowAddModal]   = useState(false);
  const [editTarget,    setEditTarget]     = useState<Company | null>(null);
  const [viewTarget,    setViewTarget]     = useState<Company | null>(null);
  const [companies,     setCompanies]      = useState<Company[]>([]);
  const [loading,       setLoading]        = useState(true);
  const [fetchError,    setFetchError]     = useState<string | null>(null);

  // ── Selection state ──
  const [selectedIds,   setSelectedIds]    = useState<Set<string>>(new Set());
  const [deleteTargets, setDeleteTargets]  = useState<Company[] | null>(null);
  const [deleting,      setDeleting]       = useState(false);

  const fetchCompanies = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data: json } = await axiosInstance.get(COMPANIES_API);
      const raw: RawCompany[] = Array.isArray(json?.data) ? json.data : [];
      setCompanies(raw.map(enrichCompany));
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Failed to load companies");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  const FILTERS: ("ALL" | Status)[] = ["ALL", "ACTIVE", "TRIAL", "SUSPENDED", "INACTIVE"];
  const query = search.trim().toLowerCase();

  const filtered = companies.filter((c) => {
    const emailDomain = c.email.includes("@") ? c.email.split("@").pop() ?? "" : "";
    const searchable  = [c.name, c.email, emailDomain, c.domain].join(" ").toLowerCase();
    return (filter === "ALL" || c.status === filter) && (!query || searchable.includes(query));
  });

  // ── Select helpers ──
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () =>
    setSelectedIds(new Set(filtered.map((c) => c.id)));

  const clearAll = () => setSelectedIds(new Set());

  const allSelected   = filtered.length > 0 && filtered.every((c) => selectedIds.has(c.id));
  const someSelected  = filtered.some((c) => selectedIds.has(c.id));
  const selectMode    = someSelected;

  const selectedCount = filtered.filter((c) => selectedIds.has(c.id)).length;

  // ── Delete flow ──
  const openDeleteSingle = (c: Company) => setDeleteTargets([c]);
  const openDeleteBulk   = () => {
    const targets = filtered.filter((c) => selectedIds.has(c.id));
    if (targets.length > 0) setDeleteTargets(targets);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargets || deleteTargets.length === 0) return;
    setDeleting(true);
    try {
      await Promise.all(
        deleteTargets.map((c) =>
          axiosInstance.delete(`${COMPANIES_API}/${c.id}`)
        )
      );
      // Remove deleted companies from selection
      setSelectedIds((prev) => {
        const next = new Set(prev);
        deleteTargets.forEach((c) => next.delete(c.id));
        return next;
      });
      await fetchCompanies();
      setDeleteTargets(null);
    } catch (e) {
      console.error("Delete failed", e);
    } finally {
      setDeleting(false);
    }
  };

  const openAdd  = ()           => { setShowAddModal(true); };
  const openEdit = (c: Company) => { setEditTarget(c); };
  const openView = (c: Company) => setViewTarget(c);

  const handleDelete = async (companyId: string) => {
    if (!confirm("Are you sure you want to delete this company? This action cannot be undone.")) {
      return;
    }
    try {
      const { data } = await axiosInstance.delete(`${COMPANIES_API}/${companyId}`);
      if (data.success) {
        await fetchCompanies();
      } else {
        alert(data.message || "Failed to delete company");
      }
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || e.message || "Something went wrong while deleting company");
    }
  };

  const handleStatusChange = async (companyId: string, newStatus: "ACTIVE" | "SUSPENDED") => {
    const actionText = newStatus === "SUSPENDED" ? "suspend" : "restore";
    if (!confirm(`Are you sure you want to ${actionText} this company?`)) {
      return;
    }
    try {
      const { data } = await axiosInstance.put(`${COMPANIES_API}/${companyId}`, {
        status: newStatus.toLowerCase(),
      });
      if (data.success) {
        await fetchCompanies();
      } else {
        alert(data.message || `Failed to ${actionText} company`);
      }
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || e.message || `Something went wrong while trying to ${actionText} company`);
    }
  };

  return (
    <div className="mc-root">
      {/* HEADER */}
      <div className="mc-header">
        <div>
          <h1 className="mc-header__title">Manage Companies</h1>
          <p className="mc-header__sub">
            All registered companies and their subscription health.
          </p>
        </div>
        <PrimaryButton onClick={openAdd}>+ Add Company</PrimaryButton>
      </div>

      {/* KPIs */}
      <div className="mc-kpi-grid">
        <KPI label="Total Companies" value={String(companies.length)}                                      icon="🏢" color="#6C5CE7" />
        <KPI label="Active"          value={String(companies.filter(c => c.status === "ACTIVE").length)}    icon="✅" color="#00CBA4" />
        <KPI label="Suspended"       value={String(companies.filter(c => c.status === "SUSPENDED").length)} icon="⛔" color="#FF6B6B" />
        <KPI label="On Trial"        value={String(companies.filter(c => c.status === "TRIAL").length)}     icon="⏳" color="#FDCB6E" />
      </div>

      {/* FILTER BAR */}
      <div className="mc-filter-bar">
        <div className="mc-search-wrap">
          <span className="mc-search-icon">🔍</span>
          <input
            className="mc-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or domain…"
            autoComplete="off"
          />
        </div>
        <div className="mc-filter-group">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`mc-filter-btn ${filter === f ? "mc-filter-btn--active" : ""}`}
            >
              {f === "ALL" ? "All" : f[0] + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Select-all checkbox */}
        {!loading && filtered.length > 0 && (
          <button
            className={`mc-select-all-btn ${allSelected ? "mc-select-all-btn--active" : ""}`}
            onClick={allSelected ? clearAll : selectAll}
            title={allSelected ? "Deselect all" : "Select all"}
          >
            <div className={`mc-checkbox mc-checkbox--sm ${allSelected ? "mc-checkbox--checked" : someSelected ? "mc-checkbox--partial" : ""}`}>
              {allSelected  && <span className="mc-checkbox__tick">✓</span>}
              {someSelected && !allSelected && <span className="mc-checkbox__tick">–</span>}
            </div>
            <span>{allSelected ? "Deselect all" : "Select all"}</span>
          </button>
        )}

        <span className="mc-filter-count">{filtered.length} companies</span>
      </div>

      {/* BULK ACTION BAR */}
      <BulkActionBar
        count={selectedCount}
        total={filtered.length}
        onSelectAll={selectAll}
        onClearAll={clearAll}
        onDelete={openDeleteBulk}
      />

      {/* GRID */}
      {loading ? (
        <div className="mc-empty">Loading companies…</div>
      ) : fetchError ? (
        <div className="mc-empty">⚠️ {fetchError}</div>
      ) : filtered.length === 0 ? (
        <div className="mc-empty">No companies found. Start by adding one 🚀</div>
      ) : (
        <div className="mc-grid">
          {filtered.map((c) => (
            <CompanyCard
              key={c.id}
              company={c}
              onEdit={openEdit}
              onView={openView}
              onDelete={openDeleteSingle}
              selected={selectedIds.has(c.id)}
              onToggleSelect={toggleSelect}
              selectMode={selectMode}
            />
          ))}
        </div>
      )}

      {/* MODALS */}
      {showAddModal && (
        <AddCompanyModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchCompanies}
        />
      )}
      {editTarget && (
        <EditCompanyModal
          company={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={fetchCompanies}
        />
      )}
      {viewTarget && (
        <CompanyDetailModal
          company={viewTarget}
          onClose={() => setViewTarget(null)}
          onEdit={(c) => { setViewTarget(null); openEdit(c); }}
          onDelete={(c) => { setViewTarget(null); openDeleteSingle(c); }}
        />
      )}
      {deleteTargets && (
        <DeleteConfirmModal
          companies={deleteTargets}
          onClose={() => setDeleteTargets(null)}
          onConfirm={handleDeleteConfirm}
          deleting={deleting}
        />
      )}
    </div>
  );
}

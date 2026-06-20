"use client";

import { useState, useEffect } from "react";
import "./manage-companies.css";
import { axiosInstance } from "@/lib/axiosInstance";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const COMPANIES_API = "/v1/admin/companies?status=active";
const ACTIVE_COMPANIES_API = "/v1/admin/companies?status=active";
const SUSPENDED_COMPANIES_API = "/v1/admin/companies?status=suspend";
const ITEMS_PER_PAGE = 50;

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface RawCompany {
  id: string | number;
  name: string;
  email?: string;
  adminEmail?: string;
  phone: string | null;
  domain: string | null;
  logo: string | null;
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

type Status = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "TRIAL";
type Plan = "Starter" | "Basic" | "Pro" | "Enterprise";

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  domain: string;
  logo: string;
  logoUrl?: string | null;
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
    active: "ACTIVE",
    inactive: "INACTIVE",
    suspend: "SUSPENDED",
    suspended: "SUSPENDED",
    trial: "TRIAL",
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
    logo: (raw.name || "??").slice(0, 2).toUpperCase(),
    logoUrl: raw.logo,
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

const STATUS_COLORS: Record<Status, string> = {
  ACTIVE: "#10b981",
  SUSPENDED: "#ef4444",
  INACTIVE: "#6b7280",
  TRIAL: "#f59e0b",
};

function StatusDropdown({
  company,
  onStatusChange,
}: {
  company: Company;
  onStatusChange: (id: string, status: "ACTIVE" | "SUSPENDED") => void;
}) {
  const color = STATUS_COLORS[company.status];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Status;
    if (newStatus === company.status) return;
    if (newStatus === "ACTIVE" || newStatus === "SUSPENDED") {
      onStatusChange(company.id, newStatus);
    } else {
      toast.info(
        "Switching directly to Inactive/Trial isn't supported here — use Edit Company."
      );
    }
    e.target.value = company.status;
  };

  return (
    <select
      className="mc-status-dropdown"
      value={company.status}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      title="Change status"
      style={{
        background: `${color}18`,
        color,
        border: `1px solid ${color}55`,
        borderRadius: 999,
        padding: "4px 10px 4px 12px",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        outline: "none",
        appearance: "none",
        WebkitAppearance: "none",
      }}
    >
      <option value="ACTIVE">● Active</option>
      <option value="SUSPENDED">● Suspended</option>
      <option value="INACTIVE" disabled={company.status !== "INACTIVE"}>
        ● Inactive
      </option>
      <option value="TRIAL" disabled={company.status !== "TRIAL"}>
        ● Trial
      </option>
    </select>
  );
}

// ─── PAGINATION ───────────────────────────────────────────────────────────────
function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pages: (number | "...")[] = [];
  const windowSize = 1;

  for (let p = 1; p <= totalPages; p++) {
    const inWindow =
      p >= currentPage - windowSize && p <= currentPage + windowSize;
    if (p === 1 || p === totalPages || inWindow) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  const navBtnStyle = (disabled: boolean): React.CSSProperties => ({
    border: "1px solid var(--mc-border, #2c3657)",
    background: "var(--mc-surface, #1a1a2e)",
    color: disabled ? "var(--mc-muted, #6b7280)" : "inherit",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 13,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        padding: "14px 4px 4px",
      }}
    >
      <div style={{ fontSize: 13, color: "var(--mc-muted, #6b7280)" }}>
        Showing <strong>{startItem}</strong>–<strong>{endItem}</strong> of{" "}
        <strong>{totalItems}</strong> companies
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          type="button"
          style={navBtnStyle(currentPage === 1)}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          ‹ Prev
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              style={{ padding: "0 4px", color: "var(--mc-muted, #6b7280)" }}
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              style={{
                minWidth: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid var(--mc-border, #2c3657)",
                background:
                  p === currentPage ? "#10b981" : "var(--mc-surface, #1a1a2e)",
                color: p === currentPage ? "#fff" : "inherit",
                fontWeight: p === currentPage ? 700 : 400,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          style={navBtnStyle(currentPage === totalPages)}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next ›
        </button>
      </div>
    </div>
  );
}

function KPI({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="mc-kpi">
      <div className="mc-kpi__orb" style={{ background: `${color}10` }} />
      <div className="mc-kpi__top">
        <span className="mc-kpi__label">{label}</span>
        <div className="mc-kpi__icon" style={{ background: `${color}18` }}>
          {icon}
        </div>
      </div>
      <div className="mc-kpi__value">{value}</div>
    </div>
  );
}

// ─── ADD / EDIT MODAL ─────────────────────────────────────────────────────────
function CompanyModal({
  company,
  onClose,
  onSuccess,
}: {
  company: Company | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(company?.name || "");
  const [email, setEmail] = useState(company?.email || "");
  const [phone, setPhone] = useState(
    company?.phone === "—" ? "" : company?.phone || ""
  );
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>(company?.status || "ACTIVE");
  const [creditBalance, setCreditBalance] = useState(
    company?.creditBalance ?? "0"
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Reset when target changes
  useEffect(() => {
    setName(company?.name || "");
    setEmail(company?.email || "");
    setPhone(company?.phone === "—" ? "" : company?.phone || "");
    setPassword("");
    setStatus(company?.status || "ACTIVE");
    setCreditBalance(company?.creditBalance ?? "0");
    setLogoFile(null);
    setLogoPreview(null);
    setErr(null);
  }, [company]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErr("Only PNG, JPG and WEBP files are allowed.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErr("Image size must be less than 2MB.");
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setErr(null);

    // ── Validation ──────────────────────────────────────────────────────────
    if (!name.trim()) return setErr("Company name is required.");

    if (!email.trim()) return setErr("Email is required.");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim()))
      return setErr("Please enter a valid email address.");

    if (!phone.trim()) return setErr("Phone number is required.");

    if (creditBalance !== "" && Number(creditBalance) < 0)
      return setErr("Credit balance cannot be negative.");

    // Password only required on Create
    if (!company) {
      if (!password.trim()) return setErr("Password is required.");

      if (password.length < 8)
        return setErr("Password must be at least 8 characters.");

      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password))
        return setErr(
          "Password must contain uppercase, lowercase, number and special character."
        );
    }

    setSaving(true);

    try {
      const isEdit = !!company;
      const url = isEdit
        ? `/v1/admin/companies/${company.id}`
        : "/v1/admin/companies";

      console.log("API URL =>", url);

      // ── Build FormData ───────────────────────────────────────────────────
      const formData = new FormData();

      formData.append("name", name);
      formData.append("email", email);
      if (phone) formData.append("phone", phone);
      formData.append("credit_balance", String(creditBalance || 0));

      // Backend requires a nested `user` JSON object for onboarding
      if (!isEdit) {
        formData.append(
          "user",
          JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone || undefined,
            password,
          })
        );
      }

      if (logoFile) {
        formData.append("file", logoFile);
      }

      // ── API call ─────────────────────────────────────────────────────────
      let data;

      if (isEdit) {
        // FIX: explicit multipart header for edit
        const response = await axiosInstance.put(url, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        data = response.data;

        // Handle Active / Suspend status change
        if (
          company?.status !== status &&
          (status === "ACTIVE" || status === "SUSPENDED")
        ) {
          const statusEndpoint =
            status === "ACTIVE"
              ? `/v1/admin/companies/${company.id}/active`
              : `/v1/admin/companies/${company.id}/suspend`;
          await axiosInstance.put(statusEndpoint);
        }
      } else {
       const response = await axiosInstance.post(
  url,
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }
);

console.log("CREATE RESPONSE", response.data);
        data = response.data;
      }

      console.log("COMPANY RESPONSE =>", data);

      if (!data.success) {
        if (data?.message?.toLowerCase().includes("already exists")) {
          setErr("⚠️ Company with this email already exists");
          return;
        }
        setErr(
          data?.error?.message || data?.message || "Company request failed"
        );
        return;
      }

      // ── Credit top-up (only when balance increased) ──────────────────────
      const newBalance = Number(creditBalance || 0);
      const oldBalance = Number(company?.creditBalance || 0);
      const creditDiff = newBalance - oldBalance;

      if (creditDiff > 0) {
        const companyId = isEdit
          ? company.id
          : data?.data?.id ?? data?.id;
        const companyName = isEdit ? company.name : name;

        if (companyId) {
          try {
            await axiosInstance.post("/v1/admin/credits/add", {
              company_id: companyId,
              company_name: companyName,
              amount: creditDiff,
              description: isEdit
                ? "Credit balance updated via Edit Company"
                : "Initial credit balance",
              created_by:
                localStorage.getItem("email") || "admin@company.com",
            });
          } catch (creditErr) {
            console.error("CREDIT UPDATE ERROR =>", creditErr);
            toast.error("Company saved, but failed to update credit balance");
          }
        }
      }

      // ── Done ─────────────────────────────────────────────────────────────
      await onSuccess();
      toast.success(
        company ? "Company updated successfully" : "Company created successfully"
      );

      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setCreditBalance("0");
      setLogoFile(null);
      setLogoPreview(null);
      setErr(null);
    } catch (e: any) {
      console.error(e);
      setErr(
        e?.response?.data?.message ||
        e?.message ||
        "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mc-modal-overlay">
      <div className="mc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mc-modal__header">
          <div>
            <div className="mc-modal__title">
              {company ? "Edit Company" : "Add New Company"}
            </div>
            <div className="mc-modal__sub">
              {company ? `Editing ${company.name}` : "Fill in the details below."}
            </div>
          </div>
          <button className="mc-modal__close" onClick={onClose}>
            ×
          </button>
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
              onChange={(e) => {
                setEmail(e.target.value);
                setErr(null);
              }}
            />
          </div>

          <div className="mc-field">
            <div className="mc-field__label">PHONE *</div>
            <PhoneInput
              country={"in"}
              value={phone}
              onChange={(value) => {
                setPhone(value);
                setErr(null);
              }}
              enableSearch
              searchPlaceholder="Search country..."
              placeholder="Enter phone number"
              inputStyle={{
                width: "100%",
                height: "48px",
                background: "#12182b",
                color: "#fff",
                border: "1px solid #2c3657",
                borderRadius: "10px",
                paddingLeft: "55px",
              }}
              buttonStyle={{
                background: "#12182b",
                border: "1px solid #2c3657",
                borderRadius: "10px 0 0 10px",
              }}
              dropdownStyle={{
                background: "#1b2338",
                color: "#fff",
                border: "1px solid #2c3657",
                maxHeight: "250px",
              }}
            />
          </div>

          <div className="mc-field">
            <div className="mc-field__label">COMPANY LOGO</div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
              }}
            >
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
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--mc-muted)",
                    marginTop: 4,
                  }}
                >
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

          {/* Password — Create only */}
          {!company && (
            <div className="mc-field">
              <div className="mc-field__label">PASSWORD *</div>
              <input
                className="mc-input"
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErr(null);
                }}
              />
            </div>
          )}

          {/* Credit Balance — both Create and Edit */}
          <div className="mc-field">
            <div className="mc-field__label">
              {company ? "CREDIT BALANCE" : "INITIAL CREDIT BALANCE"}
            </div>
            <input
              className="mc-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={creditBalance}
              onChange={(e) => {
                setCreditBalance(e.target.value);
                setErr(null);
              }}
            />
            {company && (
              <div
                style={{ fontSize: 11, color: "var(--mc-muted)", marginTop: 4 }}
              >
                Current balance: ₹{Number(company.creditBalance || 0).toFixed(2)}.
                Increasing this value will top up the company's credit.
              </div>
            )}
          </div>

          {/* Status — Edit only */}
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
              <div
                style={{ fontSize: 11, color: "var(--mc-muted)", marginTop: 4 }}
              >
                Switching between <strong>Active</strong> and{" "}
                <strong>Suspended</strong> will immediately call the company's
                activate/suspend endpoint on save.
              </div>
            </div>
          )}

          <div className="mc-modal__divider" />
          <div className="mc-modal__actions">
            <button
              type="button"
              className="mc-btn mc-btn--primary"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Saving…" : company ? "Save Changes" : "Create Company"}
            </button>
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
  company,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  company: Company;
  onClose: () => void;
  onEdit: (c: Company) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: "ACTIVE" | "SUSPENDED") => void;
}) {
  return (
    <div className="mc-modal-overlay">
      <div className="mc-modal mc-detail" onClick={(e) => e.stopPropagation()}>
        <div className="mc-detail__header">
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div
              className="mc-detail__logo"
              style={{ background: company.col, width: 52, height: 52 }}
            >
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="mc-detail-logo-img"
                />
              ) : (
                company.logo
              )}
            </div>
            <div>
              <div className="mc-detail__name">{company.name}</div>
              <div className="mc-detail__domain">{company.email}</div>
              <div style={{ marginTop: 6 }}>
                <Badge status={company.status} />
              </div>
            </div>
          </div>
          <button className="mc-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="mc-detail__divider" />

        <div className="mc-detail__metrics">
          {(
            [
              ["Domain", company.domain, "var(--mc-accent2)"],
              ["Phone", company.phone, "var(--mc-success)"],
              ["Credit Balance", `₹${company.creditBalance}`, "var(--mc-warn)"],
              ["Member Since", company.createdAt, "var(--mc-accent2)"],
            ] as [string, string, string][]
          ).map(([l, v, c]) => (
            <div key={l} className="mc-detail__cell">
              <div className="mc-detail__cell-key">{l.toUpperCase()}</div>
              <div className="mc-detail__cell-val" style={{ color: c }}>
                {v}
              </div>
            </div>
          ))}
        </div>

        {company.apiKey && (
          <div className="mc-quickstat">
            <div className="mc-quickstat__lbl">API KEY</div>
            <div
              className="mc-quickstat__row"
              style={{
                fontSize: 11,
                wordBreak: "break-all",
                color: "var(--mc-muted)",
                padding: "8px 0",
              }}
            >
              {company.apiKey.slice(0, 32)}…
            </div>
          </div>
        )}

        <div className="mc-detail__actions">
          <button
            className="mc-btn mc-btn--primary"
            onClick={() => {
              onClose();
              onEdit(company);
            }}
          >
            ✏️ Edit Company
          </button>
          <button className="mc-btn mc-btn--ghost" onClick={onClose}>
            Close
          </button>
          <button
            className="mc-btn mc-btn--danger"
            onClick={() => {
              onDelete(company.id);
              onClose();
            }}
          >
            🗑️ Delete
          </button>
          {company.status !== "SUSPENDED" ? (
            <button
              className="mc-btn mc-btn--danger"
              onClick={() => {
                onStatusChange(company.id, "SUSPENDED");
                onClose();
              }}
            >
              ⛔ Suspend
            </button>
          ) : (
            <button
              className="mc-btn mc-btn--ghost"
              onClick={() => {
                onStatusChange(company.id, "ACTIVE");
                onClose();
              }}
            >
              ✅ Restore
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── COMPANY CARD ─────────────────────────────────────────────────────────────
function CompanyCard({
  company,
  onEdit,
  onView,
  onDelete,
  onStatusChange,
}: {
  company: Company;
  onEdit: (c: Company) => void;
  onView: (c: Company) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: "ACTIVE" | "SUSPENDED") => void;
}) {
  return (
    <div className="mc-card">
      <div className="mc-card__top">
        <div className="mc-card__left">
          <div className="mc-card__logo" style={{ background: company.col }}>
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="mc-card-logo-img"
              />
            ) : (
              company.logo
            )}
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
        {(
          [
            ["EMAIL", company.email, "📧"],
            ["PHONE", company.phone, "📞"],
            ["CREDIT", `₹${company.creditBalance}`, "💰"],
            ["JOINED", company.createdAt, "📅"],
          ] as [string, string, string][]
        ).map(([label, value, icon]) => (
          <div key={label} className="mc-metric">
            <div className="mc-metric__label">
              {icon} {label}
            </div>
            <div className="mc-metric__value">{value}</div>
          </div>
        ))}
      </div>

      <div className="mc-card__actions">
        <button
          className="mc-btn mc-btn--ghost mc-btn--small"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(company);
          }}
        >
          ✏️ Edit
        </button>
        <button
          className="mc-btn mc-btn--ghost mc-btn--small"
          onClick={(e) => {
            e.stopPropagation();
            onView(company);
          }}
        >
          👁 View
        </button>
        <button
          className="mc-btn mc-btn--danger mc-btn--small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(company.id);
          }}
        >
          🗑️ Delete
        </button>
        {company.status !== "SUSPENDED" ? (
          <button
            className="mc-btn mc-btn--danger mc-btn--small"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(company.id, "SUSPENDED");
            }}
          >
            ⛔ Suspend
          </button>
        ) : (
          <button
            className="mc-btn mc-btn--ghost mc-btn--small"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(company.id, "ACTIVE");
            }}
          >
            ✅ Restore
          </button>
        )}
      </div>
    </div>
  );
}

// ─── ADD CREDIT MODAL ─────────────────────────────────────────────────────────
function AddCreditModal({
  company,
  onClose,
  onSuccess,
}: {
  company: Company;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Top-up credits");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
const currentBalance = Number(company.creditBalance || 0);
const newBalance = currentBalance + Number(amount || 0);
  const handleAddCredit = async () => {
    setErr(null);

    // ── Validation ──────────────────────────────────────────────────────────
    const numAmount = Number(amount);

    if (!amount.trim() || isNaN(numAmount)) {
      setErr("Please enter a valid amount.");
      return;
    }

    if (numAmount <= 0) {
      setErr("Amount must be greater than 0.");
      return;
    }

    try {
      setLoading(true);

      const adminEmail =
        localStorage.getItem("email") || "admin@company.com";

      const response = await axiosInstance.post("/v1/admin/credits/add", {
        company_id: company.id,
        company_name: company.name,
        amount: numAmount,
        description: description.trim() || "Top-up credits",
        created_by: adminEmail,
      });

      const data = response.data;

      // FIX: check data.success before showing success toast
      if (!data.success) {
        setErr(data?.message || "Failed to add credit.");
        return;
      }
toast.success("Credit added successfully");

await onSuccess(); 

onClose();
    } catch (error: any) {
      console.error(error);
      setErr(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add credit"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mc-modal-overlay">
      <div className="mc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mc-modal__header">
          <div>
            <div className="mc-modal__title">Add Credit</div>
            <div className="mc-modal__sub">
              Top up {company.name}'s balance
            </div>
          </div>
          <button className="mc-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="mc-modal__body">
          {err && <div className="mc-error-banner">⚠️ {err}</div>}

          <div className="mc-field">
            <div className="mc-field__label">COMPANY</div>
            <input
              className="mc-input"
              value={company.name}
              disabled
            />
          </div>

          <div className="mc-field">
            <div className="mc-field__label">CURRENT BALANCE</div>
            <input
              className="mc-input"
              value={`₹${Number(company.creditBalance || 0).toFixed(2)}`}
              disabled
            />
          </div>

          <div className="mc-field">
  <div className="mc-field__label">AMOUNT TO ADD *</div>
  <input
  className="mc-input no-spinner"
  type="number"
  min="1"
  step="1"
  placeholder="Enter amount"
  value={amount}
  onChange={(e) => {
    setAmount(e.target.value);
    setErr(null);
  }}
/>
</div>


         
          <div className="mc-modal__actions">
            <button
              type="button"
              className="mc-btn mc-btn--primary"
              onClick={handleAddCredit}
              disabled={loading}
            >
              {loading ? "Adding…" : "Add Credit"}
            </button>
            <button
              type="button"
              className="mc-btn mc-btn--ghost"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function ManageCompanies() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | Status>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Company | null>(null);
  const [viewTarget, setViewTarget] = useState<Company | null>(null);
  const [creditCompany, setCreditCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(filtered.map((c) => c.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectCompany = (companyId: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedCompanies.length === 0) return;

    const result = await Swal.fire({
      title: "Delete Selected Companies?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      await Promise.all(
        selectedCompanies.map((id) =>
          axiosInstance.delete(`/v1/admin/companies/${id}`)
        )
      );

      setSelectedCompanies([]);
      setSelectAll(false);
      toast.success(
        `${selectedCompanies.length} companies deleted successfully`
      );
      fetchCompanies();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete selected companies");
    }
  };

  const fetchCompanies = async () => {
    setLoading(true);
    setFetchError(null);

    try {
      let endpoint = COMPANIES_API;
      if (filter === "ACTIVE") endpoint = ACTIVE_COMPANIES_API;
      if (filter === "SUSPENDED") endpoint = SUSPENDED_COMPANIES_API;

      const [companiesRes, adminUsersRes] = await Promise.all([
        axiosInstance.get(endpoint),
        axiosInstance
          .get("/v1/admin/companies/user?role=admin")
          .catch(() => ({ data: null })),
      ]);

      console.log("GET COMPANY RESPONSE =>", companiesRes.data);
      console.log("GET ADMIN USERS RESPONSE =>", adminUsersRes.data);

      const raw: RawCompany[] = Array.isArray(companiesRes.data?.data)
        ? companiesRes.data.data
        : [];

      const companyList = raw.map(enrichCompany);
      const existingIds = new Set(companyList.map((c) => c.id));

      const adminRaw: any[] = Array.isArray(adminUsersRes.data?.data?.data)
        ? adminUsersRes.data.data.data
        : Array.isArray(adminUsersRes.data?.data)
        ? adminUsersRes.data.data
        : [];

      const adminCompanies: Company[] = adminRaw
        .filter((u: any) => {
          const compId = u.company_id ? String(u.company_id) : null;
          return !compId || !existingIds.has(compId);
        })
        .map(
          (u: any): Company => ({
            id: `user-${String(u.id)}`,
            name: u.name || "Unnamed",
            email: u.email || u.adminEmail || "—",
            phone: u.phone || "—",
            domain: u.email?.split("@")[1] || "—",
            logo: (u.name || "??").slice(0, 2).toUpperCase(),
            logoUrl: u.logo || null,
            col: avatarColor(String(u.id)),
            status: normaliseStatus(u.status || "active"),
            plan: "Starter",
            users: 0,
            mrr: 0,
            end: "N/A",
            creditBalance: u.credit_balance ?? "0.00",
            createdAt: u.created_at
              ? new Date(u.created_at).toLocaleDateString()
              : "—",
            apiKey: null,
          })
        );

      setCompanies([...companyList, ...adminCompanies]);
    } catch (e) {
      setFetchError(
        e instanceof Error ? e.message : "Failed to load companies"
      );
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [filter]);

  const FILTERS: ("ALL" | Status)[] = [
    "ALL",
    "ACTIVE",
    "TRIAL",
    "SUSPENDED",
    "INACTIVE",
  ];
  const query = search.trim().toLowerCase();

  const filtered = companies.filter((c) => {
    const emailDomain = c.email.includes("@")
      ? c.email.split("@").pop() ?? ""
      : "";
    const searchable = [c.name, c.email, emailDomain, c.domain]
      .join(" ")
      .toLowerCase();
    return (
      (filter === "ALL" || c.status === filter) &&
      (!query || searchable.includes(query))
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedCompanies = filtered.slice(
    pageStart,
    pageStart + ITEMS_PER_PAGE
  );

  const openAdd = () => {
    setEditTarget(null);
    setShowModal(true);
  };
  const openEdit = (c: Company) => {
    setEditTarget(c);
    setShowModal(true);
  };
  const openView = (c: Company) => setViewTarget(c);

  const handleDelete = async (companyId: string) => {
    const result = await Swal.fire({
      title: "Delete Company?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      const endpoint = `/v1/admin/companies/${companyId}`;
      console.log("DELETE URL =>", endpoint);

      const { data } = await axiosInstance.delete(endpoint);
      console.log("DELETE RESPONSE =>", data);

      if (data?.success) {
        toast.success("Company deleted successfully");
        await fetchCompanies();
      } else {
        toast.error(data?.message || "Failed to delete company");
      }
    } catch (error: any) {
      console.error("DELETE ERROR =>", error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete company"
      );
    }
  };

  const handleStatusChange = async (
    companyId: string,
    newStatus: "ACTIVE" | "SUSPENDED"
  ) => {
    const isSuspending = newStatus === "SUSPENDED";

    const result = await Swal.fire({
      title: isSuspending ? "Suspend Company?" : "Activate Company?",
      text: isSuspending
        ? "Company access will be blocked."
        : "Company access will be restored.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: isSuspending ? "#ef4444" : "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: isSuspending ? "Suspend" : "Activate",
    });

    if (!result.isConfirmed) return;

    try {
      const endpoint =
        newStatus === "ACTIVE"
          ? `/v1/admin/companies/${companyId}/active`
          : `/v1/admin/companies/${companyId}/suspend`;

      console.log("STATUS API =>", endpoint);
      const { data } = await axiosInstance.put(endpoint);
      console.log("STATUS RESPONSE =>", data);

      if (data?.success) {
        toast.success(
          newStatus === "SUSPENDED"
            ? "Company suspended successfully"
            : "Company activated successfully"
        );
        await fetchCompanies();
      } else {
        toast.error(data?.message || "Failed to update company status");
      }
    } catch (error: any) {
      console.error("STATUS ERROR =>", error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update company status"
      );
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
        <button className="mc-btn mc-btn--primary" onClick={openAdd}>
          Create Company
        </button>
      </div>

      {/* KPIs */}
      <div className="mc-kpi-grid">
        <KPI
          label="Total Companies"
          value={String(companies.length)}
          icon="🏢"
          color="#6C5CE7"
        />
        <KPI
          label="Active"
          value={String(companies.filter((c) => c.status === "ACTIVE").length)}
          icon="✅"
          color="#00CBA4"
        />
        <KPI
          label="Suspended"
          value={String(
            companies.filter((c) => c.status === "SUSPENDED").length
          )}
          icon="⛔"
          color="#FF6B6B"
        />
        <KPI
          label="On Trial"
          value={String(companies.filter((c) => c.status === "TRIAL").length)}
          icon="⏳"
          color="#FDCB6E"
        />
      </div>

      {/* FILTER BAR */}
      <div className="mc-filter-bar mc-filter-bar-top">
        <div className="mc-search-wrap mc-search-wrap-small">
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
              className={`mc-filter-btn ${
                filter === f ? "mc-filter-btn--active" : ""
              }`}
            >
              {f === "ALL" ? "All" : f[0] + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="mc-bulk-actions">
          {selectedCompanies.length > 0 && (
            <button className="mc-delete-selected" onClick={handleBulkDelete}>
              Delete Selected ({selectedCompanies.length})
            </button>
          )}
          <label className="mc-select-all">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
            />
            Select All
          </label>
          <span className="mc-filter-count">{filtered.length} companies</span>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="mc-empty">Loading companies…</div>
      ) : fetchError ? (
        <div className="mc-empty">⚠️ {fetchError}</div>
      ) : filtered.length === 0 ? (
        <div className="mc-empty">
          No companies found. Start by adding one 🚀
        </div>
      ) : (
        <div className="mc-table-wrapper">
          <table className="mc-table">
            <thead>
              <tr>
                <th style={{ width: "50px" }}>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>COMPANY</th>
                <th>EMAIL</th>
                <th>PHONE</th>
                <th>CREDIT BALANCE</th>
                <th>STATUS</th>
                <th>JOINED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCompanies.map((company) => (
                <tr key={company.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedCompanies.includes(company.id)}
                      onChange={() => handleSelectCompany(company.id)}
                    />
                  </td>
                  <td>
                    <div className="mc-company-cell">
                      <div
                        className="mc-company-avatar"
                        style={{ background: company.col }}
                      >
                        {company.logoUrl ? (
                          <img
                            src={company.logoUrl}
                            alt={company.name}
                            className="mc-company-avatar-img"
                          />
                        ) : (
                          company.logo
                        )}
                      </div>
                      <div className="mc-company-name">{company.name}</div>
                    </div>
                  </td>
                  <td>{company.email}</td>
                  <td>{company.phone}</td>
                  <td className="mc-credit-cell">
                    ₹{Number(company.creditBalance || 0).toFixed(2)}
                  </td>
                  <td>
                    <StatusDropdown
                      company={company}
                      onStatusChange={handleStatusChange}
                    />
                  </td>
                  <td>{company.createdAt}</td>
                  <td>
                    <div className="mc-actions">
                      <button
                        className="mc-action-btn"
                        onClick={() => openView(company)}
                        title="View"
                      >
                        👁
                      </button>
                      <button
                        className="mc-action-btn"
                        onClick={() => openEdit(company)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="mc-action-btn credit"
                        onClick={() => setCreditCompany(company)}
                        title="Add Credit"
                      >
                        💰
                      </button>
                      <button
                        className="mc-action-btn delete"
                        onClick={() => handleDelete(company.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      {!loading && !fetchError && filtered.length > 0 && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={ITEMS_PER_PAGE}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      {/* MODALS */}
      {showModal && (
        <CompanyModal
          company={editTarget}
          onClose={() => {
            setShowModal(false);
            setEditTarget(null);
          }}
          onSuccess={async () => {
            await fetchCompanies();
            setShowModal(false);
            setEditTarget(null);
          }}
        />
      )}

      {viewTarget && (
        <CompanyDetailModal
          company={viewTarget}
          onClose={() => setViewTarget(null)}
          onEdit={(c) => {
            setViewTarget(null);
            openEdit(c);
          }}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}

      {creditCompany && (
        <AddCreditModal
          company={creditCompany}
          onClose={() => setCreditCompany(null)}
          onSuccess={async () => {
            await fetchCompanies();
          }}
        />
      )}

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
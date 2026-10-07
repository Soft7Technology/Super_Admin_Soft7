"use client";

import type { ChangeEvent, CSSProperties, ReactNode } from "react";
import "./manage-companies.css";
import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Ban,
  Building2,
  CheckCircle2,
  Eye,
  Pencil,
  Search,
  Trash2,
  Wallet,
} from "lucide-react";
// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#206bc4",
  "#4299e1",
  "#2fb344",
  "#ae3ec9",
  "#f59f00",
  "#17a2b8",
  "#6366f1",
  "#ec4899",
];

function getAvatarBg(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const COMPANIES_API = "/v1/super-admin/companies";
const ITEMS_PER_PAGE = 25;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface CompaniesPagination {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

const DEFAULT_PAGINATION: CompaniesPagination = {
  total: 0,
  totalPages: 1,
  page: 1,
  limit: ITEMS_PER_PAGE,
};

interface RawCompany {
  id: string | number;
  name: string;
  email?: string;
  adminEmail?: string;
  phone: string | null;
  domain: string | null;
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

type Status = "ACTIVE" | "SUSPENDED";

type Plan = "Starter" | "Basic" | "Pro" | "Enterprise";

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  domain: string;
  businessId: string;
  status: Status;
  plan: Plan;
  users: number;
  mrr: number;
  end: string;
  creditBalance: string;
  createdAt: string;
  apiKey: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────




function normaliseStatus(raw: string): Status {
  const map: Record<string, Status> = {
    active: "ACTIVE",
    suspend: "SUSPENDED",
    suspended: "SUSPENDED",
  };

  return map[raw?.toLowerCase()] ?? "ACTIVE";
}
function getCompanyInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "CO"
  );
}
function enrichCompany(raw: RawCompany): Company {
  const email = raw.email || raw.adminEmail || "";

  return {
    id: String(raw.id),
    name: raw.name || "Unnamed",
    email,
    phone: raw.phone || "—",
    domain: raw.domain || email.split("@")[1] || "—",
    businessId: raw.business_id || "",
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

function getApiError(error: any, fallback: string) {
  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ERROR BANNER
// ─────────────────────────────────────────────────────────────────────────────

function ErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="mc-error-banner" role="alert">
      <AlertCircle size={18} className="mc-error-banner__icon" />

      <span className="mc-error-banner__text">{message}</span>

      <button
        type="button"
        className="mc-error-banner__close"
        onClick={onDismiss}
        aria-label="Dismiss error"
      >
        ×
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<Status, string> = {
  ACTIVE: "#10b981",
  SUSPENDED: "#ef4444",
};

const STATUS_DOT_COLORS: Record<Status, string> = {
  ACTIVE: "#10b981", // green
  SUSPENDED: "#ef4444", // red

};

function Badge({ status }: { status: Status }) {
  return (
    <span className={`mc-badge mc-badge--${status}`}>
      <span className="mc-badge__dot" />

      {status[0] + status.slice(1).toLowerCase()}
    </span>
  );
}



// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────────────────────

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

  return (
    <div className="mc-pagination">
      <div className="mc-pagination__info">
        Showing <strong>{startItem}</strong>–<strong>{endItem}</strong> of{" "}
        <strong>{totalItems}</strong> companies
      </div>

      <div className="mc-pagination__btns">
        <button
          type="button"
          className="mc-pagination__btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          ‹ Prev
        </button>

        {pages.map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="mc-pagination__ellipsis">
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`mc-pagination__btn ${
                page === currentPage ? "mc-pagination__btn--active" : ""
              }`}
            >
              {page}
            </button>
          ),
        )}

        <button
          type="button"
          className="mc-pagination__btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next ›
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI
// ─────────────────────────────────────────────────────────────────────────────

function KPI({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  color: string;
}) {
  return (
    <div className="mc-kpi">
      <div
        className="mc-kpi__icon"
        style={{ background: `${color}1f`, color }}
      >
        {icon}
      </div>

      <div className="mc-kpi__info">
        <span className="mc-kpi__label">{label}</span>
        <span className="mc-kpi__value">{value}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PHONE INPUT STYLES
// ─────────────────────────────────────────────────────────────────────────────

const phoneInputStyle: CSSProperties = {
  width: "100%",
  height: "48px",
  background: "#12182b",
  color: "#fff",
  border: "1px solid #2c3657",
  borderRadius: "10px",
  paddingLeft: "55px",
};

const phoneButtonStyle: CSSProperties = {
  background: "#12182b",
  border: "1px solid #2c3657",
  borderRadius: "10px 0 0 10px",
};

const phoneDropdownStyle: CSSProperties = {
  background: "#1b2338",
  color: "#fff",
  border: "1px solid #2c3657",
  maxHeight: "250px",
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPANY MODAL
// ─────────────────────────────────────────────────────────────────────────────

function CompanyModal({
  company,
  onClose,
  onSuccess,
}: {
  company: Company;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(company.name || "");
  const [email, setEmail] = useState(company.email || "");
  const [phone, setPhone] = useState(
    company.phone === "—" ? "" : company.phone || "",
  );

  const [businessId, setBusinessId] = useState(company.businessId || "");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErr(null);

    if (!name.trim()) {
      setErr("Company name is required.");
      return;
    }

    if (!email.trim()) {
      setErr("Company email is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setErr("Please enter a valid email address.");
      return;
    }

    if (!phone.trim()) {
      setErr("Company phone is required.");
      return;
    }

    if (phone.replace(/\D/g, "").length < 10) {
      setErr("Please enter a valid company phone number.");
      return;
    }

    if (!businessId.trim()) {
      setErr("Business ID is required.");
      return;
    }

    if (!reason.trim()) {
      setErr("Reason is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        business_id: businessId.trim(),
        reason: reason.trim(),
      };

      console.log("EDIT COMPANY PAYLOAD =>", payload);

      const response = await axiosInstance.patch(
        `/v1/super-admin/companies/${company.id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = response.data;

      console.log("EDIT COMPANY RESPONSE =>", data);

      if (!data?.success) {
        setErr(
          data?.error?.message || data?.message || "Failed to update company.",
        );
        return;
      }

      toast.success("Company updated successfully");

      await onSuccess();
      onClose();
    } catch (error: any) {
      console.error("EDIT COMPANY ERROR =>", error);

      setErr(
        error?.response?.data?.message ||
          error?.response?.data?.error?.message ||
          error?.message ||
          "Failed to update company.",
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
            <div className="mc-modal__title">Edit Company</div>

            <div className="mc-modal__sub">Update {company.name}</div>
          </div>

          <button className="mc-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="mc-modal__body">
          {err && <ErrorBanner message={err} onDismiss={() => setErr(null)} />}

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
            <div className="mc-field__label">COMPANY EMAIL *</div>

            <input
              className="mc-input"
              type="email"
              placeholder="company@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mc-field">
            <div className="mc-field__label">COMPANY PHONE *</div>

            <PhoneInput
              country="in"
              value={phone}
              onChange={(value) => setPhone(value)}
              enableSearch
              searchPlaceholder="Search country..."
              placeholder="Enter phone number"
              isValid={(value) => value.replace(/\D/g, "").length >= 10}
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
            <div className="mc-field__label">BUSINESS ID *</div>

            <input
              className="mc-input"
              placeholder="BUSINESS123"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
            />
          </div>

          <div className="mc-field">
            <div className="mc-field__label">REASON *</div>

            <textarea
              className="mc-input"
              placeholder="Company profile updated"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              style={{
                resize: "vertical",
                minHeight: "100px",
              }}
            />
          </div>

          <div className="mc-modal__divider" />

          <div className="mc-modal__actions">
            <button
              type="button"
              className="mc-btn mc-btn--primary"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Changes"}
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

// ─────────────────────────────────────────────────────────────────────────────
// COMPANY DETAIL MODAL
// ─────────────────────────────────────────────────────────────────────────────

function CompanyDetailModal({
  company,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  company: Company;
  onClose: () => void;
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: "ACTIVE" | "SUSPENDED") => void;
}) {
  return (
    <div className="mc-modal-overlay">
      <div className="mc-modal mc-detail" onClick={(e) => e.stopPropagation()}>
        <div className="mc-detail__header">
          <div
            style={{
              display: "flex",
              gap: 14,
              alignItems: "center",
            }}
          >
            <div
              className="mc-detail__logo"
              style={{
                background: "#e8f5ef",
                color: "#278b67",
                width: 52,
                height: 52,
              }}
            >
              {getCompanyInitials(company.name)}
            </div>

            <div>
              <div className="mc-detail__domain">{company.email}</div>

              <div style={{ marginTop: 6 }}>
                <Badge status={company.status} />
              </div>
            </div>
          </div>

          <button type="button" className="mc-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="mc-detail__divider" />

        <div className="mc-detail__metrics">
          {(
            [
              ["Domain", company.domain, "var(--mc-accent2)"],
              ["Phone", company.phone, "var(--mc-success)"],
              ["Business ID", company.businessId || "—", "var(--mc-accent2)"],
              ["Credit Balance", `₹${company.creditBalance}`, "var(--mc-warn)"],
              ["Member Since", company.createdAt, "var(--mc-accent2)"],
            ] as [string, string, string][]
          ).map(([label, value, color]) => (
            <div key={label} className="mc-detail__cell">
              <div className="mc-detail__cell-key">{label.toUpperCase()}</div>

              <div className="mc-detail__cell-val" style={{ color }}>
                {value}
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
            type="button"
            className="mc-btn mc-btn--primary"
            onClick={() => {
              onClose();
              onEdit(company);
            }}
          >
            ✏️ Edit Company
          </button>

          <button
            type="button"
            className="mc-btn mc-btn--ghost"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
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
              type="button"
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
              type="button"
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

// ─────────────────────────────────────────────────────────────────────────────
// ADD CREDIT MODAL
// ─────────────────────────────────────────────────────────────────────────────

function AddCreditModal({
  company,
  onClose,
  onSuccess,
}: {
  company: Company;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Top-up credits");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleAddCredit = async () => {
    setErr(null);

    const numAmount = Number(amount);

    if (!amount.trim() || Number.isNaN(numAmount)) {
      setErr("Please enter a valid amount.");
      return;
    }

    if (numAmount <= 0) {
      setErr("Amount must be greater than 0.");
      return;
    }

    try {
      setLoading(true);

      const requestId = crypto.randomUUID();

      const response = await axiosInstance.post(
        `/v1/super-admin/companies/${company.id}/credits`,
        {
          amount: numAmount,
          request_id: requestId,
          reason: description.trim() || "Top-up credits",
        },
      );

      const data = response.data;

      if (!data?.success) {
        setErr(
          data?.message || data?.error?.message || "Failed to add credit.",
        );
        return;
      }

      toast.success("Credit added successfully");

      await onSuccess();
      onClose();
    } catch (error: any) {
      console.error("ADD CREDIT ERROR =>", error);

      setErr(getApiError(error, "Failed to add credit"));
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

            <div className="mc-modal__sub">Top up {company.name}'s balance</div>
          </div>

          <button type="button" className="mc-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="mc-modal__body">
          {err && <ErrorBanner message={err} onDismiss={() => setErr(null)} />}

          <div className="mc-field">
            <div className="mc-field__label">COMPANY</div>

            <input className="mc-input" value={company.name} disabled />
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
              className="mc-input"
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setErr(null);
              }}
            />
          </div>

          <div className="mc-field">
            <div className="mc-field__label">DESCRIPTION</div>

            <input
              className="mc-input"
              type="text"
              placeholder="e.g. Top-up credits"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErr(null);
              }}
            />
          </div>

          <div className="mc-modal__divider" />

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
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ManageCompanies() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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

  const [pagination, setPagination] =
    useState<CompaniesPagination>(DEFAULT_PAGINATION);

  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [search]);
  // ─────────────────────────────────────────────────────────────────────────
  // FETCH COMPANIES
  // ─────────────────────────────────────────────────────────────────────────

  const fetchCompanies = async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      if (filter !== "ALL") {
        params.status = filter.toLowerCase();
      }

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const companiesRes = await axiosInstance.get(COMPANIES_API, {
        params,
      });

      console.log("GET COMPANY RESPONSE =>", companiesRes.data);

      const payload = companiesRes.data?.data;

      const raw: RawCompany[] = Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : [];

      const backendPagination = payload?.pagination ?? {};

      const total = Number(
        backendPagination.total ??
          backendPagination.totalCompanies ??
          backendPagination.count ??
          0,
      );

      const page = Number(backendPagination.page ?? currentPage);

      const limit = Number(backendPagination.limit ?? ITEMS_PER_PAGE);

      const totalPages = Number(
        backendPagination.totalPages ??
          backendPagination.total_pages ??
          Math.max(1, Math.ceil(total / limit)),
      );

      setCompanies(raw.map(enrichCompany));

      setPagination({
        total,
        totalPages: Math.max(1, totalPages),
        page,
        limit,
      });

      setSelectedCompanies([]);
      setSelectAll(false);
    } catch (error: any) {
      console.error("FETCH COMPANIES ERROR =>", error);

      setFetchError(getApiError(error, "Failed to load companies"));

      setCompanies([]);

      setPagination({
        ...DEFAULT_PAGINATION,
        page: currentPage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [filter, currentPage, debouncedSearch]);

  // ─────────────────────────────────────────────────────────────────────────
  // SEARCH / FILTER
  // ─────────────────────────────────────────────────────────────────────────

  const FILTERS: ("ALL" | Status)[] = ["ALL", "ACTIVE", "SUSPENDED"];

  const totalPages = Math.max(1, pagination.totalPages);

  const safePage = Math.min(currentPage, totalPages);

  const paginatedCompanies = companies;

  // ─────────────────────────────────────────────────────────────────────────
  // SELECTION
  // ─────────────────────────────────────────────────────────────────────────

  const handleSelectCompany = (companyId: string) => {
    setSelectedCompanies((previous) =>
      previous.includes(companyId)
        ? previous.filter((id) => id !== companyId)
        : [...previous, companyId],
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(companies.map((company) => company.id));
    }

    setSelectAll(!selectAll);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // BULK DELETE
  // ─────────────────────────────────────────────────────────────────────────

  const handleBulkDelete = async () => {
    if (selectedCompanies.length === 0) {
      return;
    }

    const result = await Swal.fire({
      title: "Delete Selected Companies?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await Promise.all(
        selectedCompanies.map((id) =>
          axiosInstance.delete(`/v1/super-admin/companies/${id}`),
        ),
      );

      setSelectedCompanies([]);
      setSelectAll(false);

      toast.success(
        `${selectedCompanies.length} companies deleted successfully`,
      );

      await fetchCompanies();
    } catch (error: any) {
      console.error("BULK DELETE ERROR =>", error);

      toast.error(getApiError(error, "Failed to delete selected companies"));
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE
  // ─────────────────────────────────────────────────────────────────────────

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

    if (!result.isConfirmed) {
      return;
    }

    try {
      const endpoint = `/v1/super-admin/companies/${companyId}`;

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

      toast.error(getApiError(error, "Failed to delete company"));
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STATUS
  // ─────────────────────────────────────────────────────────────────────────

  const handleStatusChange = async (
    companyId: string,
    newStatus: "ACTIVE" | "SUSPENDED",
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

    if (!result.isConfirmed) {
      return;
    }

    try {
      const endpoint = `/v1/super-admin/companies/${companyId}/status`;

      const { data } = await axiosInstance.patch(endpoint, {
        status: newStatus === "ACTIVE" ? "active" : "suspended",

        reason: newStatus === "ACTIVE" ? "Review completed" : "Account review",
      });

      console.log("STATUS RESPONSE =>", data);

      if (data?.success) {
        toast.success(
          newStatus === "SUSPENDED"
            ? "Company suspended successfully"
            : "Company activated successfully",
        );

        await fetchCompanies();
      } else {
        toast.error(data?.message || "Failed to update company status");
      }
    } catch (error: any) {
      console.error("STATUS ERROR =>", error);

      toast.error(getApiError(error, "Failed to update company status"));
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // MODAL HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  const openEdit = (company: Company) => {
    setEditTarget(company);
    setShowModal(true);
  };

  const openView = (company: Company) => {
    setViewTarget(company);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

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

        <button
          className="mc-btn mc-btn--primary"
          onClick={() => router.push("/user/manage-companies/create")}
        >
          Create Company
        </button>
      </div>

      {/* STATS */}

      <div className="mc-kpi-grid">
        <KPI
          label="Total Companies"
          value={String(pagination.total)}
          icon={<Building2 size={18} />}
          color="#0891b2"
        />

        <KPI
          label="Active Companies"
          value={String(
            companies.filter((company) => company.status === "ACTIVE").length,
          )}
          icon={<CheckCircle2 size={18} />}
          color="#10b981"
        />

        <KPI
          label="Suspended Companies"
          value={String(
            companies.filter((company) => company.status === "SUSPENDED")
              .length,
          )}
          icon={<Ban size={18} />}
          color="#ef4444"
        />
      </div>

      {/* FILTER BAR */}

      <div className="mc-filter-bar mc-filter-bar-top">
        <div className="mc-search-wrap mc-search-wrap-small">
          <span className="mc-search-icon">
            <Search size={15} />
          </span>

          <input
            className="mc-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone…"
            autoComplete="off"
          />
        </div>

        <div className="mc-filter-group">
          {FILTERS.map((filterValue) => (
            <button
              type="button"
              key={filterValue}
              onClick={() => {
                setFilter(filterValue);
                setCurrentPage(1);
              }}
              className={`mc-filter-btn ${
                filter === filterValue ? "mc-filter-btn--active" : ""
              }`}
            >
              {filterValue === "ALL"
                ? "All"
                : filterValue[0] + filterValue.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="mc-bulk-actions">
          {selectedCompanies.length > 0 && (
            <button
              type="button"
              className="mc-delete-selected"
              onClick={handleBulkDelete}
            >
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

          <span className="mc-filter-count">{pagination.total} companies</span>
        </div>
      </div>

      {/* TABLE */}

      {loading ? (
        <div className="mc-empty">Loading companies…</div>
      ) : fetchError ? (
        <div className="mc-empty">⚠️ {fetchError}</div>
      ) : companies.length === 0 ? (
        <div className="mc-empty">
          No companies found. Start by adding one 🚀
        </div>
      ) : (
        <div className="mc-table-wrapper">
          <table className="mc-table">
            <thead>
              <tr>
                <th className="mc-th-check">
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

                <th style={{ textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {paginatedCompanies.map((company) => (
                <tr key={company.id}>
                  <td className="mc-td-check">
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
                        style={{ background: getAvatarBg(company.name) }}
                      >
                        {company.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="mc-company-info">
                        <button
                          type="button"
                          className="company-name-link"
                          title={company.name}
                          onClick={() =>
                            router.push(`/user/manage-companies/${company.id}`)
                          }
                        >
                          {company.name}
                        </button>

                        <div className="mc-company-status">
                          <Badge status={company.status} />
                        </div>
                      </div>
                    </div>
                  </td>

                  <td title={company.email}>{company.email || "—"}</td>

                  <td>{company.phone || "—"}</td>

                  <td>
                    <span className="mc-credit-badge">
                      ₹{Number(company.creditBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </td>

                  <td>
                    <div className="mc-actions">
                      <button
                        type="button"
                        className="mc-action-btn"
                        onClick={() =>
                          router.push(`/user/manage-companies/${company.id}`)
                        }
                        title="View Details"
                        aria-label="View company"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        type="button"
                        className="mc-action-btn"
                        onClick={() => openEdit(company)}
                        title="Edit Company"
                        aria-label="Edit company"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        className="mc-action-btn credit"
                        onClick={() => setCreditCompany(company)}
                        title="Add Credit"
                        aria-label="Add credit"
                      >
                        <Wallet size={15} />
                      </button>

                      <button
                        type="button"
                        className="mc-action-btn delete"
                        onClick={() => handleDelete(company.id)}
                        title="Delete Company"
                        aria-label="Delete company"
                      >
                        <Trash2 size={15} />
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

      {!loading && !fetchError && pagination.total > 0 && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={pagination.total}
          pageSize={ITEMS_PER_PAGE}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      {/* CREATE / EDIT MODAL */}

      {showModal && editTarget && (
        <CompanyModal
          company={editTarget}
          onClose={() => {
            setShowModal(false);
            setEditTarget(null);
          }}
          onSuccess={async () => {
            await fetchCompanies();
          }}
        />
      )}

      {/* DETAIL MODAL */}

      {viewTarget && (
        <CompanyDetailModal
          company={viewTarget}
          onClose={() => setViewTarget(null)}
          onEdit={(company) => {
            setViewTarget(null);
            openEdit(company);
          }}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* CREDIT MODAL */}

      {creditCompany && (
        <AddCreditModal
          company={creditCompany}
          onClose={() => setCreditCompany(null)}
          onSuccess={async () => {
            await fetchCompanies();
          }}
        />
      )}

      {/* TOAST */}

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

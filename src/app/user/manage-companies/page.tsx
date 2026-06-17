"use client";

import { useState, useEffect } from "react";
import "./manage-companies.css";
import { axiosInstance } from "@/lib/axiosInstance";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const COMPANIES_API = "/v1/admin/companies";

// ─── TYPES ────────────────────────────────────────────────────────────────────
// Raw shape returned by the API
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

// Enriched shape used in UI
type Status = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "TRIAL";
type Plan   = "Starter" | "Basic" | "Pro" | "Enterprise";

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  domain: string;
  logo: string;      
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
    active: "ACTIVE", inactive: "INACTIVE",
    suspended: "SUSPENDED", trial: "TRIAL",
  };
  return map[raw?.toLowerCase()] ?? "ACTIVE";
}

function enrichCompany(raw: RawCompany): Company {
  const email = raw.email || raw.adminEmail || "";

  return {
    id:            String(raw.id),
    name:          raw.name || "Unnamed",
    email,
    phone:         raw.phone || "—",
    domain:        raw.domain || email.split("@")[1] || "—",
    logo:          (raw.name || "??").slice(0, 2).toUpperCase(),
    col:           avatarColor(String(raw.id)),
    status:        normaliseStatus(raw.status),
    plan:          "Starter",      
    users:         0,             
    mrr:           0,            
    end:           "N/A",
    creditBalance: raw.credit_balance ?? "0.00",
    createdAt:     raw.created_at
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

// ─── ADD / EDIT MODAL ─────────────────────────────────────────────────────────
function CompanyModal({
  company, onClose, onSuccess,
}: {
  company: Company | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name,     setName]     = useState(company?.name   || "");
  const [email,    setEmail]    = useState(company?.email  || "");
  const [phone,    setPhone]    = useState(company?.phone === "—" ? "" : company?.phone || "");
  const [password, setPassword] = useState("");
  const [status,   setStatus]   = useState<Status>(company?.status || "ACTIVE");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState<string | null>(null);


  // Reset when target changes
  useEffect(() => {
    setName(company?.name   || "");
    setEmail(company?.email || "");
    setPhone(company?.phone === "—" ? "" : company?.phone || "");
    setPassword("");
    setStatus(company?.status || "ACTIVE");
    setLogoFile(null);
    setLogoPreview(null);
    setErr(null);
  }, [company]);

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

  if (!name.trim()) {
    return setErr("Company name is required.");
  }

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

  return (
    <div className="mc-modal-overlay" onClick={onClose}>
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
          <button className="mc-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="mc-modal__body">
          {err && (
            <div className="mc-error-banner">⚠️ {err}</div>
          )}

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

          <div className="mc-modal__divider" />
          <div className="mc-modal__actions">
            <button
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
  company, onClose, onEdit, onDelete, onStatusChange,
}: {
  company: Company;
  onClose: () => void;
  onEdit: (c: Company) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: "ACTIVE" | "SUSPENDED") => void;
}) {
  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div className="mc-modal mc-detail" onClick={(e) => e.stopPropagation()}>
        <div className="mc-detail__header">
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div
              className="mc-detail__logo"
              style={{
                background: company.col,
                width: 52, height: 52,
                boxShadow: `0 6px 20px ${company.col}60`,
              }}
            >
              {company.logo}
            </div>
            <div>
              <div className="mc-detail__name">{company.name}</div>
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
            ["Domain",         company.domain,       "var(--mc-accent2)"],
            ["Phone",          company.phone,         "var(--mc-success)"],
            ["Credit Balance", `₹${company.creditBalance}`, "var(--mc-warn)"],
            ["Member Since",   company.createdAt,     "var(--mc-accent2)"],
          ] as [string, string, string][]).map(([l, v, c]) => (
            <div key={l} className="mc-detail__cell">
              <div className="mc-detail__cell-key">{l.toUpperCase()}</div>
              <div className="mc-detail__cell-val" style={{ color: c }}>{v}</div>
            </div>
          ))}
        </div>

        {company.apiKey && (
          <div className="mc-quickstat">
            <div className="mc-quickstat__lbl">API KEY</div>
            <div
              className="mc-quickstat__row"
              style={{ fontSize: 11, wordBreak: "break-all", color: "var(--mc-muted)", padding: "8px 0" }}
            >
              {company.apiKey.slice(0, 32)}…
            </div>
          </div>
        )}

        <div className="mc-detail__actions">
          <button
            className="mc-btn mc-btn--primary"
            onClick={() => { onClose(); onEdit(company); }}
          >
            ✏️ Edit Company
          </button>
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
        </div>
      </div>
    </div>
  );
}

// ─── COMPANY CARD ─────────────────────────────────────────────────────────────
function CompanyCard({
  company, onEdit, onView, onDelete, onStatusChange,
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
          ["EMAIL",   company.email,                              "📧"],
          ["PHONE",   company.phone,                              "📞"],
          ["CREDIT",  `₹${company.creditBalance}`,               "💰"],
          ["JOINED",  company.createdAt,                         "📅"],
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
          ✏️ Edit
        </button>
        <button
          className="mc-btn mc-btn--ghost mc-btn--small"
          onClick={(e) => { e.stopPropagation(); onView(company); }}
        >
          👁 View
        </button>
        <button
          className="mc-btn mc-btn--danger mc-btn--small"
          onClick={(e) => { e.stopPropagation(); onDelete(company.id); }}
        >
          🗑️ Delete
        </button>
        {company.status !== "SUSPENDED"
          ? <button className="mc-btn mc-btn--danger mc-btn--small" onClick={(e) => { e.stopPropagation(); onStatusChange(company.id, "SUSPENDED"); }}>⛔ Suspend</button>
          : <button className="mc-btn mc-btn--ghost  mc-btn--small" onClick={(e) => { e.stopPropagation(); onStatusChange(company.id, "ACTIVE"); }}>✅ Restore</button>
        }
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function ManageCompanies() {
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState<"ALL" | Status>("ALL");
  const [showModal,  setShowModal]  = useState(false);
  const [editTarget, setEditTarget] = useState<Company | null>(null);
  const [viewTarget, setViewTarget] = useState<Company | null>(null);
  const [companies,  setCompanies]  = useState<Company[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data: json } = await axiosInstance.get(COMPANIES_API);

      // Response shape: { success, message, data: [...], meta }
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
    const searchable = [c.name, c.email, emailDomain, c.domain].join(" ").toLowerCase();

    return (filter === "ALL" || c.status === filter) && (!query || searchable.includes(query));
  });

  const openAdd  = ()            => { setEditTarget(null); setShowModal(true); };
  const openEdit = (c: Company)  => { setEditTarget(c);    setShowModal(true); };
  const openView = (c: Company)  => setViewTarget(c);

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
        <button className="mc-btn mc-btn--primary" onClick={openAdd}>
          Create Company
        </button>
      </div>

      {/* KPIs */}
      <div className="mc-kpi-grid">
        <KPI label="Total Companies" value={String(companies.length)}                                     icon="🏢" color="#6C5CE7" />
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
        <span className="mc-filter-count">{filtered.length} companies</span>
      </div>

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
            <CompanyCard key={c.id} company={c} onEdit={openEdit} onView={openView} onDelete={handleDelete} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      {/* MODALS */}
      {showModal && (
        <CompanyModal
          company={editTarget}
          onClose={() => setShowModal(false)}
          onSuccess={fetchCompanies}
        />
      )}
      {viewTarget && (
        <CompanyDetailModal
          company={viewTarget}
          onClose={() => setViewTarget(null)}
          onEdit={(c) => { setViewTarget(null); openEdit(c); }}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

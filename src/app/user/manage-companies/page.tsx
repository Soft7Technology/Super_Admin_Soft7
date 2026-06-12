"use client";

import { useState, useEffect } from "react";
import "./manage-companies.css";
import { axiosInstance } from "@/lib/axiosInstance";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const COMPANIES_API = "/v1/admin/companies";

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
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState<string | null>(null);

  useEffect(() => {
    setName(company?.name   || "");
    setEmail(company?.email || "");
    setPhone(company?.phone === "—" ? "" : company?.phone || "");
    setPassword("");
    setStatus(company?.status || "ACTIVE");
    setErr(null);
  }, [company]);

  const handleSubmit = async () => {
    setErr(null);
    if (!name.trim())  return setErr("Company name is required.");
    if (!email.trim()) return setErr("Email is required.");
    if (!company && !password.trim()) return setErr("Password is required.");

    setSaving(true);
    try {
      const isEdit = !!company;
      const url = isEdit ? `${COMPANIES_API}/${company.id}` : COMPANIES_API;

      let body: any = {};
      body = {
        name,
        email,
        user: { name, email, phone, password },
      };

      console.log("REQUEST BODY =>", body);
      const { data } = await axiosInstance.request({
        url,
        method: isEdit ? "PUT" : "POST",
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
          <button
            className="mc-btn mc-btn--primary"
            onClick={() => { onClose(); onEdit(company); }}
          >
            ✏️ Edit 
          </button>
          <button className="mc-btn mc-btn--ghost" onClick={onClose}>
            Close
          </button>
          {company.status !== "SUSPENDED"
            ? <button className="mc-btn mc-btn--danger" onClick={onClose}>⛔ Suspend</button>
            : <button className="mc-btn mc-btn--ghost"  onClick={onClose}>✅ Restore</button>
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
  const [showModal,     setShowModal]      = useState(false);
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

  const openAdd  = ()           => { setEditTarget(null); setShowModal(true); };
  const openEdit = (c: Company) => { setEditTarget(c);    setShowModal(true); };
  const openView = (c: Company) => setViewTarget(c);

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

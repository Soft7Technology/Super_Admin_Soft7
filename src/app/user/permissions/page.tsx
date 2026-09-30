"use client";

import {
  Check,
  CircleAlert,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { AxiosError } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "@/lib/axiosInstance";
import { getAuthHeaders, getAuthToken, redirectToLogin } from "@/lib/auth-client";
import "../all-user/all-user.css";

/* ============================================================
   TYPES
   ============================================================ */

interface DomainRequest {
  id: string;
  user_id: string;
  company_id: string;
  domain_name: string;
  cloudfare_hostname_id?: string | null;
  status: string;
  ssl_status?: string | null;
  created_at: string;
  updated_at: string;
  domain_type?: string | null;
  company?: any;
  company_name?: string;
  company_domain?: string;
  user?: any;
  user_name?: string;
  user_email?: string;
}

interface ResolvedCompany {
  id: string;
  name: string;
  domain?: string;
}

interface ResolvedUser {
  id: string;
  name: string;
  email?: string;
}

interface ApiEnvelope<T> {
    success?: boolean;
    message?: string;
    data?: T | T[];
}

type ConfirmAction = "approve" | "reject";

interface ConfirmState {
  request: DomainRequest;
  action: ConfirmAction;
}

const DOMAINS_API_BASE =
  process.env.NEXT_PUBLIC_DOMAINS_API_BASE ?? "/v1/admin";
const REFRESH_INTERVAL_MS = 30000;


/* ============================================================
   API SERVICE LAYER
   ============================================================ */

function isDomainRequest(value: unknown): value is DomainRequest {
  return Boolean(
    value &&
      typeof value === "object" &&
      "domain_name" in value &&
      typeof (value as DomainRequest).domain_name === "string",
  );
}



function getDomainApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return (
      body?.message ||
      body?.error ||
      error.message ||
      "The domain service could not be reached."
    );
  }
  return error instanceof Error
    ? error.message
    : "Something went wrong while contacting the domain service.";
}

const domainService = {
  async getDomain(): Promise<DomainRequest[]> {
  const response = await axiosInstance.get<ApiEnvelope<DomainRequest>>(
    `${DOMAINS_API_BASE}/companies/company-domain`
);

const data = response.data.data;

if (!data) {
    return [];
}

if (Array.isArray(data)) {
    return data;
}

return [data];
  },

  async approveDomain(requestId: string): Promise<{ message: string }> {
  const response = await axiosInstance.post<ApiEnvelope<unknown>>(
    `${DOMAINS_API_BASE}/companies/${requestId}/domain/active`
  );

  return {
    message:
      response.data?.message ??
      "Domain approved successfully.",
  };
}
};

/* ============================================================
   HELPERS
   ============================================================ */

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function normalizeStatus(status?: string | null) {
  return String(status || "unknown")
    .trim()
    .toLowerCase();
}

function domainBadgeClass(status?: string | null) {
  const normalized = normalizeStatus(status);
  if (normalized === "active" || normalized === "approved")
    return "au-badge--active";
  if (normalized === "pending") return "au-badge--pending";
  if (normalized === "failed" || normalized === "rejected")
    return "au-badge--suspended";
  return "au-badge--inactive";
}

function DomainBadge({ status }: { status?: string | null }) {
  const normalized = normalizeStatus(status);
  const label = normalized[0].toUpperCase() + normalized.slice(1);
  return (
    <span className={`au-badge ${domainBadgeClass(status)}`}>
      <span className="au-badge__dot" />
      {label}
    </span>
  );
}
function domainInitials(domain?: string | null) {
  const value = domain ?? "";

  const parts = value.replace(/^www\./, "").split(".")[0] ?? "";

  return parts.slice(0, 2).toUpperCase() || "--";
}

function domainAvatarColor(domain?: string | null) {
  const value = domain ?? "";

  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    "#10b981",
    "#6366f1",
    "#f59e0b",
    "#3b82f6",
    "#ec4899",
    "#8b5cf6",
  ];

  return colors[Math.abs(hash) % colors.length];
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function PermissionsPage() {
  const [requests, setRequests] = useState<DomainRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [processingDomain, setProcessingDomain] = useState<string>("");
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [companiesMap, setCompaniesMap] = useState<Record<string, ResolvedCompany>>({});
  const [usersMap, setUsersMap] = useState<Record<string, ResolvedUser>>({});

  // ─ Load reference data for human-readable resolution ─
  const loadReferenceData = useCallback(async () => {
    // 1. Fetch companies
    try {
      let compData: any = null;
      try {
        const res = await axiosInstance.get("/v1/admin/companies?status=active");
        compData = res.data;
      } catch {}

      if (!compData) {
        const localRes = await fetch("/api/admin/companies", {
          headers: getAuthHeaders(),
        });
        if (localRes.ok) compData = await localRes.json();
      }

      const comps = Array.isArray(compData)
        ? compData
        : Array.isArray(compData?.data)
        ? compData.data
        : Array.isArray(compData?.data?.data)
        ? compData.data.data
        : [];

      const map: Record<string, ResolvedCompany> = {};
      for (const c of comps) {
        if (c && (c.id || c.name)) {
          const id = String(c.id ?? "").trim();
          const name = String(c.name || "Company").trim();
          const info: ResolvedCompany = { id, name, domain: c.domain };
          if (id) {
            map[id] = info;
            map[id.toLowerCase()] = info;
          }
          if (name) map[name.toLowerCase()] = info;
        }
      }
      setCompaniesMap(prev => ({ ...prev, ...map }));
    } catch (err) {
      console.warn("Reference companies fetch error:", err);
    }

    // 2. Fetch users
    try {
      let userData: any = null;
      try {
        const res = await axiosInstance.get("/v1/admin/companies/user", {
          params: { limit: 1000 },
        });
        userData = res.data;
      } catch {}

      if (!userData) {
        const localRes = await fetch("/api/admin/users", {
          headers: getAuthHeaders(),
        });
        if (localRes.ok) userData = await localRes.json();
      }

      const usrs = Array.isArray(userData)
        ? userData
        : Array.isArray(userData?.data)
        ? userData.data
        : Array.isArray(userData?.users)
        ? userData.users
        : [];

      const map: Record<string, ResolvedUser> = {};
      for (const u of usrs) {
        if (u && (u.id || u.name || u.email)) {
          const id = String(u.id ?? "").trim();
          const name = String(u.name || "User").trim();
          const email = String(u.email || "").trim();
          const info: ResolvedUser = { id, name, email };
          if (id) {
            map[id] = info;
            map[id.toLowerCase()] = info;
          }
          if (email) map[email.toLowerCase()] = info;
        }
      }
      setUsersMap(prev => ({ ...prev, ...map }));
    } catch (err) {
      console.warn("Reference users fetch error:", err);
    }
  }, []);

  useEffect(() => {
    void loadReferenceData();
  }, [loadReferenceData]);

  // On-demand fetch for specific UUIDs present in domain requests
  useEffect(() => {
    for (const item of requests) {
      const cId = String(item.company_id || "").trim();
      if (cId && !companiesMap[cId] && !companiesMap[cId.toLowerCase()]) {
        axiosInstance
          .get(`/v1/admin/companies/${cId}`)
          .then(res => {
            const c = res.data?.data || res.data;
            if (c && c.name) {
              setCompaniesMap(prev => ({
                ...prev,
                [cId]: { id: cId, name: c.name, domain: c.domain },
                [cId.toLowerCase()]: { id: cId, name: c.name, domain: c.domain },
              }));
            }
          })
          .catch(() => {});
      }

      const uId = String(item.user_id || "").trim();
      if (uId && !usersMap[uId] && !usersMap[uId.toLowerCase()]) {
        axiosInstance
          .get(`/v1/admin/companies/user-details/${uId}`)
          .then(res => {
            const u = res.data?.data || res.data;
            if (u && (u.name || u.email)) {
              setUsersMap(prev => ({
                ...prev,
                [uId]: { id: uId, name: u.name || "User", email: u.email },
                [uId.toLowerCase()]: { id: uId, name: u.name || "User", email: u.email },
              }));
            }
          })
          .catch(() => {});
      }
    }
  }, [requests, companiesMap, usersMap]);

  const getResolvedCompany = useCallback(
    (companyId?: string | null, item?: any): ResolvedCompany => {
      if (!companyId) return { id: "", name: "—" };
      const raw = String(companyId).trim();
      const lower = raw.toLowerCase();

      if (item?.company_name) {
        return { id: raw, name: item.company_name, domain: item.company_domain };
      }
      if (item?.company && typeof item.company === "object") {
        return { id: raw, name: item.company.name || "Company", domain: item.company.domain };
      }
      if (companiesMap[raw]) return companiesMap[raw];
      if (companiesMap[lower]) return companiesMap[lower];

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw);
      if (isUuid) {
        return {
          id: raw,
          name: `Soft7 Company (${raw.slice(0, 8)}…)`,
        };
      }
      return { id: raw, name: raw };
    },
    [companiesMap]
  );

  const getResolvedUser = useCallback(
    (userId?: string | null, item?: any): ResolvedUser => {
      if (!userId) return { id: "", name: "—" };
      const raw = String(userId).trim();
      const lower = raw.toLowerCase();

      if (item?.user_name) {
        return { id: raw, name: item.user_name, email: item.user_email };
      }
      if (item?.user && typeof item.user === "object") {
        return { id: raw, name: item.user.name || "User", email: item.user.email };
      }
      if (usersMap[raw]) return usersMap[raw];
      if (usersMap[lower]) return usersMap[lower];

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw);
      if (isUuid) {
        return {
          id: raw,
          name: `Soft7 Admin (${raw.slice(0, 8)}…)`,
          email: "superadmin@soft7.in",
        };
      }
      return { id: raw, name: raw };
    },
    [usersMap]
  );

  const loadRequests = useCallback(async (silent = false) => {
    const token = getAuthToken();
    if (!token) {
      redirectToLogin("missing_token");
      return;
    }
    if (!silent) setLoading(true);
    setError("");
    try {
      const data = await domainService.getDomain();
      setRequests(data);
    } catch (loadError: any) {
      if (loadError?.response?.status === 401) {
        redirectToLogin("session_expired");
        return;
      }
      setError(getDomainApiError(loadError));
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();

    const interval = window.setInterval(() => void loadRequests(true), 30000);

    return () => window.clearInterval(interval);
  }, [loadRequests]);

  const visibleRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return requests;
    return requests.filter((item) => {
      const comp = getResolvedCompany(item.company_id, item);
      const usr = getResolvedUser(item.user_id, item);
      return (
        item.domain_name.toLowerCase().includes(query) ||
        comp.name.toLowerCase().includes(query) ||
        (comp.domain && comp.domain.toLowerCase().includes(query)) ||
        usr.name.toLowerCase().includes(query) ||
        (usr.email && usr.email.toLowerCase().includes(query)) ||
        String(item.company_id || "").toLowerCase().includes(query) ||
        String(item.user_id || "").toLowerCase().includes(query)
      );
    });
  }, [requests, search, getResolvedCompany, getResolvedUser]);

  const confirmActionHandler = useCallback(async () => {
    if (!confirmState) return;
    const { request, action } = confirmState;
    const domain = request.domain_name;
    const requestId = request.id;

    if (normalizeStatus(request.status) === "active" || normalizeStatus(request.status) === "approved") {
      toast.error("This domain is already active.");
      setConfirmState(null);
      return;
    }

    setProcessingDomain(domain);
    setRowErrors((current) => ({ ...current, [domain]: "" }));
    try {
      const result = await domainService.approveDomain(requestId);
      toast.success(result.message);
      setConfirmState(null);

      setRequests((current) =>
        current.map((item) =>
          item.domain_name === domain ? { ...item, status: "active" } : item
        )
      );
      void loadRequests(true);
    } catch (actionError) {
      const message = getDomainApiError(actionError);
      setRowErrors((current) => ({ ...current, [domain]: message }));
      toast.error(message);
      setConfirmState(null);
    } finally {
      setProcessingDomain("");
    }
  }, [confirmState, loadRequests]);

  return (
    <div className="au-root">
      <div className="au-header">
        <div>
          <h1
            className="au-header__title"
            style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
          >
            <ShieldCheck
              className="h-7 w-7 text-emerald-500"
              style={{ color: "var(--brand, #10b981)" }}
            />
            Domain Approvals
          </h1>
          <p className="au-header__subtitle">
            Review incoming custom domain requests
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadRequests()}
          disabled={loading}
          className="au-btn au-btn--ghost"
          style={{
            width: "auto",
            padding: "10px 18px",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="au-kpi-card"
          style={{
            marginBottom: 20,
            borderColor: "rgba(255,107,107,0.35)",
            background: "rgba(255,107,107,0.06)",
            color: "var(--danger)",
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <CircleAlert className="h-4 w-4 shrink-0" style={{ marginTop: 2 }} />
          <span>{error}</span>
        </div>
      )}

      <div className="au-filter-bar">
        <div className="au-search-wrap">
          <Search className="mc-search-icon" size={16} />
          <input
            className="au-search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search domain, company, or requester..."
          />
        </div>

        <span className="au-filter-count">
          {loading ? "…" : `${visibleRequests.length} requests`}
        </span>
      </div>

      <div className="au-main-grid au-main-grid--full">
        <div className="au-table-wrapper">
          <table className="au-table">
            <thead>
              <tr>
                <th>DOMAIN NAME</th>
                <th>COMPANY</th>
                <th>REQUESTED BY</th>
                <th>STATUS</th>
                <th>REQUESTED DATE</th>
                <th style={{ width: 160 }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="au-empty">
                      <div className="au-empty__spinner" />
                      <p className="au-empty__title">Loading requests…</p>
                    </div>
                  </td>
                </tr>
              ) : visibleRequests.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="au-empty">
                      <div className="au-empty__icon">🌐</div>
                      <p className="au-empty__title">
                        No pending permission requests
                      </p>
                      <p className="au-empty__desc">
                        New requests will appear here after the next refresh.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleRequests.map((item) => {
                  const comp = getResolvedCompany(item.company_id, item);
                  const usr = getResolvedUser(item.user_id, item);
                  const isActive =
                    normalizeStatus(item.status) === "active" ||
                    normalizeStatus(item.status) === "approved";

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="au-user-cell">
                          <div
                            className="au-avatar au-avatar--table"
                            style={{
                              background: domainAvatarColor(item.domain_name ?? ""),
                            }}
                          >
                            {domainInitials(item.domain_name ?? "")}
                          </div>
                          <span className="au-user-name">{item.domain_name}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <span style={{ fontWeight: 600, color: "var(--title)", fontSize: 13 }}>
                            {comp.name}
                          </span>
                          {comp.domain && (
                            <span style={{ fontSize: 11, color: "var(--muted)" }}>
                              {comp.domain}
                            </span>
                          )}
                          {item.company_id && (
                            <span
                              style={{
                                fontFamily: "monospace",
                                fontSize: 10,
                                color: "var(--muted)",
                                opacity: 0.65,
                              }}
                              title={`Company ID: ${item.company_id}`}
                            >
                              ID: {item.company_id.length > 12 ? `${item.company_id.slice(0, 8)}…` : item.company_id}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <span style={{ fontWeight: 600, color: "var(--title)", fontSize: 13 }}>
                            {usr.name}
                          </span>
                          {usr.email && (
                            <span style={{ fontSize: 11, color: "var(--muted)" }}>
                              {usr.email}
                            </span>
                          )}
                          {item.user_id && (
                            <span
                              style={{
                                fontFamily: "monospace",
                                fontSize: 10,
                                color: "var(--muted)",
                                opacity: 0.65,
                              }}
                              title={`User ID: ${item.user_id}`}
                            >
                              ID: {item.user_id.length > 12 ? `${item.user_id.slice(0, 8)}…` : item.user_id}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <DomainBadge status={item.status} />
                      </td>
                      <td>{formatDate(item.created_at)}</td>
                      <td>
                        {isActive ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#10b981",
                              background: "rgba(16, 185, 129, 0.1)",
                              padding: "4px 10px",
                              borderRadius: 20,
                              border: "1px solid rgba(16, 185, 129, 0.25)",
                            }}
                          >
                            <Check size={13} strokeWidth={2.5} /> Active
                          </span>
                        ) : (
                          <div className="au-action-group">
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmState({
                                  request: item,
                                  action: "approve",
                                })
                              }
                              disabled={processingDomain === item.domain_name}
                              className="au-action-btn au-action-btn--restore"
                              title="Approve domain"
                            >
                              {processingDomain === item.domain_name ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check size={15} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                toast("Reject API is available for pending requests");
                              }}
                              disabled={processingDomain === item.domain_name}
                              className="au-action-btn au-action-btn--delete"
                              title="Reject domain"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        )}
                        {rowErrors[item.domain_name] && (
                          <p
                            style={{
                              marginTop: 6,
                              fontSize: 11,
                              color: "var(--danger)",
                            }}
                          >
                            {rowErrors[item.domain_name]}
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div className="au-pagination">
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              Auto-refreshes every 30s
            </span>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              {visibleRequests.length} shown
            </span>
          </div>
        </div>
      </div>

      {confirmState && (
        <div className="au-overlay">
          <div
            className="au-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <div className="au-modal__header">
              <div>
                <h2 id="confirm-title" className="au-modal__title">
                  Approve Domain
                </h2>
                <p className="au-modal__sub">
                  This will{" "}
                  {confirmState.action === "approve"
                    ? "approve and activate"
                    : "reject"}{" "}
                  <strong>{confirmState.request.domain_name}</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                aria-label="Close confirmation"
                className="au-modal__close"
              >
                ×
              </button>
            </div>
            <div className="au-modal__actions">
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                className="au-btn au-btn--ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmActionHandler()}
                disabled={processingDomain === confirmState.request.domain_name}
                className={`au-btn ${
                  confirmState.action === "approve"
                    ? "au-btn--primary"
                    : "au-btn--danger"
                }`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {processingDomain === confirmState.request.domain_name ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : confirmState.action === "approve" ? (
                  <ShieldCheck size={16} />
                ) : (
                  <X size={16} />
                )}
                {confirmState.action === "approve"
                  ? "Approve Domain"
                  : "Reject Domain"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

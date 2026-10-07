"use client";

import {
  Check,
  CircleAlert,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  X,
  Globe,
  Clock,
  Search,
  CheckCircle2,
} from "lucide-react";
import { AxiosError } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "@/lib/axiosInstance";
import "@/app/globals.css";
import Spinner from "@/components/ui/Spinner";
import "./permissions.css";

/* ============================================================
   TYPES
   ============================================================ */

interface DomainRequest {
  id: string;
  company_id: string;
  domain_name: string;
  hostname: string;
  domain_type: string;
  status: string;
  ssl_status: string;
  created_at: string;
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
  process.env.NEXT_PUBLIC_DOMAINS_API_BASE ?? "/v1/super-admin";
const REFRESH_INTERVAL_MS = 30000;

/* ============================================================
   API SERVICE LAYER
   ============================================================ */

function isDomainRequest(value: unknown): value is DomainRequest {
  return Boolean(
    value &&
      typeof value === "object" &&
      "domain_name" in value &&
      typeof (value as DomainRequest).domain_name === "string"
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
    const response = await axiosInstance.get(
      `${DOMAINS_API_BASE}/domains?page=1&limit=25`
    );

    const items = response.data?.data?.items;

    if (!Array.isArray(items)) {
      return [];
    }

    return items;
  },

  async approveDomain(requestId: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<ApiEnvelope<unknown>>(
      `${DOMAINS_API_BASE}/companies/${requestId}/domain/active`
    );

    return {
      message: response.data?.message ?? "Domain approved successfully.",
    };
  },
};

/* ============================================================
   HELPERS & DESIGN SYSTEM
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

function DomainBadge({ status }: { status?: string | null }) {
  const normalized = normalizeStatus(status);
  const isApproved = normalized === "active" || normalized === "approved";
  const isPending = normalized === "pending";
  const isRejected = normalized === "failed" || normalized === "rejected";

  const label = isApproved
    ? "Active"
    : isPending
    ? "Pending"
    : isRejected
    ? "Rejected"
    : normalized[0].toUpperCase() + normalized.slice(1);

  const badgeClass = isApproved
    ? "pm-badge--approved"
    : isPending
    ? "pm-badge--pending"
    : isRejected
    ? "pm-badge--rejected"
    : "pm-badge--neutral";

  return (
    <span className={`pm-badge ${badgeClass}`}>
      <span className="pm-badge__dot" />
      {label}
    </span>
  );
}

function domainInitials(domain?: string | null) {
  const value = domain ?? "";
  const parts = value.replace(/^www\./, "").split(".")[0] ?? "";
  return parts.slice(0, 2).toUpperCase() || "--";
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #206bc4, #4299e1)",
  "linear-gradient(135deg, #2fb344, #48bb78)",
  "linear-gradient(135deg, #f59f00, #ed8936)",
  "linear-gradient(135deg, #ae3ec9, #9f7aea)",
  "linear-gradient(135deg, #17a2b8, #38b2ac)",
];

function domainAvatarColor(domain?: string | null) {
  const value = domain ?? "";
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function PermissionsPage() {
  const [requests, setRequests] = useState<DomainRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "ACTIVE" | "FAILED">("ALL");
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [processingDomain, setProcessingDomain] = useState<string>("");
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

  const loadRequests = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const data = await domainService.getDomain();
      setRequests(data);
    } catch (loadError) {
      setError(getDomainApiError(loadError));
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  // Derived stats
  const stats = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    for (const r of requests) {
      const s = normalizeStatus(r.status);
      if (s === "pending") pending++;
      else if (s === "active" || s === "approved") approved++;
      else if (s === "failed" || s === "rejected") rejected++;
    }
    return {
      total: requests.length,
      pending,
      approved,
      rejected,
    };
  }, [requests]);

  // Visible filtered requests
  const visibleRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requests.filter((item) => {
      const matchesSearch =
        !query ||
        item.domain_name.toLowerCase().includes(query) ||
        String(item.company_id || "").toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (statusFilter === "ALL") return true;
      const normalized = normalizeStatus(item.status);
      if (statusFilter === "PENDING") return normalized === "pending";
      if (statusFilter === "ACTIVE") return normalized === "active" || normalized === "approved";
      if (statusFilter === "FAILED") return normalized === "failed" || normalized === "rejected";
      return true;
    });
  }, [requests, search, statusFilter]);

  const confirmActionHandler = useCallback(async () => {
    if (!confirmState) return;
    const { request, action } = confirmState;
    const domain = request.domain_name;
    const requestId = request.id;
    setProcessingDomain(domain);
    setRowErrors((current) => ({ ...current, [domain]: "" }));
    try {
      const result = await domainService.approveDomain(requestId);
      toast.success(result.message);
      setConfirmState(null);

      setRequests((current) =>
        current.filter((item) => item.domain_name !== domain)
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
    <div className="pm-root">
      {/* Header */}
      <div className="pm-header">
        <div>
          <h1 className="pm-header__title">Permissions</h1>
          <p className="pm-header__subtitle">
            Review and manage incoming custom domain approval requests
          </p>
        </div>
        <div className="pm-header__actions">
          <button
            type="button"
            onClick={() => void loadRequests()}
            disabled={loading}
            className="pm-btn-refresh"
            title="Refresh domains list"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div role="alert" className="pm-error-banner">
          <CircleAlert size={16} className="shrink-0" style={{ marginTop: 2 }} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="pm-kpi-grid">
        <div className="pm-kpi-card">
          <div
            className="pm-kpi-card__icon"
            style={{ background: "rgba(32, 107, 196, 0.12)", color: "var(--primary, #206bc4)" }}
          >
            <Globe size={22} />
          </div>
          <div className="pm-kpi-card__info">
            <span className="pm-kpi-card__label">Total Requests</span>
            <div className="pm-kpi-card__value">{stats.total}</div>
          </div>
        </div>

        <div className="pm-kpi-card">
          <div
            className="pm-kpi-card__icon"
            style={{ background: "rgba(245, 159, 0, 0.12)", color: "var(--crm-yellow, #f59f00)" }}
          >
            <Clock size={22} />
          </div>
          <div className="pm-kpi-card__info">
            <span className="pm-kpi-card__label">Pending Approval</span>
            <div className="pm-kpi-card__value">{stats.pending}</div>
          </div>
        </div>

        <div className="pm-kpi-card">
          <div
            className="pm-kpi-card__icon"
            style={{ background: "rgba(47, 179, 68, 0.12)", color: "var(--crm-green, #2fb344)" }}
          >
            <ShieldCheck size={22} />
          </div>
          <div className="pm-kpi-card__info">
            <span className="pm-kpi-card__label">Active Domains</span>
            <div className="pm-kpi-card__value">{stats.approved}</div>
          </div>
        </div>

        <div className="pm-kpi-card">
          <div
            className="pm-kpi-card__icon"
            style={{ background: "rgba(214, 57, 57, 0.12)", color: "var(--crm-red, #d63939)" }}
          >
            <ShieldAlert size={22} />
          </div>
          <div className="pm-kpi-card__info">
            <span className="pm-kpi-card__label">Rejected / Failed</span>
            <div className="pm-kpi-card__value">{stats.rejected}</div>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Status Tabs */}
      <div className="pm-controls-bar">
        <div className="pm-controls-left">
          <div className="pm-search-wrap">
            <Search size={15} className="pm-search-icon" />
            <input
              type="text"
              className="pm-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search domain, company ID..."
            />
          </div>

          {/* Segmented Tab Filter */}
          <div className="pm-tabs" role="tablist">
            <button
              type="button"
              className={`pm-tab-btn ${statusFilter === "ALL" ? "pm-tab-btn--active" : ""}`}
              onClick={() => setStatusFilter("ALL")}
            >
              <span>All</span>
              <span className="pm-tab-count">{stats.total}</span>
            </button>
            <button
              type="button"
              className={`pm-tab-btn ${statusFilter === "PENDING" ? "pm-tab-btn--active" : ""}`}
              onClick={() => setStatusFilter("PENDING")}
            >
              <span>Pending</span>
              <span className="pm-tab-count">{stats.pending}</span>
            </button>
            <button
              type="button"
              className={`pm-tab-btn ${statusFilter === "ACTIVE" ? "pm-tab-btn--active" : ""}`}
              onClick={() => setStatusFilter("ACTIVE")}
            >
              <span>Active</span>
              <span className="pm-tab-count">{stats.approved}</span>
            </button>
            <button
              type="button"
              className={`pm-tab-btn ${statusFilter === "FAILED" ? "pm-tab-btn--active" : ""}`}
              onClick={() => setStatusFilter("FAILED")}
            >
              <span>Rejected</span>
              <span className="pm-tab-count">{stats.rejected}</span>
            </button>
          </div>
        </div>

        <span className="pm-filter-count">
          {loading ? "Loading…" : `${visibleRequests.length} requests`}
        </span>
      </div>

      {/* Table Card */}
      <div className="pm-table-card">
        <div className="pm-table-responsive">
          <table className="pm-table">
            <thead>
              <tr>
                <th>DOMAIN NAME</th>
                <th>COMPANY ID</th>
                <th>STATUS</th>
                <th>REQUESTED DATE</th>
                <th style={{ width: 140, textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>
                    <div className="pm-empty" style={{ padding: "40px 0" }}>
                      <Spinner
                        variant="center"
                        size="lg"
                        color="primary"
                        text="Loading domain requests…"
                      />
                    </div>
                  </td>
                </tr>
              ) : visibleRequests.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="pm-empty">
                      <div className="pm-empty__icon">
                        <Globe size={32} />
                      </div>
                      <p className="pm-empty__title">No permission requests found</p>
                      <p className="pm-empty__desc">
                        {search || statusFilter !== "ALL"
                          ? "Try adjusting your search query or status filter."
                          : "New requests will appear automatically when companies submit them."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleRequests.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="pm-domain-cell">
                        <div
                          className="pm-avatar"
                          style={{
                            background: domainAvatarColor(item.domain_name ?? ""),
                          }}
                        >
                          {domainInitials(item.domain_name ?? "")}
                        </div>
                        <div className="pm-domain-info">
                          <span className="pm-domain-name">{item.domain_name}</span>
                          <span className="pm-domain-type">
                            {item.domain_type || "Custom domain"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="pm-company-id">
                        {item.company_id || "—"}
                      </span>
                    </td>
                    <td>
                      <DomainBadge status={item.status} />
                    </td>
                    <td>
                      <span className="pm-date-cell">
                        {formatDate(item.created_at)}
                      </span>
                    </td>
                    <td>
                      <div className="pm-action-group" style={{ justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmState({
                              request: item,
                              action: "approve",
                            })
                          }
                          disabled={processingDomain === item.domain_name}
                          className="pm-btn-action pm-btn-action--approve"
                          title="Approve domain"
                          aria-label="Approve domain"
                        >
                          {processingDomain === item.domain_name ? (
                            <Spinner size="xs" />
                          ) : (
                            <Check size={15} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            toast("Reject API is not available yet");
                          }}
                          disabled={processingDomain === item.domain_name}
                          className="pm-btn-action pm-btn-action--reject"
                          title="Reject domain"
                          aria-label="Reject domain"
                        >
                          <X size={15} />
                        </button>
                      </div>
                      {rowErrors[item.domain_name] && (
                        <p
                          style={{
                            marginTop: 6,
                            fontSize: 11,
                            color: "var(--danger)",
                            textAlign: "right",
                          }}
                        >
                          {rowErrors[item.domain_name]}
                        </p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="pm-table-footer">
          <span>Auto-refreshes every 30s</span>
          <span>
            {visibleRequests.length} of {requests.length} requests shown
          </span>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmState && (
        <div className="pm-modal-overlay" onClick={() => setConfirmState(null)}>
          <div
            className="pm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pm-modal__header">
              <div>
                <h2 id="confirm-title" className="pm-modal__title">
                  Approve Custom Domain
                </h2>
                <p className="pm-modal__desc">
                  This will activate the domain configuration for the company.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                aria-label="Close modal"
                className="pm-modal__close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="pm-modal__body">
              <div className="pm-modal__info-row">
                <span className="pm-modal__info-label">Domain Name</span>
                <span className="pm-modal__info-val">
                  {confirmState.request.domain_name}
                </span>
              </div>
              <div className="pm-modal__info-row">
                <span className="pm-modal__info-label">Company ID</span>
                <span className="pm-modal__info-val">
                  {confirmState.request.company_id || "—"}
                </span>
              </div>
            </div>

            <div className="pm-modal__actions">
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                className="pm-btn pm-btn--ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmActionHandler()}
                disabled={processingDomain === confirmState.request.domain_name}
                className={`pm-btn ${
                  confirmState.action === "approve"
                    ? "pm-btn--primary"
                    : "pm-btn--danger"
                }`}
              >
                {processingDomain === confirmState.request.domain_name ? (
                  <Spinner size="sm" text="Processing…" />
                ) : confirmState.action === "approve" ? (
                  <>
                    <ShieldCheck size={15} />
                    <span>Approve Domain</span>
                  </>
                ) : (
                  <>
                    <X size={15} />
                    <span>Reject Domain</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

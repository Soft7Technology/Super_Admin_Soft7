"use client";

import {
  Check,
  CircleAlert,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { AxiosError } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "@/lib/axiosInstance";
//import { KPI } from "../all-user/components/KPI";
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
}

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

type ConfirmAction = "approve" | "reject";

interface ConfirmState {
  request: DomainRequest;
  action: ConfirmAction;
}

const DOMAINS_API_BASE =
  process.env.NEXT_PUBLIC_DOMAINS_API_BASE ?? "/v1/admin";
const REFRESH_INTERVAL_MS = 30000;
const COMPANY_DOMAIN = "soft7.in";

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
  async getDomain(companyDomain: string): Promise<DomainRequest[]> {
    const response = await axiosInstance.get<ApiEnvelope<DomainRequest>>(
      `${DOMAINS_API_BASE}/companies/${encodeURIComponent(
        companyDomain,
      )}/domain`,
    );

    return response.data.data ? [response.data.data] : [];
  },

  async approveDomain(domainName: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<ApiEnvelope<unknown>>(
      `${DOMAINS_API_BASE}/companies/${encodeURIComponent(
        domainName,
      )}/domain/active`,
    );

    return {
      message:
        response.data?.message ?? `${domainName} was approved successfully.`,
    };
  },
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

function domainInitials(domain: string) {
  const parts = domain.replace(/^www\./, "").split(".")[0] ?? domain;
  return parts.slice(0, 2).toUpperCase();
}

function domainAvatarColor(domain: string) {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash);
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

  const loadRequests = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const data = await domainService.getDomain(COMPANY_DOMAIN);
      setRequests(data);
    } catch (loadError) {
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
    return requests.filter(
      (item) =>
        item.domain_name.toLowerCase().includes(query) ||
        String(item.company_id || "")
          .toLowerCase()
          .includes(query) ||
        String(item.user_id || "")
          .toLowerCase()
          .includes(query),
    );
  }, [requests, search]);

  const confirmActionHandler = useCallback(async () => {
    if (!confirmState) return;
    const { request, action } = confirmState;
    const domain = request.domain_name;
    setProcessingDomain(domain);
    setRowErrors((current) => ({ ...current, [domain]: "" }));
    try {
     const result = await domainService.approveDomain(domain);
      toast.success(result.message);
      setConfirmState(null);

      setRequests((current) =>
        current.filter((item) => item.domain_name !== domain),
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
          <h1 className="au-header__title">Permissions</h1>
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
          <span className="mc-search-icon">🔍</span>
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
                <th>COMPANY ID</th>
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
                visibleRequests.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="au-user-cell">
                        <div
                          className="au-avatar au-avatar--table"
                          style={{
                            background: domainAvatarColor(item.domain_name),
                          }}
                        >
                          {domainInitials(item.domain_name)}
                        </div>
                        <span className="au-user-name">{item.domain_name}</span>
                      </div>
                    </td>
                    <td
                      style={{
                        fontFamily: "monospace",
                        fontSize: 12,
                        color: "var(--muted)",
                      }}
                    >
                      {item.company_id || "—"}
                    </td>
                    <td
                      style={{
                        fontFamily: "monospace",
                        fontSize: 12,
                        color: "var(--muted)",
                      }}
                    >
                      {item.user_id || "—"}
                    </td>
                    <td>
                      <DomainBadge status={item.status} />
                    </td>
                    <td>{formatDate(item.created_at)}</td>
                    <td>
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
                            toast("Reject API not available yet");
                          }}
                          disabled={processingDomain === item.domain_name}
                          className="au-action-btn au-action-btn--delete"
                          title="Reject domain"
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

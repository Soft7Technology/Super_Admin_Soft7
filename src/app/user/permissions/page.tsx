"use client";

import {
  Check,
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
import { PageContainer, PageHeader } from "@/components/layout";
import Alert from "@/components/ui/Alert";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Table from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";


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
    const response = await axiosInstance.get(
      `${DOMAINS_API_BASE}/domains?page=1&limit=25`,
    );

    const items = response.data?.data?.items;

    if (!Array.isArray(items)) {
      return [];
    }

    return items;
  },

  async approveDomain(requestId: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<ApiEnvelope<unknown>>(
      `${DOMAINS_API_BASE}/companies/${requestId}/domain/active`,
    );

    return {
      message: response.data?.message ?? "Domain approved successfully.",
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

function domainBadgeVariant(status?: string | null): BadgeVariant {
  const normalized = normalizeStatus(status);
  if (normalized === "active" || normalized === "approved") return "success";
  if (normalized === "pending") return "warning";
  if (normalized === "failed" || normalized === "rejected") return "error";
  return "neutral";
}

function DomainBadge({ status }: { status?: string | null }) {
  const normalized = normalizeStatus(status);
  const label = normalized[0].toUpperCase() + normalized.slice(1);
  return (
    <Badge variant={domainBadgeVariant(status)} dot>
      {label}
    </Badge>
  );
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
         .includes(query),
   );
  }, [requests, search]);

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

  const columns: Column<DomainRequest>[] = [
    {
      key: "domain_name",
      header: "Domain Name",
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar name={item.domain_name.replace(/^www\./, "")} size="sm" />
          <span className="font-medium text-foreground">{item.domain_name}</span>
        </div>
      ),
    },
    {
      key: "company_id",
      header: "Company ID",
      render: (item) => <span className="font-mono text-xs text-muted-foreground">{item.company_id || "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <DomainBadge status={item.status} />,
    },
    {
      key: "created_at",
      header: "Requested Date",
      render: (item) => <span className="text-muted-foreground">{formatDate(item.created_at)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: "160px",
      render: (item) => {
        const busy = processingDomain === item.domain_name;
        return (
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <IconButton
                size="sm"
                aria-label="Approve domain"
                className="text-success hover:bg-success-bg"
                icon={busy ? <LoaderCircle size={15} className="animate-spin" /> : <Check size={15} />}
                disabled={busy}
                onClick={() => setConfirmState({ request: item, action: "approve" })}
              />
              <IconButton
                size="sm"
                aria-label="Reject domain"
                className="text-error hover:bg-error-bg"
                icon={<X size={15} />}
                disabled={busy}
                onClick={() => {
                  toast("Reject API not available yet");
                }}
              />
            </div>
            {rowErrors[item.domain_name] && (
              <p className="text-[0.6875rem] text-error">{rowErrors[item.domain_name]}</p>
            )}
          </div>
        );
      },
    },
  ];

  const confirmBusy = confirmState ? processingDomain === confirmState.request.domain_name : false;

  return (
    <PageContainer>
      <PageHeader
        title="Permissions"
        description="Review incoming custom domain requests"
        actions={
          <Button
            variant="secondary"
            onClick={() => void loadRequests()}
            disabled={loading}
            leftIcon={<RefreshCw size={15} className={loading ? "animate-spin" : undefined} />}
          >
            Refresh
          </Button>
        }
      />

      {error && <Alert variant="error" className="mb-4" message={error} />}

      <Card padding="sm" className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            wrapperClassName="sm:max-w-sm sm:flex-1"
            leftIcon={<Search size={15} />}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search domain, company, or requester..."
            aria-label="Search domain requests"
          />
          <span className="text-sm text-muted-foreground">
            {loading ? "…" : `${visibleRequests.length} requests`}
          </span>
        </div>
      </Card>

      <Table
        columns={columns}
        data={visibleRequests}
        rowKey={(item) => item.id}
        loading={loading}
        emptyMessage="No pending permission requests"
        emptyDescription="New requests will appear here after the next refresh."
      />

      <div className="mt-3 flex items-center justify-between text-[0.8125rem] text-muted-foreground">
        <span>Auto-refreshes every 30s</span>
        <span>{visibleRequests.length} shown</span>
      </div>

      <Modal
        isOpen={confirmState !== null}
        onClose={() => setConfirmState(null)}
        size="sm"
        title="Approve Domain"
        description={
          confirmState ? (
            <>
              This will {confirmState.action === "approve" ? "approve and activate" : "reject"}{" "}
              <strong className="text-foreground">{confirmState.request.domain_name}</strong>.
            </>
          ) : null
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmState(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmState?.action === "reject" ? "danger" : "primary"}
              isLoading={confirmBusy}
              leftIcon={confirmState?.action === "reject" ? <X size={16} /> : <ShieldCheck size={16} />}
              onClick={() => void confirmActionHandler()}
            >
              {confirmState?.action === "reject" ? "Reject Domain" : "Approve Domain"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-secondary-foreground">
          The domain will be activated for the requesting company.
        </p>
      </Modal>
    </PageContainer>
  );
}

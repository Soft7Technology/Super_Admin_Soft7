"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";

import { axiosInstance } from "@/lib/axiosInstance";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Swal from "sweetalert2";
import {
  Ban,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { PageContainer, PageHeader } from "@/components/layout";
import KpiCard from "@/components/admin/KpiCard";
import Alert from "@/components/ui/Alert";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Checkbox from "@/components/ui/Checkbox";
import Field from "@/components/ui/Field";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Table from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import Textarea from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import { phoneButtonStyle, phoneDropdownStyle, phoneInputStyle } from "./phoneInputStyles";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

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

type Status = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "TRIAL";

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

function formatCredit(value: string | number) {
  return `₹${Number(value || 0).toFixed(2)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<Status, BadgeVariant> = {
  ACTIVE: "success",
  SUSPENDED: "error",
  INACTIVE: "neutral",
  TRIAL: "warning",
};

const STATUS_PILL: Record<Status, string> = {
  ACTIVE: "border-success-border bg-success-bg text-success",
  SUSPENDED: "border-error-border bg-error-bg text-error",
  INACTIVE: "border-border bg-surface-muted text-muted-foreground",
  TRIAL: "border-warning-border bg-warning-bg text-warning",
};

function statusLabel(status: Status) {
  return status[0] + status.slice(1).toLowerCase();
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} dot>
      {statusLabel(status)}
    </Badge>
  );
}

/** Inline status switcher — only Active ⇄ Suspended is supported by the API. */
function StatusDropdown({
  company,
  onStatusChange,
}: {
  company: Company;
  onStatusChange: (id: string, status: "ACTIVE" | "SUSPENDED") => void;
}) {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Status;

    if (newStatus === company.status) return;

    if (newStatus === "ACTIVE" || newStatus === "SUSPENDED") {
      onStatusChange(company.id, newStatus);
    } else {
      toast.info("Switching directly to Inactive/Trial isn't supported here.");
    }

    e.target.value = company.status;
  };

  return (
    <select
      value={company.status}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      title="Change status"
      aria-label={`Change status for ${company.name}`}
      className={cn(
        "cursor-pointer appearance-none rounded-full border py-1 pl-3 pr-3 text-xs font-semibold outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-primary-ring",
        STATUS_PILL[company.status],
      )}
    >
      <option value="ACTIVE">● Active</option>
      <option value="SUSPENDED">● Suspended</option>
    </select>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EDIT COMPANY MODAL
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
    <Modal
      isOpen
      onClose={onClose}
      title="Edit Company"
      description={`Update ${company.name}`}
      closeOnOverlayClick={false}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={saving}>
            Save Changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {err && <Alert variant="error" message={err} onClose={() => setErr(null)} />}

        <Input
          label="Company Name"
          required
          placeholder="e.g. Acme Corp"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Company Email"
          required
          type="email"
          placeholder="company@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Field label="Company Phone" required>
          <PhoneInput
            country="in"
            value={phone}
            onChange={(value) => setPhone(value)}
            enableSearch
            searchPlaceholder="Search country..."
            placeholder="Enter phone number"
            isValid={(value) => value.replace(/\D/g, "").length >= 10}
            inputStyle={phoneInputStyle}
            buttonStyle={phoneButtonStyle}
            dropdownStyle={phoneDropdownStyle}
          />
        </Field>

        <Input
          label="Business ID"
          required
          placeholder="BUSINESS123"
          value={businessId}
          onChange={(e) => setBusinessId(e.target.value)}
        />

        <Textarea
          label="Reason"
          required
          placeholder="Company profile updated"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          className="min-h-[100px] resize-y"
        />
      </div>
    </Modal>
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
  const rows: [string, string][] = [
    ["Domain", company.domain],
    ["Phone", company.phone],
    ["Business ID", company.businessId || "—"],
    ["Credit Balance", `₹${company.creditBalance}`],
    ["Member Since", company.createdAt],
  ];

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="lg"
      title={
        <span className="flex items-center gap-3">
          <Avatar name={company.name} size="md" />
          <span className="min-w-0">
            <span className="block truncate">{company.name}</span>
            <span className="block truncate text-[0.8125rem] font-normal text-muted-foreground">
              {company.email}
            </span>
          </span>
        </span>
      }
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="danger"
              leftIcon={<Trash2 size={15} />}
              onClick={() => {
                onDelete(company.id);
                onClose();
              }}
            >
              Delete
            </Button>

            {company.status !== "SUSPENDED" ? (
              <Button
                variant="secondary"
                leftIcon={<Ban size={15} />}
                onClick={() => {
                  onStatusChange(company.id, "SUSPENDED");
                  onClose();
                }}
              >
                Suspend
              </Button>
            ) : (
              <Button
                variant="secondary"
                leftIcon={<RotateCcw size={15} />}
                onClick={() => {
                  onStatusChange(company.id, "ACTIVE");
                  onClose();
                }}
              >
                Restore
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button
              leftIcon={<Pencil size={15} />}
              onClick={() => {
                onClose();
                onEdit(company);
              }}
            >
              Edit Company
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <StatusBadge status={company.status} />

        <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border-subtle bg-border-subtle sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="bg-surface px-4 py-3">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 break-words text-sm font-medium text-foreground">{value}</dd>
            </div>
          ))}
        </dl>

        {company.apiKey && (
          <div className="rounded-lg border border-border-subtle bg-surface-muted px-4 py-3">
            <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">API Key</p>
            <p className="mt-1 break-all font-mono text-xs text-secondary-foreground">
              {company.apiKey.slice(0, 32)}…
            </p>
          </div>
        )}
      </div>
    </Modal>
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
    <Modal
      isOpen
      onClose={onClose}
      size="sm"
      title="Add Credit"
      description={`Top up ${company.name}'s balance`}
      closeOnOverlayClick={false}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAddCredit} isLoading={loading} leftIcon={<Wallet size={15} />}>
            Add Credit
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {err && <Alert variant="error" message={err} onClose={() => setErr(null)} />}

        <Input label="Company" value={company.name} disabled />

        <Input
          label="Current Balance"
          value={formatCredit(company.creditBalance)}
          disabled
        />

        <Input
          label="Amount to Add"
          required
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

        <Input
          label="Description"
          type="text"
          placeholder="e.g. Top-up credits"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setErr(null);
          }}
        />
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

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

  const [pagination, setPagination] =
    useState<CompaniesPagination>(DEFAULT_PAGINATION);

  const router = useRouter();
  const { isDark } = useTheme();
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
  }, [filter, currentPage]);

  // ─────────────────────────────────────────────────────────────────────────
  // SEARCH / FILTER
  // ─────────────────────────────────────────────────────────────────────────

  const FILTERS: ("ALL" | Status)[] = [
    "ALL",
    "ACTIVE",
    "SUSPENDED",
    "INACTIVE",
  ];

  const query = search.trim().toLowerCase();

  const filtered = companies.filter((company) => {
    const emailDomain = company.email.includes("@")
      ? company.email.split("@").pop() ?? ""
      : "";

    const searchable = [
      company.name,
      company.email,
      emailDomain,
      company.domain,
      company.businessId,
    ]
      .join(" ")
      .toLowerCase();

    return (
      (filter === "ALL" || company.status === filter) &&
      (!query || searchable.includes(query))
    );
  });

  const totalPages = Math.max(1, pagination.totalPages);

  const safePage = Math.min(currentPage, totalPages);

  // Backend already paginates.
  const paginatedCompanies = filtered;

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
      setSelectedCompanies(filtered.map((company) => company.id));
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
      confirmButtonColor: "var(--color-error)",
      cancelButtonColor: "var(--color-text-muted)",
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
      confirmButtonColor: "var(--color-error)",
      cancelButtonColor: "var(--color-text-muted)",
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

      confirmButtonColor: isSuspending ? "var(--color-error)" : "var(--color-brand)",

      cancelButtonColor: "var(--color-text-muted)",

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

  const columns: Column<Company>[] = [
    {
      key: "select",
      width: "48px",
      header: (
        <Checkbox
          aria-label="Select all companies"
          checked={selectAll}
          onChange={handleSelectAll}
        />
      ),
      render: (company) => (
        <Checkbox
          aria-label={`Select ${company.name}`}
          checked={selectedCompanies.includes(company.id)}
          onChange={() => handleSelectCompany(company.id)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: "name",
      header: "Company",
      render: (company) => (
        <div className="flex items-center gap-3">
          <Avatar name={company.name} size="sm" />
          <button
            type="button"
            className="truncate text-left font-medium text-foreground hover:text-primary-text hover:underline"
            onClick={() => router.push(`/user/manage-companies/${company.id}`)}
          >
            {company.name}
          </button>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (company) => <span className="text-secondary-foreground">{company.email}</span>,
    },
    {
      key: "phone",
      header: "Phone",
      render: (company) => <span className="tabular-nums text-secondary-foreground">{company.phone}</span>,
    },
    {
      key: "businessId",
      header: "Business ID",
      render: (company) => <span className="text-secondary-foreground">{company.businessId || "—"}</span>,
    },
    {
      key: "creditBalance",
      header: "Credit Balance",
      align: "right",
      render: (company) => (
        <span className="font-medium tabular-nums text-foreground">{formatCredit(company.creditBalance)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (company) => (
        <StatusDropdown company={company} onStatusChange={handleStatusChange} />
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (company) => <span className="text-muted-foreground">{company.createdAt}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (company) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton
            size="sm"
            aria-label="View"
            icon={<Eye size={15} />}
            onClick={() => router.push(`/user/manage-companies/${company.id}`)}
          />
          <IconButton
            size="sm"
            aria-label="Edit"
            icon={<Pencil size={15} />}
            onClick={() => openView(company)}
          />
          <IconButton
            size="sm"
            aria-label="Add Credit"
            icon={<Wallet size={15} />}
            onClick={() => setCreditCompany(company)}
          />
          <IconButton
            size="sm"
            aria-label="Delete"
            icon={<Trash2 size={15} />}
            className="text-error hover:bg-error-bg"
            onClick={() => handleDelete(company.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Manage Companies"
        description="All registered companies and their subscription health."
        actions={
          <Button
            leftIcon={<Plus size={15} />}
            onClick={() => router.push("/user/manage-companies/create")}
          >
            Create Company
          </Button>
        }
      />

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Companies"
          value={pagination.total.toLocaleString("en-IN")}
          icon={<Building2 size={18} />}
        />
        <KpiCard
          label="Active"
          value={companies.filter((company) => company.status === "ACTIVE").length}
          icon={<CheckCircle2 size={18} />}
          tone="success"
        />
        <KpiCard
          label="Suspended"
          value={companies.filter((company) => company.status === "SUSPENDED").length}
          icon={<Ban size={18} />}
          tone="error"
        />
        <KpiCard
          label="On Trial"
          value={companies.filter((company) => company.status === "TRIAL").length}
          icon={<Clock size={18} />}
          tone="warning"
        />
      </div>

      {/* FILTER BAR */}
      <Card padding="sm" className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            wrapperClassName="min-w-0 flex-[1_1_16rem]"
            leftIcon={<Search size={15} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, domain or business ID…"
            autoComplete="off"
            aria-label="Search companies"
          />

          <SegmentedControl<"ALL" | Status>
            aria-label="Filter by status"
            value={filter}
            onChange={(value) => {
              setFilter(value);
              setCurrentPage(1);
            }}
            options={FILTERS.map((value) => ({
              value,
              label: value === "ALL" ? "All" : statusLabel(value),
            }))}
          />

          <div className="flex items-center gap-3">
            {selectedCompanies.length > 0 && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 size={14} />}
                onClick={handleBulkDelete}
              >
                Delete Selected ({selectedCompanies.length})
              </Button>
            )}

            <Checkbox label="Select All" checked={selectAll} onChange={handleSelectAll} />

            <span className="whitespace-nowrap text-sm text-muted-foreground">
              {pagination.total} companies
            </span>
          </div>
        </div>
      </Card>

      {/* TABLE */}
      {fetchError ? (
        <Alert variant="error" message={fetchError} />
      ) : (
        <Table
          columns={columns}
          data={paginatedCompanies}
          rowKey={(company) => company.id}
          loading={loading}
          emptyMessage="No companies found"
          emptyDescription="Start by adding one."
        />
      )}

      {/* PAGINATION */}
      {!loading && !fetchError && pagination.total > 0 && (
        <Pagination
          className="mt-4"
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={pagination.total}
          itemsPerPage={ITEMS_PER_PAGE}
          showInfo
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      {/* EDIT MODAL */}
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

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme={isDark ? "dark" : "light"}
      />
    </PageContainer>
  );
}

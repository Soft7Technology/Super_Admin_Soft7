"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, Layers } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout";
import Alert from "@/components/ui/Alert";
import Avatar from "@/components/ui/Avatar";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import Table, { type Column } from "@/components/ui/Table";

interface PlanInfo {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billingCycle: "MONTHLY" | "YEARLY";
  isActive: boolean;
  isPopular: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface CompanyDetails {
  id: string;
  name: string;
  domain: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  logo: string | null;
  createdAt: string;
  updatedAt: string;
  counts: {
    users: number;
    activeUsers: number;
    inactiveUsers: number;
    plans: number;
    subscriptions: number;
    activeSubscriptions: number;
    expiredSubscriptions: number;
    cancelledSubscriptions: number;
    trialSubscriptions: number;
  };
  latestPlan: PlanInfo | null;
  plans: PlanInfo[];
}

interface CompanyDetailsResponse {
  company: CompanyDetails | null;
  error?: string | null;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(value: number) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export default function DashboardCompanyDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const companyId = useMemo(() => {
    const raw = params?.id;
    if (Array.isArray(raw)) {
      return raw[0];
    }

    return raw;
  }, [params]);

  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) {
      setError("Invalid company id.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadCompany() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/admin/companies/${companyId}`);
        const data = (await res.json()) as CompanyDetailsResponse;

        if (cancelled) {
          return;
        }

        if (!res.ok) {
          throw new Error(data.error ?? `Server error ${res.status}`);
        }

        setCompany(data.company);
        setError(data.error ?? null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to fetch company details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCompany();

    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/user/dashboard/companies");
  };

  const detailRows = company
    ? [
        ["Company ID", company.id],
        ["Company Name", company.name],
        ["Domain", company.domain ?? "—"],
        ["Status", company.status],
        ["Logo URL", company.logo ?? "—"],
        ["Created At", formatDateTime(company.createdAt)],
        ["Updated At", formatDateTime(company.updatedAt)],
        ["Total Users", company.counts.users.toLocaleString("en-IN")],
        ["Active Users", company.counts.activeUsers.toLocaleString("en-IN")],
        ["Inactive Users", company.counts.inactiveUsers.toLocaleString("en-IN")],
        ["Total Plans", company.counts.plans.toLocaleString("en-IN")],
        ["Total Subscriptions", company.counts.subscriptions.toLocaleString("en-IN")],
        ["Active Subscriptions", company.counts.activeSubscriptions.toLocaleString("en-IN")],
        ["Expired Subscriptions", company.counts.expiredSubscriptions.toLocaleString("en-IN")],
        ["Cancelled Subscriptions", company.counts.cancelledSubscriptions.toLocaleString("en-IN")],
        ["Trial Subscriptions", company.counts.trialSubscriptions.toLocaleString("en-IN")],
        ["Latest Plan", company.latestPlan?.name ?? "—"],
        ["Latest Plan Price", company.latestPlan ? formatPrice(company.latestPlan.price) : "—"],
        ["Latest Billing Cycle", company.latestPlan?.billingCycle ?? "—"],
      ]
    : [];

  const planColumns: Column<PlanInfo>[] = [
    { key: "name", header: "Plan", render: (plan) => <span className="font-medium text-foreground">{plan.name}</span> },
    { key: "price", header: "Price", render: (plan) => <span className="tabular-nums">{formatPrice(plan.price)}</span> },
    { key: "billingCycle", header: "Cycle", render: (plan) => <Badge>{plan.billingCycle}</Badge> },
    {
      key: "isActive",
      header: "Active",
      render: (plan) => (
        <Badge variant={plan.isActive ? "success" : "neutral"} dot>
          {plan.isActive ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      key: "isPopular",
      header: "Popular",
      render: (plan) => (plan.isPopular ? <Badge variant="warning">Yes</Badge> : <span className="text-muted-foreground">No</span>),
    },
    {
      key: "updatedAt",
      header: "Updated",
      render: (plan) => <span className="text-muted-foreground">{formatDateTime(plan.updatedAt)}</span>,
    },
  ];

  const statusVariant: Record<string, BadgeVariant> = { ACTIVE: "success", INACTIVE: "neutral", SUSPENDED: "error" };

  return (
    <PageContainer>
      <Button variant="ghost" size="sm" className="-ml-2 mb-3" leftIcon={<ArrowLeft size={15} />} onClick={handleBack}>
        Back
      </Button>
      <PageHeader title="Company Details" description="Complete information for selected company." />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : error ? (
        <Alert variant="error" message={error} />
      ) : company ? (
        <div className="space-y-4">
          <Card padding="none" className="overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border-subtle px-5 py-4">
              <Avatar name={company.name} src={company.logo} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">{company.name}</p>
                <p className="truncate text-[0.8125rem] text-muted-foreground">{company.domain ?? "No domain"}</p>
              </div>
              <Badge variant={statusVariant[company.status] ?? "neutral"} dot>
                {company.status}
              </Badge>
            </div>

            <dl className="grid grid-cols-1 gap-px bg-border-subtle sm:grid-cols-2">
              {detailRows.map(([label, value]) => (
                <div key={label} className="bg-surface px-5 py-3">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-0.5 break-words text-sm text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card padding="none" className="overflow-hidden">
            <div className="px-5 pt-5">
              <CardHeader icon={Layers} title="Subscription Plans" />
            </div>
            <Table
              className="rounded-none border-x-0 border-b-0"
              columns={planColumns}
              data={company.plans}
              rowKey={(plan) => plan.id}
              emptyMessage="No plans found."
            />
          </Card>
        </div>
      ) : (
        <Card padding="none">
          <EmptyState icon={<Building2 size={20} />} title="Company not found." />
        </Card>
      )}
    </PageContainer>
  );
}

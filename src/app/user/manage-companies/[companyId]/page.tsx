"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCheck,
  CheckCircle2,
  FileText,
  Inbox,
  LayoutTemplate,
  Layers,
  Loader,
  Megaphone,
  MessageSquare,
  PauseCircle,
  Pencil,
  Plus,
  Share2,
  XCircle,
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout";
import KpiCard from "@/components/admin/KpiCard";
import type { KpiTone } from "@/components/admin/KpiCard";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import Table from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import Tabs from "@/components/ui/Tabs";
import { cn } from "@/lib/utils";


type CompanyStatus = "active" | "suspended";

type Tab = "overview" | "campaigns" | "activity" | "plan";

interface CompanyDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessId: string;
  status: CompanyStatus;
  joinedDate: string;
  lastActive: string;
  plan: string;
  credits: number;
  logo?: string;
}

interface CompanyStats {
  totalMessages: number;
  failedMessages: number;
  deliveredMessages: number;
  receivedMessages: number;
  inProgressMessages: number;
  totalCampaigns: number;
  templates: number;
  messageTemplates: number;
}

interface Campaign {
  id: string;
  title: string;
  createdDate: string;
  contacts: number;
  messages: number;
  delivered: number;
  failed: number;
  status: "Completed" | "Running" | "Scheduled" | "Failed";
}

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "campaign" | "plan" | "credit" | "profile" | "status";
}

interface PlanDetails {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  status: "Active" | "Inactive";
  startDate: string;
  endDate: string;
  features: string[];
}

interface UsageItem {
  label: string;
  used: number;
  limit: number;
}

// -----------------------------------------------------------------------------
// MOCK DATA
// -----------------------------------------------------------------------------



const MOCK_STATS: CompanyStats = {
  totalMessages: 182450,
  failedMessages: 2450,
  deliveredMessages: 175820,
  receivedMessages: 32640,
  inProgressMessages: 4180,
  totalCampaigns: 48,
  templates: 24,
  messageTemplates: 18,
};

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "CMP-001",
    title: "Diwali Promotional Campaign",
    createdDate: "20 Sep 2026",
    contacts: 12500,
    messages: 12500,
    delivered: 12140,
    failed: 360,
    status: "Completed",
  },
  {
    id: "CMP-002",
    title: "Customer Feedback Campaign",
    createdDate: "18 Sep 2026",
    contacts: 8200,
    messages: 8200,
    delivered: 7980,
    failed: 220,
    status: "Completed",
  },
  {
    id: "CMP-003",
    title: "New Product Launch",
    createdDate: "28 Sep 2026",
    contacts: 15000,
    messages: 15000,
    delivered: 13840,
    failed: 310,
    status: "Running",
  },
  {
    id: "CMP-004",
    title: "October Customer Updates",
    createdDate: "30 Sep 2026",
    contacts: 5600,
    messages: 0,
    delivered: 0,
    failed: 0,
    status: "Scheduled",
  },
  {
    id: "CMP-005",
    title: "Inactive Customer Reminder",
    createdDate: "02 Oct 2026",
    contacts: 4300,
    messages: 4300,
    delivered: 3970,
    failed: 330,
    status: "Completed",
  },
];

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "ACT-001",
    title: "Campaign created",
    description: "New Product Launch campaign was created.",
    date: "Today, 10:20 AM",
    type: "campaign",
  },
  {
    id: "ACT-002",
    title: "Credits added",
    description: "5,000 credits were added to the company account.",
    date: "Yesterday, 04:35 PM",
    type: "credit",
  },
  {
    id: "ACT-003",
    title: "Plan updated",
    description: "Company plan was changed to Professional.",
    date: "28 Sep 2026, 11:15 AM",
    type: "plan",
  },
  {
    id: "ACT-004",
    title: "Profile updated",
    description: "Company profile information was updated.",
    date: "25 Sep 2026, 02:45 PM",
    type: "profile",
  },
  {
    id: "ACT-005",
    title: "Company activated",
    description: "Company account was activated.",
    date: "12 Jan 2026, 09:30 AM",
    type: "status",
  },
];

const MOCK_PLAN: PlanDetails = {
  name: "Professional",
  monthlyPrice: 4999,
  yearlyPrice: 49990,
  status: "Active",
  startDate: "28 Sep 2026",
  endDate: "28 Sep 2027",
  features: [
    "Unlimited campaign creation",
    "Advanced campaign analytics",
    "Priority support",
    "Message templates",
    "Contact management",
    "API access",
  ],
};

const MOCK_USAGE: UsageItem[] = [
  {
    label: "Contacts",
    used: 18500,
    limit: 50000,
  },
  {
    label: "Campaigns",
    used: 48,
    limit: 100,
  },
  {
    label: "Messages",
    used: 182450,
    limit: 500000,
  },
];

// -----------------------------------------------------------------------------
// COMPONENT
// -----------------------------------------------------------------------------

export default function CompanyDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const companyId = params?.companyId as string;

  const [activeTab, setActiveTab] = useState<Tab>("overview");
   const [company, setCompany] = useState<CompanyDetails | null>(null);

   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);

  const [creditAmount, setCreditAmount] = useState("");


  useEffect(() => {
    if (!companyId) return;

    const fetchCompany = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get(
          `/v1/super-admin/companies/${companyId}`,
        );

        console.log("GET COMPANY DETAILS RESPONSE =>", response.data);

        const payload = response.data?.data ?? response.data;

        const rawCompany =
          payload?.company ?? payload?.item ?? payload?.data ?? payload;

        if (!rawCompany || !rawCompany.id) {
          throw new Error("Company details not found.");
        }

        const email = rawCompany.email || rawCompany.adminEmail || "";

        const mappedCompany: CompanyDetails = {
          id: String(rawCompany.id),
          name: rawCompany.name || "Unnamed Company",
          email,
          phone: rawCompany.phone || "—",
          businessId: rawCompany.business_id || "—",
          status:
            String(rawCompany.status).toLowerCase() === "suspended"
              ? "suspended"
              : "active",
          joinedDate: rawCompany.created_at
            ? new Date(rawCompany.created_at).toLocaleDateString()
            : "—",
          lastActive: rawCompany.updated_at
            ? new Date(rawCompany.updated_at).toLocaleString()
            : "—",
          plan: rawCompany.plan || rawCompany.plan_name || "—",
          credits: Number(rawCompany.credit_balance ?? 0),
        };

        setCompany(mappedCompany);
      } catch (err: any) {
        console.error("GET COMPANY DETAILS ERROR =>", err);

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to load company details.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);


const handleStatusChange = () => {
  setCompany((current) => {
    if (!current) return current;

    return {
      ...current,
      status: current.status === "active" ? "suspended" : "active",
    };
  });
};

  const handleAddCredits = () => {
    const amount = Number(creditAmount);

    if (!amount || amount <= 0) {
      return;
    }

    setCompany((current) => {
      if (!current) return current;

      return {
        ...current,
        credits: current.credits + amount,
      };
    });

    setCreditAmount("");
    setShowCreditModal(false);
  };

  const handleEditProfile = () => {
    setShowEditModal(false);

    // TODO:
    // Replace with PATCH API later.
  };


  const backToList = () => router.push("/user/manage-companies");

  if (loading) {
    return (
      <PageContainer>
        <Skeleton className="mb-3 h-8 w-40 rounded-lg" />
        <Skeleton className="mb-6 h-10 w-72 rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </PageContainer>
    );
  }

  if (error || !company) {
    return (
      <PageContainer>
        <Card padding="none">
          <EmptyState
            icon={<Building2 size={20} />}
            title="Unable to load company"
            description={error || "Company details not found."}
            action={
              <Button leftIcon={<ArrowLeft size={15} />} onClick={backToList}>
                Back to Companies
              </Button>
            }
          />
        </Card>
      </PageContainer>
    );
  }

  const isActive = company.status === "active";

  const profileMeta: [string, string][] = [
    ["Joined", company.joinedDate],
    ["Last Active", company.lastActive],
    ["Plan", company.plan],
    ["Credits", company.credits.toLocaleString("en-IN")],
  ];

  const quickActions = [
    {
      label: isActive ? "Suspend Company" : "Activate Company",
      icon: isActive ? <PauseCircle size={16} /> : <CheckCircle2 size={16} />,
      tone: isActive ? "bg-error-bg text-error" : "bg-success-bg text-success",
      onClick: handleStatusChange,
    },
    {
      label: "Change Plan",
      icon: <Layers size={16} />,
      tone: "bg-primary-lighter text-primary-text",
      onClick: () => setShowPlanModal(true),
    },
    {
      label: "Add Credits",
      icon: <Plus size={16} />,
      tone: "bg-primary-lighter text-primary-text",
      onClick: () => setShowCreditModal(true),
    },
  ];

  const overviewKpis: { label: string; value: number; icon: ReactNode; tone?: KpiTone }[] = [
    { label: "Total Messages", value: MOCK_STATS.totalMessages, icon: <MessageSquare size={18} /> },
    { label: "Delivered Messages", value: MOCK_STATS.deliveredMessages, icon: <CheckCheck size={18} />, tone: "success" },
    { label: "Failed Messages", value: MOCK_STATS.failedMessages, icon: <XCircle size={18} />, tone: "error" },
    { label: "Received Messages", value: MOCK_STATS.receivedMessages, icon: <Inbox size={18} />, tone: "info" },
    { label: "In Progress", value: MOCK_STATS.inProgressMessages, icon: <Loader size={18} />, tone: "warning" },
    { label: "Total Campaigns", value: MOCK_STATS.totalCampaigns, icon: <Megaphone size={18} /> },
    { label: "Templates", value: MOCK_STATS.templates, icon: <LayoutTemplate size={18} /> },
    { label: "Message Templates", value: MOCK_STATS.messageTemplates, icon: <FileText size={18} /> },
  ];

  const viewMore = (
    <Button
      variant="ghost"
      size="sm"
      rightIcon={<ArrowRight size={14} />}
      onClick={() => {
        // TODO: Navigate to full history
      }}
    >
      View More
    </Button>
  );

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div>
          <SectionHeading title="Overview" description="Company messaging and campaign performance." />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {overviewKpis.map((kpi) => (
              <KpiCard
                key={kpi.label}
                label={kpi.label}
                value={kpi.value.toLocaleString("en-IN")}
                icon={kpi.icon}
                tone={kpi.tone}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "campaigns",
      label: "Campaigns",
      content: (
        <div>
          <SectionHeading
            title="Campaigns"
            description="Campaign history and performance for this company."
            action={viewMore}
          />
          <CampaignTable campaigns={MOCK_CAMPAIGNS} />
        </div>
      ),
    },
    {
      id: "activity",
      label: "Activity",
      content: (
        <div>
          <SectionHeading
            title="Activity"
            description="Recent actions and changes made to this company account."
            action={viewMore}
          />
          <ol className="relative space-y-5 border-l border-border pl-6">
            {MOCK_ACTIVITIES.map((activity) => (
              <li key={activity.id} className="relative">
                <span
                  className="absolute -left-[2.35rem] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary-lighter text-primary-text ring-4 ring-surface"
                  aria-hidden
                >
                  {getActivityIcon(activity.type)}
                </span>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.date}</p>
                </div>
                <p className="mt-0.5 text-[0.8125rem] text-secondary-foreground">{activity.description}</p>
              </li>
            ))}
          </ol>
        </div>
      ),
    },
    {
      id: "plan",
      label: "Plan & Usage",
      content: (
        <div>
          <SectionHeading
            title="Plan & Usage"
            description="Current subscription and resource usage."
            action={
              <Button size="sm" leftIcon={<Layers size={14} />} onClick={() => setShowPlanModal(true)}>
                Change Plan
              </Button>
            }
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Current Plan</p>
                  <p className="mt-0.5 text-lg font-semibold text-foreground">{MOCK_PLAN.name}</p>
                </div>
                <Badge variant={MOCK_PLAN.status === "Active" ? "success" : "neutral"} dot>
                  {MOCK_PLAN.status}
                </Badge>
              </div>

              <dl className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border-subtle bg-border-subtle">
                {(
                  [
                    ["Monthly", `₹${MOCK_PLAN.monthlyPrice.toLocaleString("en-IN")}`],
                    ["Yearly", `₹${MOCK_PLAN.yearlyPrice.toLocaleString("en-IN")}`],
                    ["Start Date", MOCK_PLAN.startDate],
                    ["End Date", MOCK_PLAN.endDate],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div key={label} className="bg-surface px-4 py-3">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>

              <p className="mb-2 text-[0.8125rem] font-semibold text-foreground">Plan Features</p>
              <ul className="space-y-2">
                {MOCK_PLAN.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-[0.8125rem] text-secondary-foreground">
                    <Check size={14} className="shrink-0 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHeader title="Usage" description="Current billing period" />
              <div className="space-y-5">
                {MOCK_USAGE.map((item) => {
                  const percentage = Math.min((item.used / item.limit) * 100, 100);

                  return (
                    <div key={item.label}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[0.8125rem]">
                        <span className="text-secondary-foreground">{item.label}</span>
                        <span className="font-medium tabular-nums text-foreground">
                          {item.used.toLocaleString("en-IN")} / {item.limit.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div
                        className="h-2 overflow-hidden rounded-full bg-surface-muted"
                        role="progressbar"
                        aria-label={`${item.label} usage`}
                        aria-valuenow={Math.round(percentage)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{Math.round(percentage)}% used</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <Button variant="ghost" size="sm" className="-ml-2 mb-3" leftIcon={<ArrowLeft size={15} />} onClick={backToList}>
        Back to Companies
      </Button>
      <PageHeader
        title="Company Details"
        description="View and manage company information, campaigns, activity and plan usage."
      />

      {/* COMPANY PROFILE + QUICK ACTIONS */}
      <Card className="mb-4">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <Avatar name={company.name} src={company.logo} size="lg" />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-semibold text-foreground">{company.name}</h2>
                <Badge variant={isActive ? "success" : "error"} dot>
                  {isActive ? "Active" : "Suspended"}
                </Badge>
              </div>

              <p className="mt-0.5 truncate text-[0.8125rem] text-muted-foreground">{company.email}</p>

              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[0.8125rem] text-secondary-foreground">
                <span>{company.phone}</span>
                <span className="text-disabled-foreground">•</span>
                <span>Business ID: {company.businessId}</span>
              </p>

              <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border-subtle bg-border-subtle">
                {profileMeta.map(([label, value]) => (
                  <div key={label} className="bg-surface px-4 py-3">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd
                      className={cn(
                        "mt-0.5 truncate text-sm font-semibold text-foreground",
                        label === "Credits" && "tabular-nums text-primary-text",
                      )}
                    >
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="w-full shrink-0 lg:w-72">
            <div className="mb-4 flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1" leftIcon={<Pencil size={14} />} onClick={() => setShowEditModal(true)}>
                Edit Profile
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                leftIcon={<Share2 size={14} />}
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                }}
              >
                Share Profile
              </Button>
            </div>

            <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">Quick Actions</p>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className="group flex w-full items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:border-primary-soft hover:bg-surface-hover"
                >
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", action.tone)}>
                    {action.icon}
                  </span>
                  <span className="flex-1 text-sm font-medium text-foreground">{action.label}</span>
                  <ArrowRight size={15} className="text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* TABS */}
      <Card>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as Tab)} />
      </Card>

      {/* EDIT PROFILE MODAL */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
        description="Update company information."
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProfile}>Save Changes</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Company Name"
            type="text"
            value={company.name}
            onChange={(e) => setCompany({ ...company, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={company.email}
            onChange={(e) => setCompany({ ...company, email: e.target.value })}
          />
          <Input
            label="Phone"
            type="text"
            value={company.phone}
            onChange={(e) => setCompany({ ...company, phone: e.target.value })}
          />
          <Input label="Business ID" type="text" value={company.businessId} disabled />
        </div>
      </Modal>

      {/* CHANGE PLAN MODAL */}
      <Modal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        size="sm"
        title="Change Plan"
        description="Select a new plan for this company."
      >
        <div className="space-y-2">
          {["Starter", "Professional", "Enterprise"].map((plan) => {
            const selected = company.plan === plan;

            return (
              <button
                type="button"
                key={plan}
                aria-pressed={selected}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors",
                  selected
                    ? "border-primary bg-primary-lighter text-primary-text"
                    : "border-border bg-surface text-foreground hover:border-primary-soft hover:bg-surface-hover",
                )}
                onClick={() => {
                  setCompany({ ...company, plan });
                  setShowPlanModal(false);
                }}
              >
                {plan}
                {selected && <Badge variant="primary">Current</Badge>}
              </button>
            );
          })}
        </div>
      </Modal>

      {/* ADD CREDITS MODAL */}
      <Modal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        size="sm"
        title="Add Credits"
        description="Add credits to the company account."
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreditModal(false)}>
              Cancel
            </Button>
            <Button leftIcon={<Plus size={15} />} onClick={handleAddCredits}>
              Add Credits
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Credit Amount"
            type="number"
            min="1"
            placeholder="Enter amount"
            value={creditAmount}
            onChange={(e) => setCreditAmount(e.target.value)}
          />
          <p className="text-[0.8125rem] text-muted-foreground">
            Current balance:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {company.credits.toLocaleString("en-IN")}
            </span>
          </p>
        </div>
      </Modal>
    </PageContainer>
  );
}

// -----------------------------------------------------------------------------
// SECTION HEADING
// -----------------------------------------------------------------------------

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="text-[0.9375rem] font-semibold text-foreground">{title}</h3>
        <p className="mt-0.5 text-[0.8125rem] text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

// -----------------------------------------------------------------------------
// CAMPAIGN TABLE
// -----------------------------------------------------------------------------

const CAMPAIGN_STATUS_VARIANT: Record<Campaign["status"], BadgeVariant> = {
  Completed: "success",
  Running: "info",
  Scheduled: "warning",
  Failed: "error",
};

function CampaignTable({ campaigns }: { campaigns: Campaign[] }) {
  const columns: Column<Campaign>[] = [
    {
      key: "title",
      header: "Campaign",
      render: (campaign) => <span className="font-medium text-foreground">{campaign.title}</span>,
    },
    {
      key: "createdDate",
      header: "Created",
      render: (campaign) => <span className="text-muted-foreground">{campaign.createdDate}</span>,
    },
    ...(["contacts", "messages", "delivered", "failed"] as const).map((key) => ({
      key,
      header: key[0].toUpperCase() + key.slice(1),
      align: "right" as const,
      render: (campaign: Campaign) => (
        <span className="tabular-nums">{campaign[key].toLocaleString("en-IN")}</span>
      ),
    })),
    {
      key: "status",
      header: "Status",
      render: (campaign) => (
        <Badge variant={CAMPAIGN_STATUS_VARIANT[campaign.status]} dot>
          {campaign.status}
        </Badge>
      ),
    },
  ];

  return <Table columns={columns} data={campaigns} rowKey={(campaign) => campaign.id} />;
}

// -----------------------------------------------------------------------------
// ACTIVITY ICON
// -----------------------------------------------------------------------------

function getActivityIcon(type: Activity["type"]) {
  switch (type) {
    case "campaign":
      return <Megaphone size={13} />;

    case "plan":
      return <Layers size={13} />;

    case "credit":
      return <Plus size={13} />;

    case "profile":
      return <Pencil size={13} />;

    case "status":
      return <Check size={13} />;

    default:
      return <span>•</span>;
  }
}

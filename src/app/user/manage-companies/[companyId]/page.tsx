"use client";

import { useEffect, useMemo, useState } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { useParams, useRouter } from "next/navigation";
import "./company-details.css";

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
  const [creditSubmitting, setCreditSubmitting] = useState(false);

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

    const loadCompany = async () => {
      await fetchCompany();
      await refreshCompanyCredits();
    };

    loadCompany();
  }, [companyId]);

  const refreshCompanyCredits = async () => {
    if (!companyId) return;

    try {
      const response = await axiosInstance.get(
        `/v1/super-admin/companies/${companyId}/credits?page=1&limit=25`,
      );

      console.log("GET COMPANY CREDITS RESPONSE =>", response.data);

      const payload = response.data?.data ?? response.data;
      const items = Array.isArray(payload?.items) ? payload.items : [];

      // The API returns the newest transaction first.
      // balance_after on the latest transaction is the current backend balance.
      if (items.length > 0) {
        const latestBalance = Number(items[0]?.balance_after);

        if (Number.isFinite(latestBalance)) {
          setCompany((current) =>
            current ? { ...current, credits: latestBalance } : current,
          );
        }
      }
    } catch (err: any) {
      console.error("GET COMPANY CREDITS ERROR =>", err);
      throw err;
    }
  };

  const handleStatusChange = () => {
    setCompany((current) => {
      if (!current) return current;

      return {
        ...current,
        status: current.status === "active" ? "suspended" : "active",
      };
    });
  };

  const handleAddCredits = async () => {
    const amount = Number(creditAmount);

    if (!amount || amount <= 0 || creditSubmitting || !companyId) {
      return;
    }

    setCreditSubmitting(true);
    setError(null);

    try {
      const requestId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      await axiosInstance.post(
        `/v1/super-admin/companies/${companyId}/credits`,
        {
          amount: amount.toFixed(2),
          request_id: requestId,
          reason: "Approved top-up",
        },
      );

      // Refresh credits once after the POST succeeds.
      // The backend credits API is the source of truth.
      await refreshCompanyCredits();

      setCreditAmount("");
      setShowCreditModal(false);
    } catch (err: any) {
      console.error("ADD CREDITS ERROR =>", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to add credits.",
      );
    } finally {
      setCreditSubmitting(false);
    }
  };

  const handleEditProfile = () => {
    setShowEditModal(false);
  };

  if (loading) {
    return (
      <div className="company-details-page">
        <div className="company-details-loading">
          Loading company details...
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="company-details-page">
        <div className="company-details-error">
          <h2>Unable to load company</h2>
          <p>{error || "Company details not found."}</p>

          <button
            type="button"
            className="primary-button"
            onClick={() => router.push("/user/manage-companies")}
          >
            Back to Companies
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="company-details-page">
      {/* Header */}
      <div className="company-details-header">
        <div>
          <button
            type="button"
            className="back-button"
            onClick={() => router.push("/user/manage-companies")}
          >
            ← Back to Companies
          </button>

          <h1>Company Details</h1>
          <p>
            View and manage company information, campaigns, activity and plan
            usage.
          </p>
        </div>
      </div>

      {/* ============================================================= */}
      {/* COMPANY PROFILE + QUICK ACTIONS */}
      {/* ============================================================= */}

      <section className="company-profile-card">
        {/* LEFT — Company information */}
        <div className="company-profile-left">
          <div className="company-logo">
            {company.name.charAt(0).toUpperCase()}
          </div>

          <div className="company-profile-info">
            <div className="company-name-row">
              <h2>{company.name}</h2>

              <span className={`status-badge ${company.status}`}>
                {company.status === "active" ? "Active" : "Suspended"}
              </span>
            </div>

            <p className="company-email">{company.email}</p>

            <div className="company-contact-row">
              <span>{company.phone}</span>
              <span className="separator">•</span>
              <span>Business ID: {company.businessId}</span>
            </div>

            {/* Profile metadata — 2 x 2 */}
            <div className="company-profile-meta">
              <div>
                <span>Joined</span>
                <strong>{company.joinedDate}</strong>
              </div>

              <div>
                <span>Last Active</span>
                <strong>{company.lastActive}</strong>
              </div>

              <div>
                <span>Plan</span>
                <strong>{company.plan}</strong>
              </div>

              <div>
                <span>Credits</span>
                <strong className="credit-value">
                  {company.credits.toLocaleString("en-IN")}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Profile buttons + Quick Actions */}
        <div className="company-profile-right">
          <div className="profile-top-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowEditModal(true)}
            >
              Edit Profile
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
              }}
            >
              Share Profile
            </button>
          </div>

          <div className="company-quick-actions">
            <span className="quick-actions-label">QUICK ACTIONS</span>

            <div className="quick-action-list">
              <button
                type="button"
                className={
                  company.status === "active"
                    ? "quick-action-item danger"
                    : "quick-action-item success"
                }
                onClick={handleStatusChange}
              >
                <span className="quick-action-icon">
                  {company.status === "active" ? "⏸" : "✓"}
                </span>

                <span className="quick-action-text">
                  <strong>
                    {company.status === "active"
                      ? "Suspend Company"
                      : "Activate Company"}
                  </strong>
                </span>

                <span className="quick-action-arrow">→</span>
              </button>

              <button
                type="button"
                className="quick-action-item"
                onClick={() => setShowPlanModal(true)}
              >
                <span className="quick-action-icon">◆</span>

                <span className="quick-action-text">
                  <strong>Change Plan</strong>
                </span>

                <span className="quick-action-arrow">→</span>
              </button>

              <button
                type="button"
                className="quick-action-item"
                onClick={() => setShowCreditModal(true)}
              >
                <span className="quick-action-icon">＋</span>

                <span className="quick-action-text">
                  <strong>Add Credits</strong>
                </span>

                <span className="quick-action-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="company-content-card">
        <div className="company-tabs">
          <button
            type="button"
            className={
              activeTab === "overview" ? "tab-button active" : "tab-button"
            }
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>

          <button
            type="button"
            className={
              activeTab === "campaigns" ? "tab-button active" : "tab-button"
            }
            onClick={() => setActiveTab("campaigns")}
          >
            Campaigns
          </button>

          <button
            type="button"
            className={
              activeTab === "activity" ? "tab-button active" : "tab-button"
            }
            onClick={() => setActiveTab("activity")}
          >
            Activity
          </button>

          <button
            type="button"
            className={
              activeTab === "plan" ? "tab-button active" : "tab-button"
            }
            onClick={() => setActiveTab("plan")}
          >
            Plan & Usage
          </button>
        </div>

        <div className="tab-content">
          {/* ========================================================= */}
          {/* OVERVIEW */}
          {/* ========================================================= */}

          {activeTab === "overview" && (
            <div>
              <div className="overview-header">
                <div>
                  <h3>Overview</h3>
                  <p>Company messaging and campaign performance.</p>
                </div>
              </div>

              <div className="kpi-grid">
                <KpiCard
                  title="Total Messages"
                  value={MOCK_STATS.totalMessages}
                />

                <KpiCard
                  title="Delivered Messages"
                  value={MOCK_STATS.deliveredMessages}
                />

                <KpiCard
                  title="Failed Messages"
                  value={MOCK_STATS.failedMessages}
                />

                <KpiCard
                  title="Received Messages"
                  value={MOCK_STATS.receivedMessages}
                />

                <KpiCard
                  title="In Progress"
                  value={MOCK_STATS.inProgressMessages}
                />

                <KpiCard
                  title="Total Campaigns"
                  value={MOCK_STATS.totalCampaigns}
                />

                <KpiCard title="Templates" value={MOCK_STATS.templates} />

                <KpiCard
                  title="Message Templates"
                  value={MOCK_STATS.messageTemplates}
                />
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* CAMPAIGNS */}
          {/* ========================================================= */}

          {activeTab === "campaigns" && (
            <div>
              <div className="overview-header">
                <div>
                  <h3>Campaigns</h3>
                  <p>Campaign history and performance for this company.</p>
                </div>

                <button
                  type="button"
                  className="view-more-button"
                  onClick={() => {}}
                >
                  View More →
                </button>
              </div>

              <CampaignTable campaigns={MOCK_CAMPAIGNS} />
            </div>
          )}

          {/* ========================================================= */}
          {/* ACTIVITY */}
          {/* ========================================================= */}

          {activeTab === "activity" && (
            <div>
              <div className="overview-header">
                <div>
                  <h3>Activity</h3>
                  <p>
                    Recent actions and changes made to this company account.
                  </p>
                </div>

                <button
                  type="button"
                  className="view-more-button"
                  onClick={() => {}}
                >
                  View More →
                </button>
              </div>

              <div className="activity-timeline">
                {MOCK_ACTIVITIES.map((activity) => (
                  <div className="activity-item" key={activity.id}>
                    <div className={`activity-icon ${activity.type}`}>
                      {getActivityIcon(activity.type)}
                    </div>

                    <div className="activity-content">
                      <div className="activity-title-row">
                        <strong>{activity.title}</strong>
                        <span>{activity.date}</span>
                      </div>

                      <p>{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PLAN & USAGE */}
          {/* ========================================================= */}

          {activeTab === "plan" && (
            <div>
              <div className="overview-header">
                <div>
                  <h3>Plan & Usage</h3>
                  <p>Current subscription and resource usage.</p>
                </div>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setShowPlanModal(true)}
                >
                  Change Plan
                </button>
              </div>

              <div className="plan-layout">
                <div className="plan-card">
                  <div className="plan-card-header">
                    <div>
                      <span className="small-label">Current Plan</span>

                      <h3>{MOCK_PLAN.name}</h3>
                    </div>

                    <span className="status-badge active">
                      {MOCK_PLAN.status}
                    </span>
                  </div>

                  <div className="plan-pricing">
                    <div>
                      <span>Monthly</span>
                      <strong>
                        ₹{MOCK_PLAN.monthlyPrice.toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div>
                      <span>Yearly</span>
                      <strong>
                        ₹{MOCK_PLAN.yearlyPrice.toLocaleString("en-IN")}
                      </strong>
                    </div>
                  </div>

                  <div className="plan-dates">
                    <div>
                      <span>Start Date</span>
                      <strong>{MOCK_PLAN.startDate}</strong>
                    </div>

                    <div>
                      <span>End Date</span>
                      <strong>{MOCK_PLAN.endDate}</strong>
                    </div>
                  </div>

                  <div className="plan-features">
                    <h4>Plan Features</h4>

                    {MOCK_PLAN.features.map((feature) => (
                      <div className="feature-item" key={feature}>
                        <span>✓</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="usage-card">
                  <div className="usage-card-header">
                    <h3>Usage</h3>
                    <span>Current billing period</span>
                  </div>

                  {MOCK_USAGE.map((item) => {
                    const percentage = Math.min(
                      (item.used / item.limit) * 100,
                      100,
                    );

                    return (
                      <div className="usage-item" key={item.label}>
                        <div className="usage-label-row">
                          <span>{item.label}</span>

                          <strong>
                            {item.used.toLocaleString("en-IN")} /{" "}
                            {item.limit.toLocaleString("en-IN")}
                          </strong>
                        </div>

                        <div className="usage-progress">
                          <div
                            className="usage-progress-bar"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                        <span className="usage-percentage">
                          {Math.round(percentage)}% used
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================= */}
      {/* EDIT PROFILE MODAL */}
      {/* ============================================================= */}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3>Edit Profile</h3>
                <p>Update company information.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>

            <div className="form-grid">
              <label>
                Company Name
                <input
                  type="text"
                  value={company.name}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      name: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={company.email}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      email: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Phone
                <input
                  type="text"
                  value={company.phone}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      phone: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Business ID
                <input type="text" value={company.businessId} disabled />
              </label>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={handleEditProfile}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* CHANGE PLAN MODAL */}
      {/* ============================================================= */}

      {showPlanModal && (
        <div className="modal-overlay">
          <div className="modal-card small">
            <div className="modal-header">
              <div>
                <h3>Change Plan</h3>
                <p>Select a new plan for this company.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowPlanModal(false)}
              >
                ×
              </button>
            </div>

            <div className="plan-options">
              {["Starter", "Professional", "Enterprise"].map((plan) => (
                <button
                  type="button"
                  key={plan}
                  className={
                    company.plan === plan
                      ? "plan-option selected"
                      : "plan-option"
                  }
                  onClick={() => {
                    setCompany({
                      ...company,
                      plan,
                    });

                    setShowPlanModal(false);
                  }}
                >
                  <strong>{plan}</strong>

                  {company.plan === plan && <span>Current</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* ADD CREDITS MODAL */}
      {/* ============================================================= */}

      {showCreditModal && (
        <div className="modal-overlay">
          <div className="modal-card small">
            <div className="modal-header">
              <div>
                <h3>Add Credits</h3>
                <p>Add credits to the company account.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowCreditModal(false)}
              >
                ×
              </button>
            </div>

            <label className="credit-input">
              Credit Amount
              <input
                type="number"
                min="1"
                placeholder="Enter amount"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
              />
            </label>

            <div className="current-credit-info">
              Current balance:{" "}
              <strong>{company.credits.toLocaleString("en-IN")}</strong>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowCreditModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={handleAddCredits}
                disabled={creditSubmitting}
              >
                {creditSubmitting ? "Adding..." : "Add Credits"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// KPI CARD
// -----------------------------------------------------------------------------

function KpiCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="kpi-card">
      <span>{title}</span>
      <strong>{value.toLocaleString("en-IN")}</strong>
    </div>
  );
}

// -----------------------------------------------------------------------------
// CAMPAIGN TABLE
// -----------------------------------------------------------------------------

function CampaignTable({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <div className="table-section">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Created</th>
              <th>Contacts</th>
              <th>Messages</th>
              <th>Delivered</th>
              <th>Failed</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td>
                  <strong>{campaign.title}</strong>
                </td>

                <td>{campaign.createdDate}</td>

                <td>{campaign.contacts.toLocaleString("en-IN")}</td>

                <td>{campaign.messages.toLocaleString("en-IN")}</td>

                <td>{campaign.delivered.toLocaleString("en-IN")}</td>

                <td>{campaign.failed.toLocaleString("en-IN")}</td>

                <td>
                  <span
                    className={`campaign-status ${campaign.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {campaign.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// ACTIVITY ICON
// -----------------------------------------------------------------------------

function getActivityIcon(type: Activity["type"]) {
  switch (type) {
    case "campaign":
      return "↗";

    case "plan":
      return "◆";

    case "credit":
      return "+";

    case "profile":
      return "✎";

    case "status":
      return "✓";

    default:
      return "•";
  }
}

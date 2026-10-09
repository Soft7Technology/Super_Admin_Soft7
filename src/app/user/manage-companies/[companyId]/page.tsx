"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { useParams, useRouter } from "next/navigation";
import "./company-details.css";
import { toast } from "react-toastify";
import ProfileAvatar from "@/components/ProfileAvatar";
import {
  ArrowLeft,
  Pencil,
  Share2,
  PauseCircle,
  CheckCircle2,
  Layers,
  PlusCircle,
  ChevronRight,
  Users,
  UserCheck,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

const AVATAR_COLORS = [
  "#087f5b",
  "#52a77d",
  "#2fb344",
  "#ae3ec9",
  "#f59f00",
  "#17a2b8",
  "#6366f1",
  "#ec4899",
];

function getAvatarBg(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

type CompanyStatus = "active" | "suspended";

type Tab = "overview" | "campaigns" | "activity";

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

interface OverviewStats {
  users: number;
  contacts: number;
  totalCampaigns: number;
  completedCampaigns: number;
  failedCampaigns: number;
  templates: number;

  totalMessages: number;
  failedMessages: number;
  deliveredMessages: number;
  receivedMessages: number;
}

const EMPTY_STATS: OverviewStats = {
  users: 0,
  contacts: 0,
  totalCampaigns: 0,
  completedCampaigns: 0,
  failedCampaigns: 0,
  templates: 0,

  totalMessages: 0,
  failedMessages: 0,
  deliveredMessages: 0,
  receivedMessages: 0,
};

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
  company_id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  description: string;
  status: string;
  created_at: string;
}

interface ActivePlan {
  plan_name?: string;
  price?: string;
  active?: boolean;
}


function buildActivePlanLabel(plans: ActivePlan[]): string {
  const active = plans.filter((p) => p?.plan_name && p.active !== false);
  if (active.length === 0) return "—";

  const sorted = [...active].sort(
    (a, b) => Number(b.price ?? 0) - Number(a.price ?? 0),
  );
  const uniqueNames = Array.from(
    new Set(sorted.map((p) => p.plan_name as string)),
  );

  return uniqueNames.length > 1
    ? `${uniqueNames[0]} +${uniqueNames.length - 1}`
    : uniqueNames[0];
}

export default function CompanyDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const companyId = params?.companyId as string;

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [stats, setStats] = useState<OverviewStats>(EMPTY_STATS);
  const [activePlanLabel, setActivePlanLabel] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);

  const [creditAmount, setCreditAmount] = useState("");
  const [creditSubmitting, setCreditSubmitting] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
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

       
        const campaignGroups: { status: string; count: string | number }[] =
          Array.isArray(payload?.campaigns) ? payload.campaigns : [];

        const campaignCount = (status: string) =>
          Number(
            campaignGroups.find(
              (g) => String(g.status).toLowerCase() === status,
            )?.count ?? 0,
          );

        const totalCampaigns = campaignGroups.reduce(
          (sum, g) => sum + Number(g.count ?? 0),
          0,
        );

        setStats((current) => ({
          ...current,
          users: Number(payload?.counts?.users ?? 0),
          contacts: Number(payload?.counts?.contacts ?? 0),
          totalCampaigns,
          completedCampaigns: campaignCount("completed"),
          failedCampaigns: campaignCount("failed"),
        }));
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


  useEffect(() => {
    if (!companyId) return;

    const fetchActivePlans = async () => {
      try {
        const response = await axiosInstance.get(
          `/v1/super-admin/companies/${companyId}/active-plans`,
          { params: { page: 1, limit: 25 } },
        );

        const items = response.data?.data?.items ?? [];
        setActivePlanLabel(buildActivePlanLabel(items));
      } catch (err) {
        console.error("GET ACTIVE PLANS ERROR =>", err);
      }
    };

    fetchActivePlans();
  }, [companyId]);

  const refreshCompanyCredits = async () => {
    if (!companyId) return;

    try {
      const response = await axiosInstance.get(
        `/v1/super-admin/companies/${companyId}/credits?page=1&limit=25`,
      );

      const payload = response.data?.data ?? response.data;
      const items = Array.isArray(payload?.items) ? payload.items : [];

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

const [statusSubmitting, setStatusSubmitting] = useState(false);

const handleStatusChange = async () => {
  if (!companyId || !company || statusSubmitting) return;

  const isSuspending = company.status === "active";

  const newStatus: CompanyStatus = isSuspending ? "suspended" : "active";

  const reason = isSuspending ? "Account review" : "Review completed";

  setStatusSubmitting(true);
  setError(null);

  try {
    const response = await axiosInstance.patch(
      `/v1/super-admin/companies/${companyId}/status`,
      {
        status: newStatus,
        reason,
      },
    );

    console.log("COMPANY STATUS UPDATE RESPONSE =>", response.data);

    // Update UI only after API succeeds
    setCompany((current) =>
      current
        ? {
            ...current,
            status: newStatus,
          }
        : current,
    );

    toast.success(
      isSuspending
        ? "Company suspended successfully."
        : "Company activated successfully.",
    );
  } catch (err: any) {
    console.error("COMPANY STATUS UPDATE ERROR =>", err);

    toast.error(
      err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update company status.",
    );
  } finally {
    setStatusSubmitting(false);
  }
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

     toast.success(
       `${amount.toLocaleString("en-IN")} credits added successfully.`,
     );
     setCreditAmount("");
     setShowCreditModal(false);

     try {
       await refreshCompanyCredits();
     } catch (refreshError) {
       console.error("CREDITS REFRESH ERROR =>", refreshError);
     }
   } catch (err: any) {
     console.error("ADD CREDITS ERROR =>", err);

     const errorMsg =
       err?.response?.data?.message ||
         err?.response?.data?.error ||
         err?.message ||
         "Failed to add credits.";
     setError(errorMsg);
     toast.error(errorMsg);
   } finally {
     setCreditSubmitting(false);
   }
 };



const handleEditProfile = async () => {
  if (!company || !companyId || editSubmitting) return;

  setEditSubmitting(true);

  try {
    const response = await axiosInstance.patch(
      `/v1/super-admin/companies/${companyId}`,
      {
        name: company.name.trim(),
        email: company.email.trim(),
        phone: company.phone.trim(),
        reason: "Company profile updated by super admin",
      },
    );

    const updatedCompany = response.data?.data;

    if (!updatedCompany) {
      throw new Error("Updated company data was not returned.");
    }

    setCompany((current) =>
      current
        ? {
            ...current,
            name: updatedCompany.name ?? current.name,
            email: updatedCompany.email ?? current.email,
            phone: updatedCompany.phone ?? current.phone,
            businessId: updatedCompany.business_id ?? current.businessId,
            status:
              String(updatedCompany.status).toLowerCase() === "suspended"
                ? "suspended"
                : "active",
          }
        : current,
    );

    setShowEditModal(false);
    showToast("Company profile updated successfully.", "success");
  } catch (err: any) {
    console.error("UPDATE COMPANY PROFILE ERROR =>", err);

    showToast(
      err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update company profile.",
      "error",
    );
  } finally {
    setEditSubmitting(false);
  }
};

  const fetchCampaignsPreview = async () => {
    if (!companyId) return;

    try {
      setCampaignsLoading(true);

      const response = await axiosInstance.get(
        `/v1/super-admin/companies/${companyId}/campaign`,
        {
          params: {
            page: 1,
            limit: 5,
          },
        },
      );

      const items = response.data?.data?.items ?? [];

      const mappedCampaigns: Campaign[] = items.map((campaign: any) => ({
        id: String(campaign.id),
        title: campaign.name || "—",
        createdDate: campaign.created_at
          ? new Date(campaign.created_at).toLocaleDateString()
          : "—",
        contacts: Number(campaign.total_recipients ?? 0),
        messages: Number(campaign.sent_count ?? 0),
        delivered: Number(campaign.delivered_count ?? 0),
        failed: Number(campaign.failed_count ?? 0),
        status:
          String(campaign.status).toLowerCase() === "completed"
            ? "Completed"
            : String(campaign.status).toLowerCase() === "failed"
            ? "Failed"
            : String(campaign.status).toLowerCase() === "scheduled"
            ? "Scheduled"
            : "Running",
      }));

      setCampaigns(mappedCampaigns);
    } catch (error) {
      console.error("Failed to fetch campaigns", error);
    } finally {
      setCampaignsLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchCampaignsPreview();
    }
  }, [companyId]);

  const fetchActivitiesPreview = async () => {
    if (!companyId) return;

    try {
      setActivitiesLoading(true);

      const response = await axiosInstance.get(
        `/v1/super-admin/companies/${companyId}/activity`,
        {
          params: {
            page: 1,
            limit: 5,
          },
        },
      );

      setActivities(response.data?.data?.items ?? []);
    } catch (error) {
      console.error("Failed to fetch activities", error);
    } finally {
      setActivitiesLoading(false);
    }
  };
useEffect(() => {
  if (!companyId) return;

  const fetchMessageStats = async () => {
    try {
      const response = await axiosInstance.get(
        `/v1/super-admin/companies/${companyId}/messages`,
        {
          params: {
            page: 1,
            limit: 1,
          },
        },
      );

     const totalMessages = Number(response.data?.data?.pagination?.total ?? 0);

     setStats((current) => ({
       ...current,
       totalMessages,
     }));
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  fetchMessageStats();
}, [companyId]);
  
  useEffect(() => {
    if (companyId) {
      fetchActivitiesPreview();
    }
  }, [companyId]);

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

  const displayPlan =
    activePlanLabel && activePlanLabel !== "—" ? activePlanLabel : company.plan;

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
            <ArrowLeft size={15} /> Back to Companies
          </button>

          <h1>Company Details</h1>
          <p>View and manage company information, campaigns and activity.</p>
        </div>
      </div>

      {/* ============================================================= */}
      {/* COMPANY PROFILE + QUICK ACTIONS */}
      {/* ============================================================= */}

      <section className="company-profile-card">
        {/* LEFT — Company information */}
        <div className="company-profile-left">
          <ProfileAvatar name={company.name} size={52} />

          <div className="company-profile-info">
            <div className="company-name-row">
              <h2>{company.name}</h2>

              <span
                className={`status-badge ${String(
                  company.status,
                ).toLowerCase()}`}
              >
                {String(company.status).toLowerCase() === "active"
                  ? "Active"
                  : "Suspended"}
              </span>

              <div className="company-profile-actions">
                <button
                  type="button"
                  className="profile-action-btn"
                  onClick={() => setShowEditModal(true)}
                  aria-label="Edit Profile"
                >
                  <Pencil size={13} />
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  className="profile-action-btn"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success("Profile link copied.");
                  }}
                  aria-label="Share Profile"
                >
                  <Share2 size={13} />
                  <span>Share Profile</span>
                </button>
              </div>
            </div>

            <p className="company-email">{company.email || "—"}</p>

            <div className="company-contact-row">
              <span>{company.phone || "—"}</span>
            </div>

            {/* Profile metadata — 2 x 2 */}
            <div className="company-profile-meta">
              <div>
                <span>Joined</span>
                <strong>{company.joinedDate || "—"}</strong>
              </div>

              <div>
                <span>Last Active</span>
                <strong>{company.lastActive || "—"}</strong>
              </div>

              <div>
                <span>Plan</span>
                <strong>{displayPlan || "Starter"}</strong>
              </div>

              <div>
                <span>Credits</span>
                <strong className="credit-value">
                  ₹{Number(company.credits || 0).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Profile buttons + Quick Actions */}
        <div className="company-profile-right">
          <div className="company-quick-actions">
            <span className="quick-actions-label">QUICK ACTIONS</span>

            <div className="quick-action-list">
              <button
                type="button"
                className={
                  String(company.status).toLowerCase() === "active"
                    ? "quick-action-item danger"
                    : "quick-action-item success"
                }
                onClick={handleStatusChange}
                disabled={statusSubmitting}
              >
                <span className="quick-action-icon">
                  {String(company.status).toLowerCase() === "active" ? (
                    <PauseCircle size={16} />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                </span>

                <span className="quick-action-text">
                  <strong>
                    {statusSubmitting
                      ? "Updating..."
                      : String(company.status).toLowerCase() === "active"
                      ? "Suspend Company"
                      : "Activate Company"}
                  </strong>
                </span>

                <ChevronRight size={16} className="quick-action-arrow" />
              </button>

              <button
                type="button"
                className="quick-action-item"
                onClick={() => setShowPlanModal(true)}
              >
                <span className="quick-action-icon">
                  <Layers size={16} />
                </span>

                <span className="quick-action-text">
                  <strong>Change Plan</strong>
                </span>

                <ChevronRight size={16} className="quick-action-arrow" />
              </button>

              <button
                type="button"
                className="quick-action-item"
                onClick={() => setShowCreditModal(true)}
              >
                <span className="quick-action-icon">
                  <PlusCircle size={16} />
                </span>

                <span className="quick-action-text">
                  <strong>Add Credits</strong>
                </span>

                <ChevronRight size={16} className="quick-action-arrow" />
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

              {/* Account totals */}
              <div className="kpi-grid kpi-grid-4">
                <KpiCard
                  title="Users"
                  value={stats.users}
                  icon={<Users size={18} />}
                />
                <KpiCard
                  title="Contacts"
                  value={stats.contacts}
                  icon={<UserCheck size={18} />}
                />
                <KpiCard
                  title="Total Campaigns"
                  value={stats.totalCampaigns}
                  icon={<Layers size={18} />}
                />
                <KpiCard
                  title="Total Messages"
                  value={stats.totalMessages}
                  icon={<MessageSquare size={18} />}
                />
              </div>

              {/* Campaigns */}
              <div className="kpi-section-heading">
                <h4>Campaigns</h4>
                <p>Campaign outcomes across this company.</p>
              </div>

              <div className="kpi-grid kpi-grid-3">
                <KpiCard
                  title="Total Campaigns"
                  value={stats.totalCampaigns}
                  icon={<Layers size={18} />}
                />
                <KpiCard
                  title="Completed"
                  value={stats.completedCampaigns}
                  tone="success"
                  icon={<CheckCircle2 size={18} />}
                />
                <KpiCard
                  title="Failed"
                  value={stats.failedCampaigns}
                  tone="danger"
                  icon={<AlertCircle size={18} />}
                />
              </div>

              {/* Messages */}
              <div className="kpi-section-heading">
                <h4>Messages</h4>
                <p>Message delivery status.</p>
              </div>

              <div className="kpi-grid kpi-grid-3">
                <KpiCard
                  title="Failed"
                  value={stats.failedMessages}
                  tone="danger"
                  icon={<AlertCircle size={18} />}
                />
                <KpiCard
                  title="Delivered"
                  value={stats.deliveredMessages}
                  tone="success"
                  icon={<CheckCircle2 size={18} />}
                />
                <KpiCard
                  title="Received"
                  value={stats.receivedMessages}
                  icon={<MessageSquare size={18} />}
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
                  onClick={() =>
                    router.push(`/user/manage-companies/${companyId}/campaigns`)
                  }
                >
                  View More →
                </button>
              </div>

              {campaignsLoading ? (
                <p>Loading campaigns...</p>
              ) : (
                <CampaignTable campaigns={campaigns} />
              )}
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
                  onClick={() =>
                    router.push(`/user/manage-companies/${companyId}/activity`)
                  }
                >
                  View More →
                </button>
              </div>

              <div className="activity-timeline">
                {activitiesLoading ? (
                  <p>Loading activity...</p>
                ) : (
                  <div className="activity-timeline">
                    {activities.map((activity) => (
                      <div className="activity-item" key={activity.id}>
                        <div className="activity-icon profile">•</div>

                        <div className="activity-content">
                          <div className="activity-title-row">
                            <strong>
                              {activity.action} {activity.entity_type}
                            </strong>

                            <span>
                              {new Date(activity.created_at).toLocaleString()}
                            </span>
                          </div>

                          <p>{activity.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                disabled={editSubmitting}
              >
                {editSubmitting ? "Saving..." : "Save Changes"}
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

function KpiCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: number;
  icon?: ReactNode;
  tone?: "success" | "danger";
}) {
  return (
    <div className={tone ? `kpi-card kpi-${tone}` : "kpi-card"}>
      <div className="kpi-card__left">
        {icon && <div className="kpi-card__icon">{icon}</div>}
        <div className="kpi-card__info">
          <span className="kpi-card__label">{title}</span>
          <strong className="kpi-card__val">{value.toLocaleString("en-IN")}</strong>
        </div>
      </div>
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

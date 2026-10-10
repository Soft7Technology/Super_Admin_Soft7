"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { axiosInstance } from "@/lib/axiosInstance";
import { ArrowLeft, Activity, Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import "../user-profile.css";

function formatPlanDateTime(dateStr: string | null | Date) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    const datePart = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timePart = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    return `${datePart}, ${timePart}`;
  } catch {
    return String(dateStr);
  }
}

export default function UserActivityPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [companyId, setCompanyId] = useState<string | null>(searchParams.get("companyId"));
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterAction, setFilterAction] = useState<string>("ALL");
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);

  // Debounce search input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Resolve companyId if not in query params
  useEffect(() => {
    if (companyId) return;
    try {
      const cached = sessionStorage.getItem(`user_${userId}`) || sessionStorage.getItem("sa_selected_user");
      if (cached) {
        const u = JSON.parse(cached);
        if (u.companyId || u.company_id) {
          setCompanyId(String(u.companyId || u.company_id));
          setUserName(u.name || "");
          return;
        }
      }
    } catch {}

    axiosInstance.get("/v1/admin/companies/user", { params: { limit: 1000 } }).then((res) => {
      const users = res.data?.data?.data || res.data?.data || res.data?.users || [];
      const match = users.find((u: any) => String(u.id) === String(userId));
      if (match) {
        setCompanyId(String(match.company_id ?? match.companyId ?? match.company?.id));
        setUserName(match.name || "");
      }
    }).catch(() => {});
  }, [userId, companyId]);

  // Fetch activities with backend query params
  const fetchActivities = useCallback(async () => {
    if (!companyId || !userId) return;
    setLoading(true);
    try {
      const qParams: Record<string, any> = { page, limit };
      if (debouncedSearch.trim()) {
        qParams.search = debouncedSearch.trim();
      }
      if (filterAction !== "ALL") {
        qParams.action = filterAction.toLowerCase();
      }

      const res = await axiosInstance.get(`/v1/super-admin/companies/${companyId}/${userId}/activity`, {
        params: qParams,
      });
      const d = res.data?.data ?? res.data ?? {};
      const items = Array.isArray(d.items) ? d.items : Array.isArray(d) ? d : [];
      setActivities(items);
      setTotal(d.pagination?.total ?? items.length);
    } catch (err) {
      console.error("Failed to fetch activity:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId, userId, page, limit, debouncedSearch, filterAction]);

  useEffect(() => {
    if (companyId) {
      fetchActivities();
    }
  }, [companyId, fetchActivities]);

  const handleFilterChange = (act: string) => {
    setFilterAction(act);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="up-container" style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => router.push(`/user/all-user/${userId}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "8px",
              background: "var(--surf2, #f1f5f9)",
              border: "1px solid var(--border, #e2e8f0)",
              color: "var(--title-color, #1e293b)",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={16} />
            Back to Profile
          </button>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "var(--title-color, #1e293b)" }}>
              User Activity & Audit History
            </h2>
            <div style={{ fontSize: "12.5px", color: "var(--muted, #64748b)", marginTop: "2px" }}>
              {userName ? `${userName} • ` : ""}Total {total} activities recorded
            </div>
          </div>
        </div>

        <button
          onClick={fetchActivities}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            borderRadius: "8px",
            background: "var(--surf, #fff)",
            border: "1px solid var(--border, #e2e8f0)",
            color: "var(--text, #334155)",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "18px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
          <input
            type="text"
            placeholder="Search activity description (Backend query)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px 9px 34px",
              borderRadius: "8px",
              border: "1px solid var(--border, #e2e8f0)",
              background: "var(--surf, #fff)",
              color: "var(--title-color, #1e293b)",
              fontSize: "13px",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {["ALL", "LOGIN", "CREATE", "UPDATE", "DELETE"].map((act) => (
            <button
              key={act}
              onClick={() => handleFilterChange(act)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                border: "1px solid var(--border, #e2e8f0)",
                background: filterAction === act ? "var(--crm-primary, #206bc4)" : "var(--surf, #fff)",
                color: filterAction === act ? "#fff" : "var(--muted, #64748b)",
              }}
            >
              {act}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Spinner />
        </div>
      ) : activities.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", background: "var(--surf, #fff)", borderRadius: "10px", border: "1px solid var(--border, #e2e8f0)", color: "var(--muted)" }}>
          No activities found matching criteria.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {activities.map((act: any, idx: number) => {
            const actionStr = (act.action || "UNKNOWN").toUpperCase();
            const iconCls = `up-act-icon--${["LOGIN", "CREATE", "UPDATE", "DELETE"].includes(actionStr) ? actionStr.toLowerCase() : "default"}`;
            const iconSymbol = actionStr === "LOGIN" ? "→" : actionStr === "CREATE" ? "+" : actionStr === "UPDATE" ? "✎" : actionStr === "DELETE" ? "✕" : "•";
            const entityStr = (act.entity_type || "").toUpperCase();
            const entityCls = `up-act-entity-badge--${["AUTH", "CONTACT", "CAMPAIGN", "TEMPLATE", "CHATBOT"].includes(entityStr) ? entityStr.toLowerCase() : "default"}`;
            const isSuccess = (act.status || "").toUpperCase() === "SUCCESS";

            return (
              <div key={act.id || idx} className="up-act-card" onClick={() => setSelectedActivity(act)}>
                <div className={`up-act-icon ${iconCls}`}>{iconSymbol}</div>
                <div className="up-act-content">
                  <div className="up-act-top-row">
                    <span className="up-act-action-name">{actionStr}</span>
                    {entityStr && <span className={`up-act-entity-badge ${entityCls}`}>{entityStr}</span>}
                  </div>
                  <div className="up-act-desc">{act.description || "—"}</div>
                </div>
                <div className="up-act-right">
                  <div className="up-act-time-block">
                    <span className="up-act-date">{formatPlanDateTime(act.created_at)}</span>
                  </div>
                  <span className={`up-act-status ${isSuccess ? "up-act-status--success" : "up-act-status--fail"}`}>
                    {act.status || "—"}
                  </span>
                  <svg className="up-act-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "20px", padding: "12px 16px", background: "var(--surf, #fff)", borderRadius: "8px", border: "1px solid var(--border, #e2e8f0)", flexWrap: "wrap", gap: "10px" }}>
          <span style={{ fontSize: "13px", color: "var(--muted)" }}>
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} items)
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                background: "var(--surf)",
                color: page <= 1 ? "var(--muted)" : "var(--title-color)",
                cursor: page <= 1 ? "not-allowed" : "pointer",
                fontSize: "12.5px",
              }}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                background: "var(--surf)",
                color: page >= totalPages ? "var(--muted)" : "var(--title-color)",
                cursor: page >= totalPages ? "not-allowed" : "pointer",
                fontSize: "12.5px",
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Activity Slide Drawer */}
      {selectedActivity && (
        <>
          <div className="up-camp-drawer-overlay" onClick={() => setSelectedActivity(null)} />
          <div className="up-camp-drawer">
            <div className="up-camp-drawer-header">
              <div className="up-camp-drawer-title">
                <Activity size={18} style={{ color: "var(--crm-primary,#206bc4)" }} />
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "700" }}>{selectedActivity.action} Event</div>
                  <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "400", marginTop: "2px" }}>
                    Activity Audit Log
                  </div>
                </div>
              </div>
              <button className="up-camp-drawer-close" onClick={() => setSelectedActivity(null)}>✕</button>
            </div>

            <div className="up-camp-drawer-body">
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <span className={`up-act-status ${(selectedActivity.status || "").toUpperCase() === "SUCCESS" ? "up-act-status--success" : "up-act-status--fail"}`} style={{ fontSize: "12.5px", padding: "4px 12px" }}>
                  {selectedActivity.status || "—"}
                </span>
                {selectedActivity.entity_type && (
                  <span className={`up-act-entity-badge up-act-entity-badge--${selectedActivity.entity_type.toLowerCase()}`}>
                    {selectedActivity.entity_type}
                  </span>
                )}
              </div>

              <div className="up-cd-section">
                <div className="up-cd-section-title">Description</div>
                <div style={{ fontSize: "13.5px", color: "var(--title-color)", lineHeight: "1.6", background: "var(--surf2)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)", wordBreak: "break-all" }}>
                  {selectedActivity.description || "—"}
                </div>
              </div>

              <div className="up-cd-section">
                <div className="up-cd-section-title">Details</div>
                {[
                  { label: "Action", val: selectedActivity.action },
                  { label: "Entity Type", val: selectedActivity.entity_type },
                  { label: "Entity ID", val: selectedActivity.entity_id },
                  { label: "Status", val: selectedActivity.status },
                ].map(({ label, val }) => (
                  <div key={label} className="up-cd-info-row">
                    <span className="up-cd-info-label">{label}</span>
                    <span className="up-cd-info-val" style={{ fontFamily: "monospace" }}>{val || "—"}</span>
                  </div>
                ))}
              </div>

              <div className="up-cd-section">
                <div className="up-cd-section-title">Timestamp</div>
                <div className="up-cd-info-row">
                  <span className="up-cd-info-label">Created At</span>
                  <span className="up-cd-info-val">{formatPlanDateTime(selectedActivity.created_at)}</span>
                </div>
              </div>

              <div className="up-cd-section">
                <div className="up-cd-section-title">Identifiers</div>
                {[
                  { label: "Log ID", val: selectedActivity.id },
                  { label: "User ID", val: selectedActivity.user_id },
                  { label: "Company ID", val: selectedActivity.company_id },
                ].map(({ label, val }) => (
                  <div key={label} className="up-cd-info-row">
                    <span className="up-cd-info-label">{label}</span>
                    <span className="up-cd-info-val" style={{ fontSize: "11px", fontFamily: "monospace", wordBreak: "break-all" }}>{val || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

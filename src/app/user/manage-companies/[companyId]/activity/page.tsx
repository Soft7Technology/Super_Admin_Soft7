"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axiosInstance";
import "./activity.css"
interface Activity {
  id: string;
  company_id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  description: string | null;
  status: string;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString();
}

function getActivityStatus(status: string) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "success") {
    return { label: "SUCCESS", className: "success" };
  }

  if (normalized === "failed" || normalized === "error") {
    return { label: normalized.toUpperCase(), className: "failed" };
  }

  return {
    label: status || "UNKNOWN",
    className: "other",
  };
}

export default function ActivityPage() {
  const params = useParams();
  const router = useRouter();

  const companyId = params?.companyId as string;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 25,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(pagination.total / pagination.limit)),
    [pagination.total, pagination.limit],
  );

  useEffect(() => {
    if (!companyId) return;

    const fetchActivities = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get(
          `/v1/super-admin/companies/${companyId}/activity`,
          {
            params: {
              page: pagination.page,
              limit: pagination.limit,
            },
          },
        );

        const payload = response.data?.data ?? response.data;
        const items = Array.isArray(payload?.items) ? payload.items : [];

        setActivities(items);

        setPagination((current) => ({
          ...current,
          page: Number(payload?.pagination?.page ?? current.page),
          limit: Number(payload?.pagination?.limit ?? current.limit),
          total: Number(payload?.pagination?.total ?? 0),
        }));
      } catch (err: any) {
        console.error("GET ACTIVITY ERROR =>", err);

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to load activity.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [companyId, pagination.page, pagination.limit]);

  return (
    <div className="full-list-page">

      <div className="full-list-container">
        <header className="page-header">
          <div>
            <button
              type="button"
              className="back-button"
              onClick={() => router.push(`/user/manage-companies/${companyId}`)}
            >
              ← Back to Company Details
            </button>

            <h1>Activity</h1>
            <p>Recent actions and activity for this company account.</p>
          </div>

          <span className="count-pill">
            {pagination.total.toLocaleString("en-IN")} activities
          </span>
        </header>

        <section className="list-card">
          {loading ? (
            <div className="loading">Loading activity...</div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : activities.length === 0 ? (
            <div className="loading">No activity found.</div>
          ) : (
            <>
              <div className="activity-list">
                {activities.map((activity) => {
                  const status = getActivityStatus(activity.status);

                  return (
                    <div className="activity-item" key={activity.id}>
                      <div className="activity-icon">•</div>

                      <div className="activity-content">
                        <div className="activity-title-row">
                          <strong className="activity-title">
                            {activity.action} {activity.entity_type}
                          </strong>

                          <span className="activity-time">
                            {formatDateTime(activity.created_at)}
                          </span>
                        </div>

                    

                        <span className={`status-badge ${status.className}`}>
                          {status.label}
                        </span>
                        {activity.description && (
                          <p className="activity-description">
                            {activity.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pagination">
                <span className="pagination-info">
                  Page {pagination.page} of {totalPages}
                </span>

                <div className="pagination-actions">
                  <button
                    type="button"
                    className="pagination-button"
                    disabled={pagination.page <= 1 || loading}
                    onClick={() =>
                      setPagination((current) => ({
                        ...current,
                        page: current.page - 1,
                      }))
                    }
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    className="pagination-button"
                    disabled={pagination.page >= totalPages || loading}
                    onClick={() =>
                      setPagination((current) => ({
                        ...current,
                        page: current.page + 1,
                      }))
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

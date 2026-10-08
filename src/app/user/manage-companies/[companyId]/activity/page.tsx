"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axiosInstance";

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
      <style jsx>{`
        .full-list-page {
          min-height: 100vh;
          padding: 14px 18px;
          background: var(--bg, #f0f7f3);
          color: var(--text, #1b2d27);
        }

        .full-list-container {
          max-width: 100%;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 12px;
        }

        .back-button {
          border: 0;
          background: transparent;
          padding: 0;
          color: var(--primary, #087f5b);
          font-weight: 700;
          cursor: pointer;
          margin-bottom: 10px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.2s;
        }

        .back-button:hover {
          opacity: 0.8;
        }

        .page-header h1 {
          margin: 0;
          color: var(--title-color, #13231e);
          font-size: 21px;
          font-weight: 800;
        }

        .page-header p {
          margin: 7px 0 0;
          color: var(--muted, #70807a);
        }

        .count-pill {
          padding: 9px 14px;
          border: 1px solid var(--border, #d8e7e1);
          border-radius: 999px;
          background: var(--card-bg, #ffffff);
          color: var(--text-sub, #4f625b);
          font-weight: 700;
          white-space: nowrap;
        }

        .list-card {
          overflow: hidden;
          border: 1px solid var(--border, #e0ebe7);
          border-radius: 16px;
          background: var(--card-bg, #ffffff);
          box-shadow: var(--shadow-card, 0 5px 20px rgba(0, 0, 0, 0.06));
        }

        .activity-list {
          padding: 2px 14px;
        }

        .activity-item {
          display: grid;
          grid-template-columns: 28px 1fr;
          gap: 8px;
          padding: 7px 0;
          border-bottom: 1px solid var(--border, #e8efec);
        }

        .activity-item:last-child {
          border-bottom: 0;
        }

        .activity-icon {
          display: flex;
          width: 26px;
          height: 26px;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border, #d7ebe4);
          border-radius: 50%;
          background: var(--crm-primary-lt, rgba(8, 127, 91, 0.12));
          color: var(--primary, #087f5b);
          font-weight: 800;
        }

        .activity-content {
          min-width: 0;
        }

        .activity-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 4px;
        }

        .activity-title {
          color: var(--title-color, #1b2d27);
          font-size: 10px;
          font-weight: 750;
        }

        .activity-description {
          margin: 3px 0 0;
          color: var(--muted, #73837d);
          font-size: 10px;
          overflow-wrap: anywhere;
        }

        .activity-time {
          color: var(--text-sub, #83918c);
          font-size: 10px;
          white-space: nowrap;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          width: fit-content;
          padding: 2px 7px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .status-badge::before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .success {
          color: var(--success, #087f5b);
          background: rgba(16, 185, 129, 0.15);
        }

        .failed {
          color: var(--danger, #d92d20);
          background: rgba(239, 68, 68, 0.15);
        }

        .other {
          color: var(--primary, #087f5b);
          background: rgba(8, 127, 91, 0.15);
        }

        .loading,
        .error-state {
          padding: 50px 24px;
          text-align: center;
          color: var(--muted, #71827c);
        }

        .error-state {
          color: var(--danger, #c92a2a);
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 12px 14px;
          border-top: 1px solid var(--border, #edf2f0);
        }

        .pagination-info {
          color: var(--muted, #71827c);
          font-size: 10px;
        }

        .pagination-actions {
          display: flex;
          gap: 8px;
        }

        .pagination-button {
          min-width: 74px;
          padding: 9px 13px;
          border: 1px solid var(--border, #d5e3de);
          border-radius: 9px;
          background: var(--card-bg, #ffffff);
          color: var(--text, #315048);
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s, background 0.2s, border-color 0.2s;
        }

        .pagination-button:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }

        @media (max-width: 700px) {
          .full-list-page {
            padding: 18px;
          }

          .page-header {
            flex-direction: column;
          }

          .activity-title-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .activity-description {
            margin: 0 0 5px;
            color: #788780;
            font-size: 10px;
            line-height: 1.35;
            overflow-wrap: anywhere;
          }


          .activity-time {
            white-space: normal;
          }

          .pagination {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

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

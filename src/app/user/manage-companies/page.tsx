"use client";

import { useEffect, useState } from "react";
import { ngrokAxiosInstance } from "../../../lib/axiosInstance";
import "./manage-companies.css";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Status = "ACTIVE"|"INACTIVE"|"SUSPENDED"|"TRIAL";
type Plan   = "Starter"|"Basic"|"Pro"|"Enterprise";

interface Company {
  id:number; name:string; domain:string; logo:string; col:string;
  status:Status; plan:Plan; users:number; mrr:number; end:string;
}

const CARD_COLORS = ["#6C5CE7", "#00CBA4", "#74B9FF", "#FDCB6E", "#FF6B6B"];

function normalizeStatus(value: string | undefined): Status {
  if (value === "INACTIVE" || value === "SUSPENDED" || value === "TRIAL") return value;
  return "ACTIVE";
}

function normalizePlan(value: string | undefined): Plan {
  if (value === "Basic" || value === "Pro" || value === "Enterprise") return value;
  return "Starter";
}

function buildCompanyCardData(raw: any, fallback: { name: string; domain: string }): Company {
  const safeName = (raw?.name ?? fallback.name).trim();
  const idValue = Number(raw?.id);
  const initials = safeName
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    id: Number.isFinite(idValue) ? idValue : Date.now(),
    name: safeName,
    domain: (raw?.business_id ?? raw?.domain ?? fallback.domain).trim(),
    logo: initials || "CO",
    col: CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)],
    status: normalizeStatus(raw?.status),
    plan: normalizePlan(raw?.plan),
    users: Number(raw?.usersCount ?? raw?.users ?? 1),
    mrr: Number(raw?.mrr ?? raw?.monthlyRevenue ?? 0),
    end: raw?.renewalDate ?? raw?.end ?? "—",
  };
}

// ─── SHARED ───────────────────────────────────────────────────────────────────
function Badge({ status }: { status: Status }) {
  return (
    <span className={`mc-badge mc-badge--${status}`}>
      <span className="mc-badge__dot" />{status[0]+status.slice(1).toLowerCase()}
    </span>
  );
}

function KPI({ label,value,delta,icon,color,up=true }:{ label:string; value:string; delta?:string; icon:string; color:string; up?:boolean }) {
  return (
    <div className="mc-kpi">
      <div className="mc-kpi__orb" style={{ background:`${color}10` }} />
      <div className="mc-kpi__top">
        <span className="mc-kpi__label">{label}</span>
        <div className="mc-kpi__icon" style={{ background:`${color}18` }}>{icon}</div>
      </div>
      <div className="mc-kpi__value">{value}</div>
      {delta && <div className={`mc-kpi__delta ${up?"mc-kpi__delta--up":"mc-kpi__delta--dn"}`}>{up?"↑":"↓"} {delta}</div>}
    </div>
  );
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function CompanyModal({
  company,
  onClose,
  onCreate,
}: {
  company: Company|null;
  onClose:()=>void;
  onCreate: (company: Company) => void;
}) {
  const isEditMode = Boolean(company);
  const [companyName, setCompanyName] = useState(company?.name ?? "");
  const [domain, setDomain] = useState(company?.domain ?? "");
  const [adminEmail, setAdminEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("https://webhook.site/unique-url");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleCreateCompany = async () => {
    if (isEditMode) {
      onClose();
      return;
    }

    if (!companyName.trim() || !domain.trim() || !adminEmail.trim() || !phoneNumber.trim() || !password.trim()) {
      setSubmitError("Please fill all required fields.");
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const localPhone = phoneNumber.replace(/\D/g, "");
      const fullPhone = `${countryCode}${localPhone}`.replace(/\s+/g, "");

      const response = await ngrokAxiosInstance.post("/companies/", {
        name: companyName.trim(),
        email: adminEmail.trim(),
        phone: fullPhone,
        business_id: domain.trim(),
        webhook_url: webhookUrl.trim(),
        initial_credit: 100.0,
        user: {
          name: companyName.trim(),
          email: adminEmail.trim(),
          password,
        },
      });

      const createdPayload = response?.data?.company ?? response?.data?.data ?? response?.data;
      const createdCompany = buildCompanyCardData(createdPayload, {
        name: companyName,
        domain,
      });
      onCreate(createdCompany);

      onClose();
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to create company. Please try again.";
      setSubmitError(apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div className="mc-modal" onClick={e=>e.stopPropagation()}>
        <div className="mc-modal__header">
          <div>
            <div className="mc-modal__title">{isEditMode ? "Edit Company" : "Add New Company"}</div>
            <div className="mc-modal__sub">{isEditMode ? `Editing ${company?.name}` : "Fill in the details below."}</div>
          </div>
          <button className="mc-modal__close" onClick={onClose}>×</button>
        </div>
        <div className="mc-modal__body">
          <div className="mc-field">
            <div className="mc-field__label">COMPANY NAME</div>
            <input
              className="mc-input"
              placeholder="e.g. Acme Corp"
              value={companyName}
              onChange={(e)=>setCompanyName(e.target.value)}
            />
          </div>
          <div className="mc-field">
            <div className="mc-field__label">DOMAIN</div>
            <input
              className="mc-input"
              placeholder="e.g. acme.com"
              value={domain}
              onChange={(e)=>setDomain(e.target.value)}
            />
          </div>
          <div className="mc-field">
            <div className="mc-field__label">ADMIN EMAIL</div>
            <input
              className="mc-input"
              type="email"
              placeholder="admin@company.com"
              value={adminEmail}
              onChange={(e)=>setAdminEmail(e.target.value)}
            />
          </div>
          <div className="mc-modal__grid-2">
            <div className="mc-field">
              <div className="mc-field__label">COUNTRY CODE</div>
              <select className="mc-select" value={countryCode} onChange={(e)=>setCountryCode(e.target.value)}>
                <option value="+91">+91 (IN)</option>
                <option value="+1">+1 (US)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+971">+971 (AE)</option>
              </select>
            </div>
            <div className="mc-field">
              <div className="mc-field__label">PHONE NUMBER</div>
              <input
                className="mc-input"
                type="tel"
                placeholder="e.g. 9876543210"
                value={phoneNumber}
                onChange={(e)=>setPhoneNumber(e.target.value)}
              />
            </div>
          </div>
          <div className="mc-field">
            <div className="mc-field__label">WEBHOOK URL</div>
            <input
              className="mc-input"
              type="url"
              placeholder="https://webhook.site/unique-url"
              value={webhookUrl}
              onChange={(e)=>setWebhookUrl(e.target.value)}
            />
          </div>
          <div className="mc-field">
            <div className="mc-field__label">PASSWORD</div>
            <input
              className="mc-input"
              type="password"
              autoComplete="new-password"
              placeholder="Enter secure password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />
          </div>
          {submitError && (
            <div style={{ color:"var(--mc-danger)", fontSize:12, fontWeight:600 }}>
              {submitError}
            </div>
          )}
          <div className="mc-modal__divider" />
          <div className="mc-modal__actions">
            <button className="mc-btn mc-btn--primary" onClick={handleCreateCompany} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : isEditMode ? "Save Changes" : "Create Company"}
            </button>
            <button className="mc-btn mc-btn--ghost" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompanyDetailModal({ company, onClose, onEdit }: { company:Company; onClose:()=>void; onEdit:(c:Company)=>void }) {
  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div className="mc-modal mc-detail" onClick={e=>e.stopPropagation()}>
        <div className="mc-detail__header">
          <div style={{ display:"flex", gap:14, alignItems:"center" }}>
            <div className="mc-detail__logo" style={{ background:company.col, width:52, height:52, boxShadow:`0 6px 20px ${company.col}60` }}>
              {company.logo}
            </div>
            <div>
              <div className="mc-detail__name">{company.name}</div>
              <div className="mc-detail__domain">{company.domain}</div>
              <div style={{ marginTop:6 }}><Badge status={company.status} /></div>
            </div>
          </div>
          <button className="mc-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="mc-detail__divider" />

        <div className="mc-detail__metrics">
          {([
            ["Plan",            company.plan,                                                   `var(--mc-plan-${company.plan.toLowerCase()})`],
            ["Monthly Revenue", company.mrr>0?`₹${company.mrr.toLocaleString()}`:"Free",        "var(--mc-success)"],
            ["Total Users",     String(company.users),                                           "var(--mc-accent2)"],
            ["Renewal Date",    company.end,                                                     "var(--mc-warn)"],
          ] as [string,string,string][]).map(([l,v,c])=>(
            <div key={l} className="mc-detail__cell">
              <div className="mc-detail__cell-key">{l.toUpperCase()}</div>
              <div className="mc-detail__cell-val" style={{ color:c }}>{v}</div>
            </div>
          ))}
        </div>

        <div className="mc-quickstat">
          <div className="mc-quickstat__lbl">QUICK STATS</div>
          <div className="mc-quickstat__row">
            {([["84.2K","Messages"],["12","Campaigns"],["3","Chatbots"],["18","Flows"]] as [string,string][]).map(([v,l])=>(
              <div key={l} className="mc-quickstat__item">
                <div className="mc-quickstat__val">{v}</div>
                <div className="mc-quickstat__key">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mc-detail__actions">
          <button className="mc-btn mc-btn--primary" onClick={()=>{ onClose(); onEdit(company); }}>✏️ Edit Company</button>
          <button className="mc-btn mc-btn--ghost" onClick={onClose}>Close</button>
          {company.status!=="SUSPENDED"
            ? <button className="mc-btn mc-btn--danger" onClick={onClose}>⛔ Suspend</button>
            : <button className="mc-btn mc-btn--ghost"  onClick={onClose}>✅ Restore</button>
          }
        </div>
      </div>
    </div>
  );
}

// ─── COMPANY CARD ─────────────────────────────────────────────────────────────
function CompanyCard({ company, onEdit, onView }: { company:Company; onEdit:(c:Company)=>void; onView:(c:Company)=>void }) {
  return (
    <div className="mc-card">
      <div className="mc-card__top">
        <div className="mc-card__left">
          <div className="mc-card__logo" style={{ background:company.col, width:42, height:42, boxShadow:`0 4px 14px ${company.col}50` }}>
            {company.logo}
          </div>
          <div>
            <div className="mc-card__name">{company.name}</div>
            <div className="mc-card__domain">{company.domain}</div>
          </div>
        </div>
        <Badge status={company.status} />
      </div>

      <div className="mc-card__div" />

      <div className="mc-card__metrics">
        {([
          ["USERS",  String(company.users),                                          "👥"],
          ["MRR",    company.mrr>0?`₹${company.mrr.toLocaleString()}`:"Free",        "💰"],
          ["PLAN",   company.plan,                                                   "📦"],
          ["RENEWS", company.end,                                                    "📅"],
        ] as [string,string,string][]).map(([label,value,icon])=>(
          <div key={label} className="mc-metric">
            <div className="mc-metric__label">{icon} {label}</div>
            <div className={`mc-metric__value ${label==="PLAN"?`mc-plan-chip--${company.plan}`:""}`}
              style={label==="PLAN"?{ color:`var(--mc-plan-${company.plan.toLowerCase()})` }:{}}>
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="mc-card__actions">
        <button className="mc-btn mc-btn--ghost mc-btn--small" onClick={e=>{e.stopPropagation();onEdit(company);}}>✏️ Edit</button>
        <button className="mc-btn mc-btn--ghost mc-btn--small" onClick={e=>{e.stopPropagation();onView(company);}}>👁 View</button>
        {company.status!=="SUSPENDED"
          ? <button className="mc-btn mc-btn--danger mc-btn--small" onClick={e=>e.stopPropagation()}>⛔ Suspend</button>
          : <button className="mc-btn mc-btn--ghost  mc-btn--small" onClick={e=>e.stopPropagation()}>✅ Restore</button>
        }
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function ManageCompanies() {
  const [companies,   setCompanies]   = useState<Company[]>([]);
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("ALL");
  const [showModal,  setShowModal]  = useState(false);
  const [editTarget, setEditTarget] = useState<Company|null>(null);
  const [viewTarget, setViewTarget] = useState<Company|null>(null);
  const [isLoading,  setIsLoading]  = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await ngrokAxiosInstance.get("/companies/");
        const payload = response?.data?.companies ?? response?.data?.data ?? response?.data;
        const list = Array.isArray(payload) ? payload : [];

        if (list.length > 0) {
          const mapped = list.map((raw, index) =>
            buildCompanyCardData(raw, {
              name: raw?.name ?? "Company",
              domain: raw?.business_id ?? raw?.domain ?? "—",
            })
          );
          setCompanies(mapped);
        }
      } catch {
        setCompanies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const filtered = companies.filter(c=>
    (filter==="ALL"||c.status===filter) &&
    (c.name.toLowerCase().includes(search.toLowerCase())||c.domain.includes(search.toLowerCase()))
  );

  const totalCompanies = companies.length;
  const activeCompanies = companies.filter((c) => c.status === "ACTIVE").length;
  const suspendedCompanies = companies.filter((c) => c.status === "SUSPENDED").length;
  const trialCompanies = companies.filter((c) => c.status === "TRIAL").length;

  const openAdd  = ()           => { setEditTarget(null); setShowModal(true); };
  const openEdit = (c:Company)  => { setEditTarget(c);    setShowModal(true); };
  const openView = (c:Company)  => setViewTarget(c);

  return (
    <div className="mc-root">
      {/* HEADER */}
      <div className="mc-header">
        <div>
          <h1 className="mc-header__title">Manage Companies</h1>
          <p className="mc-header__sub">All registered companies and their subscription health.</p>
        </div>
        <button className="mc-btn mc-btn--primary" onClick={openAdd}>+ Add Company</button>
      </div>

      {/* KPIs */}
      <div className="mc-kpi-grid">
        <KPI label="Total Companies" value={String(totalCompanies)} delta="— vs last month" icon="🏢" color="#6C5CE7" />
        <KPI label="Active"          value={String(activeCompanies)} delta="— new this week"   icon="✅" color="#00CBA4" />
        <KPI label="Suspended"       value={String(suspendedCompanies)}  delta="— this month"      icon="⛔" color="#FF6B6B" up={false} />
        <KPI label="On Trial"        value={String(trialCompanies)}  delta="— expiring soon"   icon="⏳" color="#FDCB6E" />
      </div>

      {/* FILTER BAR */}
      <div className="mc-filter-bar">
        <div className="mc-search-wrap">
          <span className="mc-search-icon">🔍</span>
          <input className="mc-search-input" value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="Search by name or domain…"
            autoComplete="off" />
        </div>
        <div className="mc-filter-group">
          {["ALL","ACTIVE","TRIAL","SUSPENDED","INACTIVE"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className={`mc-filter-btn ${filter===f?"mc-filter-btn--active":""}`}>
              {f==="ALL"?"All":f[0]+f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <span className="mc-filter-count">{filtered.length} companies</span>
      </div>

      {/* GRID */}
      {isLoading ? (
        <div className="mc-grid">
          <div className="mc-card" style={{ minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--mc-muted)", gridColumn: "1 / -1" }}>
            Loading companies...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mc-card" style={{ padding: 24, color: "var(--mc-muted)" }}>
          No companies found.
        </div>
      ) : (
        <div className="mc-grid">
          {filtered.map((c, index)=>(
            <CompanyCard key={`${c.id}-${c.domain}-${c.name}-${index}`} company={c} onEdit={openEdit} onView={openView} />
          ))}
        </div>
      )}

      {/* MODALS */}
      {showModal  && (
        <CompanyModal
          company={editTarget}
          onClose={()=>setShowModal(false)}
          onCreate={(createdCompany) => setCompanies((prev) => [createdCompany, ...prev])}
        />
      )}
      {viewTarget && <CompanyDetailModal company={viewTarget} onClose={()=>setViewTarget(null)} onEdit={c=>{ setViewTarget(null); openEdit(c); }} />}
    </div>
  );
}
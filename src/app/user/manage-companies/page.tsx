"use client";

import { useState,useEffect } from "react";
import "./manage-companies.css";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Status = "ACTIVE"|"INACTIVE"|"SUSPENDED"|"TRIAL";
type Plan   = "Starter"|"Basic"|"Pro"|"Enterprise";

interface Company {
  id:string; name:string; domain:string; logo:string; col:string;
  status:Status; plan:Plan; users:number; mrr:number; end:string;
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
function CompanyModal({ company, onClose, onSuccess }: { 
  company: Company | null; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [name, setName] = useState(company?.name || "");
  const [domain, setDomain] = useState(company?.domain || "");
  const [adminEmail, setAdminEmail] = useState("");
  const [status, setStatus] = useState<Status>(company?.status || "ACTIVE");
  const [plan, setPlan] = useState<Plan>(company?.plan || "Starter");

  useEffect(() => {
  setName(company?.name || "");
  setDomain(company?.domain || "");
  setStatus(company?.status || "ACTIVE");
  setPlan(company?.plan || "Starter");
}, [company]);

const handleSubmit = async () => {
  try {
    const method = company ? "PUT" : "POST";

    const res = await fetch("/api/admin/companies", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: company?.id,
        name,
        domain,
        adminEmail,
        status,
        plan,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed");
    }

  onSuccess();
  setName("");
  setDomain("");
  setAdminEmail("");
  onClose();

  } catch (err) {
    console.error("Error:", err);
  }
};
   
  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div className="mc-modal" onClick={e=>e.stopPropagation()}>
        <div className="mc-modal__header">
          <div>
            <div className="mc-modal__title">{company?"Edit Company":"Add New Company"}</div>
            <div className="mc-modal__sub">{company?`Editing ${company.name}`:"Fill in the details below."}</div>
          </div>
          <button className="mc-modal__close" onClick={onClose}>×</button>
        </div>
        <div className="mc-modal__body">
          <div className="mc-field">
            <div className="mc-field__label">COMPANY NAME</div>
            <input 
             className="mc-input"
             placeholder="Enter your company name"
             value={name} 
             onChange={(e)=> setName(e.target.value)}
              />
          </div>
          <div className="mc-field">
            <div className="mc-field__label">DOMAIN</div>
            <input
             className="mc-input"
             placeholder="Enter your domain name"
             value={domain}
             onChange={(e) => setDomain(e.target.value)} 
             />
          </div>
          <div className="mc-field">
            <div className="mc-field__label">ADMIN EMAIL</div>
            <input 
            className="mc-input" 
            type="email" 
            placeholder="Enter your adminEmail" 
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            />
          </div>
          <div className="mc-modal__grid-2">
            <div className="mc-field">
              <div className="mc-field__label">STATUS</div>
              <select
                className="mc-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="TRIAL">Trial</option>
              </select>
            </div>
            <div className="mc-field">
              <div className="mc-field__label">PLAN</div>
                        <select 
              className="mc-select" 
              value={plan}
              onChange={(e) => setPlan(e.target.value as Plan)}
            >
              <option value="Starter">Starter</option>
              <option value="Basic">Basic</option>
              <option value="Pro">Pro</option>
              <option value="Enterprise">Enterprise</option>
            </select>
            </div>
          </div>
          <div className="mc-modal__divider" />
          <div className="mc-modal__actions">
            <button className="mc-btn mc-btn--primary" onClick={handleSubmit}>{company?"Save Changes":"Create Company"}</button>
            <button className="mc-btn mc-btn--ghost" onClick={onClose}>Cancel</button>
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
              style={
                label === "PLAN"
                  ? { color: `var(--mc-plan-${(company.plan || "starter").toLowerCase()})` }
                  : {}
              }>
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
  const [search,     setSearch]     = useState("");
  const [filter, setFilter] = useState<"ALL" | Status>("ALL");
  const [showModal,  setShowModal]  = useState(false);
  const [editTarget, setEditTarget] = useState<Company|null>(null);
  const [viewTarget, setViewTarget] = useState<Company|null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
  fetchCompanies();
}, []);
const fetchCompanies = async () => {
  try {
    setLoading(true);
    const res = await fetch("/api/admin/companies");

    if (!res.ok) throw new Error("Failed to fetch");

    const data = await res.json();
    setCompanies(data);

  } catch (err) {
    console.error("Failed to fetch companies:", err);
    setCompanies([]); 
  } finally {
    setLoading(false);
  }
};
const FILTERS: ("ALL" | Status)[] = [
  "ALL",
  "ACTIVE",
  "TRIAL",
  "SUSPENDED",
  "INACTIVE",
];

const enrichedCompanies = companies.map((c) => ({
  ...c,
  plan: c.plan || "Starter", 
  logo: c.name ? c.name.slice(0, 2).toUpperCase() : "NA",
  col: "#6C5CE7",
  users: 0,
  mrr: 0,
  end: "N/A",
}));
const filtered = enrichedCompanies.filter((c) =>
  (filter === "ALL" || c.status === filter) &&
  (
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.domain.toLowerCase().includes(search.toLowerCase())
  )
);

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
      <KPI label="Total Companies" value={String(companies.length)} icon="🏢" color="#6C5CE7" />
      <KPI label="Active" value={String(companies.filter(c => c.status==="ACTIVE").length)} icon="✅" color="#00CBA4" />
      <KPI label="Suspended" value={String(companies.filter(c => c.status==="SUSPENDED").length)} icon="⛔" color="#FF6B6B" />
      <KPI label="On Trial" value={String(companies.filter(c => c.status==="TRIAL").length)} icon="⏳" color="#FDCB6E" />
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
          {FILTERS.map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className={`mc-filter-btn ${filter===f?"mc-filter-btn--active":""}`}>
              {f==="ALL"?"All":f[0]+f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <span className="mc-filter-count">{filtered.length} companies</span>
      </div>

      {/* GRID */}
     {loading ? (
  <div className="mc-empty">Loading companies...</div>
) : filtered.length === 0 ? (
  <div className="mc-empty">
    No companies found. Start by adding one 🚀
  </div>
) : (
  <div className="mc-grid">
    {filtered.map(c => (
      <CompanyCard key={c.id} company={c} onEdit={openEdit} onView={openView} />
    ))}
  </div>
)}

      {/* MODALS */}
      {showModal  && <CompanyModal
       company={editTarget} 
       onClose={()=>setShowModal(false) } 
       onSuccess={fetchCompanies}

       />}
      {viewTarget && <CompanyDetailModal company={viewTarget} 
      onClose={()=>setViewTarget(null)}
      onEdit={c=>{ setViewTarget(null); openEdit(c); }} />}
    </div>
  );
}
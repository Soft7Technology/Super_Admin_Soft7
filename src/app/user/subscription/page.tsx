"use client";

import { useState, useEffect } from "react";
import "./subscription.css";
import { axiosInstance } from "@/lib/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// ─── CONFIG ───────────────────────────────────────────────────────────────────
const EXTERNAL_API = "/v1/admin/subscription/plan?active=true";

const getExternalHeaders = () => {
  let token =
    typeof window !== "undefined"
      ? localStorage.getItem("console_access_token")
      : null;
  if (token && token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
  }
  return {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const updateSubscriptionPlan = async (id: string, payload: any) => {
  return axiosInstance.put(`/v1/admin/subscription/plan/${id}`, payload, {
    headers: getExternalHeaders(),
    withCredentials: false,
  });
};

const createSubscriptionPlan = async (payload: any) => {
  return axiosInstance.post("/v1/admin/subscription/plan", payload, {
    headers: getExternalHeaders(),
    withCredentials: false,
  });
};

// ─── TYPES ────────────────────────────────────────────────────────────────────
type SubStatus = "ACTIVE" | "TRIAL" | "EXPIRED" | "SUSPENDED" | "CANCELLED";
type PlanName  = "Starter" | "Basic" | "Pro" | "Enterprise";
type TxnStatus = "SUCCESS" | "FAILED" | "REFUNDED";
type TxnType   = "New" | "Renewal" | "Upgrade" | "Failed" | "Trial" | "Refund";
type BillingCycle = "Monthly" | "Yearly";

// ── Represents one plan from the API ──
interface ApiPlan {
  id: string;
  plan_name: string;
  company_id: string;
  user_id: string;
  price: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  billing_cycle: string | null;
  features: Record<string, { limit_type?: string; limit_value: number | string | null }>;
  discount_percentage?: number;
yearly_price?: number;
}

// ── Internal display row ──
interface SubRow {
  id: string;
  planName: string;
  logo: string;
  col: string;
  plan: PlanName;
  status: SubStatus;
  start: string;
  end: string;
  amt: number;
  billingCycle: string;
  description: string;
  usersLimit: string;
  waLimit: string;
  msgsLimit: string;
  otherFeatures: string[];
  rawData: ApiPlan;
  discountPercentage?: number;
yearlyPrice?: number;
}

interface CustomPlan {
  id: number;
  name: string;
  price: number;
  yearPrice: number;
  icon: string;
  col: string;
  users: string;
  wa: string;
  msgs: string;
  popular: boolean;
  extra: string[];
  billingCycle: BillingCycle;
}

interface Transaction {
  id: number;
  company: string;
  logo: string;
  col: string;
  plan: PlanName;
  amount: number;
  date: string;
  type: TxnType;
  status: TxnStatus;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const formatLimit = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined) return "∞";
  if (val === "unlimited") return "∞";
  if (typeof val === "number") {
    if (val < 0) return "∞";
    if (val === 999999) return "∞";
    if (val >= 1000) return `${val / 1000}K`;
    return String(val);
  }
  return String(val);
};

const extractLimits = (features: ApiPlan["features"]) => {
  const users = formatLimit(features?.users?.limit_value);
  const wa    = formatLimit(features?.whatsapp_accounts?.limit_value);
  const msgs  = formatLimit(features?.messages_per_month?.limit_value);

  const coreKeys = new Set(["users", "whatsapp_accounts", "messages_per_month"]);
  const others = Object.entries(features || {})
    .filter(([k]) => !coreKeys.has(k))
    .map(([k, v]) => {
      const label = k.replace(/_/g, " ");
      const lv    = formatLimit(v?.limit_value);
      return `${label}: ${lv}`;
    });

  return { users, wa, msgs, others };
};

// ── FIXED: resolvePlanType now uses price-based fallback ──
const resolvePlanType = (name: string, price?: number): { plan: PlanName; col: string } => {
  const lower = name.toLowerCase();

  // Name-based matching first
  if (lower.includes("enterprise"))                          return { plan: "Enterprise", col: "#A29BFE" };
  if (lower.includes("pro"))                                 return { plan: "Pro",        col: "#6C5CE7" };
  if (lower.includes("basic"))                               return { plan: "Basic",      col: "#FDCB6E" };
  if (lower.includes("starter") || lower.includes("free"))   return { plan: "Starter",    col: "#00CBA4" };
  if (lower.includes("premium") || lower.includes("unlimited")) return { plan: "Enterprise", col: "#A29BFE" };

  // Price-based fallback for unrecognised names
  const p = price ?? 0;
  if (p === 0)   return { plan: "Starter",    col: "#00CBA4" };
  if (p < 500)   return { plan: "Starter",    col: "#00CBA4" };
  if (p < 1500)  return { plan: "Basic",      col: "#FDCB6E" };
  if (p < 4000)  return { plan: "Pro",        col: "#6C5CE7" };
  return           { plan: "Enterprise",  col: "#A29BFE" };
};

const mapApiPlan = (plan: ApiPlan): SubRow => {
  // Pass price to resolvePlanType for fallback
  const { plan: planType, col } = resolvePlanType(plan.plan_name, Number(plan.price || 0));
  const { users, wa, msgs, others } = extractLimits(plan.features || {});

  return {
    id:           plan.id,
    planName:     plan.plan_name,
    logo:         plan.plan_name.charAt(0).toUpperCase(),
    col,
    plan:         planType,
    status:       plan.active ? "ACTIVE" : "EXPIRED",
    start:        new Date(plan.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    end:          new Date(plan.updated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    amt:          Number(plan.price || 0),
    billingCycle: plan.billing_cycle || "—",
    description:  plan.description || "",
    usersLimit:   users,
    waLimit:      wa,
    msgsLimit:    msgs,
    otherFeatures: others,
    rawData:      plan,
    discountPercentage: plan.discount_percentage || 0,
yearlyPrice: plan.yearly_price || 0,
  };
};

// ─── EXCEL EXPORT ─────────────────────────────────────────────────────────────
const escapeExcelCell = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const downloadExcel = (rows: SubRow[]) => {
  const data = rows.map((r) => ({
    "Plan Name": r.planName,
    "Plan Type": r.plan,
    Status: r.status,
    Price: r.amt,
    "Billing Cycle": r.billingCycle,
    Users: r.usersLimit,
    "WA Accounts": r.waLimit,
    Messages: r.msgsLimit,
    Description: r.description,
    Created: r.start,
    Updated: r.end,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet["!cols"] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 40 },
    { wch: 15 },
    { wch: 15 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Plans");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const file = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(file, "subscription-plans.xlsx");
};

// ─── ICON / COLOR OPTIONS ─────────────────────────────────────────────────────
const ICON_OPTIONS  = ["🌱","🚀","⚡","🏆","💎","🔥","🌟","🎯","🛡️","🧩"];
const COLOR_OPTIONS = ["#6C5CE7","#00CBA4","#FDCB6E","#A29BFE","#FF6B6B","#74B9FF","#FD79A8","#00B894","#E17055","#0984e3"];
const TYPE_COLOR: Record<TxnType, string> = { New:"#00CBA4", Renewal:"#A29BFE", Upgrade:"#FDCB6E", Failed:"#FF6B6B", Trial:"#74B9FF", Refund:"#FD79A8" };

// Plan type selector options for Create Plan modal
const PLAN_TYPE_OPTIONS: { label: PlanName; col: string; icon: string }[] = [
  { label: "Starter",    col: "#00CBA4", icon: "🌱" },
  { label: "Basic",      col: "#FDCB6E", icon: "⚡" },
  { label: "Pro",        col: "#6C5CE7", icon: "🚀" },
  { label: "Enterprise", col: "#A29BFE", icon: "🏆" },
];

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Badge({ status }: { status: SubStatus }) {
  const labels: Record<SubStatus, string> = { ACTIVE:"Active", TRIAL:"Trial", EXPIRED:"Expired", SUSPENDED:"Suspended", CANCELLED:"Cancelled" };
  return (
    <span className={`sb-badge sb-badge--${status}`}>
      <span className="sb-badge__dot" />{labels[status]}
    </span>
  );
}

function KPI({ label, value, delta, icon, color, up=true }: { label:string; value:string; delta?:string; icon:string; color:string; up?:boolean }) {
  return (
    <div className="sb-kpi">
      <div className="sb-kpi__orb" style={{ background:`${color}10` }} />
      <div className="sb-kpi__top">
        <span className="sb-kpi__label">{label}</span>
        <div className="sb-kpi__icon" style={{ background:`${color}18` }}>{icon}</div>
      </div>
      <div className="sb-kpi__value">{value}</div>
      {delta && <div className={`sb-kpi__delta ${up?"sb-kpi__delta--up":"sb-kpi__delta--dn"}`}>{up?"↑":"↓"} {delta}</div>}
    </div>
  );
}

function Inp({ label, value, onChange, placeholder, type="text", error, prefix }: {
  label:string; value:string; onChange:(v:string)=>void;
  placeholder?:string; type?:string; error?:string; prefix?:string;
}) {
  return (
    <div className="sb-field">
      <div className="sb-field__label">{label}</div>
      <div className="sb-input-wrap">
        {prefix && <span className="sb-input-prefix">{prefix}</span>}
        <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
          className={`sb-input ${prefix?"sb-input--prefix":""} ${error?"sb-input--err":""}`} />
      </div>
      {error && <div className="sb-field__error">{error}</div>}
    </div>
  );
}

function Tog({ on, setOn }: { on:boolean; setOn:(v:boolean)=>void }) {
  return (
    <button type="button" className={`sb-toggle ${on?"sb-toggle--on":""}`} onClick={()=>setOn(!on)} aria-pressed={on}>
      <div className="sb-toggle__knob" />
    </button>
  );
}

// ─── CREATE PLAN MODAL ────────────────────────────────────────────────────────
function CreatePlanModal({ onClose, onSave }: { onClose:()=>void; onSave:(p:CustomPlan)=>void }) {
  const [step,         setStep]         = useState<1|2|3>(1);
  const [name,         setName]         = useState("");
  const [price,        setPrice]        = useState("");
  const [yearPct,      setYearPct]      = useState("0");
  const [users,        setUsers]        = useState("");
  const [wa,           setWa]           = useState("");
  const [msgs,         setMsgs]         = useState("");
  const [icon,         setIcon]         = useState("🌱");
  const [col,          setCol]          = useState("#6C5CE7");
  const [popular,      setPopular]      = useState(false);
  const [feats,        setFeats]        = useState(["","",""]);
  const [errors,       setErrors]       = useState<Record<string,string>>({});
  const [aiOn,         setAiOn]         = useState(false);
  const [brandOn,      setBrandOn]      = useState(false);
  const [apiOn,        setApiOn]        = useState(false);
  const [suppOn,       setSuppOn]       = useState(false);
  const [done,         setDone]         = useState(false);
  // NEW: Billing cycle & plan type states
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("Monthly");
  const [planType,     setPlanType]     = useState<PlanName>("Starter");

  const mp = parseInt(price)||0;
  const ap = Math.round(mp*(1-(parseInt(yearPct||"0")/100)));

  // Sync icon/col when planType changes
  const handlePlanTypeChange = (pt: PlanName) => {
    setPlanType(pt);
    const found = PLAN_TYPE_OPTIONS.find(o => o.label === pt);
    if (found) { setCol(found.col); setIcon(found.icon); }
  };

  const validate = () => {
    const e: Record<string,string> = {};
    if (step===1) { if(!name.trim()) e.name="Plan name required"; if(!price||mp<1) e.price="Enter valid price"; }
    if (step===2) { if(!users.trim()) e.users="Required"; if(!wa.trim()) e.wa="Required"; if(!msgs.trim()) e.msgs="Required"; }
    setErrors(e); return Object.keys(e).length===0;
  };
  const next = () => { if(validate()) setStep(s=>Math.min(s+1,3) as 1|2|3); };
  const back = () => setStep(s=>Math.max(s-1,1) as 1|2|3);

  const handleSave = () => {
    if(!validate()) return;
    onSave({
      id: Date.now(),
      name: name.trim(),
      price: mp,
      yearPrice: ap,
      icon,
      col,
      users,
      wa,
      msgs,
      popular,
      billingCycle,
      extra: [
        ...feats.filter(f=>f.trim()),
        ...(aiOn    ? ["AI Assistant"]      : []),
        ...(brandOn ? ["Custom Branding"]   : []),
        ...(apiOn   ? ["API Access"]        : []),
        ...(suppOn  ? ["Priority Support"]  : []),
      ],
    });
    setDone(true); setTimeout(onClose, 1400);
  };

  const STEPS = ["Basic Info","Limits","Features"];

  if(done) return (
    <div className="sb-success-overlay">
      <div className="sb-success-card">
        <div className="sb-success-icon">✓</div>
        <div className="sb-success-title">Plan Created!</div>
        <div className="sb-success-desc">
          <span style={{ color:col, fontWeight:700 }}>{icon} {name}</span> is now live.
        </div>
      </div>
    </div>
  );

  return (
    <div className="sb-modal-overlay" onClick={onClose}>
      <div className="sb-modal" onClick={e=>e.stopPropagation()}>
        <div className="sb-modal__header">
          <div className="sb-modal__top">
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div className="sb-modal__icon">✦</div>
              <div>
                <div className="sb-modal__title">Create New Plan</div>
                <div className="sb-modal__step">Step {step} of 3 — {STEPS[step-1]}</div>
              </div>
            </div>
            <button className="sb-modal__close" onClick={onClose}>×</button>
          </div>
          <div className="sb-progress">
            {STEPS.map((s,i)=>(
              <div key={s} className="sb-progress__item">
                <div className={`sb-progress__bar ${i<step?"sb-progress__bar--done":""}`} />
                <div className={`sb-progress__label ${i+1===step?"sb-progress__label--active":i<step?"sb-progress__label--done":""}`}>{s}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="sb-modal__body">
          {step===1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:15 }}>
              <Inp label="PLAN NAME" value={name} onChange={setName} placeholder="e.g. Growth, Teams, Scale…" error={errors.name} />

              {/* ── NEW: Plan Type Selector ── */}
              <div>
                <div className="sb-field__label" style={{ marginBottom:8 }}>PLAN TYPE</div>
                <div style={{ display:"flex", gap:8 }}>
                  {PLAN_TYPE_OPTIONS.map(opt => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handlePlanTypeChange(opt.label)}
                      style={{
                        flex: 1,
                        padding: "8px 4px",
                        borderRadius: 10,
                        border: `2px solid ${planType === opt.label ? opt.col : "var(--sb-border, #e0e0e0)"}`,
                        background: planType === opt.label ? `${opt.col}18` : "transparent",
                        color: planType === opt.label ? opt.col : "var(--sb-muted)",
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="sb-form-grid-2">
                <Inp label="MONTHLY PRICE (₹)" value={price} onChange={setPrice} placeholder="2499" type="number" prefix="₹" error={errors.price} />
                <Inp label="YEARLY DISCOUNT (%)" value={yearPct} onChange={setYearPct} placeholder="0" type="number" />
              </div>

              {mp > 0 && billingCycle === "Yearly" && (
                <div className="sb-price-preview">
                  <span className="sb-price-preview__label">Annual billing price / mo</span>
                  <span className="sb-price-preview__val">
                    ₹{ap.toLocaleString()}
                    {parseInt(yearPct) > 0 && (
                      <span className="sb-price-preview__note"> ({yearPct}% off)</span>
                    )}
                  </span>
                </div>
              )}

              {/* ── Billing Cycle Selector (Monthly / Yearly only) ── */}
              <div>
                <div className="sb-field__label" style={{ marginBottom:8 }}>BILLING CYCLE</div>
                <div className="sb-billing-group" style={{ display:"flex", gap:8 }}>
                  {(["Monthly", "Yearly"] as BillingCycle[]).map(cycle => (
                    <button
                      key={cycle}
                      type="button"
                      onClick={() => setBillingCycle(cycle)}
                      className={`sb-billing-btn ${billingCycle === cycle ? "sb-billing-btn--active" : ""}`}
                      style={{ flex: 1 }}
                    >
                      {cycle === "Yearly" ? (
                        <>
                          <span>Yearly </span>
                          {parseInt(yearPct) > 0 && (
                            <span className="sb-billing-save">−{yearPct}%</span>
                          )}
                        </>
                      ) : cycle}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sb-toggle-row">
                <div>
                  <div className="sb-toggle-row__title">Mark as Popular ★</div>
                  <div className="sb-toggle-row__desc">Shows "Most Popular" banner on plan card.</div>
                </div>
                <Tog on={popular} setOn={setPopular} />
              </div>
              {name && (
                <div className="sb-live-preview" style={{ borderColor:`${col}40`, border:`1px solid ${col}40` }}>
                  <div className="sb-live-preview__label">LIVE PREVIEW</div>
                  <div className="sb-live-preview__row">
                    <div className="sb-live-preview__icon" style={{ background:`${col}22` }}>{icon}</div>
                    <div>
                      <div className="sb-live-preview__name">
                        {name}
                        {popular && <span className="sb-live-preview__popular">POPULAR</span>}
                      </div>
                      <div className="sb-live-preview__price">
                        <span className="sb-live-preview__amt">₹{mp.toLocaleString()}</span>
                        <span className="sb-live-preview__per">/mo</span>
                        {billingCycle && (
                          <span style={{ marginLeft:6, fontSize:10, padding:"1px 7px", borderRadius:10, background:`${col}18`, color:col, fontWeight:700 }}>
                            {billingCycle}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize:11, color:"var(--sb-muted)", marginTop:2 }}>
                        Type: <span style={{ color:col, fontWeight:700 }}>{planType}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step===2 && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ fontSize:12, color:"var(--sb-muted)" }}>
                Set usage limits for <span style={{ color:"var(--sb-accent2)", fontWeight:700 }}>{name||"this plan"}</span>.
                Use <code className="sb-code">∞</code> for unlimited.
              </div>
              <div className="sb-form-grid-3">
                <Inp label="👥 MAX USERS"    value={users} onChange={setUsers} placeholder="50 or ∞"  error={errors.users} />
                <Inp label="💬 WA ACCOUNTS"  value={wa}    onChange={setWa}    placeholder="5 or ∞"   error={errors.wa}   />
                <Inp label="📨 MSGS / MONTH" value={msgs}  onChange={setMsgs}  placeholder="25K or ∞" error={errors.msgs} />
              </div>
              {(users||wa||msgs) && (
                <div className="sb-limits-preview">
                  <div className="sb-limits-preview__lbl">LIMITS PREVIEW</div>
                  <div className="sb-limits-grid">
                    {([["👥",users||"—","users"],["💬",wa||"—","WA accts"],["📨",msgs||"—","msgs/mo"]] as [string,string,string][]).map(([ic,v,l])=>(
                      <div key={l} className="sb-limit-cell">
                        <div className="sb-limit-cell__val">{ic} {v}</div>
                        <div className="sb-limit-cell__key">{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="sb-feat-toggles">
                {([
                  ["AI Assistant","AI-powered chat assistance",aiOn,setAiOn],
                  ["Custom Branding","Logo & color customization",brandOn,setBrandOn],
                  ["API Access","REST API for integrations",apiOn,setApiOn],
                  ["Priority Support","Faster response SLA",suppOn,setSuppOn],
                ] as [string,string,boolean,(v:boolean)=>void][]).map(([lbl,desc,val,setter])=>(
                  <div key={lbl} className="sb-feat-toggle">
                    <div>
                      <div className="sb-feat-toggle__title">{lbl}</div>
                      <div className="sb-feat-toggle__desc">{desc}</div>
                    </div>
                    <Tog on={val} setOn={setter} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step===3 && (
            <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
              <div style={{ fontSize:12, color:"var(--sb-muted)" }}>
                Feature bullets shown on <span style={{ color:"var(--sb-accent2)", fontWeight:700 }}>{name||"the plan"}</span> card.
              </div>
              <div className="sb-feat-bullets">
                {feats.map((f,i)=>(
                  <div key={i} className="sb-feat-bullet">
                    <span className="sb-feat-bullet__check" style={{ color:col }}>✓</span>
                    <input value={f} onChange={e=>{const c=[...feats];c[i]=e.target.value;setFeats(c);}}
                      placeholder={`Feature ${i+1}…`} className="sb-feat-input" />
                    {feats.length>1 && <button className="sb-btn-remove" onClick={()=>setFeats(f=>f.filter((_,idx)=>idx!==i))}>×</button>}
                  </div>
                ))}
              </div>
              <button className="sb-btn-add-feat" onClick={()=>setFeats(f=>[...f,""])}>+ Add Feature</button>
              <div className="sb-final-preview" style={{ border:`1px solid ${col}35` }}>
                {popular && <div className="sb-plan-card__popular-banner">★ MOST POPULAR</div>}
                <div className="sb-final-preview__inner">
                  <div className="sb-final-preview__lbl">FINAL PREVIEW</div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <div className="sb-live-preview__icon" style={{ background:`${col}22` }}>{icon}</div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:800, color:"var(--sb-title)" }}>
                        {name||"Plan Name"}
                        <span style={{ marginLeft:6, fontSize:10, padding:"1px 7px", borderRadius:10, background:`${col}18`, color:col, fontWeight:700 }}>{planType}</span>
                      </div>
                      <div className="sb-live-preview__price">
                        <span className="sb-live-preview__amt">₹{mp.toLocaleString()}</span>
                        <span className="sb-live-preview__per">/mo</span>
                        <span style={{ marginLeft:6, fontSize:10, padding:"1px 7px", borderRadius:10, background:"rgba(0,203,164,0.12)", color:"var(--sb-success)", fontWeight:700 }}>
                          {billingCycle}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="sb-limits-grid" style={{ marginBottom:12 }}>
                    {([["👥",users||"—","users"],["💬",wa||"—","WA"],["📨",msgs||"—","msgs"]] as [string,string,string][]).map(([ic,v,l])=>(
                      <div key={l} className="sb-limit-cell"><div className="sb-limit-cell__val">{ic} {v}</div><div className="sb-limit-cell__key">{l}</div></div>
                    ))}
                  </div>
                  {feats.filter(f=>f.trim()).map(f=>(
                    <div key={f} className="sb-final-preview__feat"><span style={{ color:col }}>✓</span>{f}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sb-modal__footer">
          <button className="sb-btn sb-btn--ghost" onClick={step>1?back:onClose}>{step===1?"Cancel":"← Back"}</button>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <span className="sb-modal__step-count">{step} / 3</span>
            {step<3
              ? <button className="sb-btn sb-btn--primary" onClick={next}>Next →</button>
              : <button className="sb-btn sb-btn--primary" onClick={handleSave}>✓ Create Plan</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function Overview({ subs, loading, activeCount, onUpdatePlan }: {
  subs: SubRow[];
  loading: boolean;
  activeCount: number;
  onUpdatePlan: (plan: SubRow) => void;
}) {
  const [sel, setSel] = useState<SubRow|null>(null);
  const active       = subs.filter(s => s.status === "ACTIVE");
  const monthlyPlans = active.filter(s => s.rawData?.billing_cycle === "Monthly");
  const mrr          = monthlyPlans.reduce((sum, s) => sum + s.amt, 0);
  const exp          = subs.filter(s => s.status !== "ACTIVE");

  return (
    <div className="sb-overview">
      <div>
        <div className="sb-sub-table">
          <div className="sb-sub-table__head">
            <span className="sb-sub-table__head-title">All Plans</span>
            <span className="sb-sub-table__head-count">{active.length} active</span>
          </div>
          {loading && (
            <div style={{ padding:"24px", textAlign:"center", color:"var(--sb-muted)", fontSize:13 }}>
              Loading plans…
            </div>
          )}
          {!loading && subs.length === 0 && (
            <div style={{ padding:"24px", textAlign:"center", color:"var(--sb-muted)", fontSize:13 }}>
              No plans found.
            </div>
          )}
          {!loading && subs.map(s => (
            <div key={s.id}
              className={`sb-sub-row ${sel?.id===s.id?"sb-sub-row--active":""}`}
              onClick={()=>setSel(sel?.id===s.id?null:s)}
            >
              <div className="sb-sub-row__logo" style={{ background:s.col }}>{s.logo}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div className="sb-sub-row__name">{s.planName}</div>
                <div className="sb-sub-row__meta">
                  {s.billingCycle !== "—" ? `${s.billingCycle} · ` : ""}
                  👥 {s.usersLimit} users · 💬 {s.waLimit} WA · 📨 {s.msgsLimit} msgs
                </div>
              </div>
              <span className={`sb-plan-chip sb-plan-chip--${s.plan}`}
                style={{ marginRight:6, fontSize:10, padding:"2px 8px", borderRadius:20, fontWeight:700, background:`var(--sb-plan-${s.plan.toLowerCase()})18` }}>
                {s.plan}
              </span>
              <Badge status={s.status} />
              <div className="sb-sub-row__amount">{s.amt>0?`₹${s.amt.toLocaleString()}`:"Free"}</div>
            </div>
          ))}
        </div>

        {sel && (
          <div className="sb-detail">
            <div className="sb-detail__top">
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <div className="sb-detail__logo" style={{ background:sel.col, width:44, height:44 }}>{sel.logo}</div>
                <div>
                  <div className="sb-detail__name">{sel.planName}</div>
                  <div className="sb-detail__dates">Created {sel.start} · Updated {sel.end}</div>
                  {sel.description && <div style={{ fontSize:11, color:"var(--sb-muted)", marginTop:2 }}>{sel.description}</div>}
                </div>
              </div>
              <button className="sb-btn-close-det" onClick={()=>setSel(null)}>×</button>
            </div>
            <div className="sb-detail__grid">
              {([
                ["Plan Type",     sel.plan,                                       `var(--sb-plan-${sel.plan.toLowerCase()})`],
                ["Price",         sel.amt>0?`₹${sel.amt.toLocaleString()}`:"Free","var(--sb-success)"],
                ["Billing Cycle", sel.billingCycle,                               "var(--sb-accent2)"],
                ["Status",        sel.status[0]+sel.status.slice(1).toLowerCase(),"var(--sb-success)"],
                ["Users",         sel.usersLimit,                                 "var(--sb-accent2)"],
                ["WA Accounts",   sel.waLimit,                                    "#FDCB6E"],
                ["Msgs/Month",    sel.msgsLimit,                                  "#00CBA4"],
              ] as [string,string,string][]).map(([l,v,c])=>(
                <div key={l} className="sb-detail__cell">
                  <div className="sb-detail__cell-key">{l.toUpperCase()}</div>
                  <div className="sb-detail__cell-val" style={{ color:c }}>{v}</div>
                </div>
              ))}
            </div>
            {sel.otherFeatures.length > 0 && (
              <div style={{ marginTop:12, padding:"10px 14px", background:"var(--sb-row-hover)", borderRadius:8 }}>
                <div style={{ fontSize:11, color:"var(--sb-muted)", marginBottom:6, fontWeight:700 }}>OTHER FEATURES</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {sel.otherFeatures.map(f=>(
                    <span key={f} style={{ fontSize:11, padding:"2px 8px", borderRadius:12, background:`${sel.col}18`, color:sel.col, fontWeight:600 }}>
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="sb-detail__actions">
              <button className="sb-btn sb-btn--primary sb-btn--small" onClick={() => onUpdatePlan(sel)}>✏️ Update Plan</button>
              <button className="sb-btn sb-btn--ghost sb-btn--small">⏸ Pause</button>
              <button className="sb-btn sb-btn--danger sb-btn--small">⛔ Disable</button>
            </div>
          </div>
        )}
      </div>

      <div className="sb-sidebar">
        <div className="sb-mrr-card">
          <div className="sb-mrr-card__label">MONTHLY RECURRING REVENUE</div>
          <div className="sb-mrr-card__value">₹{mrr.toLocaleString()}</div>
          <div className="sb-mrr-card__delta">↑ +12% vs last month</div>
          <div className="sb-mrr-card__grid">
            {([
              ["ARR",  `₹${(mrr*12).toLocaleString()}`,  "var(--sb-accent2)"],
              ["ARPU", `₹${monthlyPlans.length>0 ? Math.round(mrr/monthlyPlans.length).toLocaleString() : 0}`, "var(--sb-warn)"],
            ] as [string,string,string][]).map(([l,v,c])=>(
              <div key={l} className="sb-mrr-card__cell">
                <div className="sb-mrr-card__cell-key">{l}</div>
                <div className="sb-mrr-card__cell-val" style={{ color:c }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="sb-dist-card">
          <div className="sb-dist-card__title">Plan Distribution</div>
          {subs.length === 0 ? (
            <div style={{ padding:"20px", textAlign:"center", color:"#888" }}>No Plans Found</div>
          ) : (
            subs.map(s => {
              const pct = Math.min((s.amt / Math.max(...subs.map(x=>x.amt), 1)) * 100, 100);
              return (
                <div key={s.id} className="sb-dist-row">
                  <div className="sb-dist-row__top">
                    <span className="sb-dist-row__name" style={{ fontWeight:600, maxWidth:"140px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {s.planName}
                    </span>
                    <div style={{ display:"flex", gap:"8px" }}>
                      <span className="sb-dist-row__count">{s.billingCycle !== "—" ? s.billingCycle : "One-time"}</span>
                      <span className="sb-dist-row__rev" style={{ color:s.col }}>
                        {s.amt>0?`₹${s.amt.toLocaleString()}`:"Free"}
                      </span>
                    </div>
                  </div>
                  <div className="sb-dist-bar-bg">
                    <div className="sb-dist-bar-fill" style={{ width:`${pct}%`, background:s.col }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {exp.length>0 && (
          <div className="sb-exp-card">
            <div className="sb-exp-card__head">
              <span>⚠️</span>
              <span className="sb-exp-card__title">Inactive Plans</span>
            </div>
            {exp.map(s=>(
              <div key={s.id} className="sb-exp-row">
                <div className="sb-exp-row__logo" style={{ background:s.col }}>{s.logo}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="sb-exp-row__name">{s.planName}</div>
                  <div className="sb-exp-row__end">₹{s.amt.toLocaleString()}</div>
                </div>
                <Badge status={s.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PLANS TAB ────────────────────────────────────────────────────────────────
function Plans({
  onOpenModal,
  customPlans,
  onRemoveCustom,
  onDeletePlan,
  subs
}: {
  onOpenModal: ()=>void;
  customPlans: CustomPlan[];
  onRemoveCustom: (id:number)=>void;
  onDeletePlan: (id:string)=>void;
  subs: SubRow[];
}) {
  const [billing, setBilling] = useState<"MONTHLY"|"YEARLY">("MONTHLY");
const filteredPlans = subs.filter((plan) => {
  if (billing === "MONTHLY") {
    return plan.billingCycle === "Monthly";
  }

  if (billing === "YEARLY") {
    return plan.billingCycle === "Yearly";
  }

  return true;
});
  const renderApiCard = (s: SubRow) => {
  let displayPrice = s.amt;

if (billing === "YEARLY") {
  if (s.yearlyPrice && s.yearlyPrice > 0) {
    displayPrice = s.yearlyPrice;
  } else if (
    s.discountPercentage &&
    s.discountPercentage > 0
  ) {
    displayPrice = Math.round(
      s.amt -
      (s.amt * s.discountPercentage) / 100
    );
  }
}

    return (
      <div key={s.id} className="sb-plan-card">
        <div className="sb-plan-card__body">
          <div className="sb-plan-card__top">
            <div className="sb-plan-card__icon" style={{ background:`${s.col}20`, fontSize:18, width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:10 }}>
              {s.logo}
            </div>
            <span className="sb-plan-card__badge" style={{ background:`${s.col}18`, color:s.col }}>
              {s.billingCycle !== "—" ? s.billingCycle : "One-time"}
            </span>
          </div>

          <div className="sb-plan-card__name">{s.planName}</div>

          <div className="sb-plan-card__price">
            <span className="sb-plan-card__amt">₹{displayPrice.toLocaleString()}</span>
            <span className="sb-plan-card__per">/mo</span>
          </div>
         {billing === "YEARLY" &&
 s.discountPercentage &&
 s.discountPercentage > 0 && (
  <div className="sb-plan-card__save">
    Save {s.discountPercentage}% yearly
  </div>
)}
          {s.description && (
            <div style={{ fontSize:11, color:"var(--sb-muted)", margin:"4px 0 8px", lineHeight:1.4 }}>{s.description}</div>
          )}

          <div className="sb-plan-card__div" />

          <div className="sb-plan-card__limits">
            <div className="sb-plan-card__lim">
              <div className="sb-plan-card__lim-val">👥 {s.usersLimit}</div>
              <div className="sb-plan-card__lim-key">users</div>
            </div>
            <div className="sb-plan-card__lim">
              <div className="sb-plan-card__lim-val">💬 {s.waLimit}</div>
              <div className="sb-plan-card__lim-key">WA</div>
            </div>
            <div className="sb-plan-card__lim">
              <div className="sb-plan-card__lim-val">📨 {s.msgsLimit}</div>
              <div className="sb-plan-card__lim-key">msgs</div>
            </div>
          </div>

          {s.otherFeatures.slice(0,3).map(f => (
            <div key={f} className="sb-plan-card__feat">
              <span style={{ color:s.col }}>✓</span> {f}
            </div>
          ))}
          {s.otherFeatures.length > 3 && (
            <div className="sb-plan-card__more">+{s.otherFeatures.length - 3} more</div>
          )}

        <div className="sb-plan-card__actions">
  <button
    className="sb-btn sb-btn--ghost sb-btn--small"
    style={{ flex:1 }}
  >
    ✏️ Edit
  </button>

  <button
    className="sb-btn sb-btn--danger sb-btn--small"
    style={{ flex:1 }}
   onClick={() => onDeletePlan(s.id)}

  >
    🗑 Delete
  </button>
</div>
        </div>
      </div>
    );
  };

  const renderCustomCard = (p: CustomPlan) => {
    const price = billing === "YEARLY" ? p.yearPrice : p.price;
    return (
      <div key={p.id} className={`sb-plan-card ${p.popular?"sb-plan-card--popular":""}`}>
        {p.popular && <div className="sb-plan-card__popular-banner">★ MOST POPULAR</div>}
        <div className="sb-plan-card__body">
          <div className="sb-plan-card__top">
            <div className="sb-plan-card__icon" style={{ background:`${p.col}20` }}>{p.icon}</div>
            <div style={{ display:"flex", gap:4, alignItems:"center" }}>
              <span className="sb-plan-card__badge" style={{ background:"rgba(0,203,164,0.12)", color:"var(--sb-success)" }}>✦ New</span>
              <span className="sb-plan-card__badge" style={{ background:`${p.col}18`, color:p.col }}>
                {p.billingCycle}
              </span>
            </div>
          </div>
          <div className="sb-plan-card__name">{p.name}</div>
          <div className="sb-plan-card__price">
            <span className="sb-plan-card__amt">₹{price.toLocaleString()}</span>
            <span className="sb-plan-card__per">/mo</span>
          </div>
          <div className="sb-plan-card__div" />
          <div className="sb-plan-card__limits">
            {([["👥",p.users,"users"],["💬",p.wa,"WA"],["📨",p.msgs,"msgs"]] as [string,string,string][]).map(([ic,v,l])=>(
              <div key={l} className="sb-plan-card__lim">
                <div className="sb-plan-card__lim-val">{ic} {v}</div>
                <div className="sb-plan-card__lim-key">{l}</div>
              </div>
            ))}
          </div>
          {p.extra.slice(0,3).map(f=>(
            <div key={f} className="sb-plan-card__feat"><span style={{ color:p.col }}>✓</span>{f}</div>
          ))}
          {p.extra.length>3 && <div className="sb-plan-card__more">+{p.extra.length-3} more</div>}
          <div className="sb-plan-card__actions">
            <button className="sb-btn sb-btn--ghost sb-btn--small" style={{ flex:1 }}>✏️ Edit</button>
            <button className="sb-btn sb-btn--danger sb-btn--small" style={{ flex:1 }} onClick={()=>onRemoveCustom(p.id)}>Remove</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="sb-billing-toggle">
        <span className="sb-billing-toggle__label">Billing Cycle:</span>
        <div className="sb-billing-group">
          {(["MONTHLY","YEARLY"] as const).map(b=>(
            <button key={b} onClick={()=>setBilling(b)} className={`sb-billing-btn ${billing===b?"sb-billing-btn--active":""}`}>
              {b==="YEARLY" ? <><span>Yearly </span><span className="sb-billing-save">−20%</span></> : "Monthly"}
            </button>
          ))}
        </div>
        <span className="sb-billing-toggle__count">
  {filteredPlans.length} plans active
</span>
      </div>
<div className="sb-plans-grid">
  {filteredPlans.map(s => renderApiCard(s))}
</div>

      {customPlans.length > 0 && (
        <div className="sb-plans-grid--custom">
          {customPlans.map(p => renderCustomCard(p))}
        </div>
      )}

      <div className="sb-cta-dashed" onClick={onOpenModal}>
        <div className="sb-cta-dashed__icon">➕</div>
        <div className="sb-cta-dashed__title">Create New Plan</div>
        <div className="sb-cta-dashed__desc">Add a custom pricing plan for specific company needs.</div>
      </div>
    </div>
  );
}

// ─── HISTORY TAB ──────────────────────────────────────────────────────────────
function History({ subs }: { subs: SubRow[] }) {
  const [tf, setTf] = useState("ALL");

  const historyRows: Transaction[] = subs.map((s, index) => ({
    id:      index + 1,
    company: s.planName,
    logo:    s.logo,
    col:     s.col,
    plan:    s.plan,
    amount:  s.amt,
    date:    s.start,
    type:    "New" as TxnType,
    status:  "SUCCESS" as TxnStatus,
  }));

  const filtered = tf==="ALL" ? historyRows : historyRows.filter(h=>h.type===tf);
  const rev      = historyRows.reduce((a,h)=>a+h.amount, 0);

  return (
    <div className="sb-history">
      <div className="sb-hist-kpi-grid">
        {([
          ["Total Revenue",  `₹${rev.toLocaleString()}`, "var(--sb-success)", "💰"],
          ["Transactions",   String(historyRows.length), "var(--sb-accent2)", "📄"],
          ["Failed",         "0",                        "#FF6B6B",           "❌"],
          ["Refunded",       "0",                        "#FDCB6E",           "↩️"],
        ] as [string,string,string,string][]).map(([l,v,c,ic])=>(
          <div key={l} className="sb-hist-kpi">
            <div className="sb-hist-kpi__top">
              <span className="sb-hist-kpi__lbl">{l}</span>
              <span className="sb-hist-kpi__icon">{ic}</span>
            </div>
            <div className="sb-hist-kpi__val" style={{ color:c }}>{v}</div>
          </div>
        ))}
      </div>
      <div className="sb-hist-filters">
        <span className="sb-hist-label">Filter:</span>
       <button
  onClick={() => setTf("ALL")}
  className={`sb-hist-pill ${tf === "ALL" ? "sb-hist-pill--active" : ""}`}
>
  ALL
</button>
        
      </div>
      <div className="sb-hist-table">
        <div className="sb-hist-table__head">
          {["Plan","Type","Amount","Date","Billing","Status"].map(h=>(
            <div key={h} className="sb-hist-table__hcell">{h.toUpperCase()}</div>
          ))}
        </div>
        {filtered.map(h=>(
          <div key={h.id} className="sb-hist-row">
            <div className="sb-hist-row__co">
              <div className="sb-hist-row__logo" style={{ background:h.col }}>{h.logo}</div>
              <div className="sb-hist-row__name">{h.company}</div>
            </div>
            <span className="sb-type-chip" style={{ background:`${TYPE_COLOR[h.type]}18`, color:TYPE_COLOR[h.type] }}>{h.type}</span>
            <div className="sb-hist-row__amt">{h.amount>0?`₹${h.amount.toLocaleString()}`:"Free"}</div>
            <div className="sb-hist-row__date">{h.date}</div>
            <span className={`sb-plan-chip sb-plan-chip--${h.plan}`} style={{ fontSize:10, padding:"2px 8px", borderRadius:20, fontWeight:700 }}>{h.plan}</span>
            <span className={`sb-txn-chip sb-txn-chip--${h.status}`}>
              <span className="sb-txn-chip__dot" />{h.status[0]+h.status.slice(1).toLowerCase()}
            </span>
          </div>
        ))}
        {filtered.length===0 && (
          <div className="sb-hist-empty">
            <div className="sb-hist-empty__icon">🔍</div>
            <div className="sb-hist-empty__title">No transactions found</div>
            <div className="sb-hist-empty__desc">Try a different filter.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PAGE ROOT ────────────────────────────────────────────────────────────────
export default function Subscription() {
  const [tab,         setTab]         = useState<"overview"|"plans"|"history">("overview");
  const [showModal,   setShowModal]   = useState(false);
  const [customPlans, setCustomPlans] = useState<CustomPlan[]>([]);
  const [subs,        setSubs]        = useState<SubRow[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
const [deletePlanId, setDeletePlanId] = useState<string | null>(null);
  const openModal  = () => { setTab("plans"); setShowModal(true); };

  const handleUpdatePlan = async (plan: SubRow) => {
    try {
      const payload = {
        plan_name:     plan.planName,
        price:         plan.amt,
        active:        true,
        billing_cycle: plan.rawData.billing_cycle || "Monthly",
        features:      plan.rawData.features || {},
        description:   plan.rawData.description || "",
      };
      await updateSubscriptionPlan(plan.id, payload);
      alert("Plan updated successfully");
      window.location.reload();
    } catch (error) {
      console.error("UPDATE ERROR:", error);
      alert("Failed to update plan");
    }
  };
const handleDeletePlan = async () => {
  if (!deletePlanId) return;

  try {
    await axiosInstance.delete(
      `/v1/admin/subscription/plan/${deletePlanId}`,
      {
        headers: getExternalHeaders(),
        withCredentials: false,
      }
    );

    setSubs((prev) =>
      prev.filter((plan) => plan.id !== deletePlanId)
    );

    toast.success("Plan deleted successfully");

    setDeletePlanId(null);
  } catch (error) {
    console.error("DELETE ERROR:", error);

    toast.error("Failed to delete plan");
  }
};
  const savePlan = async (p: CustomPlan) => {
    try {
      const payload = {
        plan_name:     p.name,
        price:         p.price,
        yearly_price:  p.yearPrice,
        active:        true,
        popular:       p.popular,
        billing_cycle: p.billingCycle,          // ← now sent to API
        features: {
          users:               { limit_value: p.users === "∞" ? 999999 : Number(p.users) },
          whatsapp_accounts:   { limit_value: p.wa    === "∞" ? 999999 : Number(p.wa)    },
          messages_per_month:  { limit_value: p.msgs  === "∞" ? 999999 : Number(p.msgs.replace("K","000")) },
        },
        extras: p.extra,
        icon:   p.icon,
        color:  p.col,
      };
      await createSubscriptionPlan(payload);
      setCustomPlans(prev => [...prev, p]);
      window.location.reload();
    } catch (error) {
      console.error("CREATE PLAN ERROR:", error);
      alert("Failed to create plan");
    }
  };

  const removePlan = (id: number) => setCustomPlans(prev=>prev.filter(p=>p.id!==id));

  useEffect(() => {
    let alive = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: apiResponse } = await axiosInstance.get(EXTERNAL_API, {
          headers: getExternalHeaders(),
          withCredentials: false,
        });

        if (!alive) return;

        const raw: ApiPlan[] =
          Array.isArray(apiResponse?.data?.data)
            ? apiResponse.data.data
            : Array.isArray(apiResponse?.data)
              ? apiResponse.data
              : [];

        const mapped = raw.map(mapApiPlan);

        if (!alive) return;
        setSubs(mapped);
        setActiveCount(mapped.filter(s => s.status === "ACTIVE").length);
      } catch (err) {
        console.error("API ERROR:", err);
        if (!alive) return;
        setError("Failed to load subscription plans");
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetchData();
    return () => { alive = false; };
  }, []);

  const mrr = subs
    .filter(s => s.status === "ACTIVE" && s.rawData?.billing_cycle === "Monthly")
    .reduce((a, s) => a + s.amt, 0);

  return (
  <>
    <ToastContainer
      position="top-right"
      autoClose={3000}
      theme="dark"
    />
    <div className="sb-root">
      <div className="sb-header">
        <div>
          <h1 className="sb-header__title">Subscription</h1>
          <p className="sb-header__sub">Plans, billing, and subscription management.</p>
        </div>
        <div className="sb-header__btns">
          <button className="sb-btn sb-btn--export" onClick={() => downloadExcel(subs)} disabled={loading || subs.length === 0}>
            ⬇ Export
          </button>
          <button className="sb-btn sb-btn--primary" onClick={openModal}>+ Create Plan</button>
        </div>
      </div>

      <div className="sb-kpi-grid">
        <KPI label="Active Plans"      value={loading?"…":String(activeCount)}   delta="Live data"     icon="💳" color="#6C5CE7" />
        <KPI label="Monthly Revenue"   value={loading?"…":`₹${mrr.toLocaleString()}`} delta="vs last month" icon="📈" color="#00CBA4" up />
        <KPI label="On Trial"          value={loading?"…":String(subs.filter(s=>s.status==="TRIAL").length)} delta="expiring soon" icon="⏳" color="#FDCB6E" />
        <KPI label="Inactive Plans"    value={loading?"…":String(subs.filter(s=>s.status==="EXPIRED"||s.status==="CANCELLED").length)} delta="vs last month" icon="📉" color="#FF6B6B" up={false} />
      </div>

      {error && (
        <div style={{ margin:"0 0 16px", padding:"10px 14px", borderRadius:8, background:"rgba(255,107,107,0.1)", border:"1px solid rgba(255,107,107,0.3)", color:"#FF6B6B", fontSize:13 }}>
          ⚠ {error}
        </div>
      )}

      <div className="sb-tabs">
        {([["overview","📊 Overview"],["plans","💳 Plans"],["history","🕐 History"]] as [string,string][]).map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k as typeof tab)} className={`sb-tab ${tab===k?"sb-tab--active":""}`}>{l}</button>
        ))}
      </div>

      {tab==="overview" && <Overview subs={subs} loading={loading} activeCount={activeCount} onUpdatePlan={handleUpdatePlan} />}
      {tab==="plans"    && <Plans
  onOpenModal={()=>setShowModal(true)}
  customPlans={customPlans}
  onRemoveCustom={removePlan}
  onDeletePlan={(id) => setDeletePlanId(id)}
  subs={subs}
/>}
      {tab==="history"  && <History subs={subs} />}

      {showModal && <CreatePlanModal onClose={()=>setShowModal(false)} onSave={savePlan} />}
        {deletePlanId && (
  <div className="sb-modal-overlay">
    <div className="sb-modal">
      <div
        style={{
          fontSize: "20px",
          fontWeight: 700,
          marginBottom: "12px",
        }}
      >
        Delete Plan
      </div>

      <p
        style={{
          color: "#666",
          marginBottom: "20px",
        }}
      >
        Are you sure you want to delete this plan?
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
        }}
      >
        <button
          className="sb-btn sb-btn--ghost"
          onClick={() => setDeletePlanId(null)}
        >
          Cancel
        </button>

        <button
          className="sb-btn sb-btn--danger"
          onClick={handleDeletePlan}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
   </div>
  </>
);
}
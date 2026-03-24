"use client";

import { useState } from "react";
import "./subscription.css";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type SubStatus = "ACTIVE"|"TRIAL"|"EXPIRED"|"SUSPENDED"|"CANCELLED";
type PlanName  = "Starter"|"Basic"|"Pro"|"Enterprise";
type TxnStatus = "SUCCESS"|"FAILED"|"REFUNDED";
type TxnType   = "New"|"Renewal"|"Upgrade"|"Failed"|"Trial"|"Refund";

interface SubRow    { id:number; company:string; logo:string; col:string; plan:PlanName; status:SubStatus; start:string; end:string; amt:number; users:number; seats:number; }
interface PlanRow   { id:number; name:PlanName; price:number; yearPrice:number; icon:string; col:string; users:string; wa:string; msgs:string; popular?:boolean; extra:string[]; }
interface Transaction { id:number; company:string; logo:string; col:string; plan:PlanName; amount:number; date:string; type:TxnType; status:TxnStatus; }
interface CustomPlan  { id:number; name:string; price:number; yearPrice:number; icon:string; col:string; users:string; wa:string; msgs:string; popular:boolean; extra:string[]; }

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const INIT_SUBS: SubRow[] = [
  { id:1, company:"Acme Corp",       logo:"AC", col:"#6C5CE7", plan:"Enterprise", status:"ACTIVE",    start:"Jan 1, 2026",  end:"Dec 31, 2026", amt:7999, users:320, seats:500 },
];

const INIT_PLANS: PlanRow[] = [
  { id:1, name:"Starter",    price:499,  yearPrice:399,  icon:"🌱", col:"#00CBA4", users:"5",  wa:"1", msgs:"1K",  extra:["Email Support","Basic Reports","1 Chatbot"] },
  { id:2, name:"Basic",      price:999,  yearPrice:799,  icon:"🚀", col:"#FDCB6E", users:"15", wa:"2", msgs:"5K",  extra:["Priority Support","Advanced Reports","5 Chatbots","Campaigns"] },
  { id:3, name:"Pro",        price:2499, yearPrice:1999, icon:"⚡", col:"#6C5CE7", users:"50", wa:"5", msgs:"25K", popular:true, extra:["24/7 Support","AI Assistant","Unlimited Chatbots","Flows","Custom Branding"] },
  { id:4, name:"Enterprise", price:7999, yearPrice:6399, icon:"🏆", col:"#A29BFE", users:"∞", wa:"∞", msgs:"∞",  extra:["Dedicated Manager","SLA 99.9%","Custom Integration","White Label","SSO"] },
];

const HISTORY: Transaction[] = [
  { id:1, company:"Acme Corp",       logo:"AC", col:"#6C5CE7", plan:"Enterprise", amount:7999, date:"Jan 1, 2026",  type:"Renewal", status:"SUCCESS"  },
];

const TYPE_COLOR: Record<TxnType, string> = {
  New:"#00CBA4", Renewal:"#A29BFE", Upgrade:"#FDCB6E",
  Failed:"#FF6B6B", Trial:"#74B9FF", Refund:"#FD79A8",
};
const ICON_OPTIONS  = ["🌱","🚀","⚡","🏆","💎","🔥","🌟","🎯","🛡️","🧩"];
const COLOR_OPTIONS = ["#6C5CE7","#00CBA4","#FDCB6E","#A29BFE","#FF6B6B","#74B9FF","#FD79A8","#00B894","#E17055","#0984e3"];

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Badge({ status }: { status: SubStatus }) {
  return (
    <span className={`sb-badge sb-badge--${status}`}>
      <span className="sb-badge__dot" />{status[0]+status.slice(1).toLowerCase()}
    </span>
  );
}

function PlanChip({ plan }: { plan: PlanName }) {
  return <span className={`sb-plan-chip sb-plan-chip--${plan}`}>{plan}</span>;
}

function KPI({ label,value,delta,icon,color,up=true }:{ label:string; value:string; delta?:string; icon:string; color:string; up?:boolean }) {
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

function Inp({ label,value,onChange,placeholder,type="text",error,prefix }:{
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

function Tog({ on, setOn }:{ on:boolean; setOn:(v:boolean)=>void }) {
  return (
    <div className={`sb-toggle ${on?"sb-toggle--on":""}`} onClick={()=>setOn(!on)}>
      <div className="sb-toggle__knob" />
    </div>
  );
}

// ─── CREATE PLAN MODAL ────────────────────────────────────────────────────────
function CreatePlanModal({ onClose, onSave }:{ onClose:()=>void; onSave:(p:CustomPlan)=>void }) {
  const [step,    setStep]    = useState<1|2|3>(1);
  const [name,    setName]    = useState("");
  const [price,   setPrice]   = useState("");
  const [yearPct, setYearPct] = useState("20");
  const [users,   setUsers]   = useState("");
  const [wa,      setWa]      = useState("");
  const [msgs,    setMsgs]    = useState("");
  const [icon,    setIcon]    = useState("🌱");
  const [col,     setCol]     = useState("#6C5CE7");
  const [popular, setPopular] = useState(false);
  const [feats,   setFeats]   = useState(["","",""]);
  const [errors,  setErrors]  = useState<Record<string,string>>({});
  const [aiOn,    setAiOn]    = useState(false);
  const [brandOn, setBrandOn] = useState(false);
  const [apiOn,   setApiOn]   = useState(false);
  const [suppOn,  setSuppOn]  = useState(false);
  const [done,    setDone]    = useState(false);

  const mp = parseInt(price)||0;
  const ap = Math.round(mp*(1-(parseInt(yearPct||"0")/100)));

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
    onSave({ id:Date.now(), name:name.trim(), price:mp, yearPrice:ap, icon, col, users, wa, msgs, popular,
      extra:[...feats.filter(f=>f.trim()), ...(aiOn?["AI Assistant"]:[]), ...(brandOn?["Custom Branding"]:[]), ...(apiOn?["API Access"]:[]), ...(suppOn?["Priority Support"]:[])] });
    setDone(true); setTimeout(onClose,1400);
  };

  const STEPS = ["Basic Info","Limits","Features"];

  if(done) return (
    <div className="sb-success-overlay">
      <div className="sb-success-card">
        <div className="sb-success-icon">✓</div>
        <div className="sb-success-title">Plan Created!</div>
        <div className="sb-success-desc">
          <span style={{ color:col, fontWeight:700 }}>{icon} {name}</span> is now live in your plan list.
        </div>
      </div>
    </div>
  );

  return (
    <div className="sb-modal-overlay" onClick={onClose}>
      <div className="sb-modal" onClick={e=>e.stopPropagation()}>
        {/* Header */}
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

        {/* Body */}
        <div className="sb-modal__body">

          {/* STEP 1 */}
          {step===1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:15 }}>
              <Inp label="PLAN NAME" value={name} onChange={setName} placeholder="e.g. Growth, Teams, Scale…" error={errors.name} />
              <div className="sb-form-grid-2">
                <Inp label="MONTHLY PRICE (₹)" value={price} onChange={setPrice} placeholder="2499" type="number" prefix="₹" error={errors.price} />
                <Inp label="YEARLY DISCOUNT (%)" value={yearPct} onChange={setYearPct} placeholder="20" type="number" />
              </div>
              {mp>0 && (
                <div className="sb-price-preview">
                  <span className="sb-price-preview__label">Annual billing price / mo</span>
                  <span className="sb-price-preview__val">₹{ap.toLocaleString()} <span className="sb-price-preview__note">({yearPct}% off)</span></span>
                </div>
              )}
              {/* Icon picker */}
              <div>
                <div className="sb-field__label" style={{ marginBottom:8 }}>PLAN ICON</div>
                <div className="sb-icon-grid">
                  {ICON_OPTIONS.map(ic=>(
                    <button key={ic} onClick={()=>setIcon(ic)} className={`sb-icon-btn ${icon===ic?"sb-icon-btn--active":""}`}>{ic}</button>
                  ))}
                </div>
              </div>
              {/* Color picker */}
              <div>
                <div className="sb-field__label" style={{ marginBottom:8 }}>ACCENT COLOR</div>
                <div className="sb-color-grid">
                  {COLOR_OPTIONS.map(c=>(
                    <button key={c} onClick={()=>setCol(c)} className={`sb-color-swatch ${col===c?"sb-color-swatch--active":""}`}
                      style={{ background:c, outlineColor:c, outlineStyle:col===c?"solid":"none", outlineWidth:col===c?2:0, outlineOffset:2 }} />
                  ))}
                </div>
              </div>
              {/* Popular toggle */}
              <div className="sb-toggle-row">
                <div>
                  <div className="sb-toggle-row__title">Mark as Popular ★</div>
                  <div className="sb-toggle-row__desc">Shows "Most Popular" banner on plan card.</div>
                </div>
                <Tog on={popular} setOn={setPopular} />
              </div>
              {/* Live preview */}
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
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 */}
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

          {/* STEP 3 */}
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
              {/* Final preview */}
              <div className="sb-final-preview" style={{ border:`1px solid ${col}35` }}>
                {popular && <div className="sb-plan-card__popular-banner">★ MOST POPULAR</div>}
                <div className="sb-final-preview__inner">
                  <div className="sb-final-preview__lbl">FINAL PREVIEW</div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <div className="sb-live-preview__icon" style={{ background:`${col}22` }}>{icon}</div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:800, color:"var(--sb-title)" }}>{name||"Plan Name"}</div>
                      <div className="sb-live-preview__price">
                        <span className="sb-live-preview__amt">₹{mp.toLocaleString()}</span>
                        <span className="sb-live-preview__per">/mo</span>
                      </div>
                    </div>
                  </div>
                  <div className="sb-limits-grid" style={{ marginBottom:12 }}>
                    {([["👥",users||"—","users"],["💬",wa||"—","WA"],["📨",msgs||"—","msgs"]] as [string,string,string][]).map(([ic,v,l])=>(
                      <div key={l} className="sb-limit-cell"><div className="sb-limit-cell__val">{ic} {v}</div><div className="sb-limit-cell__key">{l}</div></div>
                    ))}
                  </div>
                  {feats.filter(f=>f.trim()).map(f=>(
                    <div key={f} className="sb-final-preview__feat">
                      <span style={{ color:col }}>✓</span>{f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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
function Overview() {
  const [sel, setSel] = useState<SubRow|null>(null);
  const active = INIT_SUBS.filter(s=>s.status==="ACTIVE");
  const mrr    = active.reduce((a,s)=>a+s.amt,0);
  const exp    = INIT_SUBS.filter(s=>s.status==="TRIAL"||s.status==="EXPIRED");

  return (
    <div className="sb-overview">
      <div>
        {/* Subscription table */}
        <div className="sb-sub-table">
          <div className="sb-sub-table__head">
            <span className="sb-sub-table__head-title">All Subscriptions</span>
            <span className="sb-sub-table__head-count">{active.length} active</span>
          </div>
          {INIT_SUBS.map(s=>(
            <div key={s.id} className={`sb-sub-row ${sel?.id===s.id?"sb-sub-row--active":""}`}
              onClick={()=>setSel(sel?.id===s.id?null:s)}>
              <div className="sb-sub-row__logo" style={{ background:s.col }}>{s.logo}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div className="sb-sub-row__name">{s.company}</div>
                <div className="sb-sub-row__meta">Renews {s.end} · {s.users}/{s.seats} seats</div>
              </div>
              <span className={`sb-plan-chip sb-plan-chip--${s.plan}`} style={{ marginRight:6, fontSize:10, padding:"2px 8px", borderRadius:20, fontWeight:700, background:`var(--sb-plan-${s.plan.toLowerCase()})18` }}>{s.plan}</span>
              <Badge status={s.status} />
              <div className="sb-sub-row__amount">{s.amt>0?`₹${s.amt.toLocaleString()}`:"Free"}</div>
            </div>
          ))}
        </div>
        {/* Detail panel */}
        {sel && (
          <div className="sb-detail">
            <div className="sb-detail__top">
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <div className="sb-detail__logo" style={{ background:sel.col, width:44, height:44 }}>{sel.logo}</div>
                <div>
                  <div className="sb-detail__name">{sel.company}</div>
                  <div className="sb-detail__dates">{sel.start} → {sel.end}</div>
                </div>
              </div>
              <button className="sb-btn-close-det" onClick={()=>setSel(null)}>×</button>
            </div>
            <div className="sb-detail__grid">
              {([
                ["Plan",  sel.plan,                                              `var(--sb-plan-${sel.plan.toLowerCase()})`],
                ["Amount",sel.amt>0?`₹${sel.amt.toLocaleString()}`:"Free",      "var(--sb-success)"],
                ["Seats", `${sel.users}/${sel.seats}`,                           "var(--sb-accent2)"],
                ["Status",sel.status[0]+sel.status.slice(1).toLowerCase(),       `var(--sb-status-${sel.status.toLowerCase()}-col)`],
              ] as [string,string,string][]).map(([l,v,c])=>(
                <div key={l} className="sb-detail__cell">
                  <div className="sb-detail__cell-key">{l.toUpperCase()}</div>
                  <div className="sb-detail__cell-val" style={{ color:c }}>{v}</div>
                </div>
              ))}
            </div>
            <div className="sb-detail__actions">
              <button className="sb-btn sb-btn--primary sb-btn--small">✏️ Edit Plan</button>
              <button className="sb-btn sb-btn--ghost sb-btn--small">⏸ Pause</button>
              <button className="sb-btn sb-btn--danger sb-btn--small">⛔ Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div className="sb-sidebar">
        {/* MRR card */}
        <div className="sb-mrr-card">
          <div className="sb-mrr-card__label">MONTHLY RECURRING REVENUE</div>
          <div className="sb-mrr-card__value">₹{mrr.toLocaleString()}</div>
          <div className="sb-mrr-card__delta">↑ +12% vs last month</div>
          <div className="sb-mrr-card__grid">
            {([["ARR",`₹${(mrr*12).toLocaleString()}`,"var(--sb-accent2)"],["ARPU",`₹${active.length>0?Math.round(mrr/active.length).toLocaleString():0}`,"var(--sb-warn)"]] as [string,string,string][]).map(([l,v,c])=>(
              <div key={l} className="sb-mrr-card__cell">
                <div className="sb-mrr-card__cell-key">{l}</div>
                <div className="sb-mrr-card__cell-val" style={{ color:c }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan distribution */}
        <div className="sb-dist-card">
          <div className="sb-dist-card__title">Plan Distribution</div>
          {INIT_PLANS.map(p=>{ const cnt=INIT_SUBS.filter(s=>s.plan===p.name).length; return (
            <div key={p.id} className="sb-dist-row">
              <div className="sb-dist-row__top">
                <span className="sb-dist-row__name">{p.icon} {p.name}</span>
                <div style={{ display:"flex", gap:8 }}>
                  <span className="sb-dist-row__count">{cnt} co.</span>
                  <span className="sb-dist-row__rev" style={{ color:p.col }}>{cnt>0?`₹${(cnt*p.price).toLocaleString()}`:"—"}</span>
                </div>
              </div>
              <div className="sb-dist-bar-bg">
                <div className="sb-dist-bar-fill" style={{ width:`${(cnt/INIT_SUBS.length)*100}%`, background:p.col }} />
              </div>
            </div>
          );})}
        </div>

        {/* Expiring soon */}
        {exp.length>0 && (
          <div className="sb-exp-card">
            <div className="sb-exp-card__head">
              <span>⚠️</span>
              <span className="sb-exp-card__title">Expiring Soon</span>
            </div>
            {exp.map(s=>(
              <div key={s.id} className="sb-exp-row">
                <div className="sb-exp-row__logo" style={{ background:s.col }}>{s.logo}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="sb-exp-row__name">{s.company}</div>
                  <div className="sb-exp-row__end">Ends {s.end}</div>
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
function Plans({ onOpenModal, customPlans, onRemoveCustom }:{ onOpenModal:()=>void; customPlans:CustomPlan[]; onRemoveCustom:(id:number)=>void }) {
  const [billing, setBilling] = useState<"MONTHLY"|"YEARLY">("MONTHLY");
  const [editId,  setEditId]  = useState<number|null>(null);

  const renderCard = (p: PlanRow|CustomPlan, isCustom=false) => {
    const price    = billing==="YEARLY" ? p.yearPrice : p.price;
    const isEdit   = editId===p.id;
    const subCount = isCustom ? 0 : INIT_SUBS.filter(s=>s.plan===(p as PlanRow).name).length;
    return (
      <div key={p.id} className={`sb-plan-card ${p.popular?"sb-plan-card--popular":""}`}>
        {p.popular && <div className="sb-plan-card__popular-banner">★ MOST POPULAR</div>}
        <div className="sb-plan-card__body">
          <div className="sb-plan-card__top">
            <div className="sb-plan-card__icon" style={{ background:`${p.col}20` }}>{p.icon}</div>
            <span className="sb-plan-card__badge" style={{ background:isCustom?"rgba(0,203,164,0.12)":`${p.col}18`, color:isCustom?"var(--sb-success)":p.col }}>
              {isCustom?"✦ New":`${subCount} cos`}
            </span>
          </div>
          <div className="sb-plan-card__name">{p.name}</div>
          <div className="sb-plan-card__price">
            <span className="sb-plan-card__amt">₹{price.toLocaleString()}</span>
            <span className="sb-plan-card__per">/mo</span>
          </div>
          {billing==="YEARLY"&&!isCustom&&(
            <div className="sb-plan-card__save">Save ₹{(((p as PlanRow).price-p.yearPrice)*12).toLocaleString()}/yr</div>
          )}
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
            <div key={f} className="sb-plan-card__feat">
              <span style={{ color:p.col }}>✓</span>{f}
            </div>
          ))}
          {p.extra.length>3&&<div className="sb-plan-card__more">+{p.extra.length-3} more</div>}
          <div className="sb-plan-card__actions">
            {isCustom ? (
              <>
                <button className="sb-btn sb-btn--ghost sb-btn--small" style={{ flex:1 }}>✏️ Edit</button>
                <button className="sb-btn sb-btn--danger sb-btn--small" style={{ flex:1 }} onClick={()=>onRemoveCustom(p.id)}>Remove</button>
              </>
            ) : (
              <>
                <button onClick={()=>setEditId(isEdit?null:p.id)} style={{ flex:1 }}
                  className={`sb-btn sb-btn--small ${isEdit?"sb-btn--primary":"sb-btn--ghost"}`}>{isEdit?"✓ Done":"✏️ Edit"}</button>
                <button className="sb-btn sb-btn--danger sb-btn--small" style={{ flex:1 }}>Disable</button>
              </>
            )}
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
        <span className="sb-billing-toggle__count">{INIT_PLANS.length+customPlans.length} plans active</span>
      </div>

      <div className="sb-plans-grid">{INIT_PLANS.map(p=>renderCard(p,false))}</div>
      {customPlans.length>0 && <div className="sb-plans-grid--custom">{customPlans.map(p=>renderCard(p,true))}</div>}

      <div className="sb-cta-dashed" onClick={onOpenModal}>
        <div className="sb-cta-dashed__icon">➕</div>
        <div className="sb-cta-dashed__title">Create New Plan</div>
        <div className="sb-cta-dashed__desc">Add a custom pricing plan for specific company needs.</div>
      </div>
    </div>
  );
}

// ─── HISTORY TAB ──────────────────────────────────────────────────────────────
function History() {
  const [tf, setTf] = useState("ALL");
  const filtered = tf==="ALL"?HISTORY:HISTORY.filter(h=>h.type===tf);
  const rev = HISTORY.filter(h=>h.status==="SUCCESS").reduce((a,h)=>a+h.amount,0);

  return (
    <div className="sb-history">
      <div className="sb-hist-kpi-grid">
        {([
          ["Total Revenue",`₹${rev.toLocaleString()}`,"var(--sb-success)","💰"],
          ["Transactions",String(HISTORY.length),"var(--sb-accent2)","📊"],
          ["Failed",String(HISTORY.filter(h=>h.status==="FAILED").length),"var(--sb-danger)","❌"],
          ["Refunded",String(HISTORY.filter(h=>h.status==="REFUNDED").length),"var(--sb-warn)","↩️"],
        ] as [string,string,string,string][]).map(([l,v,c,ic])=>(
          <div key={l} className="sb-hist-kpi">
            <div className="sb-hist-kpi__top"><span className="sb-hist-kpi__lbl">{l}</span><span className="sb-hist-kpi__icon">{ic}</span></div>
            <div className="sb-hist-kpi__val" style={{ color:c }}>{v}</div>
          </div>
        ))}
      </div>

      <div className="sb-hist-filters">
        <span className="sb-hist-label">Filter:</span>
        {["ALL","New","Renewal","Upgrade","Failed","Trial","Refund"].map(t=>(
          <button key={t} onClick={()=>setTf(t)} className={`sb-hist-pill ${tf===t?"sb-hist-pill--active":""}`}>{t}</button>
        ))}
      </div>

      <div className="sb-hist-table">
        <div className="sb-hist-table__head">
          {["Company","Plan","Amount","Date","Type","Status"].map(h=>(
            <div key={h} className="sb-hist-table__hcell">{h.toUpperCase()}</div>
          ))}
        </div>
        {filtered.map(h=>(
          <div key={h.id} className="sb-hist-row">
            <div className="sb-hist-row__co">
              <div className="sb-hist-row__logo" style={{ background:h.col }}>{h.logo}</div>
              <div className="sb-hist-row__name">{h.company}</div>
            </div>
            <span className={`sb-plan-chip sb-plan-chip--${h.plan}`} style={{ fontSize:10, padding:"2px 8px", borderRadius:20, fontWeight:700 }}>{h.plan}</span>
            <div className="sb-hist-row__amt">{h.amount>0?`₹${h.amount.toLocaleString()}`:"Free"}</div>
            <div className="sb-hist-row__date">{h.date}</div>
            <span className="sb-type-chip" style={{ background:`${TYPE_COLOR[h.type]}18`, color:TYPE_COLOR[h.type] }}>{h.type}</span>
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

  const openModal  = () => { setTab("plans"); setShowModal(true); };
  const savePlan   = (p: CustomPlan) => setCustomPlans(prev=>[...prev, p]);
  const removePlan = (id: number) => setCustomPlans(prev=>prev.filter(p=>p.id!==id));

  return (
    <div className="sb-root">
      {/* Header */}
      <div className="sb-header">
        <div>
          <h1 className="sb-header__title">Subscription</h1>
          <p className="sb-header__sub">Plans, billing, and company subscription management.</p>
        </div>
        <div className="sb-header__btns">
          <button className="sb-btn sb-btn--export">⬇ Export</button>
          <button className="sb-btn sb-btn--primary" onClick={openModal}>+ Create Plan</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="sb-kpi-grid">
        <KPI label="Active Subscriptions" value="0"   delta="— this month"  icon="💳" color="#6C5CE7" />
        <KPI label="Monthly Revenue"      value="₹0.0L" delta="— vs last month" icon="📈" color="#00CBA4" up />
        <KPI label="On Trial"             value="0"    delta="— expiring soon"   icon="⏳" color="#FDCB6E" />
        <KPI label="Churned (30d)"        value="0"     delta="—s more than last"  icon="📉" color="#FF6B6B" up={false} />
      </div>

      {/* Tabs */}
      <div className="sb-tabs">
        {([ ["overview","📊 Overview"],["plans","💳 Plans"],["history","🕐 History"] ] as [string,string][]).map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k as typeof tab)} className={`sb-tab ${tab===k?"sb-tab--active":""}`}>{l}</button>
        ))}
      </div>

      {tab==="overview" && <Overview />}
      {tab==="plans"    && <Plans onOpenModal={()=>setShowModal(true)} customPlans={customPlans} onRemoveCustom={removePlan} />}
      {tab==="history"  && <History />}

      {showModal && <CreatePlanModal onClose={()=>setShowModal(false)} onSave={savePlan} />}
    </div>
  );
}
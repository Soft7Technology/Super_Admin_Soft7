"use client";

import { useState } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg:"#080A12", surf:"#0F1120", surf2:"#171929", surf3:"#1E2035",
  border:"rgba(255,255,255,0.07)", accent:"#6C5CE7", accent2:"#A29BFE",
  text:"#E2E4F0", muted:"#565875", success:"#00CBA4", danger:"#FF6B6B",
  warn:"#FDCB6E", info:"#74B9FF",
} as const;

// ─── TYPES ────────────────────────────────────────────────────────────────────
type SubStatus = "ACTIVE"|"TRIAL"|"EXPIRED"|"SUSPENDED"|"CANCELLED";
type PlanName  = "Starter"|"Basic"|"Pro"|"Enterprise";
type TxnStatus = "SUCCESS"|"FAILED"|"REFUNDED";
type TxnType   = "New"|"Renewal"|"Upgrade"|"Failed"|"Trial"|"Refund";

interface SubRow { id:number; company:string; logo:string; col:string; plan:PlanName; status:SubStatus; start:string; end:string; amt:number; users:number; seats:number; }
interface PlanRow { id:number; name:PlanName; price:number; yearPrice:number; icon:string; col:string; users:string; wa:string; msgs:string; popular?:boolean; extra:string[]; }
interface Transaction { id:number; company:string; logo:string; col:string; plan:PlanName; amount:number; date:string; type:TxnType; status:TxnStatus; }
interface CustomPlan { id:number; name:string; price:number; yearPrice:number; icon:string; col:string; users:string; wa:string; msgs:string; popular:boolean; extra:string[]; }

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const INIT_SUBS: SubRow[] = [
  { id:1, company:"Acme Corp",       logo:"AC", col:"#6C5CE7", plan:"Enterprise", status:"ACTIVE",    start:"Jan 1, 2026",  end:"Dec 31, 2026", amt:7999, users:320, seats:500 },
  { id:2, company:"Nexus Ltd",       logo:"NX", col:"#FDCB6E", plan:"Pro",        status:"ACTIVE",    start:"Jul 1, 2025",  end:"Jun 30, 2026", amt:2499, users:148, seats:200 },
  { id:3, company:"SkyLine Inc",     logo:"SK", col:"#00CBA4", plan:"Starter",    status:"TRIAL",     start:"Mar 1, 2026",  end:"Mar 15, 2026", amt:0,    users:42,  seats:50  },
  { id:4, company:"Vertex Co",       logo:"VT", col:"#FF6B6B", plan:"Basic",      status:"EXPIRED",   start:"Jan 1, 2025",  end:"Dec 1, 2025",  amt:999,  users:87,  seats:100 },
  { id:5, company:"Zenith Group",    logo:"ZN", col:"#A29BFE", plan:"Enterprise", status:"ACTIVE",    start:"Feb 1, 2026",  end:"Jan 31, 2027", amt:7999, users:510, seats:500 },
  { id:6, company:"Orbit Systems",   logo:"OS", col:"#FD79A8", plan:"Starter",    status:"SUSPENDED", start:"Aug 1, 2025",  end:"Nov 1, 2025",  amt:0,    users:23,  seats:50  },
  { id:7, company:"Prism Analytics", logo:"PA", col:"#00B894", plan:"Pro",        status:"ACTIVE",    start:"Oct 1, 2025",  end:"Sep 30, 2026", amt:2499, users:195, seats:200 },
  { id:8, company:"Delta Forge",     logo:"DF", col:"#E17055", plan:"Basic",      status:"ACTIVE",    start:"Aug 1, 2025",  end:"Jul 31, 2026", amt:999,  users:67,  seats:100 },
];
const INIT_PLANS: PlanRow[] = [
  { id:1, name:"Starter",    price:499,  yearPrice:399,  icon:"🌱", col:"#00CBA4", users:"5",  wa:"1", msgs:"1K",  extra:["Email Support","Basic Reports","1 Chatbot"] },
  { id:2, name:"Basic",      price:999,  yearPrice:799,  icon:"🚀", col:"#FDCB6E", users:"15", wa:"2", msgs:"5K",  extra:["Priority Support","Advanced Reports","5 Chatbots","Campaigns"] },
  { id:3, name:"Pro",        price:2499, yearPrice:1999, icon:"⚡", col:"#6C5CE7", users:"50", wa:"5", msgs:"25K", popular:true, extra:["24/7 Support","AI Assistant","Unlimited Chatbots","Flows","Custom Branding"] },
  { id:4, name:"Enterprise", price:7999, yearPrice:6399, icon:"🏆", col:"#A29BFE", users:"∞", wa:"∞", msgs:"∞",  extra:["Dedicated Manager","SLA 99.9%","Custom Integration","White Label","SSO"] },
];
const HISTORY: Transaction[] = [
  { id:1, company:"Acme Corp",       logo:"AC", col:"#6C5CE7", plan:"Enterprise", amount:7999, date:"Jan 1, 2026",  type:"Renewal", status:"SUCCESS"  },
  { id:2, company:"Nexus Ltd",       logo:"NX", col:"#FDCB6E", plan:"Pro",        amount:2499, date:"Dec 28, 2025", type:"Renewal", status:"SUCCESS"  },
  { id:3, company:"Zenith Group",    logo:"ZN", col:"#A29BFE", plan:"Enterprise", amount:7999, date:"Feb 1, 2026",  type:"New",     status:"SUCCESS"  },
  { id:4, company:"Vertex Co",       logo:"VT", col:"#FF6B6B", plan:"Basic",      amount:999,  date:"Nov 30, 2025", type:"Failed",  status:"FAILED"   },
  { id:5, company:"Prism Analytics", logo:"PA", col:"#00B894", plan:"Pro",        amount:2499, date:"Oct 1, 2025",  type:"Upgrade", status:"SUCCESS"  },
  { id:6, company:"Delta Forge",     logo:"DF", col:"#E17055", plan:"Basic",      amount:999,  date:"Aug 1, 2025",  type:"New",     status:"SUCCESS"  },
  { id:7, company:"SkyLine Inc",     logo:"SK", col:"#00CBA4", plan:"Starter",    amount:0,    date:"Mar 1, 2026",  type:"Trial",   status:"SUCCESS"  },
  { id:8, company:"Orbit Systems",   logo:"OS", col:"#FD79A8", plan:"Starter",    amount:499,  date:"Oct 5, 2025",  type:"Refund",  status:"REFUNDED" },
];

// ─── LOOKUP MAPS ──────────────────────────────────────────────────────────────
const STATUS_MAP: Record<SubStatus,[string,string]> = {
  ACTIVE:["#00CBA4","rgba(0,203,164,0.12)"], TRIAL:["#A29BFE","rgba(162,155,254,0.14)"],
  EXPIRED:["#565875","rgba(86,88,117,0.18)"], SUSPENDED:["#FF6B6B","rgba(255,107,107,0.12)"],
  CANCELLED:["#FF6B6B","rgba(255,107,107,0.12)"],
};
const TXN_COLOR: Record<TxnStatus,[string,string]> = {
  SUCCESS:["#00CBA4","rgba(0,203,164,0.10)"], FAILED:["#FF6B6B","rgba(255,107,107,0.10)"],
  REFUNDED:["#FDCB6E","rgba(253,203,110,0.10)"],
};
const TYPE_COLOR: Record<TxnType,string> = {
  New:"#00CBA4", Renewal:"#A29BFE", Upgrade:"#FDCB6E", Failed:"#FF6B6B", Trial:"#74B9FF", Refund:"#FD79A8",
};
const PLAN_COLOR: Record<PlanName,string> = {
  Enterprise:"#A29BFE", Pro:"#6C5CE7", Basic:"#FDCB6E", Starter:"#00CBA4",
};
const ICON_OPTIONS  = ["🌱","🚀","⚡","🏆","💎","🔥","🌟","🎯","🛡️","🧩"];
const COLOR_OPTIONS = ["#6C5CE7","#00CBA4","#FDCB6E","#A29BFE","#FF6B6B","#74B9FF","#FD79A8","#00B894","#E17055","#0984e3"];

// ─── TINY SHARED COMPONENTS ───────────────────────────────────────────────────
function Badge({ status }: { status: SubStatus }) {
  const [color,bg] = STATUS_MAP[status];
  return (
    <span style={{ background:bg, color, fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:20, display:"inline-flex", alignItems:"center", gap:4, whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:color, flexShrink:0 }} />
      {status[0]+status.slice(1).toLowerCase()}
    </span>
  );
}
function KPI({ label,value,delta,icon,color,up=true }:{ label:string; value:string; delta?:string; icon:string; color:string; up?:boolean }) {
  return (
    <div style={{ background:T.surf, border:`1px solid ${T.border}`, borderRadius:14, padding:"16px 18px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:-6, right:-6, width:56, height:56, borderRadius:"50%", background:`${color}10` }} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <span style={{ fontSize:11, color:T.muted, fontWeight:500 }}>{label}</span>
        <div style={{ width:30, height:30, borderRadius:8, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{icon}</div>
      </div>
      <div style={{ fontSize:26, fontWeight:800, color:"#fff", letterSpacing:"-0.5px", marginBottom:4 }}>{value}</div>
      {delta && <div style={{ fontSize:10, color:up?T.success:T.danger, fontWeight:600 }}>{up?"↑":"↓"} {delta}</div>}
    </div>
  );
}
function Inp({ label,value,onChange,placeholder,type="text",error,prefix }:{
  label:string; value:string; onChange:(v:string)=>void;
  placeholder?:string; type?:string; error?:string; prefix?:string;
}) {
  return (
    <div>
      <div style={{ fontSize:9, color:T.muted, fontWeight:700, letterSpacing:"0.07em", marginBottom:5 }}>{label}</div>
      <div style={{ position:"relative" }}>
        {prefix && <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:T.muted, fontSize:13, fontWeight:700, pointerEvents:"none" }}>{prefix}</span>}
        <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
          style={{ width:"100%", background:T.surf3, border:`1px solid ${error?T.danger:T.border}`, color:T.text, padding:prefix?"9px 12px 9px 26px":"9px 12px", borderRadius:9, fontSize:12, outline:"none", fontFamily:"inherit" }}
          onFocus={e=>(e.target.style.borderColor=error?T.danger:T.accent)}
          onBlur={e=>(e.target.style.borderColor=error?T.danger:T.border)} />
      </div>
      {error && <div style={{ fontSize:10, color:T.danger, marginTop:4 }}>{error}</div>}
    </div>
  );
}
function Tog({ on, setOn }:{ on:boolean; setOn:(v:boolean)=>void }) {
  return (
    <div onClick={()=>setOn(!on)} style={{ width:38, height:21, borderRadius:11, background:on?T.accent:"rgba(255,255,255,0.1)", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:3, left:on?19:3, width:15, height:15, borderRadius:"50%", background:"#fff", transition:"left 0.2s" }} />
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
    onSave({
      id:Date.now(), name:name.trim(), price:mp, yearPrice:ap, icon, col,
      users, wa, msgs, popular,
      extra:[...feats.filter(f=>f.trim()), ...(aiOn?["AI Assistant"]:[]), ...(brandOn?["Custom Branding"]:[]), ...(apiOn?["API Access"]:[]), ...(suppOn?["Priority Support"]:[])],
    });
    setDone(true);
    setTimeout(onClose, 1400);
  };

  const STEPS=["Basic Info","Limits","Features"];

  // success screen
  if(done) return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:700, backdropFilter:"blur(8px)" }}>
      <div style={{ background:T.surf, border:`1px solid rgba(0,203,164,0.3)`, borderRadius:20, padding:"52px 56px", textAlign:"center", animation:"slideUp 0.2s ease" }}>
        <div style={{ width:68, height:68, borderRadius:"50%", background:"rgba(0,203,164,0.12)", border:"2px solid #00CBA4", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, margin:"0 auto 20px" }}>✓</div>
        <div style={{ fontSize:20, fontWeight:800, color:"#fff", marginBottom:8 }}>Plan Created!</div>
        <div style={{ fontSize:13, color:T.muted }}>
          <span style={{ color:col, fontWeight:700 }}>{icon} {name}</span> is now live in your plan list.
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:700, backdropFilter:"blur(8px)" }}
      onClick={onClose}>
      <div style={{ background:T.surf, border:`1px solid rgba(108,92,231,0.35)`, borderRadius:20, width:530, maxHeight:"92vh", display:"flex", flexDirection:"column", boxShadow:"0 32px 80px rgba(0,0,0,0.7)", animation:"slideUp 0.22s ease" }}
        onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding:"22px 26px 16px", borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:9, background:`linear-gradient(135deg,${T.accent},${T.accent2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>✦</div>
              <div>
                <div style={{ fontSize:17, fontWeight:800, color:"#fff" }}>Create New Plan</div>
                <div style={{ fontSize:11, color:T.muted }}>Step {step} of 3 — {STEPS[step-1]}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:22, lineHeight:1 }}>×</button>
          </div>
          {/* Progress bar */}
          <div style={{ display:"flex", gap:6, marginTop:16 }}>
            {STEPS.map((s,i)=>(
              <div key={s} style={{ flex:1 }}>
                <div style={{ height:3, borderRadius:2, background:i<step?T.accent:"rgba(255,255,255,0.07)", transition:"background 0.3s" }} />
                <div style={{ fontSize:9, color:i+1===step?T.accent2:i<step?T.success:T.muted, fontWeight:i+1===step?700:400, marginTop:4 }}>{s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:"22px 26px", overflowY:"auto", flex:1 }}>

          {/* STEP 1 */}
          {step===1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:15 }}>
              <Inp label="PLAN NAME" value={name} onChange={setName} placeholder="e.g. Growth, Teams, Scale…" error={errors.name} />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Inp label="MONTHLY PRICE (₹)" value={price} onChange={setPrice} placeholder="2499" type="number" prefix="₹" error={errors.price} />
                <Inp label="YEARLY DISCOUNT (%)" value={yearPct} onChange={setYearPct} placeholder="20" type="number" />
              </div>
              {mp>0 && (
                <div style={{ background:"rgba(0,203,164,0.06)", border:"1px solid rgba(0,203,164,0.2)", borderRadius:10, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:11, color:T.muted }}>Annual billing price / mo</span>
                  <span style={{ fontSize:15, fontWeight:800, color:T.success }}>₹{ap.toLocaleString()} <span style={{ fontSize:10, color:T.muted }}>({yearPct}% off)</span></span>
                </div>
              )}
              {/* Icon picker */}
              <div>
                <div style={{ fontSize:9, color:T.muted, fontWeight:700, letterSpacing:"0.07em", marginBottom:8 }}>PLAN ICON</div>
                <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                  {ICON_OPTIONS.map(ic=>(
                    <button key={ic} onClick={()=>setIcon(ic)}
                      style={{ width:40, height:40, borderRadius:9, background:icon===ic?"rgba(108,92,231,0.2)":T.surf2, border:`1.5px solid ${icon===ic?T.accent:T.border}`, fontSize:19, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.12s" }}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              {/* Color picker */}
              <div>
                <div style={{ fontSize:9, color:T.muted, fontWeight:700, letterSpacing:"0.07em", marginBottom:8 }}>ACCENT COLOR</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {COLOR_OPTIONS.map(c=>(
                    <button key={c} onClick={()=>setCol(c)}
                      style={{ width:28, height:28, borderRadius:"50%", background:c, border:`2.5px solid ${col===c?"#fff":"transparent"}`, cursor:"pointer", outline:col===c?`2px solid ${c}`:"none", outlineOffset:2, transition:"all 0.12s" }} />
                  ))}
                </div>
              </div>
              {/* Popular toggle */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:T.surf2, borderRadius:10, padding:"12px 14px", border:`1px solid ${T.border}` }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:T.text }}>Mark as Popular ★</div>
                  <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>Shows "Most Popular" banner on plan card.</div>
                </div>
                <Tog on={popular} setOn={setPopular} />
              </div>
              {/* Live preview */}
              {name && (
                <div style={{ background:T.surf2, borderRadius:12, padding:"14px 16px", border:`1px solid ${col}40` }}>
                  <div style={{ fontSize:9, color:T.muted, fontWeight:700, letterSpacing:"0.07em", marginBottom:10 }}>LIVE PREVIEW</div>
                  <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                    <div style={{ width:44, height:44, borderRadius:11, background:`${col}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{icon}</div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:800, color:"#fff", display:"flex", alignItems:"center", gap:7 }}>
                        {name}
                        {popular && <span style={{ background:`linear-gradient(135deg,${T.accent},${T.accent2})`, color:"#fff", fontSize:9, padding:"2px 7px", borderRadius:4, fontWeight:800 }}>POPULAR</span>}
                      </div>
                      <div style={{ display:"flex", alignItems:"baseline", gap:3, marginTop:3 }}>
                        <span style={{ fontSize:22, fontWeight:800, color:"#fff" }}>₹{mp.toLocaleString()}</span>
                        <span style={{ fontSize:10, color:T.muted }}>/mo</span>
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
              <div style={{ fontSize:12, color:T.muted }}>
                Set usage limits for <span style={{ color:T.accent2, fontWeight:700 }}>{name||"this plan"}</span>.
                Use <code style={{ background:T.surf2, padding:"1px 5px", borderRadius:4, fontSize:11 }}>∞</code> for unlimited.
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                <Inp label="👥 MAX USERS"    value={users} onChange={setUsers} placeholder="50 or ∞"  error={errors.users} />
                <Inp label="💬 WA ACCOUNTS"  value={wa}    onChange={setWa}    placeholder="5 or ∞"   error={errors.wa}   />
                <Inp label="📨 MSGS / MONTH" value={msgs}  onChange={setMsgs}  placeholder="25K or ∞" error={errors.msgs} />
              </div>
              {(users||wa||msgs) && (
                <div style={{ background:T.surf2, borderRadius:11, padding:"14px", border:`1px solid ${T.border}` }}>
                  <div style={{ fontSize:9, color:T.muted, fontWeight:700, letterSpacing:"0.07em", marginBottom:10 }}>LIMITS PREVIEW</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                    {([["👥",users||"—","users"],["💬",wa||"—","WA accts"],["📨",msgs||"—","msgs/mo"]] as [string,string,string][]).map(([ic,v,l])=>(
                      <div key={l} style={{ background:T.surf, borderRadius:8, padding:"8px", textAlign:"center", border:`1px solid ${T.border}` }}>
                        <div style={{ fontSize:15, fontWeight:800, color:"#fff" }}>{ic} {v}</div>
                        <div style={{ fontSize:9, color:T.muted, marginTop:2 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ background:T.surf2, borderRadius:11, overflow:"hidden", border:`1px solid ${T.border}` }}>
                {([
                  ["AI Assistant",     "AI-powered chat assistance",  aiOn,    setAiOn],
                  ["Custom Branding",  "Logo & color customization",  brandOn, setBrandOn],
                  ["API Access",       "REST API for integrations",   apiOn,   setApiOn],
                  ["Priority Support", "Faster response SLA",         suppOn,  setSuppOn],
                ] as [string,string,boolean,(v:boolean)=>void][]).map(([lbl,desc,val,setter],i,arr)=>(
                  <div key={lbl} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 14px", borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none" }}>
                    <div>
                      <div style={{ fontSize:12, fontWeight:500, color:T.text }}>{lbl}</div>
                      <div style={{ fontSize:10, color:T.muted }}>{desc}</div>
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
              <div style={{ fontSize:12, color:T.muted }}>
                Feature bullets shown on <span style={{ color:T.accent2, fontWeight:700 }}>{name||"the plan"}</span> card.
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {feats.map((f,i)=>(
                  <div key={i} style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <span style={{ color:col, fontSize:14, flexShrink:0 }}>✓</span>
                    <input value={f} onChange={e=>{const c=[...feats];c[i]=e.target.value;setFeats(c);}}
                      placeholder={`Feature ${i+1}…`}
                      style={{ flex:1, background:T.surf2, border:`1px solid ${T.border}`, color:T.text, padding:"8px 11px", borderRadius:8, fontSize:12, outline:"none", fontFamily:"inherit" }}
                      onFocus={e=>(e.target.style.borderColor=T.accent)} onBlur={e=>(e.target.style.borderColor=T.border)} />
                    {feats.length>1 && <button onClick={()=>setFeats(f=>f.filter((_,idx)=>idx!==i))} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:18, padding:"2px 4px", flexShrink:0 }}>×</button>}
                  </div>
                ))}
              </div>
              <button onClick={()=>setFeats(f=>[...f,""])}
                style={{ background:"transparent", border:`1px dashed ${T.border}`, color:T.muted, padding:"8px", borderRadius:9, cursor:"pointer", fontSize:12, fontFamily:"inherit" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.color=T.accent2;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.muted;}}>
                + Add Feature
              </button>
              {/* Final preview */}
              <div style={{ background:T.surf2, border:`1px solid ${col}35`, borderRadius:14, overflow:"hidden" }}>
                {popular && <div style={{ background:`linear-gradient(135deg,${T.accent},${T.accent2})`, textAlign:"center", padding:"5px", fontSize:9, fontWeight:800, color:"#fff", letterSpacing:"0.08em" }}>★ MOST POPULAR</div>}
                <div style={{ padding:"16px 18px" }}>
                  <div style={{ fontSize:9, color:T.muted, fontWeight:700, letterSpacing:"0.07em", marginBottom:12 }}>FINAL PREVIEW</div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:`${col}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{icon}</div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>{name||"Plan Name"}</div>
                      <div style={{ display:"flex", alignItems:"baseline", gap:3 }}>
                        <span style={{ fontSize:22, fontWeight:800, color:"#fff" }}>₹{mp.toLocaleString()}</span>
                        <span style={{ fontSize:10, color:T.muted }}>/mo</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:12 }}>
                    {([["👥",users||"—","users"],["💬",wa||"—","WA"],["📨",msgs||"—","msgs"]] as [string,string,string][]).map(([ic,v,l])=>(
                      <div key={l} style={{ background:T.surf, borderRadius:6, padding:"5px 4px", textAlign:"center", border:`1px solid ${T.border}` }}>
                        <div style={{ fontSize:10, fontWeight:800, color:"#fff" }}>{ic} {v}</div>
                        <div style={{ fontSize:9, color:T.muted }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  {feats.filter(f=>f.trim()).map(f=>(
                    <div key={f} style={{ display:"flex", gap:6, fontSize:11, color:"#9CA3AF", marginBottom:5, alignItems:"center" }}>
                      <span style={{ color:col }}>✓</span>{f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:"14px 26px 20px", borderTop:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <button onClick={step>1?back:onClose}
            style={{ background:T.surf2, color:T.muted, border:`1px solid ${T.border}`, padding:"9px 18px", borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:600 }}>
            {step===1?"Cancel":"← Back"}
          </button>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <span style={{ fontSize:11, color:T.muted }}>{step} / 3</span>
            {step<3
              ? <button onClick={next} style={{ background:`linear-gradient(135deg,${T.accent},${T.accent2})`, color:"#fff", border:"none", padding:"9px 24px", borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:700 }}>Next →</button>
              : <button onClick={handleSave} style={{ background:`linear-gradient(135deg,${T.accent},${T.accent2})`, color:"#fff", border:"none", padding:"9px 24px", borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:700 }}>✓ Create Plan</button>
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
  const mrr = active.reduce((a,s)=>a+s.amt,0);
  const exp = INIT_SUBS.filter(s=>s.status==="TRIAL"||s.status==="EXPIRED");

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:18 }}>
      <div>
        <div style={{ background:T.surf, border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden", marginBottom:14 }}>
          <div style={{ padding:"14px 18px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontWeight:700, fontSize:13, color:"#fff" }}>All Subscriptions</span>
            <span style={{ fontSize:11, color:T.muted }}>{active.length} active</span>
          </div>
          {INIT_SUBS.map((s,i)=>(
            <div key={s.id} onClick={()=>setSel(sel?.id===s.id?null:s)}
              style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 18px", borderBottom:i<INIT_SUBS.length-1?`1px solid ${T.border}`:"none", cursor:"pointer", background:sel?.id===s.id?"rgba(108,92,231,0.06)":"transparent", transition:"background 0.12s" }}
              onMouseEnter={e=>(e.currentTarget.style.background="rgba(108,92,231,0.04)")}
              onMouseLeave={e=>(e.currentTarget.style.background=sel?.id===s.id?"rgba(108,92,231,0.06)":"transparent")}>
              <div style={{ width:34, height:34, borderRadius:9, background:s.col, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:11, color:"#fff", flexShrink:0 }}>{s.logo}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:12, color:T.text, marginBottom:2 }}>{s.company}</div>
                <div style={{ fontSize:10, color:T.muted }}>Renews {s.end} · {s.users}/{s.seats} seats</div>
              </div>
              <span style={{ background:`${PLAN_COLOR[s.plan]}18`, color:PLAN_COLOR[s.plan], fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, marginRight:6 }}>{s.plan}</span>
              <Badge status={s.status} />
              <div style={{ fontWeight:700, fontSize:12, color:T.text, minWidth:58, textAlign:"right" }}>{s.amt>0?`₹${s.amt.toLocaleString()}`:"Free"}</div>
            </div>
          ))}
        </div>
        {sel&&(
          <div style={{ background:T.surf, border:"1px solid rgba(108,92,231,0.3)", borderRadius:14, padding:"18px 20px", animation:"fadeIn 0.15s" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <div style={{ width:44, height:44, borderRadius:12, background:sel.col, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, color:"#fff" }}>{sel.logo}</div>
                <div>
                  <div style={{ fontWeight:800, fontSize:15, color:"#fff" }}>{sel.company}</div>
                  <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{sel.start} → {sel.end}</div>
                </div>
              </div>
              <button onClick={()=>setSel(null)} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:20 }}>×</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:14 }}>
              {([["Plan",sel.plan,PLAN_COLOR[sel.plan]],["Amount",sel.amt>0?`₹${sel.amt.toLocaleString()}`:"Free",T.success],["Seats",`${sel.users}/${sel.seats}`,T.accent2],["Status",sel.status[0]+sel.status.slice(1).toLowerCase(),STATUS_MAP[sel.status][0]]] as [string,string,string][]).map(([l,v,c])=>(
                <div key={l} style={{ background:T.surf2, borderRadius:9, padding:"10px 12px", border:`1px solid ${T.border}` }}>
                  <div style={{ fontSize:9, color:T.muted, fontWeight:700, letterSpacing:"0.07em", marginBottom:4 }}>{l.toUpperCase()}</div>
                  <div style={{ fontSize:13, fontWeight:800, color:c }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button style={{ background:`linear-gradient(135deg,${T.accent},${T.accent2})`, color:"#fff", border:"none", padding:"7px 16px", borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:600 }}>✏️ Edit Plan</button>
              <button style={{ background:T.surf2, color:T.muted, border:`1px solid ${T.border}`, padding:"7px 16px", borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:600 }}>⏸ Pause</button>
              <button style={{ background:"rgba(255,107,107,0.08)", color:T.danger, border:"1px solid rgba(255,107,107,0.25)", padding:"7px 16px", borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:600 }}>⛔ Cancel</button>
            </div>
          </div>
        )}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div style={{ background:"linear-gradient(135deg,rgba(108,92,231,0.18),rgba(162,155,254,0.08))", border:"1px solid rgba(108,92,231,0.3)", borderRadius:14, padding:"20px" }}>
          <div style={{ fontSize:10, color:T.accent2, fontWeight:700, letterSpacing:"0.06em", marginBottom:8 }}>MONTHLY RECURRING REVENUE</div>
          <div style={{ fontSize:36, fontWeight:800, color:"#fff", letterSpacing:"-1.5px", marginBottom:6 }}>₹{mrr.toLocaleString()}</div>
          <div style={{ fontSize:11, color:T.success, fontWeight:600, marginBottom:16 }}>↑ +12% vs last month</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {([["ARR",`₹${(mrr*12).toLocaleString()}`,T.accent2],["ARPU",`₹${active.length>0?Math.round(mrr/active.length).toLocaleString():0}`,T.warn]] as [string,string,string][]).map(([l,v,c])=>(
              <div key={l} style={{ background:"rgba(0,0,0,0.2)", borderRadius:9, padding:"10px 12px" }}>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)", fontWeight:700, letterSpacing:"0.06em", marginBottom:4 }}>{l}</div>
                <div style={{ fontSize:16, fontWeight:800, color:c }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:T.surf, border:`1px solid ${T.border}`, borderRadius:14, padding:"16px 18px" }}>
          <div style={{ fontWeight:700, fontSize:13, color:"#fff", marginBottom:14 }}>Plan Distribution</div>
          {INIT_PLANS.map(p=>{ const cnt=INIT_SUBS.filter(s=>s.plan===p.name).length; return (
            <div key={p.id} style={{ marginBottom:13 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:12, color:T.text }}>{p.icon} {p.name}</span>
                <div style={{ display:"flex", gap:8 }}>
                  <span style={{ fontSize:10, color:T.muted }}>{cnt} co.</span>
                  <span style={{ fontSize:10, fontWeight:700, color:p.col }}>{cnt>0?`₹${(cnt*p.price).toLocaleString()}`:"—"}</span>
                </div>
              </div>
              <div style={{ height:6, background:"rgba(255,255,255,0.05)", borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${(cnt/INIT_SUBS.length)*100}%`, background:p.col, borderRadius:3, transition:"width 0.6s ease" }} />
              </div>
            </div>
          );})}
        </div>
        {exp.length>0&&(
          <div style={{ background:T.surf, border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"13px 17px", borderBottom:`1px solid ${T.border}`, display:"flex", gap:8, alignItems:"center" }}>
              <span>⚠️</span><span style={{ fontWeight:700, fontSize:12, color:"#fff" }}>Expiring Soon</span>
            </div>
            {exp.map((s,i)=>(
              <div key={s.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderBottom:i<exp.length-1?`1px solid ${T.border}`:"none" }}>
                <div style={{ width:28, height:28, borderRadius:7, background:s.col, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:9, color:"#fff", flexShrink:0 }}>{s.logo}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:T.text }}>{s.company}</div>
                  <div style={{ fontSize:9, color:T.muted }}>Ends {s.end}</div>
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
    const price = billing==="YEARLY" ? p.yearPrice : p.price;
    const isEdit = editId===p.id;
    const subCount = isCustom ? 0 : INIT_SUBS.filter(s=>s.plan===(p as PlanRow).name).length;
    return (
      <div key={p.id}
        style={{ background:T.surf, border:`1px solid ${p.popular?"rgba(108,92,231,0.45)":T.border}`, borderRadius:16, overflow:"hidden", transition:"transform 0.15s,box-shadow 0.15s", boxShadow:p.popular?"0 0 40px rgba(108,92,231,0.12)":"none" }}
        onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=p.popular?"0 12px 50px rgba(108,92,231,0.2)":"0 8px 30px rgba(0,0,0,0.3)";}}
        onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=p.popular?"0 0 40px rgba(108,92,231,0.12)":"none";}}>
        {p.popular && <div style={{ background:`linear-gradient(135deg,${T.accent},${T.accent2})`, textAlign:"center", padding:"5px", fontSize:9, fontWeight:800, color:"#fff", letterSpacing:"0.08em" }}>★ MOST POPULAR</div>}
        <div style={{ padding:"20px 18px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:`${p.col}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{p.icon}</div>
            <span style={{ background:isCustom?"rgba(0,203,164,0.12)":`${p.col}18`, color:isCustom?T.success:p.col, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20 }}>
              {isCustom?"✦ New":`${subCount} cos`}
            </span>
          </div>
          <div style={{ fontSize:15, fontWeight:800, color:"#fff", marginBottom:4 }}>{p.name}</div>
          <div style={{ display:"flex", alignItems:"baseline", gap:3, marginBottom:4 }}>
            <span style={{ fontSize:30, fontWeight:800, color:"#fff", letterSpacing:"-1px" }}>₹{price.toLocaleString()}</span>
            <span style={{ fontSize:11, color:T.muted }}>/mo</span>
          </div>
          {billing==="YEARLY"&&!isCustom&&<div style={{ fontSize:10, color:T.success, fontWeight:600, marginBottom:10 }}>Save ₹{(((p as PlanRow).price-p.yearPrice)*12).toLocaleString()}/yr</div>}
          <div style={{ height:1, background:T.border, marginBottom:14 }} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:14 }}>
            {([["👥",p.users,"users"],["💬",p.wa,"WA"],["📨",p.msgs,"msgs"]] as [string,string,string][]).map(([ic,v,l])=>(
              <div key={l} style={{ background:T.surf2, borderRadius:7, padding:"6px 4px", textAlign:"center", border:`1px solid ${T.border}` }}>
                <div style={{ fontSize:11, fontWeight:800, color:"#fff" }}>{ic} {v}</div>
                <div style={{ fontSize:9, color:T.muted, marginTop:1 }}>{l}</div>
              </div>
            ))}
          </div>
          {p.extra.slice(0,3).map(f=>(
            <div key={f} style={{ display:"flex", gap:7, fontSize:11, color:"#9CA3AF", marginBottom:7, alignItems:"center" }}>
              <span style={{ color:p.col }}>✓</span>{f}
            </div>
          ))}
          {p.extra.length>3&&<div style={{ fontSize:10, color:T.muted, marginBottom:7 }}>+{p.extra.length-3} more</div>}
          <div style={{ display:"flex", gap:6, marginTop:14 }}>
            {isCustom
              ? <>
                  <button style={{ flex:1, background:T.surf2, color:T.muted, border:`1px solid ${T.border}`, padding:"7px 0", borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:600 }}>✏️ Edit</button>
                  <button onClick={()=>onRemoveCustom(p.id)} style={{ flex:1, background:"rgba(255,107,107,0.08)", color:T.danger, border:"1px solid rgba(255,107,107,0.25)", padding:"7px 0", borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:600 }}>Remove</button>
                </>
              : <>
                  <button onClick={()=>setEditId(isEdit?null:p.id)} style={{ flex:1, background:isEdit?`linear-gradient(135deg,${T.accent},${T.accent2})`:T.surf2, color:isEdit?"#fff":T.muted, border:`1px solid ${isEdit?"transparent":T.border}`, padding:"7px 0", borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:600 }}>{isEdit?"✓ Done":"✏️ Edit"}</button>
                  <button style={{ flex:1, background:"rgba(255,107,107,0.08)", color:T.danger, border:"1px solid rgba(255,107,107,0.25)", padding:"7px 0", borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:600 }}>Disable</button>
                </>
            }
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:22 }}>
        <span style={{ fontSize:12, color:T.muted }}>Billing Cycle:</span>
        <div style={{ display:"flex", background:T.surf, border:`1px solid ${T.border}`, borderRadius:9, padding:3, gap:3 }}>
          {(["MONTHLY","YEARLY"] as const).map(b=>(
            <button key={b} onClick={()=>setBilling(b)}
              style={{ background:billing===b?T.surf2:"transparent", border:`1px solid ${billing===b?"rgba(108,92,231,0.35)":"transparent"}`, color:billing===b?T.accent2:T.muted, padding:"5px 16px", borderRadius:7, cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:billing===b?700:400 }}>
              {b==="YEARLY"?<><span>Yearly </span><span style={{ color:T.success, fontSize:10 }}>−20%</span></>:"Monthly"}
            </button>
          ))}
        </div>
        <span style={{ fontSize:11, color:T.muted }}>{INIT_PLANS.length+customPlans.length} plans active</span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom: customPlans.length>0?14:0 }}>
        {INIT_PLANS.map(p=>renderCard(p,false))}
      </div>

      {customPlans.length>0&&(
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:14 }}>
          {customPlans.map(p=>renderCard(p,true))}
        </div>
      )}

      {/* ✅ Dashed CTA also opens modal */}
      <div onClick={onOpenModal}
        style={{ border:`2px dashed ${T.border}`, borderRadius:14, padding:"28px", textAlign:"center", cursor:"pointer", transition:"all 0.15s", marginTop:14 }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(108,92,231,0.5)";e.currentTarget.style.background="rgba(108,92,231,0.04)";}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;(e.currentTarget as HTMLDivElement).style.background="transparent";}}>
        <div style={{ width:44, height:44, borderRadius:12, background:"rgba(108,92,231,0.1)", border:"1px solid rgba(108,92,231,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, margin:"0 auto 12px" }}>➕</div>
        <div style={{ fontSize:13, fontWeight:700, color:"#fff", marginBottom:4 }}>Create New Plan</div>
        <div style={{ fontSize:11, color:T.muted }}>Add a custom pricing plan for specific company needs.</div>
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
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {([["Total Revenue",`₹${rev.toLocaleString()}`,T.success,"💰"],["Transactions",String(HISTORY.length),T.accent2,"📊"],["Failed",String(HISTORY.filter(h=>h.status==="FAILED").length),T.danger,"❌"],["Refunded",String(HISTORY.filter(h=>h.status==="REFUNDED").length),T.warn,"↩️"]] as [string,string,string,string][]).map(([l,v,c,ic])=>(
          <div key={l} style={{ background:T.surf, border:`1px solid ${T.border}`, borderRadius:12, padding:"14px 16px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <span style={{ fontSize:10, color:T.muted }}>{l}</span><span style={{ fontSize:16 }}>{ic}</span>
            </div>
            <div style={{ fontSize:22, fontWeight:800, color:c }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:7, marginBottom:16, alignItems:"center", flexWrap:"wrap" }}>
        <span style={{ fontSize:11, color:T.muted }}>Filter:</span>
        {["ALL","New","Renewal","Upgrade","Failed","Trial","Refund"].map(t=>(
          <button key={t} onClick={()=>setTf(t)} style={{ background:tf===t?T.surf2:"transparent", border:`1px solid ${tf===t?"rgba(108,92,231,0.35)":T.border}`, color:tf===t?T.accent2:T.muted, padding:"4px 12px", borderRadius:20, cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:tf===t?700:400 }}>{t}</button>
        ))}
      </div>
      <div style={{ background:T.surf, border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1.2fr 1fr 0.8fr 0.8fr 0.7fr", padding:"10px 18px", borderBottom:`1px solid ${T.border}`, background:T.surf2 }}>
          {["Company","Plan","Amount","Date","Type","Status"].map(h=>(
            <div key={h} style={{ fontSize:10, fontWeight:700, color:T.muted, letterSpacing:"0.06em" }}>{h.toUpperCase()}</div>
          ))}
        </div>
        {filtered.map((h,i)=>{ const [sc,sbg]=TXN_COLOR[h.status]; const tc=TYPE_COLOR[h.type]; return (
          <div key={h.id}
            style={{ display:"grid", gridTemplateColumns:"2fr 1.2fr 1fr 0.8fr 0.8fr 0.7fr", padding:"13px 18px", borderBottom:i<filtered.length-1?`1px solid ${T.border}`:"none", transition:"background 0.12s", alignItems:"center" }}
            onMouseEnter={e=>(e.currentTarget.style.background="rgba(108,92,231,0.04)")}
            onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <div style={{ width:30, height:30, borderRadius:8, background:h.col, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:10, color:"#fff", flexShrink:0 }}>{h.logo}</div>
              <div style={{ fontSize:12, fontWeight:600, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{h.company}</div>
            </div>
            <span style={{ background:`${PLAN_COLOR[h.plan]}18`, color:PLAN_COLOR[h.plan], fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, width:"fit-content" }}>{h.plan}</span>
            <div style={{ fontSize:12, fontWeight:700, color:h.amount>0?T.text:T.muted }}>{h.amount>0?`₹${h.amount.toLocaleString()}`:"Free"}</div>
            <div style={{ fontSize:11, color:T.muted }}>{h.date}</div>
            <span style={{ background:`${tc}18`, color:tc, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, width:"fit-content" }}>{h.type}</span>
            <span style={{ background:sbg, color:sc, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, display:"inline-flex", alignItems:"center", gap:4, width:"fit-content" }}>
              <span style={{ width:4, height:4, borderRadius:"50%", background:sc, flexShrink:0 }} />{h.status[0]+h.status.slice(1).toLowerCase()}
            </span>
          </div>
        );})}
        {filtered.length===0&&(
          <div style={{ padding:"40px 20px", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:10 }}>🔍</div>
            <div style={{ fontSize:13, fontWeight:700, color:"#fff", marginBottom:4 }}>No transactions found</div>
            <div style={{ fontSize:11, color:T.muted }}>Try a different filter.</div>
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
  const closeModal = () => setShowModal(false);
  const savePlan   = (p: CustomPlan) => setCustomPlans(prev=>[...prev, p]);
  const removePlan = (id: number) => setCustomPlans(prev=>prev.filter(p=>p.id!==id));

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", background:T.bg, minHeight:"100vh", padding:"28px 32px", color:T.text }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#222440;border-radius:4px}
        ::placeholder{color:#3A3D5C}
        button,input,select{font-family:inherit}
        select option{background:#171929}
        @keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:"#fff", letterSpacing:"-0.5px" }}>Subscription</h1>
          <p style={{ fontSize:12, color:T.muted, marginTop:3 }}>Plans, billing, and company subscription management.</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ background:T.surf2, color:T.muted, border:`1px solid ${T.border}`, padding:"9px 16px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600 }}
            onMouseEnter={e=>(e.currentTarget.style.opacity="0.8")} onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>
            ⬇ Export
          </button>
          {/* ✅ Header button */}
          <button onClick={openModal}
            style={{ background:`linear-gradient(135deg,${T.accent},${T.accent2})`, color:"#fff", border:"none", padding:"9px 18px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600 }}
            onMouseEnter={e=>(e.currentTarget.style.opacity="0.8")} onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>
            + Create Plan
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        <KPI label="Active Subscriptions" value="194"   delta="3.1% this month"  icon="💳" color={T.accent}  />
        <KPI label="Monthly Revenue"      value="₹8.4L" delta="12% vs last month" icon="📈" color={T.success} />
        <KPI label="On Trial"             value="31"    delta="8 expiring soon"   icon="⏳" color={T.warn}    />
        <KPI label="Churned (30d)"        value="7"     delta="2 more than last"  icon="📉" color={T.danger}  up={false} />
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:3, marginBottom:24, background:T.surf, border:`1px solid ${T.border}`, borderRadius:11, padding:4, width:"fit-content" }}>
        {([ ["overview","📊 Overview"],["plans","💳 Plans"],["history","🕐 History"] ] as [string,string][]).map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k as typeof tab)}
            style={{ padding:"8px 20px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:500, border:"none", fontFamily:"inherit", background:tab===k?T.surf2:"transparent", color:tab===k?T.accent2:T.muted, transition:"all 0.12s" }}>
            {l}
          </button>
        ))}
      </div>

      {tab==="overview" && <Overview />}
      {tab==="plans"    && <Plans onOpenModal={()=>setShowModal(true)} customPlans={customPlans} onRemoveCustom={removePlan} />}
      {tab==="history"  && <History />}

      {/* ✅ Modal — renders at page root so it overlays everything */}
      {showModal && <CreatePlanModal onClose={closeModal} onSave={savePlan} />}
    </div>
  );
}
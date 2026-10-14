"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Ban,
  BarChart3,
  Check,
  CreditCard,
  Download,
  FileText,
  History as History_,
  Hourglass,
  MessageCircle,
  PauseCircle,
  Pencil,
  Plus,
  RotateCcw,
  Send,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { PageContainer, PageHeader } from "@/components/layout";
import KpiCard from "@/components/admin/KpiCard";
import type { KpiTone } from "@/components/admin/KpiCard";
import Alert from "@/components/ui/Alert";
import KitBadge from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import SegmentedControl from "@/components/ui/SegmentedControl";
import KitSelect from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import Switch from "@/components/ui/Switch";
import Table from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import Tabs from "@/components/ui/Tabs";
import { cn } from "@/lib/utils";


// ─── CONFIG ───────────────────────────────────────────────────────────────────
const EXTERNAL_API =
 "/v1/admin/subscription/plan?active=true";
 const getExternalHeaders = () => {
  let token =
    typeof window !== "undefined"
      ? localStorage.getItem("console_access_token")
      : null;

  if (
    token &&
    token.startsWith('"') &&
    token.endsWith('"')
  ) {
    token = token.slice(1, -1);
  }

  return {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

const updateSubscriptionPlan = async (
  id: string,
  payload: any
) => {
  return axiosInstance.put(
    `/v1/admin/subscription/plan/${id}`,
    payload,
    {
      headers: getExternalHeaders(),
      withCredentials: false,
    }
  );
};

const createSubscriptionPlan = async (
  payload: any
) => {
  return axiosInstance.post(
    "/v1/admin/subscription/plan",
    payload,
    {
      headers: getExternalHeaders(),
      withCredentials: false,
    }
  );
};


// ─── TYPES ────────────────────────────────────────────────────────────────────
type SubStatus =
  | "ACTIVE"
  | "TRIAL"
  | "EXPIRED"
  | "SUSPENDED"
  | "CANCELLED";
type PlanName  = "Starter"|"Basic"|"Pro"|"Enterprise";
type TxnStatus = "SUCCESS"|"FAILED"|"REFUNDED";
type TxnType   = "New"|"Renewal"|"Upgrade"|"Failed"|"Trial"|"Refund";

interface SubRow {
  id: string;
  company: string;
  logo: string;
  col: string;
  plan: PlanName;
  status: SubStatus;
  start: string;
  end: string;
  amt: number;
  users: number;
  seats: number;

  // API original data
  rawData?: any;
}
interface PlanRow   { id:number; name:PlanName; price:number; yearPrice:number; icon:string; col:string; users:string; wa:string; msgs:string; popular?:boolean; extra:string[]; }
interface Transaction { id:number; company:string; logo:string; col:string; plan:PlanName; amount:number; date:string; type:TxnType; status:TxnStatus; }
interface CustomPlan  { id:number; name:string; price:number; yearPrice:number; icon:string; col:string; users:string; wa:string; msgs:string; popular:boolean; extra:string[]; }

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const INIT_SUBS: SubRow[] = [
  { id:"1", company:"Acme Corp", logo:"AC", col:"var(--color-brand)", plan:"Enterprise", status:"ACTIVE", start:"Jan 1, 2026", end:"Dec 31, 2026", amt:7999, users:320, seats:500 },
];

const INIT_PLANS: PlanRow[] = [
  { id:1, name:"Starter",    price:499,  yearPrice:399,  icon:"🌱", col:"var(--color-brand)", users:"5",  wa:"1", msgs:"1K",  extra:["Email Support","Basic Reports","1 Chatbot"] },
  { id:2, name:"Basic",      price:999,  yearPrice:799,  icon:"🚀", col:"var(--color-warning)", users:"15", wa:"2", msgs:"5K",  extra:["Priority Support","Advanced Reports","5 Chatbots","Campaigns"] },
  { id:3, name:"Pro",        price:2499, yearPrice:1999, icon:"⚡", col:"var(--color-brand)", users:"50", wa:"5", msgs:"25K", popular:true, extra:["24/7 Support","AI Assistant","Unlimited Chatbots","Flows","Custom Branding"] },
  { id:4, name:"Enterprise", price:7999, yearPrice:6399, icon:"🏆", col:"var(--color-brand)", users:"∞", wa:"∞", msgs:"∞",  extra:["Dedicated Manager","SLA 99.9%","Custom Integration","White Label","SSO"] },
];

const HISTORY: Transaction[] = [];

const TYPE_COLOR: Record<TxnType, string> = {
  New:"var(--color-brand)", Renewal:"var(--color-brand)", Upgrade:"var(--color-warning)",
  Failed:"var(--color-error)", Trial:"var(--color-brand)", Refund:"var(--color-error)",
};
const ICON_OPTIONS  = ["🌱","🚀","⚡","🏆","💎","🔥","🌟","🎯","🛡️","🧩"];
const COLOR_OPTIONS = ["var(--color-brand)","var(--color-brand)","var(--color-warning)","var(--color-brand)","var(--color-error)","var(--color-brand)","var(--color-error)","var(--color-brand)","var(--color-error)","var(--color-brand)"];

// ─── PLAN COLOR MAP ───────────────────────────────────────────────────────────
const PLAN_COLORS: Record<string, string> = {
  starter:    "var(--color-brand)",
  basic:      "var(--color-warning)",
  pro:        "var(--color-brand)",
  enterprise: "var(--color-brand)",
};

const escapeExcelCell = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const serialiseExportValue = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const downloadExcel = (rows: SubRow[]) => {
  if (rows.length === 0) {
    alert("No subscription data available to export.");
    return;
  }

  const columns = [
    "Plan ID",
    "Plan Name",
    "Mapped Plan Type",
    "Status",
    "Price",
    "Feature Count",
    "Total Limits",
    "Created Date",
    "Updated Date",
    "API Active",
    "Billing Cycle",
    "Popular",
    "Description",
    "Features",
    "Raw API Data",
  ];

  const tableRows = rows.map((row) => {
    const raw = row.rawData ?? {};

    return [
      row.id,
      raw.plan_name ?? row.company,
      row.plan,
      row.status,
      row.amt,
      row.users,
      row.seats,
      row.start,
      row.end,
      raw.active ?? "",
      raw.billing_cycle ?? "",
      raw.popular ?? "",
      raw.description ?? "",
      serialiseExportValue(raw.features),
      serialiseExportValue(raw),
    ];
  });

  const worksheet = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <table>
      <thead>
        <tr>${columns.map((column) => `<th>${escapeExcelCell(column)}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${tableRows
          .map(
            (row) =>
              `<tr>${row
                .map((cell) => `<td>${escapeExcelCell(cell)}</td>`)
                .join("")}</tr>`
          )
          .join("")}
      </tbody>
    </table>
  </body>
</html>`;

  const blob = new Blob([worksheet], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `subscription-plans-${stamp}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const SUB_STATUS_VARIANT: Record<SubStatus, BadgeVariant> = {
  ACTIVE: "success",
  TRIAL: "info",
  EXPIRED: "neutral",
  SUSPENDED: "error",
  CANCELLED: "error",
};

const PLAN_VARIANT: Record<PlanName, BadgeVariant> = {
  Starter: "info",
  Basic: "warning",
  Pro: "primary",
  Enterprise: "primary",
};

const TXN_VARIANT: Record<TxnType, BadgeVariant> = {
  New: "primary", Renewal: "primary", Upgrade: "warning",
  Failed: "error", Trial: "info", Refund: "error",
};

function Badge({ status }: { status: SubStatus }) {
  const labels: Record<SubStatus, string> = {
    ACTIVE: "Active",
    TRIAL: "Trial",
    EXPIRED: "Expired",
    SUSPENDED: "Suspended",
    CANCELLED: "Cancelled",
  };

  return (
    <KitBadge variant={SUB_STATUS_VARIANT[status]} dot>
      {labels[status]}
    </KitBadge>
  );
}

function PlanChip({ plan }: { plan: PlanName }) {
  return <KitBadge variant={PLAN_VARIANT[plan]}>{plan}</KitBadge>;
}

/** Monogram tile tinted with the plan's own (data-driven) accent color. */
function PlanMark({ col, children, size = "md" }: { col: string; children: ReactNode; size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg font-semibold",
        size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-base",
      )}
      style={{ background: `color-mix(in oklab, ${col} 14%, transparent)`, color: col }}
    >
      {children}
    </span>
  );
}

function Inp({ label,value,onChange,placeholder,type="text",error,prefix }:{
  label:string; value:string; onChange:(v:string)=>void;
  placeholder?:string; type?:string; error?:string; prefix?:string;
}) {
  return (
    <Input
      label={label}
      type={type}
      value={value}
      onChange={e=>onChange(e.target.value)}
      placeholder={placeholder}
      error={error}
      leftIcon={prefix ? <span className="text-xs">{prefix}</span> : undefined}
    />
  );
}

function Tog({ on, setOn, label }:{ on:boolean; setOn:(v:boolean)=>void; label?: string }) {
  return <Switch checked={on} onCheckedChange={setOn} aria-label={label ?? (on ? "Enabled" : "Disabled")} />;
}

function ToggleRow({ title, desc, on, setOn }: { title: string; desc: string; on: boolean; setOn: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border-subtle bg-surface-muted px-4 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
      <Tog on={on} setOn={setOn} label={title} />
    </div>
  );
}

function LimitsGrid({ items }: { items: [ReactNode, string, string][] }) {
  return (
    <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border-subtle bg-border-subtle">
      {items.map(([ic, v, l]) => (
        <div key={l} className="bg-surface px-2 py-2 text-center">
          <div className="flex items-center justify-center gap-1 text-sm font-semibold text-foreground">{ic} {v}</div>
          <div className="text-[0.6875rem] text-muted-foreground">{l}</div>
        </div>
      ))}
    </div>
  );
}

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">{children}</p>
);

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
  const [col,     setCol]     = useState("var(--color-brand)");
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
    <Modal isOpen onClose={onClose} size="sm" showCloseButton={false}>
      <div className="flex flex-col items-center py-4 text-center">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success-bg text-success">
          <Check size={24} />
        </span>
        <p className="text-lg font-semibold text-foreground">Plan Created!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="font-semibold" style={{ color: col }}>{icon} {name}</span> is now live in your plan list.
        </p>
      </div>
    </Modal>
  );

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="lg"
      title="Create New Plan"
      description={`Step ${step} of 3 — ${STEPS[step-1]}`}
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <Button variant="secondary" onClick={step>1?back:onClose} leftIcon={step>1 ? <ArrowLeft size={15} /> : undefined}>
            {step===1?"Cancel":"Back"}
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-xs tabular-nums text-muted-foreground">{step} / 3</span>
            {step<3
              ? <Button onClick={next} rightIcon={<ArrowRight size={15} />}>Next</Button>
              : <Button onClick={handleSave} leftIcon={<Check size={15} />}>Create Plan</Button>
            }
          </div>
        </div>
      }
    >
      {/* Progress */}
      <ol className="mb-5 grid grid-cols-3 gap-2" aria-label="Progress">
        {STEPS.map((s,i)=>(
          <li key={s} aria-current={i+1===step ? "step" : undefined}>
            <div className={cn("h-1 rounded-full", i<step ? "bg-primary" : "bg-surface-muted")} />
            <p className={cn("mt-1.5 text-xs", i+1===step ? "font-semibold text-primary-text" : i<step ? "text-secondary-foreground" : "text-muted-foreground")}>{s}</p>
          </li>
        ))}
      </ol>

      {step===1 && (
        <div className="space-y-4">
          <Inp label="Plan Name" value={name} onChange={setName} placeholder="e.g. Growth, Teams, Scale…" error={errors.name} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Inp label="Monthly Price (₹)" value={price} onChange={setPrice} placeholder="2499" type="number" prefix="₹" error={errors.price} />
            <Inp label="Yearly Discount (%)" value={yearPct} onChange={setYearPct} placeholder="20" type="number" />
          </div>
          {mp>0 && (
            <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-muted px-4 py-2.5 text-[0.8125rem]">
              <span className="text-muted-foreground">Annual billing price / mo</span>
              <span className="font-semibold tabular-nums text-foreground">₹{ap.toLocaleString()} <span className="font-normal text-success">({yearPct}% off)</span></span>
            </div>
          )}
          <div>
            <SectionLabel>Plan Icon</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(ic=>(
                <button
                  key={ic}
                  type="button"
                  onClick={()=>setIcon(ic)}
                  aria-pressed={icon===ic}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg border text-lg transition-colors",
                    icon===ic ? "border-primary bg-primary-lighter" : "border-border bg-surface hover:bg-surface-hover",
                  )}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Accent Color</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c, i)=>(
                <button
                  key={`${c}-${i}`}
                  type="button"
                  onClick={()=>setCol(c)}
                  aria-label={`Accent color ${i + 1}`}
                  aria-pressed={col===c}
                  className={cn("h-7 w-7 rounded-full ring-offset-2 ring-offset-surface transition-shadow", col===c && "ring-2 ring-primary")}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <ToggleRow title="Mark as Popular ★" desc={`Shows "Most Popular" banner on plan card.`} on={popular} setOn={setPopular} />
          {name && (
            <div className="rounded-lg border p-4" style={{ borderColor: `color-mix(in oklab, ${col} 30%, transparent)` }}>
              <SectionLabel>Live Preview</SectionLabel>
              <div className="flex items-center gap-3">
                <PlanMark col={col}>{icon}</PlanMark>
                <div>
                  <p className="flex items-center gap-2 font-semibold text-foreground">
                    {name}
                    {popular && <KitBadge variant="warning" size="sm">POPULAR</KitBadge>}
                  </p>
                  <p className="text-sm"><span className="font-semibold tabular-nums text-foreground">₹{mp.toLocaleString()}</span><span className="text-muted-foreground">/mo</span></p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {step===2 && (
        <div className="space-y-4">
          <p className="text-[0.8125rem] text-muted-foreground">
            Set usage limits for <span className="font-semibold text-primary-text">{name||"this plan"}</span>.
            Use <code className="rounded bg-surface-muted px-1 font-mono text-foreground">∞</code> for unlimited.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Inp label="Max Users"    value={users} onChange={setUsers} placeholder="50 or ∞"  error={errors.users} />
            <Inp label="WA Accounts"  value={wa}    onChange={setWa}    placeholder="5 or ∞"   error={errors.wa}   />
            <Inp label="Msgs / Month" value={msgs}  onChange={setMsgs}  placeholder="25K or ∞" error={errors.msgs} />
          </div>
          {(users||wa||msgs) && (
            <div>
              <SectionLabel>Limits Preview</SectionLabel>
              <LimitsGrid items={[[<Users key="u" size={13} />,users||"—","users"],[<MessageCircle key="w" size={13} />,wa||"—","WA accts"],[<Send key="m" size={13} />,msgs||"—","msgs/mo"]]} />
            </div>
          )}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {([
              ["AI Assistant","AI-powered chat assistance",aiOn,setAiOn],
              ["Custom Branding","Logo & color customization",brandOn,setBrandOn],
              ["API Access","REST API for integrations",apiOn,setApiOn],
              ["Priority Support","Faster response SLA",suppOn,setSuppOn],
            ] as [string,string,boolean,(v:boolean)=>void][]).map(([lbl,desc,val,setter])=>(
              <ToggleRow key={lbl} title={lbl} desc={desc} on={val} setOn={setter} />
            ))}
          </div>
        </div>
      )}

      {step===3 && (
        <div className="space-y-4">
          <p className="text-[0.8125rem] text-muted-foreground">
            Feature bullets shown on <span className="font-semibold text-primary-text">{name||"the plan"}</span> card.
          </p>
          <div className="space-y-2">
            {feats.map((f,i)=>(
              <div key={i} className="flex items-center gap-2">
                <Check size={15} className="shrink-0" style={{ color: col }} />
                <Input
                  wrapperClassName="flex-1"
                  aria-label={`Feature ${i+1}`}
                  value={f}
                  onChange={e=>{const c=[...feats];c[i]=e.target.value;setFeats(c);}}
                  placeholder={`Feature ${i+1}…`}
                />
                {feats.length>1 && (
                  <IconButton size="sm" aria-label={`Remove feature ${i+1}`} icon={<X size={14} />} onClick={()=>setFeats(f=>f.filter((_,idx)=>idx!==i))} />
                )}
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={()=>setFeats(f=>[...f,""])}>Add Feature</Button>
          <div className="overflow-hidden rounded-lg border" style={{ borderColor: `color-mix(in oklab, ${col} 30%, transparent)` }}>
            {popular && <div className="bg-primary py-1 text-center text-[0.6875rem] font-semibold tracking-wide text-primary-foreground">★ MOST POPULAR</div>}
            <div className="p-4">
              <SectionLabel>Final Preview</SectionLabel>
              <div className="mb-3 flex items-center gap-3">
                <PlanMark col={col}>{icon}</PlanMark>
                <div>
                  <p className="font-semibold text-foreground">{name||"Plan Name"}</p>
                  <p className="text-sm"><span className="font-semibold tabular-nums text-foreground">₹{mp.toLocaleString()}</span><span className="text-muted-foreground">/mo</span></p>
                </div>
              </div>
              <div className="mb-3">
                <LimitsGrid items={[[<Users key="u" size={13} />,users||"—","users"],[<MessageCircle key="w" size={13} />,wa||"—","WA"],[<Send key="m" size={13} />,msgs||"—","msgs"]]} />
              </div>
              <ul className="space-y-1.5">
                {feats.filter(f=>f.trim()).map(f=>(
                  <li key={f} className="flex items-center gap-2 text-[0.8125rem] text-secondary-foreground">
                    <Check size={14} style={{ color: col }} />{f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function Overview({
  subs,
  loading,
  activeCount,
  onUpdatePlan,
}: {
  subs: SubRow[];
  loading: boolean;
  activeCount: number;
  onUpdatePlan: (plan: SubRow) => void;
}) {
  const [sel, setSel] = useState<SubRow|null>(null);
 const active = subs.filter(
  s => s.status === "ACTIVE"
);

const monthlyPlans = active.filter(
  s =>
    s.rawData?.billing_cycle === "Monthly"
);

const mrr = monthlyPlans.reduce(
  (sum, s) => sum + s.amt,
  0
);
  const exp    = subs.filter(s=>s.status!=="ACTIVE");

  const distribution = Object.values(
    subs.reduce((acc: Record<string, { name: string; count: number; revenue: number; color: string }>, sub) => {
      const key = sub.company;
      if (!acc[key]) acc[key] = { name: sub.company, count: 0, revenue: 0, color: sub.col };
      acc[key].count += 1;
      acc[key].revenue += sub.amt;
      return acc;
    }, {}),
  );

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-4">
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
            <h3 className="text-[0.9375rem] font-semibold text-foreground">All Subscriptions</h3>
            <KitBadge variant="success">{active.length} active</KitBadge>
          </div>
          {loading && (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
            </div>
          )}
          {!loading && subs.length === 0 && (
            <EmptyState compact icon={<CreditCard size={20} />} title="No subscriptions found." />
          )}
          {!loading && subs.length > 0 && (
            <ul className="divide-y divide-border-subtle">
              {subs.map(s=>{
                const selected = sel?.id===s.id;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={()=>setSel(selected?null:s)}
                      aria-pressed={selected}
                      className={cn(
                        "flex w-full items-center gap-3 px-5 py-3 text-left transition-colors",
                        selected ? "bg-primary-lighter" : "hover:bg-surface-hover",
                      )}
                    >
                      <PlanMark col={s.col} size="sm">{s.logo}</PlanMark>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{s.company}</p>
                        <p className="truncate text-xs text-muted-foreground">Renews on {s.end} · {s.users}/{s.seats} seats</p>
                      </div>
                      <span className="hidden sm:inline-flex"><PlanChip plan={s.plan} /></span>
                      <Badge status={s.status} />
                      <span className="w-20 text-right text-sm font-semibold tabular-nums text-foreground">{s.amt>0?`₹${s.amt.toLocaleString()}`:"Free"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {sel && (
          <Card>
            <CardHeader
              title={
                <span className="flex items-center gap-3">
                  <PlanMark col={sel.col}>{sel.logo}</PlanMark>
                  <span>
                    <span className="block">{sel.company}</span>
                    <span className="block text-xs font-normal text-muted-foreground">{sel.start} → {sel.end}</span>
                  </span>
                </span>
              }
              action={<IconButton size="sm" aria-label="Close details" icon={<X size={15} />} onClick={()=>setSel(null)} />}
            />
            <dl className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border-subtle bg-border-subtle sm:grid-cols-4">
              <div className="bg-surface px-4 py-3"><dt className="text-xs text-muted-foreground">Plan</dt><dd className="mt-1"><PlanChip plan={sel.plan} /></dd></div>
              <div className="bg-surface px-4 py-3"><dt className="text-xs text-muted-foreground">Amount</dt><dd className="mt-0.5 text-sm font-semibold tabular-nums text-success">{sel.amt>0?`₹${sel.amt.toLocaleString()}`:"Free"}</dd></div>
              <div className="bg-surface px-4 py-3"><dt className="text-xs text-muted-foreground">Seats</dt><dd className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{sel.users}/{sel.seats}</dd></div>
              <div className="bg-surface px-4 py-3"><dt className="text-xs text-muted-foreground">Status</dt><dd className="mt-1"><Badge status={sel.status} /></dd></div>
            </dl>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" leftIcon={<Pencil size={14} />} onClick={() => onUpdatePlan(sel)}>Update Plan</Button>
              <Button size="sm" variant="secondary" leftIcon={<PauseCircle size={14} />}>Pause</Button>
              <Button size="sm" variant="danger" leftIcon={<Ban size={14} />}>Cancel</Button>
            </div>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <Card>
          <SectionLabel>Monthly Recurring Revenue</SectionLabel>
          <p className="text-2xl font-semibold tabular-nums text-foreground">₹{mrr.toLocaleString()}</p>
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-success"><TrendingUp size={13} /> +12% vs last month</p>
          <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border-subtle bg-border-subtle">
            <div className="bg-surface px-3 py-2.5">
              <dt className="text-xs text-muted-foreground">ARR</dt>
              <dd className="mt-0.5 text-sm font-semibold tabular-nums text-primary-text">₹{(mrr*12).toLocaleString()}</dd>
            </div>
            <div className="bg-surface px-3 py-2.5">
              <dt className="text-xs text-muted-foreground">ARPU</dt>
              <dd className="mt-0.5 text-sm font-semibold tabular-nums text-warning">
                ₹{monthlyPlans.length > 0 ? Math.round(mrr / monthlyPlans.length).toLocaleString() : 0}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader title="Plan Distribution" />
          {subs.length === 0 ? (
            <p className="py-4 text-center text-[0.8125rem] text-muted-foreground">No Plans Found</p>
          ) : (
            <div className="space-y-3">
              {distribution.map(item => (
                <div key={item.name}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-[0.8125rem]">
                    <span className="max-w-[9rem] truncate font-medium text-foreground">{item.name}</span>
                    <span className="flex gap-2">
                      <span className="text-muted-foreground">{item.count} co.</span>
                      <span className="font-semibold tabular-nums" style={{ color: item.color }}>₹{item.revenue.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(item.count * 20, 100)}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {exp.length>0 && (
          <Card className="border-warning-border">
            <CardHeader icon={AlertTriangle} title="Expiring Soon" />
            <ul className="space-y-3">
              {exp.map(s=>(
                <li key={s.id} className="flex items-center gap-3">
                  <PlanMark col={s.col} size="sm">{s.logo}</PlanMark>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{s.company}</p>
                    <p className="text-xs text-muted-foreground">Ends {s.end}</p>
                  </div>
                  <Badge status={s.status} />
                </li>
              ))}
            </ul>
          </Card>
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
  subs,
  onEditPlan,
  onDisablePlan,
}:{
  onOpenModal:()=>void;
  customPlans:CustomPlan[];
  onRemoveCustom:(id:number)=>void;
  subs:SubRow[];
  onEditPlan:(plan:any)=>void;
  onDisablePlan:(plan:any)=>void;
}) {
  const [billing, setBilling] = useState<"MONTHLY"|"YEARLY">("MONTHLY");
  const apiPlans = subs.map((s) => ({
  id: s.id,
  name: s.company,
  price: s.amt,
  yearPrice: Math.round(s.amt * 0.8),
  icon: s.logo,
  col: s.col,
  users: String(s.users),
  wa: "-",
  msgs: String(s.seats),
  popular: false,
  extra: [] as string[],
}));

  const renderCard = (p: PlanRow|CustomPlan|(typeof apiPlans)[number], isCustom=false) => {
    const price    = billing==="YEARLY" ? p.yearPrice : p.price;
    const subCount = 1;
    return (
      <Card
        key={p.id}
        padding="none"
        className={cn("flex flex-col overflow-hidden", p.popular && "border-primary ring-1 ring-primary")}
      >
        {p.popular && <div className="bg-primary py-1 text-center text-[0.6875rem] font-semibold tracking-wide text-primary-foreground">★ MOST POPULAR</div>}
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-start justify-between gap-2">
            <PlanMark col={p.col}>{p.icon}</PlanMark>
            {isCustom ? <KitBadge variant="success">✦ New</KitBadge> : <KitBadge>{subCount} cos</KitBadge>}
          </div>
          <p className="font-semibold text-foreground">{p.name}</p>
          <p className="mt-1">
            <span className="text-2xl font-semibold tabular-nums text-foreground">₹{price.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">/mo</span>
          </p>
          {billing==="YEARLY"&&!isCustom&&(
            <p className="mt-0.5 text-xs font-medium text-success">Save ₹{((p.price-p.yearPrice)*12).toLocaleString()}/yr</p>
          )}
          <div className="my-4 border-t border-border-subtle" />
          <LimitsGrid items={[[<Users key="u" size={13} />,p.users,"users"],[<MessageCircle key="w" size={13} />,p.wa,"WA"],[<Send key="m" size={13} />,p.msgs,"msgs"]]} />
          <ul className="mt-3 space-y-1.5">
            {p.extra.slice(0,3).map(f=>(
              <li key={f} className="flex items-center gap-2 text-[0.8125rem] text-secondary-foreground">
                <Check size={14} className="shrink-0" style={{ color: p.col }} />{f}
              </li>
            ))}
          </ul>
          {p.extra.length>3&&<p className="mt-1.5 text-xs text-muted-foreground">+{p.extra.length-3} more</p>}
          <div className="mt-auto flex gap-2 pt-4">
            {isCustom ? (
              <>
                <Button variant="secondary" size="sm" className="flex-1" leftIcon={<Pencil size={14} />}>Edit</Button>
                <Button variant="danger" size="sm" className="flex-1" onClick={()=>onRemoveCustom(p.id as number)}>Remove</Button>
              </>
            ) : (
              <>
                <Button variant="secondary" size="sm" className="flex-1" leftIcon={<Pencil size={14} />} onClick={()=>onEditPlan(p)}>Edit</Button>
                <Button variant="danger" size="sm" className="flex-1" onClick={()=>onDisablePlan(p)}>Disable</Button>
              </>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Billing Cycle:</span>
        <SegmentedControl<"MONTHLY"|"YEARLY">
          aria-label="Billing cycle"
          value={billing}
          onChange={setBilling}
          options={[
            { value: "MONTHLY", label: "Monthly" },
            { value: "YEARLY", label: <span className="flex items-center gap-1.5">Yearly <KitBadge variant="success" size="sm">−20%</KitBadge></span> },
          ]}
        />
        <span className="text-sm text-muted-foreground sm:ml-auto">{apiPlans.length} plans active</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {apiPlans.map(p => renderCard(p, false))}
      </div>
      {customPlans.length>0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{customPlans.map(p=>renderCard(p,true))}</div>
      )}
      <button
        type="button"
        onClick={onOpenModal}
        className="flex w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border-strong bg-surface-muted px-6 py-8 text-center transition-colors hover:border-primary-soft hover:bg-primary-lighter"
      >
        <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary-lighter text-primary-text"><Plus size={18} /></span>
        <span className="text-sm font-semibold text-foreground">Create New Plan</span>
        <span className="text-[0.8125rem] text-muted-foreground">Add a custom pricing plan for specific company needs.</span>
      </button>
    </div>
  );
}

// ─── HISTORY TAB ──────────────────────────────────────────────────────────────
function History({
  subs
}:{
  subs: SubRow[];
}) {
  const [tf, setTf] = useState("ALL");
const historyRows: Transaction[] = subs.map((s, index) => ({
  id: index + 1,
  company: s.company,
  logo: s.logo,
  col: s.col,
  plan: s.plan,
  amount: s.amt,
  date: s.start,
  type: "Renewal" as TxnType,
  status: "SUCCESS" as TxnStatus,
}));
const filtered =
  tf==="ALL"
    ? historyRows
    : historyRows.filter(
        h=>h.type===tf
      );

const rev =
  historyRows.reduce(
    (a,h)=>a+h.amount,
    0
  );

  const columns: Column<Transaction>[] = [
    {
      key: "company",
      header: "Company",
      render: h => (
        <div className="flex items-center gap-3">
          <PlanMark col={h.col} size="sm">{h.logo}</PlanMark>
          <span className="font-medium text-foreground">{h.company}</span>
        </div>
      ),
    },
    { key: "plan", header: "Plan", render: h => <PlanChip plan={h.plan} /> },
    { key: "amount", header: "Amount", align: "right", render: h => <span className="font-semibold tabular-nums text-foreground">{h.amount>0?`₹${h.amount.toLocaleString()}`:"Free"}</span> },
    { key: "date", header: "Date", render: h => <span className="text-muted-foreground">{h.date}</span> },
    { key: "type", header: "Type", render: h => <KitBadge variant={TXN_VARIANT[h.type]}>{h.type}</KitBadge> },
    {
      key: "status",
      header: "Status",
      render: h => (
        <KitBadge variant={h.status === "SUCCESS" ? "success" : h.status === "FAILED" ? "error" : "warning"} dot>
          {h.status[0]+h.status.slice(1).toLowerCase()}
        </KitBadge>
      ),
    },
  ];

  const histKpis: { label: string; value: string; icon: ReactNode; tone: KpiTone }[] = [
    { label: "Total Revenue", value: `₹${rev.toLocaleString()}`, icon: <Wallet size={18} />, tone: "success" },
    { label: "Transactions", value: String(historyRows.length), icon: <FileText size={18} />, tone: "primary" },
    { label: "Failed", value: "0", icon: <XCircle size={18} />, tone: "error" },
    { label: "Refunded", value: "0", icon: <RotateCcw size={18} />, tone: "warning" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {histKpis.map(k => <KpiCard key={k.label} label={k.label} value={k.value} icon={k.icon} tone={k.tone} />)}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Filter:</span>
        <SegmentedControl<string>
          aria-label="Filter by transaction type"
          value={tf}
          onChange={setTf}
          options={["ALL","New","Renewal","Upgrade","Failed","Trial","Refund"].map(t => ({ value: t, label: t === "ALL" ? "All" : t }))}
        />
      </div>
      <Table
        columns={columns}
        data={filtered}
        rowKey={h => h.id}
        emptyMessage="No transactions found"
        emptyDescription="Try a different filter."
      />
    </div>
  );
}

// ─── EDIT PLAN MODAL ──────────────────────────────────────────────────────────
function EditPlanModal({ plan, onClose, onSave }: { plan: any; onClose: () => void; onSave: (id: string, payload: any) => void }) {
  const raw = plan.rawData || {};
  const [name,     setName]     = useState<string>(raw.plan_name || plan.name || "");
  const [price,    setPrice]    = useState<string>(String(plan.price || ""));
  const [billing,  setBilling]  = useState<string>(raw.billing_cycle || "Monthly");
  const [active,   setActive]   = useState<boolean>(raw.active ?? true);
  const [desc,     setDesc]     = useState<string>(raw.description || "");
  const [saving,   setSaving]   = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !price) { alert("Plan name and price are required."); return; }
    setSaving(true);
    try {
      await onSave(String(plan.id), {
        plan_name: name.trim(),
        price: Number(price),
        billing_cycle: billing,
        active,
        description: desc,
        features: raw.features || {},
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Edit Plan"
      description="Update plan details"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} isLoading={saving} leftIcon={<Check size={15} />}>Save Changes</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Inp label="Plan Name" value={name} onChange={setName} placeholder="Plan name" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Inp label="Price (₹)" value={price} onChange={setPrice} placeholder="2499" type="number" prefix="₹" />
          <KitSelect
            label="Billing Cycle"
            value={billing}
            onChange={e => setBilling(e.target.value)}
            options={[{ value: "Monthly", label: "Monthly" }, { value: "Yearly", label: "Yearly" }]}
          />
        </div>
        <Inp label="Description" value={desc} onChange={setDesc} placeholder="Optional description" />
        <ToggleRow title="Active" desc="Make this plan available to users." on={active} setOn={setActive} />
      </div>
    </Modal>
  );
}

// ─── PAGE ROOT ────────────────────────────────────────────────────────────────
export default function Subscription() {
  const [tab,         setTab]         = useState<"overview"|"plans"|"history">("overview");
  const [showModal,   setShowModal]   = useState(false);
  const [customPlans, setCustomPlans] = useState<CustomPlan[]>([]);
  const [editPlan,    setEditPlan]    = useState<any|null>(null);

  const [subs,        setSubs]        = useState<SubRow[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  const openModal = () => { setTab("plans"); setShowModal(true); };

  const handleUpdatePlan = async (plan: SubRow) => {
    try {
      const payload = {
        plan_name: plan.company,
        price: plan.amt,
        active: true,
        billing_cycle: "Monthly",
        features: plan.rawData?.features || {},
        description: plan.rawData?.description || "",
      };
      console.log("UPDATE PAYLOAD:", payload);
      await updateSubscriptionPlan(plan.id, payload);
      alert("Plan updated successfully");
      window.location.reload();
    } catch (error) {
      console.error("UPDATE ERROR:", error);
      alert("Failed to update plan");
    }
  };

  const handleEditPlan = (plan: any) => {
    setEditPlan(plan);
  };

  const handleDisablePlan = async (plan: any) => {
    if (!confirm(`Disable plan "${plan.name}"? It will no longer be visible to users.`)) return;
    try {
      await updateSubscriptionPlan(String(plan.id), {
        plan_name: plan.rawData?.plan_name || plan.name,
        price: plan.price,
        active: false,
        billing_cycle: plan.rawData?.billing_cycle || "Monthly",
        features: plan.rawData?.features || {},
        description: plan.rawData?.description || "",
      });
      alert("Plan disabled successfully");
      window.location.reload();
    } catch (error) {
      console.error("DISABLE ERROR:", error);
      alert("Failed to disable plan");
    }
  };
  const savePlan = async (p: CustomPlan) => {
  try {
    const payload = {
      plan_name: p.name,

      price: p.price,

      yearly_price: p.yearPrice,

      active: true,

      popular: p.popular,

      features: {
        users: {
          limit_value:
            p.users === "∞"
              ? 999999
              : Number(p.users),
        },

        whatsapp_accounts: {
          limit_value:
            p.wa === "∞"
              ? 999999
              : Number(p.wa),
        },

        messages_per_month: {
          limit_value:
            p.msgs === "∞"
              ? 999999
              : Number(
                  p.msgs.replace("K", "000")
                ),
        },
      },

      extras: p.extra,

      icon: p.icon,

      color: p.col,
    };

    console.log(
      "CREATE PLAN PAYLOAD:",
      payload
    );

    const response =
      await createSubscriptionPlan(payload);

    console.log(
      "CREATE PLAN RESPONSE:",
      response.data
    );

    alert("Plan created successfully");

    // Add locally
    setCustomPlans((prev) => [...prev, p]);

    // Refresh data
    window.location.reload();
  } catch (error) {
    console.error(
      "CREATE PLAN ERROR:",
      error
    );

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

      console.log("FULL API RESPONSE:", apiResponse);

      if (!alive) return;

      // Correct array path
      const raw =
        apiResponse?.data?.data && Array.isArray(apiResponse.data.data)
          ? apiResponse.data.data
          : [];

      console.log("RAW DATA:", raw);

      const mapped: SubRow[] = raw.map((plan: any, index: number) => {
  const name = plan.plan_name || "Plan";

  let planType: PlanName = "Starter";

const lowerName = name.toLowerCase();

if (lowerName.includes("basic")) {
  planType = "Basic";
}
else if (lowerName.includes("pro")) {
  planType = "Pro";
}
else if (lowerName.includes("enterprise")) {
  planType = "Enterprise";
}
else {
  planType = "Starter";
}

  const features = plan.features || {};

  // Total features
  const featureKeys = Object.keys(features);

  // Calculate total limits
  let totalLimits = 0;

  featureKeys.forEach((key) => {
    const value = features[key]?.limit_value;

    if (typeof value === "number") {
      totalLimits += value;
    }
  });

  // Proper plan color
  const planColor =
    planType === "Basic"
      ? "var(--color-warning)"
      : planType === "Pro"
      ? "var(--color-brand)"
      : planType === "Enterprise"
      ? "var(--color-brand)"
      : "var(--color-brand)";

  return {
  id: String(plan.id),

    // Show plan name in UI
    company: name,

    // First letter logo
    logo: name.charAt(0).toUpperCase(),

    col: planColor,

    plan: planType,

    status: plan.active ? "ACTIVE" : "EXPIRED",

    // Created date
    start: new Date(plan.created_at).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ),

    // Updated date
    end: new Date(plan.updated_at).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ),

    // Price
    amt: Number(plan.price || 0),

    // Total feature count
    users: featureKeys.length,

    seats: totalLimits,

rawData: plan,
  };
});
      console.log("MAPPED DATA:", mapped);

      if (!alive) return;

      setSubs(mapped);

      setActiveCount(
        mapped.filter((s) => s.status === "ACTIVE").length
      );
    } catch (err) {
      console.error("API ERROR:", err);

      if (!alive) return;

      setError("Failed to load subscription plans");
    } finally {
      if (alive) {
        setLoading(false);
      }
    }
  };

  fetchData();

  return () => {
    alive = false;
  };
}, []);
  const monthlyRevenue = subs
    .filter(s => s.status === "ACTIVE" && s.rawData?.billing_cycle === "Monthly")
    .reduce((a, s) => a + s.amt, 0);

  const TAB_ITEMS = [
    { id: "overview", label: "Overview", icon: <BarChart3 size={15} /> },
    { id: "plans", label: "Plans", icon: <CreditCard size={15} /> },
    { id: "history", label: "History", icon: <History_ size={15} /> },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Subscription"
        description="Plans, billing, and company subscription management."
        actions={
          <>
            <Button
              variant="secondary"
              leftIcon={<Download size={15} />}
              onClick={() => downloadExcel(subs)}
              disabled={loading || subs.length === 0}
            >
              Export
            </Button>
            <Button leftIcon={<Plus size={15} />} onClick={openModal}>Create Plan</Button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active Subscriptions"
          value={loading ? "…" : String(activeCount)}
          hint="Live data"
          icon={<CreditCard size={18} />}
        />
        <KpiCard
          label="Monthly Revenue"
          value={loading ? "…" : `₹${monthlyRevenue.toLocaleString()}`}
          hint="vs last month"
          icon={<TrendingUp size={18} />}
          tone="success"
        />
        <KpiCard
          label="On Trial"
          value={loading ? "…" : String(subs.filter(s=>s.status==="TRIAL").length)}
          hint="expiring soon"
          icon={<Hourglass size={18} />}
          tone="warning"
        />
        <KpiCard
          label="Churned (30d)"
          value={loading ? "…" : String(subs.filter(s=>s.status==="CANCELLED"||s.status==="EXPIRED").length)}
          hint="vs last month"
          icon={<TrendingDown size={18} />}
          tone="error"
        />
      </div>

      {error && <Alert variant="error" className="mb-4" message={error} />}

      <Tabs
        className="mb-4"
        activeTab={tab}
        onChange={id => setTab(id as typeof tab)}
        tabs={TAB_ITEMS}
      />

      {tab==="overview" && <Overview
  subs={subs}
  loading={loading}
  activeCount={activeCount}
  onUpdatePlan={handleUpdatePlan}
/>}
     {tab==="plans" &&
  <Plans
    onOpenModal={()=>setShowModal(true)}
    customPlans={customPlans}
    onRemoveCustom={removePlan}
    subs={subs}
    onEditPlan={handleEditPlan}
    onDisablePlan={handleDisablePlan}
  />
}
    {tab==="history" &&
  <History
    subs={subs}
  />
}

      {showModal && <CreatePlanModal onClose={()=>setShowModal(false)} onSave={savePlan} />}
      {editPlan && <EditPlanModal plan={editPlan} onClose={()=>setEditPlan(null)} onSave={async (id, payload) => {
        try {
          await updateSubscriptionPlan(id, payload);
          alert("Plan updated successfully");
          setEditPlan(null);
          window.location.reload();
        } catch (err) {
          console.error("EDIT ERROR:", err);
          alert("Failed to update plan");
        }
      }} />}
    </PageContainer>
  );
}

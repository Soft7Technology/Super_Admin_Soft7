"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";          // ← ADD
import { ArrowLeft, Building2, Image as ImageIcon, Save, UploadCloud, UserCog, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageContainer, PageHeader } from "@/components/layout";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { uploadToCloudinary } from "../../../../lib/cloudinary";

interface FileState {
  file: File | null;
  preview: string | null;
  dragging: boolean;
}
const empty = (): FileState => ({ file: null, preview: null, dragging: false });

export default function AddCompanyPage() {
  const router = useRouter();                          // ← ADD

  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [phone,   setPhone]   = useState("");
  const [businessId, setBusinessId] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [initialCredit, setInitialCredit] = useState<number | string>(1000);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [logo,    setLogo]    = useState<FileState>(empty());
  const [favicon, setFavicon] = useState<FileState>(empty());
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});

  const logoRef    = useRef<HTMLInputElement | null>(null);
  const faviconRef = useRef<HTMLInputElement | null>(null);

  const readFile = (f: File, set: React.Dispatch<React.SetStateAction<FileState>>) => {
    const r = new FileReader();
    r.onload = () => set({ file: f, preview: r.result as string, dragging: false });
    r.readAsDataURL(f);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, set: React.Dispatch<React.SetStateAction<FileState>>) => {
    const f = e.target.files?.[0]; if (f) readFile(f, set);
  };
  const onDrop = (e: React.DragEvent, set: React.Dispatch<React.SetStateAction<FileState>>) => {
    e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) readFile(f, set);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim())  errs.name = "Company name is required";
    if (!email.trim()) errs.email = "Email is required";
    if (!phone.trim()) errs.phone = "Phone is required";
    if (!adminName.trim()) errs.adminName = "Admin name is required";
    if (!adminEmail.trim()) errs.adminEmail = "Admin email is required";
    if (!adminPassword.trim()) errs.adminPassword = "Admin password is required";
    if (!logo.file)    errs.logo = "Please upload a company logo";
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    
    let logoUrl = null;
    if (logo.file) {
      logoUrl = await uploadToCloudinary(logo.file);
    }

    const payload = {
      name: name,
      email: email,
      phone: phone,
      business_id: businessId,
      webhook_url: webhookUrl,
      initial_credit: Number(initialCredit) || 0,
      logo: logoUrl,
      user: {
        name: adminName,
        email: adminEmail,
        password: adminPassword
      }
    };

    try {
      const token = localStorage.getItem("console_access_token");
      const response = await fetch("https://hostapi.soft7.in/v1/admin/companies/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => {
          router.push("/user/dashboard");
        }, 1500);
      } else {
        const errorData = await response.json();
        console.error("API error:", errorData);
        alert("Failed to save company.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Error saving company.");
    } finally {
      setSaving(false);
    }
  };

  // ── Cancel → go back to dashboard ──────────────────
  const handleCancel = () => {
    router.push("/user/dashboard");
  };

  /** Clear a field's error as soon as it is edited (unchanged behavior). */
  const clearError = (key: string) => {
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  return (
    <PageContainer width="narrow">
      <Button variant="ghost" size="sm" className="-ml-2 mb-3" leftIcon={<ArrowLeft size={15} />} onClick={handleCancel}>
        Back to Dashboard
      </Button>
      <PageHeader title="Add Company" description="Register a new company on the platform." />

      {saved && (
        <Alert variant="success" className="mb-4" message="Company saved! Returning to dashboard..." />
      )}

      <div className="space-y-4">
        <Card>
          <CardHeader icon={Building2} title="Company Information" divided />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Company Name" required value={name} error={errors.name} placeholder="e.g. Acme Corporation"
              onChange={(e) => { setName(e.target.value); clearError("name"); }} />
            <Input label="Company Email" required type="email" value={email} error={errors.email} placeholder="hello@acme.com"
              onChange={(e) => { setEmail(e.target.value); clearError("email"); }} />
            <Input label="Company Phone" required value={phone} error={errors.phone} placeholder="e.g. +1 234 567 890"
              onChange={(e) => { setPhone(e.target.value); clearError("phone"); }} />
            <Input label="Business ID" value={businessId} placeholder="e.g. BIZ-123" onChange={(e) => setBusinessId(e.target.value)} />
            <Input label="Webhook URL" value={webhookUrl} placeholder="https://..." onChange={(e) => setWebhookUrl(e.target.value)} />
            <Input label="Initial Credit" type="number" value={initialCredit} placeholder="1000" onChange={(e) => setInitialCredit(e.target.value)} />
          </div>
        </Card>

        <Card>
          <CardHeader icon={UserCog} title="Admin User Details" divided />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Admin Name" required value={adminName} error={errors.adminName} placeholder="Admin Name"
              onChange={(e) => { setAdminName(e.target.value); clearError("adminName"); }} />
            <Input label="Admin Email" required type="email" value={adminEmail} error={errors.adminEmail} placeholder="admin@acme.com"
              onChange={(e) => { setAdminEmail(e.target.value); clearError("adminEmail"); }} />
            <Input label="Admin Password" required type="password" value={adminPassword} error={errors.adminPassword} placeholder="••••••••"
              onChange={(e) => { setAdminPassword(e.target.value); clearError("adminPassword"); }} />
          </div>
        </Card>

        <Card>
          <CardHeader icon={ImageIcon} title="Branding" divided />
          <div className="space-y-6">
            <div>
              <p className="text-[0.8125rem] font-medium text-foreground">
                Company Logo <span className="text-error">*</span>
              </p>
              <p className="mb-3 mt-0.5 text-xs text-muted-foreground">PNG, JPG, SVG up to 5MB · Recommended 200×200px</p>
              <Zone
                state={logo} label="logo" previewSize={80} error={!!errors.logo}
                inputRef={logoRef} accept="image/*"
                onChange={(e) => { onFileChange(e, setLogo); clearError("logo"); }}
                onDrop={(e) => { onDrop(e, setLogo); clearError("logo"); }}
                onDragOver={(e) => { e.preventDefault(); setLogo((p) => ({ ...p, dragging: true })); }}
                onDragLeave={() => setLogo((p) => ({ ...p, dragging: false }))}
                onRemove={() => { setLogo(empty()); if (logoRef.current) logoRef.current.value = ""; }}
              />
              {errors.logo && <p className="mt-1.5 text-xs text-error" role="alert">{errors.logo}</p>}
            </div>

            <div>
              <p className="text-[0.8125rem] font-medium text-foreground">
                Favicon <span className="font-normal text-muted-foreground">(optional)</span>
              </p>
              <p className="mb-3 mt-0.5 text-xs text-muted-foreground">ICO, PNG up to 1MB · Recommended 32×32px</p>
              <Zone
                state={favicon} label="favicon" previewSize={48} error={false}
                inputRef={faviconRef} accept=".ico,image/png,image/x-icon"
                onChange={(e) => onFileChange(e, setFavicon)}
                onDrop={(e) => onDrop(e, setFavicon)}
                onDragOver={(e) => { e.preventDefault(); setFavicon((p) => ({ ...p, dragging: true })); }}
                onDragLeave={() => setFavicon((p) => ({ ...p, dragging: false }))}
                onRemove={() => { setFavicon(empty()); if (faviconRef.current) faviconRef.current.value = ""; }}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={saving} leftIcon={<Save size={15} />}>
            Save Company
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

/* ── Upload Zone ─────────────────────────────────────────────── */
interface ZoneProps {
  state: FileState;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onRemove: () => void;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  accept: string;
  label: string;
  error: boolean;
  previewSize: number;
}

function Zone({ state, onChange, onDrop, onDragOver, onDragLeave, onRemove, inputRef, accept, label, error, previewSize }: ZoneProps) {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <div
        role="button"
        tabIndex={0}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        className={cn(
          "flex min-h-[110px] min-w-[200px] flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 text-center transition-colors",
          error
            ? "border-error bg-error-bg"
            : state.dragging
              ? "border-primary bg-primary-lighter"
              : "border-border-strong bg-surface-muted hover:border-primary-soft hover:bg-primary-lighter",
        )}
      >
        <UploadCloud size={22} className="text-muted-foreground" />
        <p className="text-[0.8125rem] font-medium text-secondary-foreground">
          Drag & drop or <span className="text-primary-text underline">choose file</span>
        </p>
        <p className="text-xs text-muted-foreground">for {label}</p>
        <input ref={inputRef} type="file" accept={accept} onChange={onChange} className="hidden" />
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">Preview</span>
        <div
          className="relative flex items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-muted"
          style={{ width: previewSize + 20, height: previewSize + 20 }}
        >
          {state.preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={state.preview} alt="preview" style={{ width: previewSize, height: previewSize, objectFit: "contain" }} />
              <button
                type="button"
                aria-label={`Remove ${label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error text-error-foreground"
              >
                <X size={11} />
              </button>
            </>
          ) : (
            <ImageIcon size={previewSize <= 48 ? 18 : 26} className="text-disabled-foreground" />
          )}
        </div>
        {state.file && <span className="max-w-[110px] truncate text-center text-[0.6875rem] text-muted-foreground">{state.file.name}</span>}
      </div>
    </div>
  );
}

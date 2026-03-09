"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";          // ← ADD
import { useTheme, tokens } from "../../../../context/ThemeContext";

interface FileState {
  file: File | null;
  preview: string | null;
  dragging: boolean;
}
const empty = (): FileState => ({ file: null, preview: null, dragging: false });
type Tok = typeof tokens.dark | typeof tokens.light;

export default function AddCompanyPage() {
  const { isDark } = useTheme();
  const t: Tok = isDark ? tokens.dark : tokens.light;
  const router = useRouter();                          // ← ADD

  const [name,    setName]    = useState("");
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
    if (!logo.file)    errs.logo = "Please upload a company logo";
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false); setSaved(true);
 
  };

  // ── Cancel → go back to dashboard ──────────────────
  const handleCancel = () => {
    router.push("/user/dashboard");
  };

  /* ─── colours ──────────────────────────────────────── */
  const C = {
    pageBg:   isDark ? "#070b14"  : "#f1f5f9",
    cardBg:   isDark ? "#0d1117"  : "#ffffff",
    border:   isDark ? "#1c2333"  : "#e2e8f0",
    heading:  isDark ? "#f1f5f9"  : "#0f172a",
    label:    isDark ? "#e2e8f0"  : "#1e293b",
    hint:     isDark ? "#94a3b8"  : "#64748b",
    inputBg:  isDark ? "#161b27"  : "#f8fafc",
    inputClr: isDark ? "#e2e8f0"  : "#1e293b",
    divider:  isDark ? "#1c2333"  : "#f0f4f8",
    dropText: isDark ? "#94a3b8"  : "#475569",
    dropSub:  isDark ? "#4b5563"  : "#94a3b8",
    prevBox:  isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
    prevLbl:  isDark ? "#6b7280"  : "#94a3b8",
  };

  return (
    <div style={{ minHeight: "100%", padding: "36px 24px 64px", background: C.pageBg, fontFamily: "'Inter',sans-serif", display: "flex", flexDirection: "column", alignItems: "center", transition: "background .3s" }}>

      {/* ── Header ── */}
      <div style={{ width: "100%", maxWidth: 660, marginBottom: 24 }}>
        {/* Back link */}
        <button
          onClick={() => router.push("/user/dashboard")}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, background: "none", border: "none", cursor: "pointer", color: C.hint, fontSize: "0.82rem", fontFamily: "inherit", padding: 0 }}
        >
          
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#3b5bdb,#6741d9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0, boxShadow: "0 4px 14px rgba(59,91,219,.4)" }}>🏢</div>
          <h1 style={{ margin: 0, fontWeight: 800, fontSize: "1.55rem", color: C.heading, letterSpacing: "-0.02em" }}>Add Company</h1>
        </div>
        <p style={{ margin: 0, paddingLeft: 56, fontSize: "0.875rem", color: C.hint }}>Register a new company on the platform.</p>
      </div>

      {/* ── Toast ── */}
      {saved && (
        <div style={{ width: "100%", maxWidth: 660, marginBottom: 18, padding: "12px 18px", borderRadius: 10, background: "rgba(34,197,94,.12)", border: "1px solid rgba(34,197,94,.3)", color: "#16a34a", fontSize: "0.875rem", fontWeight: 600 }}>
          ✓ Company saved! Returning to dashboard...
        </div>
      )}

      {/* ── Card ── */}
      <div style={{ width: "100%", maxWidth: 660, background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 18, overflow: "hidden", boxShadow: isDark ? "0 8px 36px rgba(0,0,0,.45)" : "0 8px 36px rgba(0,0,0,.09)", transition: "background .3s,border-color .3s" }}>

        {/* stripe */}
        <div style={{ height: 4, background: "linear-gradient(90deg,#3b5bdb,#6741d9,#0ca678)" }} />

        <div style={{ padding: "32px 36px 36px" }}>

          {/* Company Name */}
          <div style={{ marginBottom: 26 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: C.label }}>Company Name</span>
              <span style={{ color: "#f87171" }}>*</span>
            </div>
            <input
              type="text" placeholder="e.g. Acme Corporation" value={name}
              onChange={e => { setName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: "" })); }}
              onFocus={e  => (e.target.style.borderColor = "#3b5bdb")}
              onBlur={e   => (e.target.style.borderColor = errors.name ? "#f87171" : C.border)}
              style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 9, border: `1.5px solid ${errors.name ? "#f87171" : C.border}`, background: C.inputBg, color: C.inputClr, fontSize: "0.9rem", fontFamily: "inherit", outline: "none", transition: "border .2s" }}
            />
            {errors.name && <p style={{ margin: "5px 0 0", fontSize: "0.75rem", color: "#f87171" }}>⚠ {errors.name}</p>}
          </div>

          <div style={{ height: 1, background: C.divider, marginBottom: 26 }} />

          {/* Logo */}
          <div style={{ marginBottom: 26 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: C.label }}>Company Logo</span>
              <span style={{ color: "#f87171" }}>*</span>
            </div>
            <p style={{ margin: "2px 0 12px", fontSize: "0.75rem", color: C.hint }}>PNG, JPG, SVG up to 5MB · Recommended 200×200px</p>
            <Zone
              state={logo} C={C} isDark={isDark} label="logo" icon="🏢" previewSize={80} error={!!errors.logo}
              inputRef={logoRef} accept="image/*"
              onChange={e => { onFileChange(e, setLogo); if (errors.logo) setErrors(p => ({ ...p, logo: "" })); }}
              onDrop={e   => { onDrop(e, setLogo);       if (errors.logo) setErrors(p => ({ ...p, logo: "" })); }}
              onDragOver={e  => { e.preventDefault(); setLogo(p => ({ ...p, dragging: true })); }}
              onDragLeave={() => setLogo(p  => ({ ...p, dragging: false }))}
              onRemove={() => { setLogo(empty()); if (logoRef.current) logoRef.current.value = ""; }}
            />
            {errors.logo && <p style={{ margin: "6px 0 0", fontSize: "0.75rem", color: "#f87171" }}>⚠ {errors.logo}</p>}
          </div>

          <div style={{ height: 1, background: C.divider, marginBottom: 26 }} />

          {/* Favicon */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: C.label }}>Favicon</span>
              <span style={{ fontSize: "0.72rem", color: C.hint }}>(optional)</span>
            </div>
            <p style={{ margin: "2px 0 12px", fontSize: "0.75rem", color: C.hint }}>ICO, PNG up to 1MB · Recommended 32×32px</p>
            <Zone
              state={favicon} C={C} isDark={isDark} label="favicon" icon="🌐" previewSize={48} error={false}
              inputRef={faviconRef} accept=".ico,image/png,image/x-icon"
              onChange={e => onFileChange(e, setFavicon)}
              onDrop={e   => onDrop(e, setFavicon)}
              onDragOver={e  => { e.preventDefault(); setFavicon(p => ({ ...p, dragging: true })); }}
              onDragLeave={() => setFavicon(p => ({ ...p, dragging: false }))}
              onRemove={() => { setFavicon(empty()); if (faviconRef.current) faviconRef.current.value = ""; }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            {/* ── Cancel → back to dashboard ── */}
            <BtnCancel onClick={handleCancel} C={C} />
            <BtnSave   onClick={handleSave}   saving={saving} />
          </div>

        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
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
  accept: string; label: string; icon: string;
  isDark: boolean; error: boolean; previewSize: number;
  C: Record<string, string>;
}

function Zone({ state, onChange, onDrop, onDragOver, onDragLeave, onRemove, inputRef, accept, label, icon, isDark, error, previewSize, C }: ZoneProps) {
  const zoneBorder = error ? "#f87171" : state.dragging ? "#3b5bdb" : C.border;
  const zoneBg     = state.dragging ? (isDark ? "rgba(59,91,219,.1)" : "rgba(59,91,219,.05)") : (isDark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.01)");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <div onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} onClick={() => inputRef.current?.click()}
        style={{ flex: 1, minWidth: 200, minHeight: 110, border: `2px dashed ${zoneBorder}`, borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", background: zoneBg, transition: "all .2s" }}>
        <span style={{ fontSize: "1.8rem", opacity: .5 }}>📂</span>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: C.dropText }}>
            Drag & drop or <span style={{ color: "#3b5bdb", textDecoration: "underline" }}>choose file</span>
          </p>
          <p style={{ margin: "3px 0 0", fontSize: "0.72rem", color: C.dropSub }}>for {label}</p>
        </div>
        <input ref={inputRef} type="file" accept={accept} onChange={onChange} style={{ display: "none" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "0.68rem", fontWeight: 700, color: C.prevLbl, letterSpacing: "0.08em", textTransform: "uppercase" }}>Preview</span>
        <div style={{ width: previewSize + 20, height: previewSize + 20, borderRadius: previewSize <= 48 ? 9 : 14, border: `1.5px solid ${C.border}`, background: C.prevBox, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", transition: "all .3s" }}>
          {state.preview ? (
            <>
              <img src={state.preview} alt="preview" style={{ width: previewSize, height: previewSize, objectFit: "contain" }} />
              <button onClick={e => { e.stopPropagation(); onRemove(); }}
                style={{ position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: "50%", background: "rgba(239,68,68,.9)", border: "none", color: "#fff", fontSize: "0.5rem", cursor: "pointer", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </>
          ) : (
            <span style={{ fontSize: previewSize <= 48 ? "1.4rem" : "2rem", opacity: .15 }}>{icon}</span>
          )}
        </div>
        {state.file && <span style={{ fontSize: "0.68rem", color: C.hint, maxWidth: 110, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{state.file.name}</span>}
      </div>
    </div>
  );
}

/* ── Buttons ─────────────────────────────────────────────────── */
function BtnCancel({ onClick, C }: { onClick: () => void; C: Record<string, string> }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: "10px 26px", borderRadius: 9, fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: "transparent", border: `1.5px solid ${hov ? "#3b5bdb" : C.border}`, color: hov ? "#3b5bdb" : C.label, transition: "all .15s" }}>
       Cancel
    </button>
  );
}

function BtnSave({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={saving} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: "10px 28px", borderRadius: 9, fontSize: "0.875rem", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", border: "none", fontFamily: "inherit", color: "#fff", display: "flex", alignItems: "center", gap: 8, transition: "all .15s", background: saving ? "#4b5563" : hov ? "linear-gradient(135deg,#2f4dc7,#5a35c0)" : "linear-gradient(135deg,#3b5bdb,#6741d9)", boxShadow: saving ? "none" : hov ? "0 6px 20px rgba(59,91,219,.5)" : "0 4px 14px rgba(59,91,219,.35)" }}>
      {saving
        ? <><span style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTop: "2px solid #fff", display: "inline-block", animation: "spin .8s linear infinite" }} /> Saving...</>
        : <>💾 Save Company</>}
    </button>
  );
}
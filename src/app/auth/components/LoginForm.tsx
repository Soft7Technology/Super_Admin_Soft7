"use client";

import { useEffect, useRef, useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  ScrollText,
} from "lucide-react";
import type { Theme } from "../types/auth.types";
import "./LoginForm.css";

interface LoginFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  isPending: boolean;
  onForgot: () => void;
  onRegister?: () => void;
  theme: Theme;
  isMobile: boolean;
}


type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  z: number; 
  r: number;
  hub: boolean;
  ph: number; 
  sx: number; 
  sy: number;
};
type Packet = { a: number; b: number; t: number; hops: number; speed: number };
type Ripple = { x: number; y: number; t: number };

const GREEN = "6, 95, 70";
const GLOW = "16, 128, 95";

function NetworkCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0;
    let h = 0;
    let raf = 0;
    let link = 170;
    let lastSpawn = 0;
    let nodes: Node[] = [];
    let packets: Packet[] = [];
    let ripples: Ripple[] = [];
    const mouse = { x: -9999, y: -9999 };
    const cam = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      link = w < 640 ? 120 : 170;
      const count = Math.round(Math.min(130, Math.max(30, (w * h) / 12000)));
      nodes = Array.from({ length: count }, (_, i) => {
        const z = 0.35 + Math.random() * 0.65;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.28 * z,
          vy: (Math.random() - 0.5) * 0.28 * z,
          z,
          r: 1.2 + z * 1.8,
          hub: i % 9 === 0,
          ph: Math.random() * Math.PI * 2,
          sx: 0,
          sy: 0,
        };
      });
      packets = [];
      ripples = [];
    };

    const neighbour = (i: number, exclude: number) => {
      const a = nodes[i];
      const pool: number[] = [];
      for (let j = 0; j < nodes.length; j++) {
        if (j === i || j === exclude) continue;
        const b = nodes[j];
        if (Math.hypot(a.sx - b.sx, a.sy - b.sy) < link) pool.push(j);
      }
      return pool.length ? pool[Math.floor(Math.random() * pool.length)] : -1;
    };

    const spawn = (from: number, hops = 3 + Math.floor(Math.random() * 3)) => {
      const to = neighbour(from, -1);
      if (to < 0 || packets.length > 44) return;
      packets.push({
        a: from,
        b: to,
        t: 0,
        hops,
        speed: 0.012 + Math.random() * 0.01,
      });
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      cam.tx = (e.clientX / w - 0.5) * 2;
      cam.ty = (e.clientY / h - 0.5) * 2;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      cam.tx = 0;
      cam.ty = 0;
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.(".sa-card")) return;
      ripples.push({ x: e.clientX, y: e.clientY, t: 0 });
      const near = nodes
        .map((n, i) => ({
          i,
          d: Math.hypot(n.sx - e.clientX, n.sy - e.clientY),
        }))
        .sort((p, q) => p.d - q.d)
        .slice(0, 5);
      near.forEach((n) => spawn(n.i, 4));
    };

    const frame = (now: number) => {
      ctx.clearRect(0, 0, w, h);

      cam.x += (cam.tx - cam.x) * 0.05;
      cam.y += (cam.ty - cam.y) * 0.05;

      for (const n of nodes) {
        if (!reduce) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -30) n.x = w + 30;
          if (n.x > w + 30) n.x = -30;
          if (n.y < -30) n.y = h + 30;
          if (n.y > h + 30) n.y = -30;
        }
        n.sx = n.x - cam.x * 26 * n.z;
        n.sy = n.y - cam.y * 18 * n.z;

        
        const dx = n.sx - mouse.x;
        const dy = n.sy - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < 130 && d > 0.01 && !reduce) {
          const f = (1 - d / 130) * 0.5 * n.z;
          n.x += (dx / d) * f;
          n.y += (dy / d) * f;
        }
      }

      // links
      ctx.lineWidth = 0.8;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.sx - b.sx, a.sy - b.sy);
          if (d < link) {
            const z = (a.z + b.z) / 2;
            ctx.strokeStyle = `rgba(${GREEN}, ${(1 - d / link) * 0.42 * z})`;
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(b.sx, b.sy);
            ctx.stroke();
          }
        }
        const md = Math.hypot(a.sx - mouse.x, a.sy - mouse.y);
        if (md < 160) {
          ctx.strokeStyle = `rgba(${GLOW}, ${(1 - md / 160) * 0.75})`;
          ctx.beginPath();
          ctx.moveTo(a.sx, a.sy);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      // nodes
      for (const n of nodes) {
        const md = Math.hypot(n.sx - mouse.x, n.sy - mouse.y);
        const boost = md < 160 ? 1 - md / 160 : 0;
        ctx.fillStyle = `rgba(${GREEN}, ${0.32 + 0.5 * n.z + boost * 0.3})`;
        ctx.beginPath();
        ctx.arc(n.sx, n.sy, n.r + boost * 1.2, 0, Math.PI * 2);
        ctx.fill();

        if (n.hub) {
          const pulse = reduce ? 0.5 : (Math.sin(now / 1100 + n.ph) + 1) / 2;
          ctx.strokeStyle = `rgba(${GLOW}, ${0.25 + pulse * 0.3})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(n.sx, n.sy, n.r + 4 + pulse * 4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.lineWidth = 0.8;
        }
      }

      if (!reduce) {
        // ambient data packets
        if (now - lastSpawn > 240) {
          lastSpawn = now;
          if (nodes.length) spawn(Math.floor(Math.random() * nodes.length));
        }

        const next: Packet[] = [];
        for (const p of packets) {
          p.t += p.speed;
          const a = nodes[p.a];
          const b = nodes[p.b];
          if (!a || !b) continue;
          if (Math.hypot(a.sx - b.sx, a.sy - b.sy) > link * 1.15) continue; // link broke

          const x = a.sx + (b.sx - a.sx) * Math.min(p.t, 1);
          const y = a.sy + (b.sy - a.sy) * Math.min(p.t, 1);
          const t0 = Math.max(p.t - 0.22, 0);
          const tx = a.sx + (b.sx - a.sx) * t0;
          const ty = a.sy + (b.sy - a.sy) * t0;

          const trail = ctx.createLinearGradient(tx, ty, x, y);
          trail.addColorStop(0, `rgba(${GLOW}, 0)`);
          trail.addColorStop(1, `rgba(${GLOW}, 0.75)`);
          ctx.strokeStyle = trail;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(x, y);
          ctx.stroke();

          const g = ctx.createRadialGradient(x, y, 0, x, y, 7);
          g.addColorStop(0, `rgba(${GLOW}, 0.9)`);
          g.addColorStop(1, `rgba(${GLOW}, 0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.lineWidth = 0.8;

          if (p.t >= 1) {
            if (p.hops > 0) {
              const to = neighbour(p.b, p.a);
              if (to >= 0)
                next.push({
                  a: p.b,
                  b: to,
                  t: 0,
                  hops: p.hops - 1,
                  speed: p.speed,
                });
            }
          } else {
            next.push(p);
          }
        }
        packets = next;

        // click ripples
        ripples = ripples.filter((r) => r.t < 1);
        for (const r of ripples) {
          r.t += 0.018;
          ctx.strokeStyle = `rgba(${GLOW}, ${(1 - r.t) * 0.3})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.t * 240, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.lineWidth = 0.8;

        raf = requestAnimationFrame(frame);
      }
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) raf = requestAnimationFrame(frame);
    };

    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("pointerdown", onDown);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="sa-canvas" aria-hidden="true" />;
}

const vars = (o: Record<string, string | number>) => o as React.CSSProperties;
const delay = (s: number) => vars({ "--d": `${s}s` });

export function LoginForm({
  onSubmit,
  errors,
  setErrors,
  isPending,
  onForgot,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const stageRef = useRef<HTMLElement>(null);

  const identifierError = errors.identifier || errors.email;

  const clearError = (field: string) => {
    const next = { ...errors };
    delete next[field];
    setErrors(next);
  };

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        el.style.setProperty("--mx", `${(-x * 5).toFixed(2)}px`);
        el.style.setProperty("--my", `${(-y * 4).toFixed(2)}px`);
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div className="sa-login">
      <div className="sa-scene" aria-hidden="true">
        <div className="sa-grid" />
        <NetworkCanvas />
      </div>

      <main className="sa-stage" ref={stageRef}>
        <div className="sa-card">
          {/* ── Left: welcome + live platform visual ── */}
          <section className="sa-hero">
            <div className="sa-stagger" style={delay(0.25)}>
              <h2 className="sa-headline">
                Welcome back.
                <br />
                Your platform is ready when you are.
              </h2>
              <p className="sa-lede">
                Manage companies, users, and platform operations from one secure
                console.
              </p>
            </div>

            <div
              className="sa-orbit sa-stagger"
              style={delay(0.45)}
              aria-hidden="true"
            >
              <span className="sa-ring sa-ring--1" />
              <span className="sa-ring sa-ring--2" />
              <span className="sa-ring sa-ring--3" />
              <span className="sa-spin sa-spin--1">
                <i />
              </span>
              <span className="sa-spin sa-spin--2">
                <i />
              </span>
              <span className="sa-spin sa-spin--3">
                <i />
              </span>

              <div className="sa-core">
                <ShieldCheck size={34} strokeWidth={1.8} />
              </div>

              <div className="sa-chip sa-chip--a">
                <span className="sa-chip__live" />
                Tenants
              </div>
              <div className="sa-chip sa-chip--b">
                <KeyRound size={14} strokeWidth={2} />
                Access control
              </div>
              <div className="sa-chip sa-chip--c">
                <ScrollText size={14} strokeWidth={2} />
                Audit logs
              </div>
            </div>
          </section>

          {/* ── Right: sign-in form ── */}
          <section className="sa-pane">
            <div className="sa-stagger" style={delay(0.2)}>
              <h1 className="sa-title">Sign in</h1>
              <p className="sa-subtitle">
                Enter your credentials to access your Super Admin workspace.
              </p>
            </div>

            <form onSubmit={onSubmit} noValidate>
              {errors.general && (
                <div className="sa-alert" role="alert" key={errors.general}>
                  <AlertCircle
                    size={16}
                    style={{ flex: "none", marginTop: 1 }}
                  />
                  <span>{errors.general}</span>
                </div>
              )}

              {/* Email / Phone */}
              <div className="sa-field sa-stagger" style={delay(0.3)}>
                <label className="sa-label" htmlFor="sa-identifier">
                  Email or phone
                </label>
                <div className="sa-control">
                  <Mail className="sa-icon" size={16} />
                  <input
                    id="sa-identifier"
                    className="sa-input"
                    type="text"
                    name="identifier"
                    placeholder="name@company.com"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={identifier}
                    aria-invalid={!!identifierError}
                    aria-describedby={
                      identifierError ? "sa-identifier-err" : undefined
                    }
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      clearError("identifier");
                      clearError("email");
                    }}
                  />
                </div>
                {identifierError && (
                  <p className="sa-error" id="sa-identifier-err" role="alert">
                    {identifierError}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="sa-field sa-stagger" style={delay(0.38)}>
                <label className="sa-label" htmlFor="sa-password">
                  Password
                </label>
                <div className="sa-control">
                  <Lock className="sa-icon" size={16} />
                  <input
                    id="sa-password"
                    className="sa-input sa-input--pw"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "sa-password-err" : undefined
                    }
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError("password");
                    }}
                  />
                  <button
                    type="button"
                    className="sa-eye"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="sa-error" id="sa-password-err" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Forgot */}
              <div className="sa-row sa-stagger" style={delay(0.44)}>
                <button type="button" className="sa-link" onClick={onForgot}>
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <div className="sa-stagger" style={delay(0.5)}>
                <button
                  type="submit"
                  className="sa-submit"
                  disabled={isPending}
                  aria-busy={isPending}
                >
                  {isPending ? (
                    <>
                      <span className="sa-spinner" aria-hidden="true" />
                      <span className="sr-only">Signing in</span>
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight
                        className="sa-arrow"
                        size={16}
                        strokeWidth={2.25}
                      />
                    </>
                  )}
                </button>
              </div>
            </form>

            <p className="sa-foot sa-stagger" style={delay(0.58)}>
              Restricted to authorised administrators.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

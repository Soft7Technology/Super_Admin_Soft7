"use client";
import React, { useEffect, useRef, useState } from "react";
import { useTheme, tokens } from "../context/ThemeContext";

const DATA = [
  {l:"Jan",v:30},{l:"Feb",v:52},{l:"Mar",v:45},{l:"Apr",v:70},{l:"May",v:65},{l:"Jun",v:90},
  {l:"Jul",v:110},{l:"Aug",v:95},{l:"Sep",v:130},{l:"Oct",v:118},{l:"Nov",v:150},{l:"Dec",v:194},
];

export default function SubscriptionChart() {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const color = isDark ? "#4dabf7" : "#2563eb";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{x:number;y:number;l:string;v:number}|null>(null);
  const rafRef = useRef(0);

  const draw = (progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const pL=48,pR=20,pT=20,pB=36;
    ctx.clearRect(0,0,W,H);
    const max = Math.max(...DATA.map(d=>d.v));
    const tx = (i:number) => pL+(i/(DATA.length-1))*(W-pL-pR);
    const ty = (v:number) => pT+(1-v/max)*(H-pT-pB);
    // Grid
    ctx.strokeStyle = isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.07)";
    ctx.lineWidth=1; ctx.setLineDash([4,4]);
    for(let i=0;i<=4;i++){
      const y=pT+(i/4)*(H-pT-pB);
      ctx.beginPath();ctx.moveTo(pL,y);ctx.lineTo(W-pR,y);ctx.stroke();
      ctx.fillStyle=isDark?"#4b5563":"#94a3b8";
      ctx.font="11px Inter,sans-serif";ctx.textAlign="right";
      ctx.fillText(String(Math.round(max-(i/4)*max)),pL-8,y+4);
    }
    ctx.setLineDash([]);
    ctx.fillStyle=isDark?"#4b5563":"#94a3b8";
    ctx.font="11px Inter,sans-serif";ctx.textAlign="center";
    DATA.forEach((d,i)=>{ if(i%2===0||i===DATA.length-1) ctx.fillText(d.l,tx(i),H-6); });
    // Axes
    ctx.strokeStyle=isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.1)";
    ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pL,pT);ctx.lineTo(pL,H-pB);ctx.lineTo(W-pR,H-pB);ctx.stroke();
    const upto=Math.floor(progress*(DATA.length-1));
    const frac=(progress*(DATA.length-1))-upto;
    const ex=upto<DATA.length-1?tx(upto)+frac*(tx(upto+1)-tx(upto)):tx(DATA.length-1);
    const ey=upto<DATA.length-1?ty(DATA[upto].v)+frac*(ty(DATA[upto+1].v)-ty(DATA[upto].v)):ty(DATA[upto].v);
    // Fill
    const grad=ctx.createLinearGradient(pL,pT,pL,H-pB);
    grad.addColorStop(0,`${color}30`);grad.addColorStop(1,`${color}00`);
    ctx.beginPath();ctx.moveTo(tx(0),H-pB);ctx.lineTo(tx(0),ty(DATA[0].v));
    for(let i=1;i<=upto;i++){const cx=(tx(i-1)+tx(i))/2;ctx.bezierCurveTo(cx,ty(DATA[i-1].v),cx,ty(DATA[i].v),tx(i),ty(DATA[i].v));}
    if(upto<DATA.length-1)ctx.lineTo(ex,ey);
    ctx.lineTo(ex,H-pB);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
    // Line
    ctx.beginPath();ctx.moveTo(tx(0),ty(DATA[0].v));
    for(let i=1;i<=upto;i++){const cx=(tx(i-1)+tx(i))/2;ctx.bezierCurveTo(cx,ty(DATA[i-1].v),cx,ty(DATA[i].v),tx(i),ty(DATA[i].v));}
    if(upto<DATA.length-1)ctx.lineTo(ex,ey);
    ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.lineJoin="round";ctx.stroke();
    // Dots
    for(let i=0;i<=upto;i++){
      ctx.beginPath();ctx.arc(tx(i),ty(DATA[i].v),4,0,Math.PI*2);
      ctx.fillStyle=isDark?"#0d1117":"#fff";ctx.fill();
      ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
    }
    // Leading glow
    const glow=ctx.createRadialGradient(ex,ey,0,ex,ey,10);
    glow.addColorStop(0,`${color}99`);glow.addColorStop(1,`${color}00`);
    ctx.beginPath();ctx.arc(ex,ey,10,0,Math.PI*2);ctx.fillStyle=glow;ctx.fill();
    ctx.beginPath();ctx.arc(ex,ey,5,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
  };

  useEffect(()=>{
    const canvas=canvasRef.current,container=containerRef.current;
    if(!canvas||!container)return;
    const resize=()=>{canvas.width=container.clientWidth;canvas.height=container.clientHeight;draw(1);};
    resize();
    const start=performance.now();
    const tick=(now:number)=>{const p=Math.min((now-start)/1200,1);draw(1-Math.pow(1-p,3));if(p<1)rafRef.current=requestAnimationFrame(tick);};
    rafRef.current=requestAnimationFrame(tick);
    const ro=new ResizeObserver(resize);ro.observe(container);
    return()=>{cancelAnimationFrame(rafRef.current);ro.disconnect();};
  },[isDark]);

  const onMove=(e:React.MouseEvent<HTMLCanvasElement>)=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const rect=canvas.getBoundingClientRect();
    const mx=(e.clientX-rect.left)*(canvas.width/rect.width);
    const pL=48,pR=20;
    const tx=(i:number)=>pL+(i/(DATA.length-1))*(canvas.width-pL-pR);
    let ci=0,md=Infinity;
    DATA.forEach((_,i)=>{const d=Math.abs(tx(i)-mx);if(d<md){md=d;ci=i;}});
    if(md<30){
      const max=Math.max(...DATA.map(d=>d.v));
      const ty=(v:number)=>20+(1-v/max)*(canvas.height-56);
      setTip({x:tx(ci)*(rect.width/canvas.width),y:ty(DATA[ci].v)*(rect.height/canvas.height),l:DATA[ci].l,v:DATA[ci].v});
    } else setTip(null);
  };

  return (
    <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:"14px", overflow:"hidden", display:"flex", flexDirection:"column", transition:"background 0.3s,border-color 0.3s" }}>
      <div style={{ padding:"18px 20px 14px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <span style={{ fontWeight:700, fontSize:"0.95rem", color:t.text }}>Subscription Status</span>
          <span style={{ background:"rgba(74,222,128,0.1)", color:"#16a34a", fontSize:"0.7rem", fontWeight:600, padding:"2px 8px", borderRadius:"20px", display:"inline-flex", alignItems:"center", gap:"4px" }}>
            <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:"#4ade80" }} />+12% this month
          </span>
        </div>
        <div style={{ display:"flex", gap:"6px" }}>
          {["6M","1Y","All"].map(p=>(
            <button key={p} style={{ padding:"4px 10px", borderRadius:"6px", fontSize:"0.72rem", fontWeight:600, cursor:"pointer", border:`1px solid ${t.border}`, background:p==="1Y"?t.accentBg:"transparent", color:p==="1Y"?t.accent:t.textMuted, fontFamily:"inherit", transition:"all 0.15s" }}>{p}</button>
          ))}
        </div>
      </div>
      <div ref={containerRef} style={{ position:"relative", minHeight:"220px", padding:"12px 8px 4px" }}>
        <canvas ref={canvasRef} onMouseMove={onMove} onMouseLeave={()=>setTip(null)} style={{ display:"block", width:"100%", height:"100%", cursor:"crosshair" }} />
        {tip&&(
          <div style={{ position:"absolute", left:tip.x, top:tip.y-44, transform:"translateX(-50%)", background:t.surface2, border:`1px solid ${t.border}`, borderRadius:"8px", padding:"6px 12px", pointerEvents:"none", zIndex:10, whiteSpace:"nowrap", boxShadow:`0 4px 16px ${t.shadow}` }}>
            <div style={{ fontSize:"0.72rem", color:t.textFaint }}>{tip.l}</div>
            <div style={{ fontSize:"0.9rem", fontWeight:700, color:t.text }}>{tip.v} subs</div>
          </div>
        )}
      </div>
    </div>
  );
}

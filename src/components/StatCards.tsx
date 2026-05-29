"use client";
import React, { useState,useEffect } from "react";
import { useTheme, tokens } from "../context/ThemeContext";
import { StatCard } from "../types";

const DARK: Record<StatCard["accent"],{bg:string;border:string;iconBg:string}> = {
  blue:   {bg:"linear-gradient(135deg,#082f27,#0f3f36)",   border:"#10b981",iconBg:"rgba(16,185,129,0.24)"},
  green:  {bg:"linear-gradient(135deg,#082f27,#0f3f36)",   border:"#10b981",iconBg:"rgba(16,185,129,0.24)"},
  purple: {bg:"linear-gradient(135deg,#082f27,#0f3f36)",   border:"#10b981",iconBg:"rgba(16,185,129,0.24)"},
  orange: {bg:"linear-gradient(135deg,#082f27,#0f3f36)",   border:"#10b981",iconBg:"rgba(16,185,129,0.24)"},
  red:    {bg:"linear-gradient(135deg,#082f27,#0f3f36)",   border:"#10b981",iconBg:"rgba(16,185,129,0.24)"},
  teal:   {bg:"linear-gradient(135deg,#082f27,#0f3f36)",   border:"#10b981",iconBg:"rgba(16,185,129,0.24)"},
};
const LIGHT: Record<StatCard["accent"],{bg:string;border:string;iconBg:string}> = {
  blue:   {bg:"linear-gradient(135deg,#ffffff,#ecfdf5)",   border:"#10b981",iconBg:"rgba(16,185,129,0.14)"},
  green:  {bg:"linear-gradient(135deg,#ffffff,#ecfdf5)",   border:"#10b981",iconBg:"rgba(16,185,129,0.14)"},
  purple: {bg:"linear-gradient(135deg,#ffffff,#ecfdf5)",   border:"#10b981",iconBg:"rgba(16,185,129,0.14)"},
  orange: {bg:"linear-gradient(135deg,#ffffff,#ecfdf5)",   border:"#10b981",iconBg:"rgba(16,185,129,0.14)"},
  red:    {bg:"linear-gradient(135deg,#ffffff,#ecfdf5)",   border:"#10b981",iconBg:"rgba(16,185,129,0.14)"},
  teal:   {bg:"linear-gradient(135deg,#ffffff,#ecfdf5)",   border:"#10b981",iconBg:"rgba(16,185,129,0.14)"},
};
const LIGHT_TEXT: Record<StatCard["accent"],string> = {
  blue:"#000000", green:"#000000", purple:"#000000", orange:"#000000", red:"#000000", teal:"#000000",
};




export default function StatCards({ stats }: { stats: StatCard[] }) {

  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const check = () => setIsMobile(window.innerWidth <= 1024);
  check();
  window.addEventListener("resize", check);
  return () => window.removeEventListener("resize", check);
}, []);
  return (
    <div style={{ display:"grid",  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap:"24px", marginBottom:"32px" }}>
      {stats.map((s,i) => <Card key={i} stat={s} />)}
    </div>
  );
}

function Card({ stat, onClick }: { stat: StatCard; onClick?: () => void }) {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const s = isDark ? DARK[stat.accent] : LIGHT[stat.accent];
  const [hov, setHov] = useState(false);
  const textColor = isDark ? "#fff" : LIGHT_TEXT[stat.accent];
  const clickable = Boolean(onClick);

  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:s.bg, border:`2px solid ${s.border}`, borderRadius:"16px", padding:"26px", overflow:"hidden", position:"relative",
        transform:hov?"translateY(-3px)":"translateY(0)", boxShadow:hov?"0 12px 28px rgba(16,185,129,0.20)":"0 4px 14px rgba(16,185,129,0.10)", transition:"all 0.2s", cursor:"default" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"18px" }}>
        <div style={{ fontSize:"1rem", color: isDark?"#d1fae5":textColor, fontWeight:800, maxWidth:"170px", lineHeight:1.35 }}>{stat.label}</div>
        <div style={{ width:"50px", height:"50px", borderRadius:"12px", background:s.iconBg, border:"1px solid rgba(16,185,129,0.24)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.35rem", flexShrink:0 }}>{stat.icon}</div>
      </div>
      <div style={{ fontSize:"2.65rem", fontWeight:900, color: isDark?"#fff":textColor, lineHeight:1, marginBottom:"14px" }}>{stat.value}</div>
      <div style={{ fontSize:"0.95rem", display:"flex", alignItems:"center", gap:"7px", color: isDark?"#d1fae5":"#111827", fontWeight:700 }}>
        <span style={{ color:stat.changeType==="up"?"#10b981":"#dc2626", fontWeight:800 }}>
          {stat.changeType==="up"?"▲":"▼"} {stat.change}
        </span>
        vs last month
      </div>
    </div>
  );
}

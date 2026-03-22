"use client";
import React, { useState } from "react";
import { useTheme, tokens } from "../context/ThemeContext";
import { StatCard } from "../types";

const DARK: Record<StatCard["accent"],{bg:string;border:string;iconBg:string}> = {
  blue:   {bg:"linear-gradient(135deg,#1a2744,#1e3a5f)",   border:"#1e3a6e",iconBg:"rgba(59,130,246,0.25)"},
  green:  {bg:"linear-gradient(135deg,#0f2a1e,#14532d)",   border:"#166534",iconBg:"rgba(34,197,94,0.25)"},
  purple: {bg:"linear-gradient(135deg,#1e1040,#2d1b69)",   border:"#3730a3",iconBg:"rgba(139,92,246,0.25)"},
  orange: {bg:"linear-gradient(135deg,#3b1a08,#7c2d12)",   border:"#9a3412",iconBg:"rgba(249,115,22,0.25)"},
  red:    {bg:"linear-gradient(135deg,#3b0f0f,#7f1d1d)",   border:"#991b1b",iconBg:"rgba(239,68,68,0.25)"},
  teal:   {bg:"linear-gradient(135deg,#0c2a2a,#134e4a)",   border:"#0f766e",iconBg:"rgba(20,184,166,0.25)"},
};
const LIGHT: Record<StatCard["accent"],{bg:string;border:string;iconBg:string}> = {
  blue:   {bg:"linear-gradient(135deg,#eff6ff,#dbeafe)",   border:"#bfdbfe",iconBg:"rgba(37,99,235,0.1)"},
  green:  {bg:"linear-gradient(135deg,#f0fdf4,#dcfce7)",   border:"#bbf7d0",iconBg:"rgba(22,163,74,0.1)"},
  purple: {bg:"linear-gradient(135deg,#f5f3ff,#ede9fe)",   border:"#ddd6fe",iconBg:"rgba(124,58,237,0.1)"},
  orange: {bg:"linear-gradient(135deg,#fff7ed,#ffedd5)",   border:"#fed7aa",iconBg:"rgba(234,88,12,0.1)"},
  red:    {bg:"linear-gradient(135deg,#fff1f2,#ffe4e6)",   border:"#fecdd3",iconBg:"rgba(220,38,38,0.1)"},
  teal:   {bg:"linear-gradient(135deg,#f0fdfa,#ccfbf1)",   border:"#99f6e4",iconBg:"rgba(13,148,136,0.1)"},
};
const LIGHT_TEXT: Record<StatCard["accent"],string> = {
  blue:"#1d4ed8", green:"#15803d", purple:"#6d28d9", orange:"#c2410c", red:"#b91c1c", teal:"#0f766e",
};

export default function StatCards({
  stats,
  onCardClick,
  isCardClickable,
}: {
  stats: StatCard[];
  onCardClick?: (stat: StatCard) => void;
  isCardClickable?: (stat: StatCard) => boolean;
}) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px", marginBottom:"24px" }}>
      {stats.map((s,i) => {
        const clickable = isCardClickable ? isCardClickable(s) : Boolean(onCardClick);
        return (
          <Card
            key={i}
            stat={s}
            onClick={clickable && onCardClick ? () => onCardClick(s) : undefined}
          />
        );
      })}
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
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick}
      style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:"14px", padding:"20px", overflow:"hidden", position:"relative",
        transform:hov?"translateY(-3px)":"translateY(0)", boxShadow:hov?"0 8px 24px rgba(0,0,0,0.18)":"0 2px 8px rgba(0,0,0,0.06)", transition:"all 0.2s", cursor:clickable?"pointer":"default" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"14px" }}>
        <div style={{ fontSize:"0.8rem", color: isDark?"#94a3b8":textColor, fontWeight:600, maxWidth:"130px", lineHeight:1.3, opacity:isDark?1:0.75 }}>{stat.label}</div>
        <div style={{ width:"42px", height:"42px", borderRadius:"10px", background:s.iconBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", flexShrink:0 }}>{stat.icon}</div>
      </div>
      <div style={{ fontSize:"2.2rem", fontWeight:800, color: isDark?"#fff":textColor, lineHeight:1, marginBottom:"10px", letterSpacing:"-0.02em" }}>{stat.value}</div>
      <div style={{ fontSize:"0.78rem", display:"flex", alignItems:"center", gap:"5px", color: isDark?"#94a3b8":textColor, opacity:isDark?1:0.7 }}>
        <span style={{ color:stat.changeType==="up"?"#16a34a":"#dc2626", fontWeight:700 }}>
          {stat.changeType==="up"?"▲":"▼"} {stat.change}
        </span>
        vs last month
      </div>
    </div>
  );
}

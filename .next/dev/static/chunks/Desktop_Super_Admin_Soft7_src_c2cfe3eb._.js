(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/Super_Admin_Soft7/src/components/StatCards.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StatCards
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/src/context/ThemeContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const DARK = {
    blue: {
        bg: "linear-gradient(135deg,#1a2744,#1e3a5f)",
        border: "#1e3a6e",
        iconBg: "rgba(59,130,246,0.25)"
    },
    green: {
        bg: "linear-gradient(135deg,#0f2a1e,#14532d)",
        border: "#166534",
        iconBg: "rgba(34,197,94,0.25)"
    },
    purple: {
        bg: "linear-gradient(135deg,#1e1040,#2d1b69)",
        border: "#3730a3",
        iconBg: "rgba(139,92,246,0.25)"
    },
    orange: {
        bg: "linear-gradient(135deg,#3b1a08,#7c2d12)",
        border: "#9a3412",
        iconBg: "rgba(249,115,22,0.25)"
    },
    red: {
        bg: "linear-gradient(135deg,#3b0f0f,#7f1d1d)",
        border: "#991b1b",
        iconBg: "rgba(239,68,68,0.25)"
    },
    teal: {
        bg: "linear-gradient(135deg,#0c2a2a,#134e4a)",
        border: "#0f766e",
        iconBg: "rgba(20,184,166,0.25)"
    }
};
const LIGHT = {
    blue: {
        bg: "linear-gradient(135deg,#eff6ff,#dbeafe)",
        border: "#bfdbfe",
        iconBg: "rgba(37,99,235,0.1)"
    },
    green: {
        bg: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
        border: "#bbf7d0",
        iconBg: "rgba(22,163,74,0.1)"
    },
    purple: {
        bg: "linear-gradient(135deg,#f5f3ff,#ede9fe)",
        border: "#ddd6fe",
        iconBg: "rgba(124,58,237,0.1)"
    },
    orange: {
        bg: "linear-gradient(135deg,#fff7ed,#ffedd5)",
        border: "#fed7aa",
        iconBg: "rgba(234,88,12,0.1)"
    },
    red: {
        bg: "linear-gradient(135deg,#fff1f2,#ffe4e6)",
        border: "#fecdd3",
        iconBg: "rgba(220,38,38,0.1)"
    },
    teal: {
        bg: "linear-gradient(135deg,#f0fdfa,#ccfbf1)",
        border: "#99f6e4",
        iconBg: "rgba(13,148,136,0.1)"
    }
};
const LIGHT_TEXT = {
    blue: "#1d4ed8",
    green: "#15803d",
    purple: "#6d28d9",
    orange: "#c2410c",
    red: "#b91c1c",
    teal: "#0f766e"
};
function StatCards({ stats }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "16px",
            marginBottom: "24px"
        },
        children: stats.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                stat: s
            }, i, false, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/StatCards.tsx",
                lineNumber: 29,
                columnNumber: 27
            }, this))
    }, void 0, false, {
        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/StatCards.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
_c = StatCards;
function Card({ stat }) {
    _s();
    const { isDark } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const t = isDark ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokens"].dark : __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokens"].light;
    const s = isDark ? DARK[stat.accent] : LIGHT[stat.accent];
    const [hov, setHov] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const textColor = isDark ? "#fff" : LIGHT_TEXT[stat.accent];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        onMouseEnter: ()=>setHov(true),
        onMouseLeave: ()=>setHov(false),
        style: {
            background: s.bg,
            border: `1px solid ${s.border}`,
            borderRadius: "14px",
            padding: "20px",
            overflow: "hidden",
            position: "relative",
            transform: hov ? "translateY(-3px)" : "translateY(0)",
            boxShadow: hov ? "0 8px 24px rgba(0,0,0,0.18)" : "0 2px 8px rgba(0,0,0,0.06)",
            transition: "all 0.2s",
            cursor: "default"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "14px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: "0.8rem",
                            color: isDark ? "#94a3b8" : textColor,
                            fontWeight: 600,
                            maxWidth: "130px",
                            lineHeight: 1.3,
                            opacity: isDark ? 1 : 0.75
                        },
                        children: stat.label
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/StatCards.tsx",
                        lineNumber: 46,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: "42px",
                            height: "42px",
                            borderRadius: "10px",
                            background: s.iconBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.2rem",
                            flexShrink: 0
                        },
                        children: stat.icon
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/StatCards.tsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/StatCards.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontSize: "2.2rem",
                    fontWeight: 800,
                    color: isDark ? "#fff" : textColor,
                    lineHeight: 1,
                    marginBottom: "10px",
                    letterSpacing: "-0.02em"
                },
                children: stat.value
            }, void 0, false, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/StatCards.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontSize: "0.78rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    color: isDark ? "#94a3b8" : textColor,
                    opacity: isDark ? 1 : 0.7
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: stat.changeType === "up" ? "#16a34a" : "#dc2626",
                            fontWeight: 700
                        },
                        children: [
                            stat.changeType === "up" ? "▲" : "▼",
                            " ",
                            stat.change
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/StatCards.tsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, this),
                    "vs last month"
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/StatCards.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/StatCards.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
_s(Card, "FTrE1VUVPgse6wMj0q70HbVcdds=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c1 = Card;
var _c, _c1;
__turbopack_context__.k.register(_c, "StatCards");
__turbopack_context__.k.register(_c1, "Card");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CompanyOverview
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/src/context/ThemeContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const ST = {
    Active: {
        bg: "rgba(34,197,94,0.12)",
        color: "#16a34a",
        dot: "#4ade80"
    },
    Inactive: {
        bg: "rgba(148,163,184,0.1)",
        color: "#64748b",
        dot: "#94a3b8"
    },
    Trial: {
        bg: "rgba(251,191,36,0.12)",
        color: "#d97706",
        dot: "#fbbf24"
    }
};
const DATA = [
    {
        id: "1",
        name: "Acme Corp",
        ini: "AC",
        col: "linear-gradient(135deg,#3b5bdb,#6741d9)",
        status: "Active",
        plan: "Enterprise",
        users: 320
    },
    {
        id: "2",
        name: "Nexus Ltd",
        ini: "NX",
        col: "linear-gradient(135deg,#0ca678,#2f9e44)",
        status: "Active",
        plan: "Pro",
        users: 148
    },
    {
        id: "3",
        name: "SkyLine Inc",
        ini: "SK",
        col: "linear-gradient(135deg,#f59f00,#e67700)",
        status: "Trial",
        plan: "Starter",
        users: 42
    },
    {
        id: "4",
        name: "Vertex Co",
        ini: "VT",
        col: "linear-gradient(135deg,#e03131,#c92a2a)",
        status: "Inactive",
        plan: "Basic",
        users: 87
    },
    {
        id: "5",
        name: "Zenith Group",
        ini: "ZN",
        col: "linear-gradient(135deg,#6741d9,#862e9c)",
        status: "Active",
        plan: "Enterprise",
        users: 510
    }
];
function CompanyOverview() {
    _s();
    const { isDark } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const t = isDark ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokens"].dark : __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokens"].light;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: "14px",
            overflow: "hidden",
            transition: "background 0.3s,border-color 0.3s"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: "18px 20px 14px",
                    borderBottom: `1px solid ${t.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            color: t.text
                        },
                        children: "Company Overview"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
                        lineNumber: 24,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: "0.8rem",
                            color: t.accent,
                            cursor: "pointer",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                        },
                        children: [
                            "View All ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                width: "14",
                                height: "14",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                    points: "9 18 15 12 9 6"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
                                    lineNumber: 26,
                                    columnNumber: 120
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
                                lineNumber: 26,
                                columnNumber: 20
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
                        lineNumber: 25,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                style: {
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.85rem"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            style: {
                                background: t.tableHead
                            },
                            children: [
                                "COMPANY NAME",
                                "STATUS",
                                "PLAN",
                                "USERS"
                            ].map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    style: {
                                        padding: "10px 20px",
                                        textAlign: "left",
                                        fontSize: "0.68rem",
                                        color: t.textFaint,
                                        letterSpacing: "0.08em",
                                        fontWeight: 700,
                                        borderBottom: `1px solid ${t.border}`
                                    },
                                    children: h
                                }, h, false, {
                                    fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
                                    lineNumber: 33,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
                            lineNumber: 31,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                        children: DATA.map((co, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Row, {
                                co: co,
                                last: i === DATA.length - 1,
                                t: t
                            }, co.id, false, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
                                lineNumber: 38,
                                columnNumber: 31
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
_s(CompanyOverview, "p8LwrWNaEMX2B6gWWkmgIiuCFNw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = CompanyOverview;
function Row({ co, last, t }) {
    _s1();
    const [hov, setHov] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const s = ST[co.status];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
        onMouseEnter: ()=>setHov(true),
        onMouseLeave: ()=>setHov(false),
        style: {
            borderBottom: last ? "none" : `1px solid ${t.border}`,
            background: hov ? t.rowHover : "transparent",
            transition: "background 0.12s",
            cursor: "pointer"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                style: {
                    padding: "13px 20px"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                width: "30px",
                                height: "30px",
                                borderRadius: "8px",
                                background: co.col,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "0.68rem",
                                color: "#fff",
                                flexShrink: 0
                            },
                            children: co.ini
                        }, void 0, false, {
                            fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
                            lineNumber: 53,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontWeight: 600,
                                color: t.textSub
                            },
                            children: co.name
                        }, void 0, false, {
                            fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
                            lineNumber: 54,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
                    lineNumber: 52,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                style: {
                    padding: "13px 20px"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: s.bg,
                        color: s.color
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: s.dot
                            }
                        }, void 0, false, {
                            fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
                            lineNumber: 59,
                            columnNumber: 11
                        }, this),
                        co.status
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
                    lineNumber: 58,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                style: {
                    padding: "13px 20px"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        fontSize: "0.78rem",
                        color: t.textMuted,
                        background: t.surface2,
                        padding: "3px 10px",
                        borderRadius: "6px",
                        border: `1px solid ${t.border}`
                    },
                    children: co.plan
                }, void 0, false, {
                    fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
                    lineNumber: 63,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                style: {
                    padding: "13px 20px",
                    color: t.textSub,
                    fontWeight: 500
                },
                children: co.users
            }, void 0, false, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, this);
}
_s1(Row, "9/uAcqUQPQAY6db9qMgZXXwbOpM=");
_c1 = Row;
var _c, _c1;
__turbopack_context__.k.register(_c, "CompanyOverview");
__turbopack_context__.k.register(_c1, "Row");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UserManagement
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/src/context/ThemeContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const RS = {
    Admin: {
        bg: "rgba(59,91,219,0.15)",
        color: "#4dabf7"
    },
    Manager: {
        bg: "rgba(251,191,36,0.12)",
        color: "#fbbf24"
    },
    User: {
        bg: "rgba(148,163,184,0.1)",
        color: "#94a3b8"
    }
};
const SS = {
    Active: {
        bg: "rgba(34,197,94,0.12)",
        color: "#16a34a",
        dot: "#4ade80"
    },
    Inactive: {
        bg: "rgba(148,163,184,0.1)",
        color: "#64748b",
        dot: "#94a3b8"
    },
    Suspended: {
        bg: "rgba(239,68,68,0.10)",
        color: "#dc2626",
        dot: "#f87171"
    }
};
const USERS = [
    {
        id: "1",
        un: "james_doe",
        role: "Admin",
        status: "Active",
        av: "JD",
        col: "linear-gradient(135deg,#3b5bdb,#6741d9)"
    },
    {
        id: "2",
        un: "sara_rivera",
        role: "Manager",
        status: "Active",
        av: "SR",
        col: "linear-gradient(135deg,#0ca678,#2f9e44)"
    },
    {
        id: "3",
        un: "tom_king",
        role: "User",
        status: "Inactive",
        av: "TK",
        col: "linear-gradient(135deg,#f59f00,#e67700)"
    },
    {
        id: "4",
        un: "anya_patel",
        role: "Admin",
        status: "Active",
        av: "AP",
        col: "linear-gradient(135deg,#6741d9,#862e9c)"
    },
    {
        id: "5",
        un: "mike_loren",
        role: "User",
        status: "Suspended",
        av: "ML",
        col: "linear-gradient(135deg,#e03131,#c92a2a)"
    }
];
function UserManagement() {
    _s();
    const { isDark } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const t = isDark ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokens"].dark : __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokens"].light;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: "14px",
            overflow: "hidden",
            transition: "background 0.3s,border-color 0.3s"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: "18px 20px 14px",
                    borderBottom: `1px solid ${t.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            color: t.text
                        },
                        children: "User Management"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx",
                        lineNumber: 29,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: "0.8rem",
                            color: t.accent,
                            cursor: "pointer",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                        },
                        children: [
                            "View All ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                width: "14",
                                height: "14",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                    points: "9 18 15 12 9 6"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx",
                                    lineNumber: 31,
                                    columnNumber: 120
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx",
                                lineNumber: 31,
                                columnNumber: 20
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                style: {
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.85rem"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            style: {
                                background: t.tableHead
                            },
                            children: [
                                "USERNAME",
                                "ROLE",
                                "STATUS"
                            ].map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    style: {
                                        padding: "10px 20px",
                                        textAlign: "left",
                                        fontSize: "0.68rem",
                                        color: t.textFaint,
                                        letterSpacing: "0.08em",
                                        fontWeight: 700,
                                        borderBottom: `1px solid ${t.border}`
                                    },
                                    children: h
                                }, h, false, {
                                    fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx",
                                    lineNumber: 38,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx",
                            lineNumber: 36,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx",
                        lineNumber: 35,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                        children: USERS.map((u, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Row, {
                                u: u,
                                last: i === USERS.length - 1,
                                t: t
                            }, u.id, false, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx",
                                lineNumber: 43,
                                columnNumber: 31
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx",
                        lineNumber: 42,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_s(UserManagement, "p8LwrWNaEMX2B6gWWkmgIiuCFNw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = UserManagement;
function Row({ u, last, t }) {
    _s1();
    const [hov, setHov] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const rs = RS[u.role];
    const ss = SS[u.status];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
        onMouseEnter: ()=>setHov(true),
        onMouseLeave: ()=>setHov(false),
        style: {
            borderBottom: last ? "none" : `1px solid ${t.border}`,
            background: hov ? t.rowHover : "transparent",
            transition: "background 0.12s",
            cursor: "pointer"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                style: {
                    padding: "12px 20px"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                width: "30px",
                                height: "30px",
                                borderRadius: "8px",
                                background: u.col,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "0.68rem",
                                color: "#fff",
                                flexShrink: 0
                            },
                            children: u.av
                        }, void 0, false, {
                            fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx",
                            lineNumber: 58,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontWeight: 500,
                                color: t.textSub
                            },
                            children: [
                                "@",
                                u.un
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx",
                            lineNumber: 59,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx",
                    lineNumber: 57,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                style: {
                    padding: "12px 20px"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: "6px",
                        background: rs.bg,
                        color: rs.color
                    },
                    children: u.role
                }, void 0, false, {
                    fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx",
                    lineNumber: 63,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                style: {
                    padding: "12px 20px"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: "20px",
                        background: ss.bg,
                        color: ss.color
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                width: "5px",
                                height: "5px",
                                borderRadius: "50%",
                                background: ss.dot
                            }
                        }, void 0, false, {
                            fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx",
                            lineNumber: 67,
                            columnNumber: 11
                        }, this),
                        u.status
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx",
                    lineNumber: 66,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this);
}
_s1(Row, "9/uAcqUQPQAY6db9qMgZXXwbOpM=");
_c1 = Row;
var _c, _c1;
__turbopack_context__.k.register(_c, "UserManagement");
__turbopack_context__.k.register(_c1, "Row");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/Super_Admin_Soft7/src/components/SubscriptionChart.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SubscriptionChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/src/context/ThemeContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const DATA = [
    {
        l: "Jan",
        v: 30
    },
    {
        l: "Feb",
        v: 52
    },
    {
        l: "Mar",
        v: 45
    },
    {
        l: "Apr",
        v: 70
    },
    {
        l: "May",
        v: 65
    },
    {
        l: "Jun",
        v: 90
    },
    {
        l: "Jul",
        v: 110
    },
    {
        l: "Aug",
        v: 95
    },
    {
        l: "Sep",
        v: 130
    },
    {
        l: "Oct",
        v: 118
    },
    {
        l: "Nov",
        v: 150
    },
    {
        l: "Dec",
        v: 194
    }
];
function SubscriptionChart() {
    _s();
    const { isDark } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const t = isDark ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokens"].dark : __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokens"].light;
    const color = isDark ? "#4dabf7" : "#2563eb";
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [tip, setTip] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const rafRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const draw = (progress)=>{
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const W = canvas.width, H = canvas.height;
        const pL = 48, pR = 20, pT = 20, pB = 36;
        ctx.clearRect(0, 0, W, H);
        const max = Math.max(...DATA.map((d)=>d.v));
        const tx = (i)=>pL + i / (DATA.length - 1) * (W - pL - pR);
        const ty = (v)=>pT + (1 - v / max) * (H - pT - pB);
        // Grid
        ctx.strokeStyle = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)";
        ctx.lineWidth = 1;
        ctx.setLineDash([
            4,
            4
        ]);
        for(let i = 0; i <= 4; i++){
            const y = pT + i / 4 * (H - pT - pB);
            ctx.beginPath();
            ctx.moveTo(pL, y);
            ctx.lineTo(W - pR, y);
            ctx.stroke();
            ctx.fillStyle = isDark ? "#4b5563" : "#94a3b8";
            ctx.font = "11px Inter,sans-serif";
            ctx.textAlign = "right";
            ctx.fillText(String(Math.round(max - i / 4 * max)), pL - 8, y + 4);
        }
        ctx.setLineDash([]);
        ctx.fillStyle = isDark ? "#4b5563" : "#94a3b8";
        ctx.font = "11px Inter,sans-serif";
        ctx.textAlign = "center";
        DATA.forEach((d, i)=>{
            if (i % 2 === 0 || i === DATA.length - 1) ctx.fillText(d.l, tx(i), H - 6);
        });
        // Axes
        ctx.strokeStyle = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pL, pT);
        ctx.lineTo(pL, H - pB);
        ctx.lineTo(W - pR, H - pB);
        ctx.stroke();
        const upto = Math.floor(progress * (DATA.length - 1));
        const frac = progress * (DATA.length - 1) - upto;
        const ex = upto < DATA.length - 1 ? tx(upto) + frac * (tx(upto + 1) - tx(upto)) : tx(DATA.length - 1);
        const ey = upto < DATA.length - 1 ? ty(DATA[upto].v) + frac * (ty(DATA[upto + 1].v) - ty(DATA[upto].v)) : ty(DATA[upto].v);
        // Fill
        const grad = ctx.createLinearGradient(pL, pT, pL, H - pB);
        grad.addColorStop(0, `${color}30`);
        grad.addColorStop(1, `${color}00`);
        ctx.beginPath();
        ctx.moveTo(tx(0), H - pB);
        ctx.lineTo(tx(0), ty(DATA[0].v));
        for(let i = 1; i <= upto; i++){
            const cx = (tx(i - 1) + tx(i)) / 2;
            ctx.bezierCurveTo(cx, ty(DATA[i - 1].v), cx, ty(DATA[i].v), tx(i), ty(DATA[i].v));
        }
        if (upto < DATA.length - 1) ctx.lineTo(ex, ey);
        ctx.lineTo(ex, H - pB);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        // Line
        ctx.beginPath();
        ctx.moveTo(tx(0), ty(DATA[0].v));
        for(let i = 1; i <= upto; i++){
            const cx = (tx(i - 1) + tx(i)) / 2;
            ctx.bezierCurveTo(cx, ty(DATA[i - 1].v), cx, ty(DATA[i].v), tx(i), ty(DATA[i].v));
        }
        if (upto < DATA.length - 1) ctx.lineTo(ex, ey);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";
        ctx.stroke();
        // Dots
        for(let i = 0; i <= upto; i++){
            ctx.beginPath();
            ctx.arc(tx(i), ty(DATA[i].v), 4, 0, Math.PI * 2);
            ctx.fillStyle = isDark ? "#0d1117" : "#fff";
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        // Leading glow
        const glow = ctx.createRadialGradient(ex, ey, 0, ex, ey, 10);
        glow.addColorStop(0, `${color}99`);
        glow.addColorStop(1, `${color}00`);
        ctx.beginPath();
        ctx.arc(ex, ey, 10, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex, ey, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SubscriptionChart.useEffect": ()=>{
            const canvas = canvasRef.current, container = containerRef.current;
            if (!canvas || !container) return;
            const resize = {
                "SubscriptionChart.useEffect.resize": ()=>{
                    canvas.width = container.clientWidth;
                    canvas.height = container.clientHeight;
                    draw(1);
                }
            }["SubscriptionChart.useEffect.resize"];
            resize();
            const start = performance.now();
            const tick = {
                "SubscriptionChart.useEffect.tick": (now)=>{
                    const p = Math.min((now - start) / 1200, 1);
                    draw(1 - Math.pow(1 - p, 3));
                    if (p < 1) rafRef.current = requestAnimationFrame(tick);
                }
            }["SubscriptionChart.useEffect.tick"];
            rafRef.current = requestAnimationFrame(tick);
            const ro = new ResizeObserver(resize);
            ro.observe(container);
            return ({
                "SubscriptionChart.useEffect": ()=>{
                    cancelAnimationFrame(rafRef.current);
                    ro.disconnect();
                }
            })["SubscriptionChart.useEffect"];
        }
    }["SubscriptionChart.useEffect"], [
        isDark
    ]);
    const onMove = (e)=>{
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
        const pL = 48, pR = 20;
        const tx = (i)=>pL + i / (DATA.length - 1) * (canvas.width - pL - pR);
        let ci = 0, md = Infinity;
        DATA.forEach((_, i)=>{
            const d = Math.abs(tx(i) - mx);
            if (d < md) {
                md = d;
                ci = i;
            }
        });
        if (md < 30) {
            const max = Math.max(...DATA.map((d)=>d.v));
            const ty = (v)=>20 + (1 - v / max) * (canvas.height - 56);
            setTip({
                x: tx(ci) * (rect.width / canvas.width),
                y: ty(DATA[ci].v) * (rect.height / canvas.height),
                l: DATA[ci].l,
                v: DATA[ci].v
            });
        } else setTip(null);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: "14px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            transition: "background 0.3s,border-color 0.3s"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: "18px 20px 14px",
                    borderBottom: `1px solid ${t.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "10px"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontWeight: 700,
                                    fontSize: "0.95rem",
                                    color: t.text
                                },
                                children: "Subscription Status"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/SubscriptionChart.tsx",
                                lineNumber: 107,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    background: "rgba(74,222,128,0.1)",
                                    color: "#16a34a",
                                    fontSize: "0.7rem",
                                    fontWeight: 600,
                                    padding: "2px 8px",
                                    borderRadius: "20px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            width: "5px",
                                            height: "5px",
                                            borderRadius: "50%",
                                            background: "#4ade80"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/SubscriptionChart.tsx",
                                        lineNumber: 109,
                                        columnNumber: 13
                                    }, this),
                                    "+12% this month"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/SubscriptionChart.tsx",
                                lineNumber: 108,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/SubscriptionChart.tsx",
                        lineNumber: 106,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            gap: "6px"
                        },
                        children: [
                            "6M",
                            "1Y",
                            "All"
                        ].map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                style: {
                                    padding: "4px 10px",
                                    borderRadius: "6px",
                                    fontSize: "0.72rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    border: `1px solid ${t.border}`,
                                    background: p === "1Y" ? t.accentBg : "transparent",
                                    color: p === "1Y" ? t.accent : t.textMuted,
                                    fontFamily: "inherit",
                                    transition: "all 0.15s"
                                },
                                children: p
                            }, p, false, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/SubscriptionChart.tsx",
                                lineNumber: 114,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/SubscriptionChart.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/SubscriptionChart.tsx",
                lineNumber: 105,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: containerRef,
                style: {
                    position: "relative",
                    minHeight: "220px",
                    padding: "12px 8px 4px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                        ref: canvasRef,
                        onMouseMove: onMove,
                        onMouseLeave: ()=>setTip(null),
                        style: {
                            display: "block",
                            width: "100%",
                            height: "100%",
                            cursor: "crosshair"
                        }
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/SubscriptionChart.tsx",
                        lineNumber: 119,
                        columnNumber: 9
                    }, this),
                    tip && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: "absolute",
                            left: tip.x,
                            top: tip.y - 44,
                            transform: "translateX(-50%)",
                            background: t.surface2,
                            border: `1px solid ${t.border}`,
                            borderRadius: "8px",
                            padding: "6px 12px",
                            pointerEvents: "none",
                            zIndex: 10,
                            whiteSpace: "nowrap",
                            boxShadow: `0 4px 16px ${t.shadow}`
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: "0.72rem",
                                    color: t.textFaint
                                },
                                children: tip.l
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/SubscriptionChart.tsx",
                                lineNumber: 122,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: "0.9rem",
                                    fontWeight: 700,
                                    color: t.text
                                },
                                children: [
                                    tip.v,
                                    " subs"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/SubscriptionChart.tsx",
                                lineNumber: 123,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/SubscriptionChart.tsx",
                        lineNumber: 121,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/SubscriptionChart.tsx",
                lineNumber: 118,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/SubscriptionChart.tsx",
        lineNumber: 104,
        columnNumber: 5
    }, this);
}
_s(SubscriptionChart, "xPQf141JuQh33NgybBxIGiGK1xQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = SubscriptionChart;
var _c;
__turbopack_context__.k.register(_c, "SubscriptionChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/Super_Admin_Soft7/src/components/AuditLogs.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AuditLogs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/src/context/ThemeContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
const SEV = {
    success: {
        bg: "rgba(34,197,94,0.1)",
        color: "#16a34a",
        icon: "✓"
    },
    warn: {
        bg: "rgba(251,191,36,0.1)",
        color: "#d97706",
        icon: "!"
    },
    danger: {
        bg: "rgba(239,68,68,0.1)",
        color: "#dc2626",
        icon: "✕"
    },
    info: {
        bg: "rgba(59,130,246,0.1)",
        color: "#2563eb",
        icon: "i"
    }
};
const LOGS = [
    {
        id: "1",
        msg: "New company SkyLine Inc registered",
        actor: "Super Admin",
        time: "2 mins ago",
        sev: "success"
    },
    {
        id: "2",
        msg: "Subscription plan changed for Vertex Co",
        actor: "Admin",
        time: "15 mins ago",
        sev: "warn"
    },
    {
        id: "3",
        msg: "User Anya Patel role updated to Admin",
        actor: "Super Admin",
        time: "1 hr ago",
        sev: "info"
    },
    {
        id: "4",
        msg: "Failed login attempt from unknown IP",
        actor: "System",
        time: "3 hrs ago",
        sev: "danger"
    },
    {
        id: "5",
        msg: "Bulk export of user data completed",
        actor: "Admin",
        time: "6 hrs ago",
        sev: "success"
    }
];
function AuditLogs() {
    _s();
    const { isDark } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const t = isDark ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokens"].dark : __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokens"].light;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: "14px",
            overflow: "hidden",
            transition: "background 0.3s,border-color 0.3s"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: "18px 20px 14px",
                    borderBottom: `1px solid ${t.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            color: t.text
                        },
                        children: "Activity Logs"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/AuditLogs.tsx",
                        lineNumber: 25,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: "0.8rem",
                            color: t.accent,
                            cursor: "pointer",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                        },
                        children: [
                            "View All ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                width: "14",
                                height: "14",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                    points: "9 18 15 12 9 6"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/AuditLogs.tsx",
                                    lineNumber: 27,
                                    columnNumber: 120
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/AuditLogs.tsx",
                                lineNumber: 27,
                                columnNumber: 20
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/AuditLogs.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/AuditLogs.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: LOGS.map((log, i)=>{
                    const s = SEV[log.sev];
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: "12px 20px",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "12px",
                            borderBottom: i < LOGS.length - 1 ? `1px solid ${t.border}` : "none"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "8px",
                                    background: s.bg,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: s.color,
                                    fontSize: "0.78rem",
                                    fontWeight: 800,
                                    flexShrink: 0,
                                    marginTop: "1px"
                                },
                                children: s.icon
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/AuditLogs.tsx",
                                lineNumber: 35,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flex: 1
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: "0.85rem",
                                            color: t.textSub,
                                            fontWeight: 500,
                                            lineHeight: 1.4
                                        },
                                        children: log.msg
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/AuditLogs.tsx",
                                        lineNumber: 37,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: "0.72rem",
                                            color: t.textFaint,
                                            marginTop: "3px"
                                        },
                                        children: [
                                            log.time,
                                            " · ",
                                            log.actor
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/AuditLogs.tsx",
                                        lineNumber: 38,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/AuditLogs.tsx",
                                lineNumber: 36,
                                columnNumber: 15
                            }, this)
                        ]
                    }, log.id, true, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/AuditLogs.tsx",
                        lineNumber: 34,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/AuditLogs.tsx",
                lineNumber: 30,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/AuditLogs.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
_s(AuditLogs, "p8LwrWNaEMX2B6gWWkmgIiuCFNw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = AuditLogs;
var _c;
__turbopack_context__.k.register(_c, "AuditLogs");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/Super_Admin_Soft7/src/app/user/dashboard/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/src/context/ThemeContext.tsx [app-client] (ecmascript)");
/* ── inline components to keep file self-contained ── */ var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$components$2f$StatCards$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/src/components/StatCards.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$components$2f$CompanyOverview$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/src/components/CompanyOverview.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$components$2f$UserManagement$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/src/components/UserManagement.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$components$2f$SubscriptionChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/src/components/SubscriptionChart.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$components$2f$AuditLogs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/src/components/AuditLogs.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
const STATS = [
    {
        label: "Total Companies",
        value: "248",
        icon: "🏢",
        change: "12%",
        changeType: "up",
        accent: "blue"
    },
    {
        label: "Active User",
        value: "5,831",
        icon: "👥",
        change: "8.4%",
        changeType: "up",
        accent: "green"
    },
    {
        label: "Subscription",
        value: "194",
        icon: "💳",
        change: "3.1%",
        changeType: "up",
        accent: "purple"
    },
    {
        label: "Audit Logs",
        value: "1,042",
        icon: "📋",
        change: "2%",
        changeType: "down",
        accent: "orange"
    }
];
function DashboardPage() {
    _s();
    const { isDark } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const t = isDark ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokens"].dark : __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokens"].light;
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: "28px 28px 48px",
            background: t.bg,
            minHeight: "100%",
            transition: "background 0.3s ease"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "28px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                style: {
                                    fontWeight: 800,
                                    fontSize: "1.6rem",
                                    color: t.text,
                                    margin: 0,
                                    letterSpacing: "-0.02em",
                                    transition: "color 0.3s"
                                },
                                children: "Dashboard Overview"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/app/user/dashboard/page.tsx",
                                lineNumber: 30,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: "0.875rem",
                                    color: t.textMuted,
                                    margin: "6px 0 0",
                                    transition: "color 0.3s"
                                },
                                children: "Welcome back! Here's what's happening with your platform."
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/app/user/dashboard/page.tsx",
                                lineNumber: 33,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/app/user/dashboard/page.tsx",
                        lineNumber: 29,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            gap: "10px",
                            paddingTop: "4px"
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Btn, {
                            variant: "primary",
                            label: "Add Company",
                            onClick: ()=>router.push("/user/dashboard/create")
                        }, void 0, false, {
                            fileName: "[project]/Desktop/Super_Admin_Soft7/src/app/user/dashboard/page.tsx",
                            lineNumber: 39,
                            columnNumber: 10
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/app/user/dashboard/page.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/app/user/dashboard/page.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$components$2f$StatCards$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                stats: STATS
            }, void 0, false, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/app/user/dashboard/page.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "18px",
                    marginBottom: "18px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$components$2f$CompanyOverview$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/app/user/dashboard/page.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$components$2f$UserManagement$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/app/user/dashboard/page.tsx",
                        lineNumber: 53,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/app/user/dashboard/page.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "18px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$components$2f$SubscriptionChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/app/user/dashboard/page.tsx",
                        lineNumber: 58,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$components$2f$AuditLogs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/app/user/dashboard/page.tsx",
                        lineNumber: 59,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/app/user/dashboard/page.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Super_Admin_Soft7/src/app/user/dashboard/page.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
_s(DashboardPage, "qVp7LWoOcECUjSvsUl4h3EaY4cU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = DashboardPage;
function Btn({ variant, label, onClick }) {
    _s1();
    const { isDark } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const t = isDark ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokens"].dark : __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokens"].light;
    const [hov, setHov] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    if (variant === "primary") return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: onClick,
        onMouseEnter: ()=>setHov(true),
        onMouseLeave: ()=>setHov(false),
        style: {
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "9px 20px",
            borderRadius: "9px",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
            background: hov ? "linear-gradient(135deg,#2f4dc7,#5a35c0)" : "linear-gradient(135deg,#3b5bdb,#6741d9)",
            color: "#fff",
            boxShadow: hov ? "0 4px 20px rgba(59,91,219,0.4)" : "0 2px 8px rgba(59,91,219,0.2)",
            transition: "all 0.15s",
            fontFamily: "inherit"
        },
        children: label
    }, void 0, false, {
        fileName: "[project]/Desktop/Super_Admin_Soft7/src/app/user/dashboard/page.tsx",
        lineNumber: 78,
        columnNumber: 4
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: onClick,
        onMouseEnter: ()=>setHov(true),
        onMouseLeave: ()=>setHov(false),
        style: {
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "9px 20px",
            borderRadius: "9px",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            border: `1px solid ${hov ? t.accent : t.border}`,
            background: hov ? t.accentBg : "transparent",
            color: hov ? t.accent : t.textMuted,
            transition: "all 0.15s",
            fontFamily: "inherit"
        },
        children: label
    }, void 0, false, {
        fileName: "[project]/Desktop/Super_Admin_Soft7/src/app/user/dashboard/page.tsx",
        lineNumber: 87,
        columnNumber: 4
    }, this);
}
_s1(Btn, "FTrE1VUVPgse6wMj0q70HbVcdds=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c1 = Btn;
var _c, _c1;
__turbopack_context__.k.register(_c, "DashboardPage");
__turbopack_context__.k.register(_c1, "Btn");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Desktop_Super_Admin_Soft7_src_c2cfe3eb._.js.map
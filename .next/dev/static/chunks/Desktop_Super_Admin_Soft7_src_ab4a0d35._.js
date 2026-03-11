(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/Super_Admin_Soft7/src/components/Sidebar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Sidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/src/context/ThemeContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const NAV = [
    {
        icon: "⊞",
        label: "Dashboard",
        bg: "#3b5bdb"
    },
    {
        icon: "🏢",
        label: "Manage Companies",
        bg: "#1971c2",
        badge: 12
    },
    {
        icon: "👥",
        label: "All User",
        bg: "#0ca678"
    },
    {
        icon: "💳",
        label: "Subscription",
        bg: "#6741d9"
    },
    {
        icon: "📋",
        label: "Audit Logs",
        bg: "#862e9c"
    },
    {
        icon: "⚙️",
        label: "System",
        bg: "#495057"
    },
    {
        icon: "👤",
        label: "Profile",
        bg: "#1864ab"
    },
    {
        icon: "🎫",
        label: "Support Tickets",
        bg: "#c92a2a"
    }
];
function Sidebar({ activeItem = "Dashboard", onNavigate }) {
    _s();
    const { isDark } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const t = isDark ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokens"].dark : __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokens"].light;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        style: {
            width: "250px",
            background: t.surface,
            borderRight: `1px solid ${t.border}`,
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            zIndex: 100,
            transition: "background 0.3s,border-color 0.3s"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: "20px",
                    borderBottom: `1px solid ${t.border}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: "38px",
                            height: "38px",
                            borderRadius: "10px",
                            background: "linear-gradient(135deg,#3b5bdb,#6741d9)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.1rem",
                            boxShadow: "0 4px 14px rgba(59,91,219,0.35)",
                            flexShrink: 0
                        },
                        children: "🛡"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Sidebar.tsx",
                        lineNumber: 24,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontWeight: 800,
                                    fontSize: "1rem",
                                    color: t.text,
                                    letterSpacing: "-0.02em",
                                    transition: "color 0.3s"
                                },
                                children: [
                                    "Super",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: t.accent
                                        },
                                        children: "Admin"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Sidebar.tsx",
                                        lineNumber: 27,
                                        columnNumber: 18
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Sidebar.tsx",
                                lineNumber: 26,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: "0.65rem",
                                    color: t.textFaint,
                                    marginTop: "2px",
                                    transition: "color 0.3s"
                                },
                                children: "Management Portal"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Sidebar.tsx",
                                lineNumber: 29,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Sidebar.tsx",
                        lineNumber: 25,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Sidebar.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                style: {
                    flex: 1,
                    overflowY: "auto",
                    padding: "12px 10px"
                },
                children: NAV.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NavItem, {
                        item: item,
                        active: item.label === activeItem,
                        onClick: ()=>onNavigate?.(item.label),
                        t: t,
                        isDark: isDark
                    }, item.label, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Sidebar.tsx",
                        lineNumber: 35,
                        columnNumber: 26
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Sidebar.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: "14px 20px",
                    borderTop: `1px solid ${t.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "border-color 0.3s"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: "7px",
                                    height: "7px",
                                    borderRadius: "50%",
                                    background: "#4ade80",
                                    boxShadow: "0 0 6px #4ade80"
                                }
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Sidebar.tsx",
                                lineNumber: 41,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: "0.72rem",
                                    color: t.textFaint
                                },
                                children: "System Online"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Sidebar.tsx",
                                lineNumber: 42,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Sidebar.tsx",
                        lineNumber: 40,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: "0.72rem",
                            color: t.textFaint
                        },
                        children: "© 2026 Soft7"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Sidebar.tsx",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Sidebar.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Sidebar.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
_s(Sidebar, "p8LwrWNaEMX2B6gWWkmgIiuCFNw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = Sidebar;
function NavItem({ item, active, onClick, t, isDark }) {
    _s1();
    const [hov, setHov] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        onClick: onClick,
        onMouseEnter: ()=>setHov(true),
        onMouseLeave: ()=>setHov(false),
        style: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "9px 12px",
            marginBottom: "2px",
            borderRadius: "9px",
            cursor: "pointer",
            userSelect: "none",
            transition: "all 0.15s",
            color: active ? isDark ? "#fff" : "#0f172a" : hov ? t.textSub : t.textMuted,
            fontWeight: active ? 600 : 400,
            fontSize: "0.875rem",
            background: active ? t.navActive : hov ? t.navHover : "transparent",
            borderLeft: `3px solid ${active ? t.accent : "transparent"}`
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    flexShrink: 0,
                    transition: "background 0.15s",
                    background: active ? item.bg : t.iconBox,
                    boxShadow: active ? `0 2px 10px ${item.bg}66` : "none"
                },
                children: item.icon
            }, void 0, false, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Sidebar.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    flex: 1
                },
                children: item.label
            }, void 0, false, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Sidebar.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            item.badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    background: "#1971c2",
                    color: "#fff",
                    fontSize: "0.62rem",
                    padding: "2px 7px",
                    borderRadius: "20px",
                    fontWeight: 700
                },
                children: item.badge
            }, void 0, false, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Sidebar.tsx",
                lineNumber: 67,
                columnNumber: 22
            }, this),
            active && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: t.accent,
                    boxShadow: `0 0 6px ${t.accent}`
                }
            }, void 0, false, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Sidebar.tsx",
                lineNumber: 68,
                columnNumber: 18
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Sidebar.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
_s1(NavItem, "9/uAcqUQPQAY6db9qMgZXXwbOpM=");
_c1 = NavItem;
var _c, _c1;
__turbopack_context__.k.register(_c, "Sidebar");
__turbopack_context__.k.register(_c1, "NavItem");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Topbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/src/context/ThemeContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function Topbar({ title = "Dashboard", adminName = "Admin" }) {
    _s();
    const { isDark, toggleTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const t = isDark ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokens"].dark : __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokens"].light;
    const [sf, setSf] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [dd, setDd] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        style: {
            height: "64px",
            background: t.surface,
            borderBottom: `1px solid ${t.border}`,
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            gap: "16px",
            position: "sticky",
            top: 0,
            zIndex: 50,
            transition: "background 0.3s,border-color 0.3s"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: t.text,
                    minWidth: "120px",
                    flexShrink: 0,
                    transition: "color 0.3s"
                },
                children: title
            }, void 0, false, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    flex: 1,
                    maxWidth: "420px",
                    background: t.inputBg,
                    border: `1px solid ${sf ? t.accent : t.border}`,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "0 14px",
                    height: "40px",
                    transition: "all 0.2s",
                    boxShadow: sf ? `0 0 0 3px ${t.accentBg}` : "none"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        width: "14",
                        height: "14",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: t.textFaint,
                        strokeWidth: "2.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                cx: "11",
                                cy: "11",
                                r: "8"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                lineNumber: 17,
                                columnNumber: 108
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "m21 21-4.35-4.35"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                lineNumber: 17,
                                columnNumber: 139
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                        lineNumber: 17,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        placeholder: "Search users, campaigns, leads...",
                        onFocus: ()=>setSf(true),
                        onBlur: ()=>setSf(false),
                        style: {
                            background: "none",
                            border: "none",
                            outline: "none",
                            color: t.textSub,
                            fontSize: "0.875rem",
                            fontFamily: "inherit",
                            width: "100%"
                        }
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                        lineNumber: 18,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: toggleTheme,
                        title: isDark ? "Switch to Light Mode" : "Switch to Dark Mode",
                        style: {
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            background: t.iconBox,
                            border: `1px solid ${t.border}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.2s"
                        },
                        children: isDark ? /* Sun */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            width: "18",
                            height: "18",
                            viewBox: "0 0 24 24",
                            fill: "none",
                            stroke: "#fbbf24",
                            strokeWidth: "2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                    cx: "12",
                                    cy: "12",
                                    r: "5"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                    lineNumber: 28,
                                    columnNumber: 118
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                    x1: "12",
                                    y1: "1",
                                    x2: "12",
                                    y2: "3"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                    lineNumber: 28,
                                    columnNumber: 149
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                    x1: "12",
                                    y1: "21",
                                    x2: "12",
                                    y2: "23"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                    lineNumber: 28,
                                    columnNumber: 186
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                    x1: "4.22",
                                    y1: "4.22",
                                    x2: "5.64",
                                    y2: "5.64"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                    lineNumber: 28,
                                    columnNumber: 225
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                    x1: "18.36",
                                    y1: "18.36",
                                    x2: "19.78",
                                    y2: "19.78"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                    lineNumber: 28,
                                    columnNumber: 272
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                    x1: "1",
                                    y1: "12",
                                    x2: "3",
                                    y2: "12"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                    lineNumber: 28,
                                    columnNumber: 323
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                    x1: "21",
                                    y1: "12",
                                    x2: "23",
                                    y2: "12"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                    lineNumber: 28,
                                    columnNumber: 360
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                    x1: "4.22",
                                    y1: "19.78",
                                    x2: "5.64",
                                    y2: "18.36"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                    lineNumber: 28,
                                    columnNumber: 399
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                    x1: "18.36",
                                    y1: "5.64",
                                    x2: "19.78",
                                    y2: "4.22"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                    lineNumber: 28,
                                    columnNumber: 448
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                            lineNumber: 28,
                            columnNumber: 25
                        }, this) : /* Moon */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            width: "17",
                            height: "17",
                            viewBox: "0 0 24 24",
                            fill: "none",
                            stroke: "#6741d9",
                            strokeWidth: "2",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                lineNumber: 29,
                                columnNumber: 119
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                            lineNumber: 29,
                            columnNumber: 26
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                        lineNumber: 24,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: "relative"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "8px",
                                    background: t.iconBox,
                                    border: `1px solid ${t.border}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    color: t.textMuted
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    width: "16",
                                    height: "16",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                            lineNumber: 36,
                                            columnNumber: 111
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M13.73 21a2 2 0 0 1-3.46 0"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                            lineNumber: 36,
                                            columnNumber: 166
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                    lineNumber: 36,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                lineNumber: 35,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    position: "absolute",
                                    top: "7px",
                                    right: "7px",
                                    width: "7px",
                                    height: "7px",
                                    borderRadius: "50%",
                                    background: "#f03e3e",
                                    border: `2px solid ${t.surface}`
                                }
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                lineNumber: 38,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                        lineNumber: 34,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: "1px",
                            height: "24px",
                            background: t.border
                        }
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: "relative"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: ()=>setDd((p)=>!p),
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    cursor: "pointer",
                                    padding: "5px 10px 5px 5px",
                                    borderRadius: "10px",
                                    background: t.iconBox,
                                    border: `1px solid ${t.border}`,
                                    transition: "all 0.15s"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "8px",
                                            background: "linear-gradient(135deg,#3b5bdb,#6741d9)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontWeight: 800,
                                            fontSize: "0.78rem",
                                            color: "#fff"
                                        },
                                        children: adminName.slice(0, 2).toUpperCase()
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                        lineNumber: 46,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: "0.82rem",
                                                    fontWeight: 600,
                                                    color: t.text,
                                                    lineHeight: 1.2,
                                                    transition: "color 0.3s"
                                                },
                                                children: adminName
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                                lineNumber: 50,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: "0.65rem",
                                                    color: t.accent,
                                                    fontWeight: 600
                                                },
                                                children: "Administrator"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                                lineNumber: 51,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                        lineNumber: 49,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        width: "12",
                                        height: "12",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: t.textFaint,
                                        strokeWidth: "2.5",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                            points: "6 9 12 15 18 9"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                            lineNumber: 53,
                                            columnNumber: 112
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                        lineNumber: 53,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                lineNumber: 45,
                                columnNumber: 11
                            }, this),
                            dd && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    position: "absolute",
                                    top: "calc(100%+8px)",
                                    right: 0,
                                    background: t.surface,
                                    border: `1px solid ${t.border}`,
                                    borderRadius: "12px",
                                    minWidth: "175px",
                                    overflow: "hidden",
                                    zIndex: 200,
                                    boxShadow: `0 12px 40px ${t.shadow}`,
                                    marginTop: "8px"
                                },
                                children: [
                                    {
                                        icon: "👤",
                                        label: "Profile"
                                    },
                                    {
                                        icon: "⚙️",
                                        label: "Settings"
                                    },
                                    {
                                        icon: "🚪",
                                        label: "Logout",
                                        red: true
                                    }
                                ].map((item, i, arr)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: "10px 16px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            fontSize: "0.85rem",
                                            color: item.red ? "#f03e3e" : t.textSub,
                                            cursor: "pointer",
                                            borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : "none"
                                        },
                                        children: [
                                            item.icon,
                                            " ",
                                            item.label
                                        ]
                                    }, item.label, true, {
                                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                        lineNumber: 59,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                                lineNumber: 57,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
_s(Topbar, "iUdDNijDEHsityBAec2DLW1tGMQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = Topbar;
var _c;
__turbopack_context__.k.register(_c, "Topbar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/Super_Admin_Soft7/src/app/user/layout.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UserLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$components$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/src/components/Sidebar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$components$2f$Topbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/src/components/Topbar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/src/context/ThemeContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function UserLayout({ children }) {
    _s();
    const [activeNav, setActiveNav] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("Dashboard");
    const { isDark } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const t = isDark ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokens"].dark : __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokens"].light;
    const titles = {
        "Dashboard": "Dashboard",
        "Manage Companies": "Manage Companies",
        "All User": "All Users",
        "Subscription": "Subscription",
        "Audit Logs": "Audit Logs",
        "System": "System",
        "Profile": "Profile",
        "Support Tickets": "Support Tickets"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            minHeight: "100vh",
            background: t.bg,
            transition: "background 0.3s ease"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$components$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                activeItem: activeNav,
                onNavigate: setActiveNav
            }, void 0, false, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/app/user/layout.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginLeft: "250px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$components$2f$Topbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        title: titles[activeNav] ?? activeNav
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/app/user/layout.tsx",
                        lineNumber: 21,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        style: {
                            flex: 1,
                            background: t.bg,
                            transition: "background 0.3s ease"
                        },
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Super_Admin_Soft7/src/app/user/layout.tsx",
                        lineNumber: 22,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Super_Admin_Soft7/src/app/user/layout.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Super_Admin_Soft7/src/app/user/layout.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_s(UserLayout, "+WwpJnxs0QAGaJIxCQ8hZJAwFpM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$src$2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = UserLayout;
var _c;
__turbopack_context__.k.register(_c, "UserLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Desktop_Super_Admin_Soft7_src_ab4a0d35._.js.map
module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/Desktop/Super_Admin_Soft7/src/context/ThemeContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider,
    "tokens",
    ()=>tokens,
    "useTheme",
    ()=>useTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const ThemeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    theme: "dark",
    toggleTheme: ()=>{},
    isDark: true
});
const ThemeProvider = ({ children })=>{
    const [theme, setTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("dark");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            const saved = localStorage.getItem("sa-theme");
            if (saved === "light" || saved === "dark") {
                setTheme(saved);
                document.documentElement.setAttribute("data-theme", saved); // ✅ FIX: apply saved theme to <html>
            } else {
                document.documentElement.setAttribute("data-theme", "dark"); // ✅ FIX: apply default dark theme
            }
        } catch  {
            document.documentElement.setAttribute("data-theme", "dark");
        }
    }, []);
    const toggleTheme = ()=>setTheme((prev)=>{
            const next = prev === "dark" ? "light" : "dark";
            try {
                localStorage.setItem("sa-theme", next);
            } catch  {}
            document.documentElement.setAttribute("data-theme", next); // ✅ FIX: update <html> on every toggle
            return next;
        });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ThemeContext.Provider, {
        value: {
            theme,
            toggleTheme,
            isDark: theme === "dark"
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/Super_Admin_Soft7/src/context/ThemeContext.tsx",
        lineNumber: 33,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
};
const useTheme = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Super_Admin_Soft7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ThemeContext);
const tokens = {
    dark: {
        bg: "#070b14",
        surface: "#0d1117",
        surface2: "#0a0e17",
        border: "#1c2333",
        text: "#ffffff",
        textSub: "#e2e8f0",
        textMuted: "#8b949e",
        textFaint: "#4b5563",
        accent: "#4dabf7",
        accentBg: "rgba(59,91,219,0.15)",
        inputBg: "#161b27",
        tableHead: "#0a0e17",
        navActive: "linear-gradient(135deg,rgba(59,91,219,0.4),rgba(103,65,217,0.3))",
        navHover: "rgba(255,255,255,0.05)",
        rowHover: "rgba(255,255,255,0.03)",
        iconBox: "rgba(255,255,255,0.05)",
        shadow: "rgba(0,0,0,0.4)"
    },
    light: {
        bg: "#f1f5f9",
        surface: "#ffffff",
        surface2: "#f8fafc",
        border: "#e2e8f0",
        text: "#0f172a",
        textSub: "#1e293b",
        textMuted: "#64748b",
        textFaint: "#94a3b8",
        accent: "#2563eb",
        accentBg: "rgba(37,99,235,0.08)",
        inputBg: "#f1f5f9",
        tableHead: "#f8fafc",
        navActive: "linear-gradient(135deg,rgba(37,99,235,0.15),rgba(99,60,200,0.1))",
        navHover: "rgba(0,0,0,0.04)",
        rowHover: "rgba(0,0,0,0.02)",
        iconBox: "rgba(0,0,0,0.05)",
        shadow: "rgba(0,0,0,0.1)"
    }
};
}),
"[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/Desktop/Super_Admin_Soft7/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1345564d._.js.map
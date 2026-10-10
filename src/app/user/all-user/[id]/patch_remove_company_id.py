FILE = r"e:\111\Super_Admin_Soft7\src\app\user\all-user\[id]\page.tsx"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

target_str = """                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <strong style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Company ID</strong>
                      <span style={{ fontSize: "12.5px", color: "var(--title-color)", fontFamily: "monospace", wordBreak: "break-all", background: "var(--surf2)", padding: "2px 6px", borderRadius: "4px" }}>
                        {user.companyId || user.company || "—"}
                      </span>
                    </div>"""

if target_str in content:
    content = content.replace(target_str, "")
    with open(FILE, "w", encoding="utf-8") as f:
        f.write(content)
    print("Company ID removed successfully.")
else:
    print("Target string not found.")

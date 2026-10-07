FILE = r"e:\111\Super_Admin_Soft7\src\app\user\all-user\[id]\page.tsx"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# Add totalActivities field to interface
content = content.replace(
    "  templates: number;\n}",
    "  templates: number;\n  totalActivities: number;\n}",
    1
)

# Add to DEFAULT_STATS
content = content.replace(
    "  templates: 0,\n};",
    "  templates: 0,\n  totalActivities: 0,\n};",
    1
)

with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("[OK] Added totalActivities to interface and defaults")

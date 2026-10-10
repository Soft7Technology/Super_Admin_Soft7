import codecs

FILE = r"e:\111\Super_Admin_Soft7\src\app\user\all-user\[id]\page.tsx"

with codecs.open(FILE, "r", "utf-8") as f:
    content = f.read()

# Fix 1: store activityTotal from pagination
old_activity_fetch = """        // ── Activity ─────────────────────────────────────────────
        if (activityRes.status === "fulfilled") {
          // Structure: { data: { data: { items: [], pagination: { total: N } } } }
          const inner = activityRes.value.data?.data ?? {};
          const arr = Array.isArray(inner.items) ? inner.items : [];
          setActivityData(arr);
        } else {
          console.warn("[activity] failed:", activityRes.reason);
        }"""

new_activity_fetch = """        // ── Activity ─────────────────────────────────────────────
        if (activityRes.status === "fulfilled") {
          // Structure: { data: { data: { items: [], pagination: { total: N } } } }
          const inner = activityRes.value.data?.data ?? {};
          const arr = Array.isArray(inner.items) ? inner.items : [];
          const actTotal = Number(inner.pagination?.total ?? arr.length);
          setActivityData(arr);
          setStats(prev => ({ ...prev, totalActivities: actTotal }));
        } else {
          console.warn("[activity] failed:", activityRes.reason);
        }"""

content = content.replace(old_activity_fetch, new_activity_fetch)

# Fix 2: Replace hardcoded "1608+" with dynamic stat
old_count_display = 'activityData.length > 0 ? "1608+" : "0"'
new_count_display = 'stats.totalActivities > 0 ? String(stats.totalActivities) : "0"'
content = content.replace(old_count_display, new_count_display)

# Fix 3: Replace View All (1608+) button label with dynamic count
old_label = "View All (1608+)"
new_label = "View All ({stats.totalActivities || activityData.length})"
content = content.replace(old_label, new_label)

with codecs.open(FILE, "w", "utf-8") as f:
    f.write(content)

print("[OK] Activity total is now dynamic!")

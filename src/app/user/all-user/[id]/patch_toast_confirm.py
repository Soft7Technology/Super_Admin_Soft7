FILE = r"e:\111\Super_Admin_Soft7\src\app\user\all-user\[id]\page.tsx"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# Remove window.confirm for Suspend - direct call with toast
old_suspend = """      onClick: () => {
        if (window.confirm(`Are you sure you want to suspend ${user?.name}?`)) {
          updateUserData({ status: "SUSPENDED" }, "User suspended successfully");
        }
      },"""

new_suspend = """      onClick: () => {
        const toastId = toast.info(
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>Suspend User?</div>
            <div style={{ fontSize: "13px", color: "#475569" }}>
              Are you sure you want to suspend <strong>{user?.name}</strong>?
            </div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                onClick={() => { toast.dismiss(toastId); updateUserData({ status: "SUSPENDED" }, "User suspended successfully"); }}
                style={{ padding: "5px 14px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}
              >
                Yes, Suspend
              </button>
              <button
                onClick={() => toast.dismiss(toastId)}
                style={{ padding: "5px 14px", background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}
              >
                Cancel
              </button>
            </div>
          </div>,
          { autoClose: false, closeButton: false, draggable: false, closeOnClick: false }
        );
      },"""

content = content.replace(old_suspend, new_suspend)

# Remove window.confirm for Activate - direct call with toast
old_activate = """      onClick: () => {
        if (window.confirm(`Are you sure you want to activate ${user?.name}?`)) {
          updateUserData({ status: "ACTIVE" }, "User activated successfully");
        }
      },"""

new_activate = """      onClick: () => {
        const toastId = toast.info(
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>Activate User?</div>
            <div style={{ fontSize: "13px", color: "#475569" }}>
              Are you sure you want to activate <strong>{user?.name}</strong>?
            </div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                onClick={() => { toast.dismiss(toastId); updateUserData({ status: "ACTIVE" }, "User activated successfully"); }}
                style={{ padding: "5px 14px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}
              >
                Yes, Activate
              </button>
              <button
                onClick={() => toast.dismiss(toastId)}
                style={{ padding: "5px 14px", background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}
              >
                Cancel
              </button>
            </div>
          </div>,
          { autoClose: false, closeButton: false, draggable: false, closeOnClick: false }
        );
      },"""

content = content.replace(old_activate, new_activate)

# Also update the updateUserData function to use better toast messages with icons
old_toast_success = "      toast.success(successMsg);"
new_toast_success = """      toast.success(successMsg, {
        position: "top-right",
        autoClose: 3000,
        icon: "✅",
      });"""

content = content.replace(old_toast_success, new_toast_success)

old_toast_error = '      toast.error(err?.message || "Operation failed");'
new_toast_error = """      toast.error(err?.response?.data?.message || err?.message || "Operation failed", {
        position: "top-right",
        autoClose: 4000,
        icon: "❌",
      });"""

content = content.replace(old_toast_error, new_toast_error)

with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("[OK] Toast confirmations added for Suspend, Activate, and better toast for Plan/Reset!")

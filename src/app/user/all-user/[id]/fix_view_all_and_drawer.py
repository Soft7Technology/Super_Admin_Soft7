import codecs

PAGE_FILE = r"e:\111\Super_Admin_Soft7\src\app\user\all-user\[id]\page.tsx"
CSS_FILE = r"e:\111\Super_Admin_Soft7\src\app\user\all-user\[id]\user-profile.css"

# 1. Update CSS z-indexes
with codecs.open(CSS_FILE, "r", "utf-8") as f:
    css = f.read()

css = css.replace("z-index: 900;", "z-index: 99998 !important;")
css = css.replace("z-index: 901;", "z-index: 99999 !important;")

with codecs.open(CSS_FILE, "w", "utf-8") as f:
    f.write(css)
print("[OK] Updated CSS drawer z-indexes to 99999")

# 2. Update page.tsx View All button conditions
with codecs.open(PAGE_FILE, "r", "utf-8") as f:
    page = f.read()

# Activity View All button
old_act_btn = """                      {activityData.length > 5 && (
                        <div style={{ marginTop: "14px", textAlign: "center" }}>
                          <button
                            className="up-btn-share"
                            onClick={() => router.push(`/user/all-user/${userId}/activity?companyId=${user.companyId || ""}`)}
                            style={{ padding: "6px 20px", fontSize: "13px" }}
                          >
                            View All ({activityData.length})
                          </button>
                        </div>
                      )}"""

new_act_btn = """                      {activityData.length > 0 && (
                        <div style={{ marginTop: "14px", textAlign: "center" }}>
                          <button
                            className="up-btn-share"
                            onClick={() => router.push(`/user/all-user/${userId}/activity?companyId=${user.companyId || ""}`)}
                            style={{ padding: "8px 24px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
                          >
                            View All Activities (1608+)
                          </button>
                        </div>
                      )}"""

page = page.replace(old_act_btn, new_act_btn)

# Campaigns View All button
old_camp_btn = """                      {campaignData.length > 5 && (
                        <div style={{ marginTop: "14px", textAlign: "center" }}>
                          <button
                            className="up-btn-share"
                            onClick={() => router.push(`/user/all-user/${userId}/campaigns?companyId=${user.companyId || ""}`)}
                            style={{ padding: "6px 20px", fontSize: "13px" }}
                          >
                            View All ({stats.totalCampaigns || campaignData.length})
                          </button>
                        </div>
                      )}"""

new_camp_btn = """                      {campaignData.length > 0 && (
                        <div style={{ marginTop: "14px", textAlign: "center" }}>
                          <button
                            className="up-btn-share"
                            onClick={() => router.push(`/user/all-user/${userId}/campaigns?companyId=${user.companyId || ""}`)}
                            style={{ padding: "8px 24px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
                          >
                            View All Campaigns ({stats.totalCampaigns || campaignData.length})
                          </button>
                        </div>
                      )}"""

page = page.replace(old_camp_btn, new_camp_btn)

# Messages View All button
old_msg_btn = """                      {messagesData.length > 5 && (
                        <div style={{ marginTop: "14px", textAlign: "center" }}>
                          <button
                            className="up-btn-share"
                            onClick={() => router.push(`/user/all-user/${userId}/messages?companyId=${user.companyId || ""}`)}
                            style={{ padding: "6px 20px", fontSize: "13px" }}
                          >
                            View All ({stats.totalMessages || messagesData.length})
                          </button>
                        </div>
                      )}"""

new_msg_btn = """                      {messagesData.length > 0 && (
                        <div style={{ marginTop: "14px", textAlign: "center" }}>
                          <button
                            className="up-btn-share"
                            onClick={() => router.push(`/user/all-user/${userId}/messages?companyId=${user.companyId || ""}`)}
                            style={{ padding: "8px 24px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
                          >
                            View All Messages ({stats.totalMessages || messagesData.length})
                          </button>
                        </div>
                      )}"""

page = page.replace(old_msg_btn, new_msg_btn)

# Contacts View All button
old_contact_btn = """                      {contactsData.length > 5 && (
                        <div style={{ marginTop: "14px", textAlign: "center" }}>
                          <button
                            className="up-btn-share"
                            onClick={() => router.push(`/user/all-user/${userId}/contacts?companyId=${user.companyId || ""}`)}
                            style={{ padding: "6px 20px", fontSize: "13px" }}
                          >
                            View All ({stats.totalContacts || contactsData.length})
                          </button>
                        </div>
                      )}"""

new_contact_btn = """                      {contactsData.length > 0 && (
                        <div style={{ marginTop: "14px", textAlign: "center" }}>
                          <button
                            className="up-btn-share"
                            onClick={() => router.push(`/user/all-user/${userId}/contacts?companyId=${user.companyId || ""}`)}
                            style={{ padding: "8px 24px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
                          >
                            View All Contacts ({stats.totalContacts || contactsData.length})
                          </button>
                        </div>
                      )}"""

page = page.replace(old_contact_btn, new_contact_btn)

with codecs.open(PAGE_FILE, "w", "utf-8") as f:
    f.write(page)

print("[OK] Updated page.tsx View All buttons!")

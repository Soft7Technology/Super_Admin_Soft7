import codecs

FILE = r"e:\111\Super_Admin_Soft7\src\app\user\all-user\[id]\page.tsx"

with codecs.open(FILE, "r", "utf-8") as f:
    content = f.read()

# 1. Map to just slice(0, 5)
content = content.replace(
    "(showAllActivities ? activityData : activityData.slice(0, 5))",
    "activityData.slice(0, 5)"
)

content = content.replace(
    "(showAllCampaigns ? campaignData : campaignData.slice(0, 5))",
    "campaignData.slice(0, 5)"
)

# 2. Activity View All
old_act_btn = """                      {!showAllActivities && activityData.length > 8 && (
                        <div style={{ marginTop: "14px", textAlign: "center" }}>
                          <button className="up-btn-share" onClick={() => setShowAllActivities(true)} style={{ padding: "6px 20px", fontSize: "13px" }}>
                            View All ({activityData.length})
                          </button>
                        </div>
                      )}"""

new_act_btn = """                      {activityData.length > 5 && (
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

content = content.replace(old_act_btn, new_act_btn)

# 3. Campaign View All
old_camp_btn = """                      {!showAllCampaigns && campaignData.length > 6 && (
                        <div style={{ marginTop: "14px", textAlign: "center" }}>
                          <button className="up-btn-share" onClick={() => setShowAllCampaigns(true)} style={{ padding: "6px 20px", fontSize: "13px" }}>
                            View All ({campaignData.length})
                          </button>
                        </div>
                      )}"""

new_camp_btn = """                      {campaignData.length > 5 && (
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

content = content.replace(old_camp_btn, new_camp_btn)

# 4. Message View All
old_msg_btn = """                      {messagesData.length > 8 && (
                        <div style={{ marginTop: "14px", textAlign: "center" }}>
                          <button className="up-btn-share" style={{ padding: "6px 20px", fontSize: "13px" }}>
                            View All ({stats.totalMessages})
                          </button>
                        </div>
                      )}"""

new_msg_btn = """                      {messagesData.length > 5 && (
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

content = content.replace(old_msg_btn, new_msg_btn)

# 5. Contact View All
old_contact_btn = """                      {contactsData.length > 5 && (
                        <div style={{ marginTop: "14px", textAlign: "center" }}>
                          <button className="up-btn-share" style={{ padding: "6px 20px", fontSize: "13px" }}>
                            View All ({stats.totalContacts})
                          </button>
                        </div>
                      )}"""

new_contact_btn = """                      {contactsData.length > 5 && (
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

content = content.replace(old_contact_btn, new_contact_btn)

with codecs.open(FILE, "w", "utf-8") as f:
    f.write(content)

print("[OK] Updated all 4 View All buttons to route to dedicated pages!")

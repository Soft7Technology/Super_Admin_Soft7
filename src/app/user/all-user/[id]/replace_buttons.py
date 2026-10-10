import codecs

FILE = r"e:\111\Super_Admin_Soft7\src\app\user\all-user\[id]\page.tsx"

with codecs.open(FILE, "r", "utf-8") as f:
    lines = f.readlines()

# 1. Fix Activity map and View All
for i, line in enumerate(lines):
    if "(showAllActivities ? activityData : activityData.slice(0, 5))" in line:
        lines[i] = line.replace("(showAllActivities ? activityData : activityData.slice(0, 5))", "activityData.slice(0, 5)")
        print(f"Fixed Activity map at line {i}")
        break

for i in range(860, min(len(lines), 900)):
    if "{!showAllActivities &&" in lines[i]:
        # replace the whole block until the closing `)}`
        end_j = i
        for j in range(i, i+10):
            if lines[j].strip() == ")}":
                end_j = j
                break
        new_block = [
            '                      <div style={{ marginTop: "14px", textAlign: "center" }}>\n',
            '                        <button\n',
            '                          className="up-btn-share"\n',
            '                          onClick={() => router.push(`/user/all-user/${userId}/activity?companyId=${user.companyId || ""}`)}\n',
            '                          style={{ padding: "6px 20px", fontSize: "13px", cursor: "pointer" }}\n',
            '                        >\n',
            '                          View All (1608+)\n',
            '                        </button>\n',
            '                      </div>\n'
        ]
        lines[i:end_j+1] = new_block
        print(f"Fixed Activity View All button at lines {i}-{end_j}")
        break

# 2. Fix Campaigns map and View All
for i, line in enumerate(lines):
    if "(showAllCampaigns ? campaignData : campaignData.slice(0, 5))" in line:
        lines[i] = line.replace("(showAllCampaigns ? campaignData : campaignData.slice(0, 5))", "campaignData.slice(0, 5)")
        print(f"Fixed Campaigns map at line {i}")
        break

for i in range(990, min(len(lines), 1050)):
    if "{!showAllCampaigns &&" in lines[i]:
        end_j = i
        for j in range(i, i+10):
            if lines[j].strip() == ")}":
                end_j = j
                break
        new_block = [
            '                      <div style={{ marginTop: "14px", textAlign: "center" }}>\n',
            '                        <button\n',
            '                          className="up-btn-share"\n',
            '                          onClick={() => router.push(`/user/all-user/${userId}/campaigns?companyId=${user.companyId || ""}`)}\n',
            '                          style={{ padding: "6px 20px", fontSize: "13px", cursor: "pointer" }}\n',
            '                        >\n',
            '                          View All ({stats.totalCampaigns || campaignData.length})\n',
            '                        </button>\n',
            '                      </div>\n'
        ]
        lines[i:end_j+1] = new_block
        print(f"Fixed Campaigns View All button at lines {i}-{end_j}")
        break

# 3. Fix Messages View All
for i in range(1340, min(len(lines), 1410)):
    if "messagesData.length > 8 && (" in lines[i] or "messagesData.length > 5 && (" in lines[i]:
        end_j = i
        for j in range(i, i+10):
            if lines[j].strip() == ")}":
                end_j = j
                break
        new_block = [
            '                      <div style={{ marginTop: "14px", textAlign: "center" }}>\n',
            '                        <button\n',
            '                          className="up-btn-share"\n',
            '                          onClick={() => router.push(`/user/all-user/${userId}/messages?companyId=${user.companyId || ""}`)}\n',
            '                          style={{ padding: "6px 20px", fontSize: "13px", cursor: "pointer" }}\n',
            '                        >\n',
            '                          View All ({stats.totalMessages || messagesData.length})\n',
            '                        </button>\n',
            '                      </div>\n'
        ]
        lines[i:end_j+1] = new_block
        print(f"Fixed Messages View All button at lines {i}-{end_j}")
        break

# 4. Fix Contacts View All
for i in range(1550, min(len(lines), 1620)):
    if "contactsData.length > 5 && (" in lines[i]:
        end_j = i
        for j in range(i, i+10):
            if lines[j].strip() == ")}":
                end_j = j
                break
        new_block = [
            '                      <div style={{ marginTop: "14px", textAlign: "center" }}>\n',
            '                        <button\n',
            '                          className="up-btn-share"\n',
            '                          onClick={() => router.push(`/user/all-user/${userId}/contacts?companyId=${user.companyId || ""}`)}\n',
            '                          style={{ padding: "6px 20px", fontSize: "13px", cursor: "pointer" }}\n',
            '                        >\n',
            '                          View All ({stats.totalContacts || contactsData.length})\n',
            '                        </button>\n',
            '                      </div>\n'
        ]
        lines[i:end_j+1] = new_block
        print(f"Fixed Contacts View All button at lines {i}-{end_j}")
        break

with codecs.open(FILE, "w", "utf-8") as f:
    f.writelines(lines)

print("[DONE] All 4 buttons replaced with router.push redirects!")

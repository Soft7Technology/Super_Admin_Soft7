/** Frontend-only search index for the Topbar (moved verbatim from the original
 *  SuperAdmin Topbar). Filtered locally by title / subtitle — no API call. */
export interface SearchEntry {
  title: string;
  subtitle: string;
  route: string;
}

export const SEARCH_DIRECTORY: SearchEntry[] = [
  { title: "aakanksha acer", subtitle: "aakanksha_acer@gmail.com · +915749383939", route: "/user/all-user" },
  { title: "aakanksha mam", subtitle: "aakankshapatil366@gmail.com · 9890756103", route: "/user/all-user" },
  { title: "ayush", subtitle: "ayush_acer@gmail.com · +91958493839", route: "/user/all-user" },
  { title: "fdsh", subtitle: "stgs@gmail.com · +914646232115", route: "/user/all-user" },
  { title: "tech", subtitle: "techUser@gmail.com · +919372972927", route: "/user/all-user" },
  { title: "Dashboard", subtitle: "Page", route: "/user/dashboard" },
  { title: "Manage Companies", subtitle: "Page", route: "/user/manage-companies" },
  { title: "All User", subtitle: "Page", route: "/user/all-user" },
  { title: "Audit Logs", subtitle: "Page", route: "/user/audit-logs" },
  { title: "System", subtitle: "Page", route: "/user/system" },
  { title: "Profile", subtitle: "Page", route: "/user/profile" },
  { title: "Support Tickets", subtitle: "Page", route: "/user/support-tickets" },
  { title: "Permissions", subtitle: "Page", route: "/user/permissions" },
  { title: "Transactions", subtitle: "Page", route: "/user/transactions" },
];

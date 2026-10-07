const fs = require('fs');
let code = fs.readFileSync('src/app/user/all-user/page.tsx', 'utf8');

code = code.replace(
  /<div className="au-foot au-desktop-only">\s*<div>\s*Showing <b>\{Math\.min/g,
  `<div className="au-foot au-desktop-only">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <div>
                  Showing <b>{Math.min`
);

fs.writeFileSync('src/app/user/all-user/page.tsx', code);

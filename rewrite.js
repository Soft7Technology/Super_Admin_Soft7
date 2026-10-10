const fs = require('fs');
let code = fs.readFileSync('src/app/user/all-user/page.tsx', 'utf8');

const tableStartMatch = code.match(/<div className="au-table-wrapper au-desktop-only">/);
const tableEndMatch = code.match(/\s+\{\/\* Mobile Cards View \(<= 768px\) \*\/\}/);

if (!tableStartMatch || !tableEndMatch) {
  console.log('Could not find block boundaries');
  process.exit(1);
}

const tableBlockStart = tableStartMatch.index;
const tableBlockEnd = tableEndMatch.index;

const newTableBlock = `
          <div className="au-tbl au-tbl-scroll au-desktop-only">
            <div className="au-th">
              <div>
                <input type="checkbox" checked={sortedUsers.length > 0 && selectedUsers.length === sortedUsers.length} onChange={handleSelectAll} />
              </div>
              <div>USER</div>
              <div>EMAIL</div>
              <div>PHONE</div>
              <div>ROLE</div>
              <div>PLAN</div>
              <div>STATUS</div>
              <div>ACTIONS</div>
            </div>
            
            {loading ? (
               <div style={{ padding: '32px 0', textAlign: 'center' }}>
                 <Spinner variant="center" size="lg" color="primary" text="Loading users..." />
               </div>
            ) : sortedUsers.length === 0 ? (
               <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--muted)' }}>
                 No users match your filters
               </div>
            ) : (
              sortedUsers.map(user => (
                <div className="au-row" key={user.id}>
                  <div>
                    <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => handleSelectUser(user.id)} />
                  </div>
                  
                  <div className="au-usr">
                    <Link href={\`/user/all-user/\${user.id}\`} onClick={() => { try { sessionStorage.setItem(\`user_\${user.id}\`, JSON.stringify(user)); sessionStorage.setItem("sa_selected_user", JSON.stringify(user)); } catch {} }} className="au-av" style={{ background: !user.av || user.av === '#10b981' || user.av === '#00a67d' ? 'var(--crm-primary, #206bc4)' : user.av }}>
                      {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </Link>
                    <Link href={\`/user/all-user/\${user.id}\`} onClick={() => { try { sessionStorage.setItem(\`user_\${user.id}\`, JSON.stringify(user)); sessionStorage.setItem("sa_selected_user", JSON.stringify(user)); } catch {} }} className="au-un">
                      {user.name}
                    </Link>
                  </div>
                  
                  <div className="au-cell-muted">{user.email}</div>
                  <div className="au-cell-muted">{user.phone || "-"}</div>
                  
                  <div>
                    <span className="au-badge-role" style={{ color: roleColor(user.role) }}>{user.role}</span>
                  </div>
                  
                  <div>
                    <span className="au-badge-plan"><Award size={14} color={planColor(user.plan)} /> {user.plan}</span>
                  </div>
                  
                  <div>
                    <Badge status={user.status} />
                  </div>
                  
                  <div className="au-action-group">
                    <button className="au-action-btn" title="View Details" onClick={() => setDetail(user)}><Eye size={15} /></button>
                    <button className="au-action-btn au-action-btn--edit" title="Edit User" onClick={() => setEditUser(user)}><Pencil size={15} /></button>
                    <button className="au-action-btn au-action-btn--key" title="Reset Password" onClick={() => setPasswordUser(user)}><KeyRound size={15} /></button>
                    {user.status === "SUSPENDED" ? (
                      <button className="au-action-btn au-action-btn--restore" title="Restore Account" disabled={suspendingId === user.id} onClick={() => handleSuspendToggle(user)}><ShieldCheck size={15} /></button>
                    ) : (
                      <button className="au-action-btn au-action-btn--suspend" title="Suspend User" disabled={suspendingId === user.id} onClick={() => handleSuspendToggle(user)}><ShieldOff size={15} /></button>
                    )}
                    <button className="au-action-btn au-action-btn--delete" title="Delete User" disabled={deletingId === user.id} onClick={() => handleDeleteUser(user)}><Trash2 size={15} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
`;

code = code.substring(0, tableBlockStart) + newTableBlock + code.substring(tableBlockEnd);

const paginationStartMatch = code.match(/<div className="au-pagination">/);
if (paginationStartMatch) {
  const paginationStart = paginationStartMatch.index;
  const paginationEnd = code.indexOf('</div>', code.indexOf('</div>', paginationStart) + 1) + 6;

  const newPagination = `
          {/* Pagination */}
          <div className="au-foot au-desktop-only">
            <div>
              Showing <b>{Math.min((currentPage - 1) * rowsPerPage + 1, pagination?.total || users.length)}-{Math.min(currentPage * rowsPerPage, pagination?.total || users.length)}</b> of <b>{pagination?.total || users.length}</b> users
            </div>
            
            <div className="au-pg">
              <button className="text-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1).map((p, i, arr) => (
                <span key={p} style={{display: 'flex', alignItems: 'center'}}>
                  {i > 0 && arr[i - 1] !== p - 1 && <span style={{margin: '0 4px', color: 'var(--muted)'}}>...</span>}
                  <button className={\`num-btn \${currentPage === p ? 'on' : ''}\`} onClick={() => setCurrentPage(p)}>{p}</button>
                </span>
              ))}
              
              <button className="text-btn" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
            </div>
          </div>`;

  code = code.substring(0, paginationStart) + newPagination + code.substring(paginationEnd);
}

fs.writeFileSync('src/app/user/all-user/page.tsx', code);
console.log('Script executed successfully!');

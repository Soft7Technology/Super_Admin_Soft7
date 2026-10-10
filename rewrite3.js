const fs = require('fs');
let code = fs.readFileSync('src/app/user/all-user/page.tsx', 'utf8');

code = code.replace(
  /users\.length\}<\/b> users\s*<\/div>/,
  `users.length}</b> users
              </div>
            </div>`
);

fs.writeFileSync('src/app/user/all-user/page.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/pages/ConsultantDashboard.tsx', 'utf-8');

const target = `        const createRes = await fetch('/api/create-connect-account', { method: 'POST' });
        const createData = await createRes.json();
        accountId = createData.accountId;`;

const replacement = `        const createRes = await fetch('/api/create-connect-account', { method: 'POST' });
        const createData = await createRes.json();
        
        if (createData.error) {
          throw new Error(createData.error);
        }
        
        accountId = createData.accountId;`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/ConsultantDashboard.tsx', code);
  console.log("Patched ConsultantDashboard.tsx successfully.");
} else {
  console.log("Target not found");
}

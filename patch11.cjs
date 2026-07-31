const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

code = code.replace(
  "const leadsData = leadsSnap.docs.map(d => ({ id: d.id, ...d.data() }));",
  "const leadsData: any[] = leadsSnap.docs.map(d => ({ id: d.id, ...d.data() }));"
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);

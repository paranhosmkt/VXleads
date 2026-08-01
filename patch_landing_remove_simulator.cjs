const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

const regex = /function PartnerSimulator\(\) \{[\s\S]*?\n\}\n\n/;
code = code.replace(regex, '');

fs.writeFileSync('src/pages/Landing.tsx', code);

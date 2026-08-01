const fs = require('fs');
let code = fs.readFileSync('src/pages/TVMode.tsx', 'utf8');

code = code.replace(/const \[planType, setPlanType\] = useState\('Starter'\);\n/g, '');
code = code.replace(/setPlanType\(data\.planType \|\| 'Starter'\);\n/g, '');

fs.writeFileSync('src/pages/TVMode.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

code = code.replace(/<a href={isAnnual \? /g, '<a target="_blank" rel="noopener noreferrer" href={isAnnual ? ');

fs.writeFileSync('src/pages/Landing.tsx', code);
console.log("Patched targets");

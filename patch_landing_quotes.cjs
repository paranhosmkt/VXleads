const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

code = code.replace(/"Dispositivos simultâneos ilimitados"/g, 'Dispositivos simultâneos ilimitados');

fs.writeFileSync('src/pages/Landing.tsx', code);

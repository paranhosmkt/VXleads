const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

code = code.replace(
  '{isAnnual ? "1 dispositivo (Totem/Tablet/smartphone) por evento" : "1 Dispositivo (Totem/Tablet)"}',
  '"Dispositivos simultâneos ilimitados"'
);

fs.writeFileSync('src/pages/Landing.tsx', code);

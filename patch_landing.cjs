const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

code = code.replace(
  '{isAnnual ? "Até 10 dispositivos conectados por evento" : "Até 10 dispositivos conectados"}',
  '"Dispositivos simultâneos ilimitados"'
);

code = code.replace(
  '{isAnnual ? "Até 1.000 dispositivos simultâneos por evento" : "Até 50 dispositivos conectados"}',
  '"Dispositivos simultâneos ilimitados"'
);

code = code.replace(
  '"Dispositivos personalizados"',
  '"Dispositivos simultâneos ilimitados"'
);

fs.writeFileSync('src/pages/Landing.tsx', code);

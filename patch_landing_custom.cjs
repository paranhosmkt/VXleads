const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

code = code.replace(
  '<span className="text-gray-300">Dispositivos personalizados</span>',
  '<span className="text-gray-300">Dispositivos simultâneos ilimitados</span>'
);

fs.writeFileSync('src/pages/Landing.tsx', code);

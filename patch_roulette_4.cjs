const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf8');

code = code.replace(
  '<p className="text-gray-500 font-medium">Gerando seu código...</p>',
  '<p className="text-gray-500 font-medium">Registrando prêmio...</p>'
);

fs.writeFileSync('src/pages/Roulette.tsx', code);

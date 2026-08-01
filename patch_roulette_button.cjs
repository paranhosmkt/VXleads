const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf8');

code = code.replace(
  'Realizar Novo Cadastro',
  'Retirar brinde'
);

fs.writeFileSync('src/pages/Roulette.tsx', code);

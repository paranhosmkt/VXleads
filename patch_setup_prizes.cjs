const fs = require('fs');
let code = fs.readFileSync('src/pages/SetupPrizes.tsx', 'utf8');

code = code.replace(
  /placeholder="Ex: Copo Personalizado"/g,
  'placeholder="Digite o nome do brinde aqui"'
);
code = code.replace(
  /placeholder="Ex: 100"/g,
  'placeholder="0"'
);

fs.writeFileSync('src/pages/SetupPrizes.tsx', code);

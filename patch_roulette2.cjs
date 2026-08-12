const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf-8');

code = code.replace(
  "prize: preSelectedPrize.nome,",
  "prize: preSelectedPrize.nome,\n        prizeId: preSelectedPrize.id || null,"
);

fs.writeFileSync('src/pages/Roulette.tsx', code);
console.log("Patched Roulette.tsx for prizeId");

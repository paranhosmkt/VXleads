const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf8');

// fix share button logic
code = code.replace(
  "{isOwner && planType !== 'Starter' && (",
  "{isOwner && ("
);

fs.writeFileSync('src/pages/Roulette.tsx', code);

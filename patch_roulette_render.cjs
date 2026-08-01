const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf8');

code = code.replace(
  /let lines = \[prize\.nome\];/g,
  "let lines = [prize.nome || 'Aguardando'];"
);

code = code.replace(
  /if \(prize\.nome\.length > maxLen\) \{/g,
  "if ((prize.nome || 'Aguardando').length > maxLen) {"
);

code = code.replace(
  /const words = prize\.nome\.split\(' '\);/g,
  "const words = (prize.nome || 'Aguardando').split(' ');"
);

fs.writeFileSync('src/pages/Roulette.tsx', code);

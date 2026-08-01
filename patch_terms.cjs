const fs = require('fs');
let code = fs.readFileSync('src/pages/TermsOfUse.tsx', 'utf8');

code = code.replace(
  '(quantidade de leads e dispositivos simultâneos)',
  '(quantidade de leads da cota escolhida)'
);

code = code.replace(
  'Refere-se ao número de telas que podem acessar o sistema simultaneamente usando o mesmo link de captação.',
  'Atualmente, todos os planos permitem o uso de dispositivos simultâneos ilimitados, de modo que você pode acessar o mesmo link de captação em quantas telas ou celulares quiser ao mesmo tempo.'
);

fs.writeFileSync('src/pages/TermsOfUse.tsx', code);

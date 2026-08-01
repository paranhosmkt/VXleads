const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf8');

code = code.replace(
  'if (!character) setCharacter(AVAILABLE_CHARACTERS[0]);',
  '// removed'
);

fs.writeFileSync('src/pages/Roulette.tsx', code);

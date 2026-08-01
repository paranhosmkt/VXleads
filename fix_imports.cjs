const fs = require('fs');

function addTargetImport(filename) {
  let code = fs.readFileSync(filename, 'utf8');
  if (!code.includes('Target,') && !code.includes(', Target')) {
    code = code.replace("from 'lucide-react';", ", Target } from 'lucide-react';");
    code = code.replace("} , Target", ", Target }"); // Just in case
    fs.writeFileSync(filename, code);
  }
}

addTargetImport('src/pages/SelectCharacter.tsx');
addTargetImport('src/pages/SetupPrizes.tsx');

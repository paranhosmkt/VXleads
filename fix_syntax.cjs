const fs = require('fs');

function fixImport(filename) {
  let code = fs.readFileSync(filename, 'utf8');
  code = code.replace("User , Target } } from 'lucide-react';", "User, Target } from 'lucide-react';");
  code = code.replace("Gift , Target } } from 'lucide-react';", "Gift, Target } from 'lucide-react';");
  fs.writeFileSync(filename, code);
}

fixImport('src/pages/SelectCharacter.tsx');
fixImport('src/pages/SetupPrizes.tsx');

const fs = require('fs');
let code = fs.readFileSync('src/pages/SetupPrizes.tsx', 'utf8');

code = code.replace(
  /placeholder="Digite o nome do brinde aqui"/g,
  'placeholder="Nome do Brinde"'
);

// Ensure text color is black and placeholder is gray
code = code.replace(
  /className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"/g,
  'className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"'
);

fs.writeFileSync('src/pages/SetupPrizes.tsx', code);

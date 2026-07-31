const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

code = code.replace(
  'const plans = {\n    Starter: 497,\n    Pro: 997,\n    Enterprise: 2497\n  };',
  'const plans = {\n    Starter: 797,\n    Pro: 1297,\n    Enterprise: 3597\n  };'
);

code = code.replace(
  '<span className="text-4xl font-extrabold text-gray-900">R$ 497</span>',
  '<span className="text-4xl font-extrabold text-gray-900">R$ 797</span>'
);

code = code.replace(
  '<span className="text-4xl font-extrabold text-gray-900">R$ 997</span>',
  '<span className="text-4xl font-extrabold text-gray-900">R$ 1.297</span>'
);

code = code.replace(
  '<span className="text-4xl font-extrabold text-gray-900">R$ 2.497</span>',
  '<span className="text-4xl font-extrabold text-gray-900">R$ 3.597</span>'
);

fs.writeFileSync('src/pages/Landing.tsx', code);

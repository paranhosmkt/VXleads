const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf-8');

// Starter
code = code.replace(
  /<span className="text-sm text-gray-400 line-through font-normal">\{formatPrice\(797\)\}<\/span>/g,
  '<span className="text-sm text-gray-400 line-through font-normal">{formatPrice(selectedCycle === \'annual\' ? 4997 : 797)}</span>'
);
code = code.replace(
  /<span className="text-emerald-600">\{formatPrice\(calculatePrice\(797\)\)\} <span className="text-sm font-medium text-gray-500">\/evento<\/span><\/span>/g,
  '<span className="text-emerald-600">{formatPrice(calculatePrice(selectedCycle === \'annual\' ? 4997 : 797))} <span className="text-sm font-medium text-gray-500">{selectedCycle === \'annual\' ? \'/ano\' : \'/evento\'}</span></span>'
);
code = code.replace(
  /<>\{formatPrice\(797\)\} <span className="text-sm font-medium text-gray-500">\/evento<\/span><\/>/g,
  '<>{formatPrice(selectedCycle === \'annual\' ? 4997 : 797)} <span className="text-sm font-medium text-gray-500">{selectedCycle === \'annual\' ? \'/ano\' : \'/evento\'}</span></>'
);

// Pro
code = code.replace(
  /<span className="text-sm text-gray-400 line-through font-normal">\{formatPrice\(1497\)\}<\/span>/g,
  '<span className="text-sm text-gray-400 line-through font-normal">{formatPrice(selectedCycle === \'annual\' ? 8997 : 1497)}</span>'
);
code = code.replace(
  /<span className="text-emerald-600">\{formatPrice\(calculatePrice\(1497\)\)\} <span className="text-sm font-medium text-gray-500">\/evento<\/span><\/span>/g,
  '<span className="text-emerald-600">{formatPrice(calculatePrice(selectedCycle === \'annual\' ? 8997 : 1497))} <span className="text-sm font-medium text-gray-500">{selectedCycle === \'annual\' ? \'/ano\' : \'/evento\'}</span></span>'
);
code = code.replace(
  /<>\{formatPrice\(1497\)\} <span className="text-sm font-medium text-gray-500">\/evento<\/span><\/>/g,
  '<>{formatPrice(selectedCycle === \'annual\' ? 8997 : 1497)} <span className="text-sm font-medium text-gray-500">{selectedCycle === \'annual\' ? \'/ano\' : \'/evento\'}</span></>'
);

// Enterprise
code = code.replace(
  /<span className="text-sm text-gray-400 line-through font-normal">\{formatPrice\(2997\)\}<\/span>/g,
  '<span className="text-sm text-gray-400 line-through font-normal">{formatPrice(selectedCycle === \'annual\' ? 24997 : 2997)}</span>'
);
code = code.replace(
  /<span className="text-emerald-600">\{formatPrice\(calculatePrice\(2997\)\)\} <span className="text-sm font-medium text-gray-500">\/evento<\/span><\/span>/g,
  '<span className="text-emerald-600">{formatPrice(calculatePrice(selectedCycle === \'annual\' ? 24997 : 2997))} <span className="text-sm font-medium text-gray-500">{selectedCycle === \'annual\' ? \'/ano\' : \'/evento\'}</span></span>'
);
code = code.replace(
  /<>\{formatPrice\(2997\)\} <span className="text-sm font-medium text-gray-500">\/evento<\/span><\/>/g,
  '<>{formatPrice(selectedCycle === \'annual\' ? 24997 : 2997)} <span className="text-sm font-medium text-gray-500">{selectedCycle === \'annual\' ? \'/ano\' : \'/evento\'}</span></>'
);

// Also update the checkout fetch body
code = code.replace(
  /body: JSON\.stringify\(\{\n\s*plan: selectedPlan,\n\s*lang: localStorage\.getItem\('i18nextLng'\) \|\| 'pt'\n\s*\}\)/,
  "body: JSON.stringify({\n              plan: selectedPlan,\n              cycle: selectedCycle,\n              lang: localStorage.getItem('i18nextLng') || 'pt'\n            })"
);

fs.writeFileSync('src/pages/Register.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

code = code.replace(
  'className="text-5xl md:text-6xl font-extrabold text-gray-900 max-w-2xl leading-[1.15] tracking-tight mb-6 text-left"',
  'className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 max-w-2xl leading-[1.15] tracking-tight mb-6 text-left"'
);

fs.writeFileSync('src/pages/Landing.tsx', code);

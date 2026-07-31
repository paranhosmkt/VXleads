const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

code = code.replace(
  /className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"/g,
  'className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"'
);

code = code.replace(
  'className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition-colors"',
  'className="flex items-center gap-2 px-3 md:px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition-colors"'
);

code = code.replace(
  '<span className="text-white font-bold text-xl">VX</span>',
  '<span className="text-white font-bold text-lg md:text-xl">VX</span>'
);

code = code.replace(
  '<h1 className="text-xl font-bold text-gray-900">{companyName}</h1>',
  '<h1 className="text-lg md:text-xl font-bold text-gray-900 truncate max-w-[120px] md:max-w-none">{companyName}</h1>'
);

// We need to hide text on mobile for the buttons to fit in the navbar.
code = code.replace(
  '<Settings size={18} />\n            Brindes',
  '<Settings size={18} />\n            <span className="hidden md:inline">Brindes</span>'
);

code = code.replace(
  '<Settings size={18} />\n            Personagem',
  '<Settings size={18} />\n            <span className="hidden md:inline">Personagem</span>'
);

code = code.replace(
  '<ExternalLink size={18} />\n            Abrir Roleta',
  '<ExternalLink size={18} />\n            <span className="hidden md:inline">Abrir Roleta</span>'
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);

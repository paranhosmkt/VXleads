const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

code = code.replace(
  '<button \n            onClick={() => window.open(rouletteLink, \'_blank\')}',
  '<button \n            onClick={() => navigate(\'/configurar-experiencia\')}\n            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"\n          >\n            <Settings size={18} />\n            <span className="hidden md:inline">Experiência</span>\n          </button>\n\n          <button \n            onClick={() => window.open(window.location.origin + `/tv/${userId}`, \'_blank\')}\n            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-purple-50 text-purple-700 font-semibold rounded-lg hover:bg-purple-100 transition-colors"\n          >\n            <ExternalLink size={18} />\n            <span className="hidden md:inline">Modo TV</span>\n          </button>\n          \n          <button \n            onClick={() => window.open(rouletteLink, \'_blank\')}'
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);

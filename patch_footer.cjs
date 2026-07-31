const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

code = code.replace(
  '            {/* Contact */}',
  '            {/* Legal Links */}\n            <div>\n              <h4 className="text-white font-bold text-lg mb-6">Políticas</h4>\n              <ul className="space-y-4">\n                <li>\n                  <RouterLink to="/termos-de-uso" className="text-gray-400 hover:text-white transition-colors cursor-pointer">\n                    Termos de Uso\n                  </RouterLink>\n                </li>\n                <li>\n                  <RouterLink to="/politica-de-privacidade" className="text-gray-400 hover:text-white transition-colors cursor-pointer">\n                    Política de Privacidade\n                  </RouterLink>\n                </li>\n              </ul>\n            </div>\n\n            {/* Contact */}'
);

fs.writeFileSync('src/pages/Landing.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf-8');

const regexGrid = /<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">/;
code = code.replace(regexGrid, '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">');

// We can just append the block right before </div>\s*<div className="flex flex-col sm:flex-row justify-between items-center gap-4">
const addBlockRegex = /<\/ul>\s*<\/div>\s*<\/div>\s*<div className="flex flex-col sm:flex-row justify-between items-center gap-4">/;
const addBlockMatch = code.match(addBlockRegex);

if (addBlockMatch) {
  const newText = `</ul>
              </div>
              
              {/* Personalizado */}
              <div 
                className={\`border-2 rounded-2xl p-6 cursor-pointer transition-all \${selectedPlan === 'personalizado' ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-blue-300'}\`}
                onClick={() => setSelectedPlan('personalizado')}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">Personalizado</h3>
                <p className="text-gray-500 text-sm mb-4">Projeto sob medida para sua necessidade.</p>
                <div className="text-2xl font-black text-gray-900 mb-4">Sob Consulta</div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Leads personalizados</li>
                  <li>• Dispositivos simultâneos ilimitados</li>
                  <li>• Integração CRM / Webhook</li>
                  <li>• Suporte 24/7 no Evento</li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">`;
  code = code.replace(addBlockMatch[0], newText);
}

fs.writeFileSync('src/pages/Register.tsx', code);
console.log('Done 2');

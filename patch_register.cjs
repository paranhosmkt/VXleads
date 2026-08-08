const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf-8');

const regexGrid = /<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">/;
code = code.replace(regexGrid, '<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">');

const regexEnterprise = /{!\* Enterprise \*\/}([\s\S]*?)<\/ul>\s*<\/div>/;
const enterpriseMatch = code.match(regexEnterprise);

if (enterpriseMatch) {
  let newEnterpriseAndPersonalizado = enterpriseMatch[0] + `
              
              {/* Personalizado */}
              <div 
                className={\`border-2 rounded-2xl p-6 cursor-pointer transition-all \${selectedPlan === 'personalizado' ? 'border-gray-900 bg-gray-50 shadow-md' : 'border-gray-200 hover:border-gray-900'}\`}
                onClick={() => setSelectedPlan('personalizado')}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">Personalizado</h3>
                <p className="text-gray-500 text-sm mb-4">Projeto sob medida para sua necessidade.</p>
                <div className="text-2xl font-black text-gray-900 mb-4">Sob Consulta</div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Leads personalizados</li>
                  <li>• Jogo/Design Exclusivo</li>
                  <li>• Integrações Dedicadas</li>
                </ul>
              </div>`;
  
  code = code.replace(enterpriseMatch[0], newEnterpriseAndPersonalizado);
}

const buttonsRegex = /<div className="flex justify-end">\s*<button([\s\S]*?)Continuar para Dados da Empresa\s*<\/button>\s*<\/div>/;
const buttonsMatch = code.match(buttonsRegex);

if (buttonsMatch) {
  const newButtons = `<div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <a 
                href="https://wa.me/5511999999999?text=Ol%C3%A1,%20gostaria%20de%20falar%20com%20um%20consultor%20sobre%20os%20planos%20da%20VX%20Leads" 
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Converse com um consultor
              </a>
              <button 
                onClick={() => setStep(2)}
                disabled={!selectedPlan}
                className={\`px-8 py-3 rounded-xl font-bold text-white transition-all w-full sm:w-auto \${selectedPlan ? 'bg-blue-600 hover:bg-blue-700 shadow-lg' : 'bg-gray-300 cursor-not-allowed'}\`}
              >
                Continuar para Dados da Empresa
              </button>
            </div>`;
  code = code.replace(buttonsMatch[0], newButtons);
}

fs.writeFileSync('src/pages/Register.tsx', code);
console.log('Done');

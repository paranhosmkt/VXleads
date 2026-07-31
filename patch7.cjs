const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

// Update Enterprise Plan
const oldEnterprise = `            {/* Enterprise Plan */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-500 min-h-[48px]">Para grandes marcas e múltiplas feiras.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">R$ 2.497</span>
                  <span className="text-gray-500 font-medium">/evento</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Leads Ilimitados</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Dispositivos Ilimitados</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Modo Offline</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700 font-medium">Integração CRM / Webhook</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Suporte 24/7 no Evento</span>
                </li>
              </ul>
              <RouterLink to="/cadastro" className="w-full block text-center py-3.5 px-6 font-semibold text-gray-900 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                Falar com Consultor
              </RouterLink>
            </div>`;

const newEnterprise = `            {/* Enterprise Plan */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-500 min-h-[48px]">Para grandes marcas e feiras maiores.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">R$ 2.497</span>
                  <span className="text-gray-500 font-medium">/evento</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Até 10 mil Leads</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Até 50 dispositivos conectados</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Modo Offline</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700 font-medium">Integração CRM / Webhook</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Suporte 24/7 no Evento</span>
                </li>
              </ul>
              <RouterLink to="/cadastro" className="w-full block text-center py-3.5 px-6 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30">
                Assinar Plano
              </RouterLink>
            </div>

            {/* Personalizado Plan */}
            <div className="bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-800 flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Personalizado</h3>
                <p className="text-gray-400 min-h-[48px]">Projeto sob medida para sua necessidade.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">Sob Consulta</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300">Leads personalizados</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300">Dispositivos personalizados</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300">Interface personalizada</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300">Modo Offline</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300 font-medium">Integrações completas</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300">Suporte 24/7 dedicado</span>
                </li>
              </ul>
              <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="w-full block text-center py-3.5 px-6 font-semibold text-gray-900 bg-white rounded-xl hover:bg-gray-100 transition-colors">
                Falar com um Consultor
              </a>
            </div>`;

code = code.replace(oldEnterprise, newEnterprise);
code = code.replace('<div className="grid md:grid-cols-3 gap-8">', '<div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">');

fs.writeFileSync('src/pages/Landing.tsx', code);

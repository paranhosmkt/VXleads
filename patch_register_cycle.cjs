const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf-8');

code = code.replace(
  /const \[selectedPlan, setSelectedPlan\] = useState<string \| null>\(null\);/,
  "const [selectedPlan, setSelectedPlan] = useState<string | null>(null);\n  const [selectedCycle, setSelectedCycle] = useState<'event' | 'annual'>('event');"
);

code = code.replace(
  /const planFromUrl = params.get\('plan'\);\n\s*if \(planFromUrl\) \{\n\s*setSelectedPlan\(planFromUrl\);\n\s*\}/,
  "const planFromUrl = params.get('plan');\n    const cycleFromUrl = params.get('cycle');\n    if (planFromUrl) setSelectedPlan(planFromUrl);\n    if (cycleFromUrl === 'annual' || cycleFromUrl === 'event') setSelectedCycle(cycleFromUrl as 'event' | 'annual');"
);

// We need to add the billing cycle toggle to the UI, right above the plans grid
code = code.replace(
  /<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">/,
  `<div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-xl inline-flex items-center">
              <button
                type="button"
                onClick={() => setSelectedCycle('event')}
                className={\`px-6 py-2.5 rounded-lg text-sm font-bold transition-all \${selectedCycle === 'event' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}\`}
              >
                Por Evento
              </button>
              <button
                type="button"
                onClick={() => setSelectedCycle('annual')}
                className={\`px-6 py-2.5 rounded-lg text-sm font-bold transition-all \${selectedCycle === 'annual' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}\`}
              >
                Anual (Ilimitado)
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">`
);

// Update prices in the UI based on selectedCycle
// We need to replace fixed prices with dynamic ones in the cards
// "R$ 797" -> `{selectedCycle === 'annual' ? 'R$ 4.997' : 'R$ 797'}`
code = code.replace(/<span className="text-3xl font-extrabold text-gray-900">R\$ 797<\/span>/g, '<span className="text-3xl font-extrabold text-gray-900">{selectedCycle === \'annual\' ? \'R$ 4.997\' : \'R$ 797\'}</span>');
code = code.replace(/<span className="text-3xl font-extrabold text-gray-900">R\$ 1.297<\/span>/g, '<span className="text-3xl font-extrabold text-gray-900">{selectedCycle === \'annual\' ? \'R$ 8.997\' : \'R$ 1.297\'}</span>'); // Wait, landing says 1297/8997 for Pro? Let's use the ones from Landing page
code = code.replace(/<span className="text-3xl font-extrabold text-gray-900">R\$ 3.597<\/span>/g, '<span className="text-3xl font-extrabold text-gray-900">{selectedCycle === \'annual\' ? \'R$ 24.997\' : \'R$ 3.597\'}</span>');

// wait, the previous code had 1497 and 2997. Let's check what prices are there.
fs.writeFileSync('src/pages/Register.tsx', code);

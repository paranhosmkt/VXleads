const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

// Add state for isAnnual
code = code.replace(
  'const canvasRef = useRef<HTMLCanvasElement>(null);',
  'const canvasRef = useRef<HTMLCanvasElement>(null);\n  const [isAnnual, setIsAnnual] = useState(false);'
);

// Add toggle UI
const toggleUI = `          </div>
          
          <div className="flex justify-center mb-12">
            <div className="bg-white p-1.5 rounded-xl border border-gray-200 inline-flex items-center shadow-sm">
              <button
                onClick={() => setIsAnnual(false)}
                className={\`px-6 py-2.5 rounded-lg text-sm font-bold transition-all \${!isAnnual ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}\`}
              >
                Por Evento
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={\`px-6 py-2.5 rounded-lg text-sm font-bold transition-all \${isAnnual ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}\`}
              >
                Anual (Eventos Ilimitados)
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">`;

code = code.replace(
  '          </div>\n\n          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">',
  toggleUI
);

// Change prices based on toggle
code = code.replace(
  '<span className="text-4xl font-extrabold text-gray-900">R$ 797</span>',
  '<span className="text-4xl font-extrabold text-gray-900">{isAnnual ? "R$ 4.997" : "R$ 797"}</span>'
);

code = code.replace(
  '<span className="text-gray-500 font-medium">/evento</span>',
  '<span className="text-gray-500 font-medium">{isAnnual ? "/ano" : "/evento"}</span>'
);

code = code.replace(
  '<span className="text-4xl font-extrabold text-gray-900">R$ 1.297</span>',
  '<span className="text-4xl font-extrabold text-gray-900">{isAnnual ? "R$ 8.997" : "R$ 1.297"}</span>'
);

code = code.replace(
  '<span className="text-gray-500 font-medium">/evento</span>',
  '<span className="text-gray-500 font-medium">{isAnnual ? "/ano" : "/evento"}</span>'
);

code = code.replace(
  '<span className="text-4xl font-extrabold text-gray-900">R$ 3.597</span>',
  '<span className="text-4xl font-extrabold text-gray-900">{isAnnual ? "R$ 24.997" : "R$ 3.597"}</span>'
);

code = code.replace(
  '<span className="text-gray-500 font-medium">/evento</span>',
  '<span className="text-gray-500 font-medium">{isAnnual ? "/ano" : "/evento"}</span>'
);

fs.writeFileSync('src/pages/Landing.tsx', code);

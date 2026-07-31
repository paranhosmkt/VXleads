const fs = require('fs');
let code = fs.readFileSync('src/pages/TVMode.tsx', 'utf8');

code = code.replace(
  "const [character, setCharacter] = useState<any>(null);",
  "const [character, setCharacter] = useState<any>(null);\n  const [planType, setPlanType] = useState('Starter');"
);

code = code.replace(
  "setCompanyLogo(data.logoUrl || null);",
  "setCompanyLogo(data.logoUrl || null);\n          setPlanType(data.planType || 'Starter');"
);

code = code.replace(
  "Escaneie o QR Code ao lado, gire a roleta e <strong className=\"text-yellow-400\">ganhe brindes exclusivos!</strong>",
  "{planType !== 'Starter' ? (\n              <>\n                Escaneie o QR Code ao lado, gire a roleta e <strong className=\"text-yellow-400\">ganhe brindes exclusivos!</strong>\n              </>\n            ) : (\n              <>\n                Gire a roleta no totem e <strong className=\"text-yellow-400\">ganhe brindes exclusivos!</strong>\n              </>\n            )}"
);

code = code.replace(
  "<div className=\"bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center transform hover:scale-105 transition-transform duration-500 border-8 border-white/50 backdrop-blur-sm relative z-20\">",
  "{planType !== 'Starter' && (\n          <div className=\"bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center transform hover:scale-105 transition-transform duration-500 border-8 border-white/50 backdrop-blur-sm relative z-20\">\n            <div className=\"absolute -top-6 bg-blue-600 text-white font-black px-8 py-2 rounded-full text-xl shadow-xl uppercase tracking-widest\">\n              Jogue Aqui\n            </div>\n            <QRCodeSVG value={rouletteUrl} size={300} level=\"H\" includeMargin={false} />\n            <p className=\"mt-8 text-gray-500 font-bold text-xl uppercase tracking-widest\">Aponte a Câmera</p>\n          </div>\n        )}"
);

code = code.replace(
  "<div className=\"absolute -top-6 bg-blue-600 text-white font-black px-8 py-2 rounded-full text-xl shadow-xl uppercase tracking-widest\">\n            Jogue Aqui\n          </div>\n          <QRCodeSVG value={rouletteUrl} size={300} level=\"H\" includeMargin={false} />\n          <p className=\"mt-8 text-gray-500 font-bold text-xl uppercase tracking-widest\">Aponte a Câmera</p>\n        </div>",
  "" // we just removed the inner content because we wrapped it above. Wait, if I replace the opening tag with the wrapped full block, I should remove the rest. Let's do it safer.
);

fs.writeFileSync('src/pages/TVMode.tsx', code);

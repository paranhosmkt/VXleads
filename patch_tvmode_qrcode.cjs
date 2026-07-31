const fs = require('fs');
let code = fs.readFileSync('src/pages/TVMode.tsx', 'utf8');

code = code.replace(
  "{planType !== 'Starter' ? (\n              <>\n                Escaneie o QR Code ao lado, gire a roleta e <strong className=\"text-yellow-400\">ganhe brindes exclusivos!</strong>\n              </>\n            ) : (\n              <>\n                Gire a roleta no totem e <strong className=\"text-yellow-400\">ganhe brindes exclusivos!</strong>\n              </>\n            )}",
  "{['Enterprise', 'Personalizado'].includes(planType) ? (\n              <>\n                Escaneie o QR Code ao lado, gire a roleta e <strong className=\"text-yellow-400\">ganhe brindes exclusivos!</strong>\n              </>\n            ) : (\n              <>\n                Gire a roleta no totem e <strong className=\"text-yellow-400\">ganhe brindes exclusivos!</strong>\n              </>\n            )}"
);

code = code.replace(
  "{planType !== 'Starter' && (\n          <div className=\"bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center transform hover:scale-105 transition-transform duration-500 border-8 border-white/50 backdrop-blur-sm relative z-20\">",
  "{['Enterprise', 'Personalizado'].includes(planType) && (\n          <div className=\"bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center transform hover:scale-105 transition-transform duration-500 border-8 border-white/50 backdrop-blur-sm relative z-20\">"
);

fs.writeFileSync('src/pages/TVMode.tsx', code);

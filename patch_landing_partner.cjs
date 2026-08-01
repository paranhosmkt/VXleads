const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

// Replace the text
code = code.replace(
  '<p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-xl">\n              Seja um consultor parceiro e receba <strong className="text-white">12% de comissão recorrente</strong> por cada empresa indicada. Leve inovação para seus clientes e construa uma nova fonte de renda.\n            </p>',
  '<p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-xl">\n              Seja um consultor parceiro e receba comissão recorrente enquanto os seus clientes usarem a plataforma. Leve inovação e construa uma nova fonte de renda.\n            </p>'
);

// Replace PartnerSimulator usage
code = code.replace(
  '<PartnerSimulator />',
  '<img src="https://i.ibb.co/kVpZ6yhf/Gemini-Generated-Image-lge41clge41clge4.png" alt="Programa de Parceiros VX Leads" className="w-full max-w-md rounded-2xl shadow-2xl shadow-blue-500/20 object-cover" />'
);

fs.writeFileSync('src/pages/Landing.tsx', code);

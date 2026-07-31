const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

// Starter Leads
code = code.replace(
  '<span className="text-gray-700">Até 100 leads</span>',
  '<span className="text-gray-700">Até {isAnnual ? "2.400" : "100"} leads</span>'
);

// Starter Devices
code = code.replace(
  '<span className="text-gray-700">1 Dispositivo (Totem/Tablet)</span>',
  '<span className="text-gray-700">{isAnnual ? "1 dispositivo (Totem/Tablet/smartphone) por evento" : "1 Dispositivo (Totem/Tablet)"}</span>'
);

// Pro Leads
code = code.replace(
  '<span className="text-gray-700">Até 1.000 leads</span>',
  '<span className="text-gray-700">Até {isAnnual ? "24.000" : "1.000"} leads</span>'
);

// Pro Devices
code = code.replace(
  '<span className="text-gray-700 font-medium">3 Dispositivos Simultâneos</span>',
  '<span className="text-gray-700 font-medium">{isAnnual ? "Até 10 dispositivos conectados por evento" : "3 Dispositivos Simultâneos"}</span>'
);

// Pro CRM addition
code = code.replace(
  '<span className="text-gray-700">Gestão de Estoque</span>\n                </li>',
  '<span className="text-gray-700">Gestão de Estoque</span>\n                </li>\n                <li className="flex items-start gap-3">\n                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />\n                  <span className="text-gray-700">Integração com CRM</span>\n                </li>'
);

// Enterprise Leads
code = code.replace(
  '<span className="text-gray-700">Até 10 mil Leads</span>',
  '<span className="text-gray-700">Até {isAnnual ? "240.000" : "10 mil"} Leads</span>'
);

// Enterprise Devices
code = code.replace(
  '<span className="text-gray-700">Até 50 dispositivos conectados</span>',
  '<span className="text-gray-700">{isAnnual ? "Até 1.000 dispositivos simultâneos por evento" : "Até 50 dispositivos conectados"}</span>'
);

fs.writeFileSync('src/pages/Landing.tsx', code);

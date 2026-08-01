const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Remove header
code = code.replace(
  '                  <th className="px-6 py-4 font-semibold text-center">Código</th>\n',
  ''
);

// Remove column content
code = code.replace(
  '                  <td className="px-6 py-4">\n                    <div className="flex justify-center">\n                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg font-mono font-bold tracking-widest text-sm">\n                        {lead.code}\n                      </span>\n                    </div>\n                  </td>\n',
  ''
);

code = code.replace(
  'const csvContent = "data:text/csv;charset=utf-8," + \n      "Nome,E-mail,Telefone,Área,Prêmio,Código,Data,Status\\n" +\n      leads.map(l => `${l.name},${l.email},${l.phone},${l.area},${l.prize},${l.code},${new Date(l.createdAt?.toDate()).toLocaleDateString("pt-BR")},${l.status}`).join("\\n");',
  'const csvContent = "data:text/csv;charset=utf-8," + \n      "Nome,E-mail,Telefone,Área,Prêmio,Data,Status\\n" +\n      leads.map(l => `${l.name},${l.email},${l.phone},${l.area},${l.prize},${new Date(l.createdAt?.toDate()).toLocaleDateString("pt-BR")},${l.status}`).join("\\n");'
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);

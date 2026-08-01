const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const cellCode = `                      <td className="px-6 py-4 text-center">
                        <span className="inline-block bg-gray-100 text-gray-800 font-mono px-3 py-1 rounded-lg font-bold tracking-widest">
                          {lead.code}
                        </span>
                      </td>`;
code = code.replace(cellCode, '');

code = code.replace(
  '        `"${lead.prize || \'\'}"`,\n        `"${lead.code || \'\'}"`,\n        `"${lead.status || \'\'}"`,',
  '        `"${lead.prize || \'\'}"`,\n        `"${lead.status || \'\'}"`,'
);

code = code.replace(
  "return (l.name?.toLowerCase().includes(term) || l.email?.toLowerCase().includes(term) || l.code?.toLowerCase().includes(term));",
  "return (l.name?.toLowerCase().includes(term) || l.email?.toLowerCase().includes(term));"
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);

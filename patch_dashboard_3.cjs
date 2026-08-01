const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

code = code.replace(
  "const headers = ['Nome', 'Email', 'Telefone', 'Area', 'Premio', 'Codigo', 'Status', 'Data'];",
  "const headers = ['Nome', 'Email', 'Telefone', 'Area', 'Premio', 'Status', 'Data'];"
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);

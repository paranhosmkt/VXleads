const fs = require('fs');
let code = fs.readFileSync('src/i18n.ts', 'utf-8');
code = code.replace(
  '"contact_email": "contato@vxleads.com.br",\n        "rights": "Todos os direitos reservados.",',
  '"contact_email": "contato@vxleads.com.br",\n        "social": "Siga nossas redes sociais",\n        "rights": "Todos os direitos reservados.",'
);
fs.writeFileSync('src/i18n.ts', code);

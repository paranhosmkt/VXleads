const fs = require('fs');
let code = fs.readFileSync('src/i18n.ts', 'utf-8');

const replacement = `"footer": {
        "about": "A melhor plataforma de gamificação e captação de leads para eventos corporativos.",
        "product": "Produto",
        "company": "Empresa",
        "legal": "Legal",
        "contact": "Contato",
        "contact_email": "contato@vxleads.com.br",
        "rights": "Todos os direitos reservados.",`;

code = code.replace(/"footer": \{\s*"about": "A melhor plataforma de gamificação e captação de leads para eventos corporativos.",\s*"product": "Produto",\s*"company": "Empresa",\s*"legal": "Legal",\s*"rights": "Todos os direitos reservados.",/, replacement);

fs.writeFileSync('src/i18n.ts', code);
console.log("Patched i18n.ts");

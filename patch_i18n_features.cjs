const fs = require('fs');
let code = fs.readFileSync('src/i18n.ts', 'utf-8');

const featuresTarget = `"support_dedicated": "Suporte 24/7 dedicado"`;
const featuresReplacement = `"support_dedicated": "Suporte 24/7 dedicado",
          "community_group": "Grupo Exclusivo VIP",
          "course_conversion": "Curso Prático de Conversão de Estandes",
          "account_manager": "Gerente de Contas Dedicado"`;

code = code.replace(featuresTarget, featuresReplacement);
fs.writeFileSync('src/i18n.ts', code);
console.log("Patched i18n features");

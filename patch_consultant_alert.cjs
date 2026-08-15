const fs = require('fs');
let code = fs.readFileSync('src/pages/ConsultantDashboard.tsx', 'utf-8');

const target = `alert("Ocorreu um erro ao iniciar a conexão bancária. Tente novamente.");`;
const replacement = `alert("Ocorreu um erro ao iniciar a conexão bancária: " + (error.message || "Tente novamente."));`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/ConsultantDashboard.tsx', code);
  console.log("Patched alert successfully.");
} else {
  console.log("Target not found");
}

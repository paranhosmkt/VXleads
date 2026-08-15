const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const target = `  app.post("/api/create-connect-account", async (req, res) => {
    try {`;
    
const replacement = `  app.post("/api/create-connect-account", async (req, res) => {
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ error: "Chave STRIPE_SECRET_KEY não configurada no servidor. Adicione no painel de configurações para testar." });
      }`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('server.ts', code);
  console.log("Patched server.ts successfully.");
} else {
  console.log("Target not found");
}

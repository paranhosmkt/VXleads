const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Replace the lang destructuring
code = code.replace("const { plan, cycle, lang } = req.body;", "const { plan, cycle } = req.body;");

// Replace the amounts
code = code.replace("if (lang !== 'pt') amount = cycle === 'annual' ? 99900 : 14900;\n", "");
code = code.replace("if (lang !== 'pt') amount = cycle === 'annual' ? 199900 : 29900;\n", "");
code = code.replace("if (lang !== 'pt') amount = cycle === 'annual' ? 399900 : 59900;\n", "");

// Replace currency
code = code.replace("currency = lang === 'pt' ? 'brl' : (lang === 'es' ? 'eur' : 'usd');", "currency = 'brl';");

fs.writeFileSync('server.ts', code);
console.log("server.ts patched");

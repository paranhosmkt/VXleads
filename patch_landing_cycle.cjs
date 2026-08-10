const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

code = code.replace(/to="\/cadastro\?plan=starter"/g, 'to={`/cadastro?plan=starter&cycle=${isAnnual ? "annual" : "event"}`}');
code = code.replace(/to="\/cadastro\?plan=pro"/g, 'to={`/cadastro?plan=pro&cycle=${isAnnual ? "annual" : "event"}`}');
code = code.replace(/to="\/cadastro\?plan=enterprise"/g, 'to={`/cadastro?plan=enterprise&cycle=${isAnnual ? "annual" : "event"}`}');

fs.writeFileSync('src/pages/Landing.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/pages/Login.tsx', 'utf-8');

const target = `<Link to="/cadastro" className="text-blue-600 font-bold hover:underline">
                  Cadastre-se
                </Link>`;
const replacement = `<Link to={loginType === 'company' ? "/cadastro" : "/cadastro-consultor"} className="text-blue-600 font-bold hover:underline">
                  Cadastre-se
                </Link>`;

if(code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/Login.tsx', code);
  console.log("Patched link successfully");
} else {
  console.log("Could not find target to patch");
}

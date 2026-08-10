const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

code = code.replace(/<a target="_blank" rel="noopener noreferrer" href={isAnnual \? "https:\/\/buy\.stripe\.com\/bJeaEXadZ5qf84bdyj6Zy02" : "https:\/\/buy\.stripe\.com\/8x2cN5adZ05V0BJeCn6Zy00"} className="w-full block text-center py-3.5 px-6 font-semibold text-blue-600 bg-blue-50 border-2 border-blue-100 rounded-xl hover:bg-blue-100 transition-colors">\s*Começar com Starter\s*<\/a>/s, 
'<RouterLink to={`/cadastro?plan=starter&cycle=${isAnnual ? "annual" : "event"}`} className="w-full block text-center py-3.5 px-6 font-semibold text-blue-600 bg-blue-50 border-2 border-blue-100 rounded-xl hover:bg-blue-100 transition-colors">\n                Começar com Starter\n              </RouterLink>');

code = code.replace(/<a target="_blank" rel="noopener noreferrer" href={isAnnual \? "https:\/\/buy\.stripe\.com\/aFa14n2Lx2e398fcuf6Zy04" : "https:\/\/buy\.stripe\.com\/4gMfZhadZcSH3NV1PB6Zy01"} className="w-full block text-center py-3.5 px-6 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600\/30">\s*Assinar Plano Pro\s*<\/a>/s, 
'<RouterLink to={`/cadastro?plan=pro&cycle=${isAnnual ? "annual" : "event"}`} className="w-full block text-center py-3.5 px-6 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30">\n                Assinar Plano Pro\n              </RouterLink>');

code = code.replace(/<a target="_blank" rel="noopener noreferrer" href={isAnnual \? "https:\/\/buy\.stripe\.com\/9B6aEXfyjbODfwD8dZ6Zy05" : "https:\/\/buy\.stripe\.com\/bJeaEXadZ5qf84bdyj6Zy02"} className="w-full block text-center py-3.5 px-6 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600\/30">\s*Assinar Plano Enterprise\s*<\/a>/s, 
'<RouterLink to={`/cadastro?plan=enterprise&cycle=${isAnnual ? "annual" : "event"}`} className="w-full block text-center py-3.5 px-6 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30">\n                Assinar Plano Enterprise\n              </RouterLink>');

fs.writeFileSync('src/pages/Landing.tsx', code);
console.log("Reverted landing links");

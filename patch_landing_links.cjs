const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

const starterLink = `<a href={isAnnual ? "https://buy.stripe.com/bJeaEXadZ5qf84bdyj6Zy02" : "https://buy.stripe.com/8x2cN5adZ05V0BJeCn6Zy00"} className="w-full block text-center py-3.5 px-6 font-semibold text-blue-600 bg-blue-50 border-2 border-blue-100 rounded-xl hover:bg-blue-100 transition-colors">
                Começar com Starter
              </a>`;

const proLink = `<a href={isAnnual ? "https://buy.stripe.com/aFa14n2Lx2e398fcuf6Zy04" : "https://buy.stripe.com/4gMfZhadZcSH3NV1PB6Zy01"} className="w-full block text-center py-3.5 px-6 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30">
                Assinar Plano Pro
              </a>`;

const enterpriseLink = `<a href={isAnnual ? "https://buy.stripe.com/9B6aEXfyjbODfwD8dZ6Zy05" : "https://buy.stripe.com/bJeaEXadZ5qf84bdyj6Zy02"} className="w-full block text-center py-3.5 px-6 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30">
                Assinar Plano Enterprise
              </a>`;

// Find and replace the RouterLinks
code = code.replace(/<RouterLink to={`\/cadastro\?plan=starter.*?<\/RouterLink>/s, starterLink);
code = code.replace(/<RouterLink to={`\/cadastro\?plan=pro.*?<\/RouterLink>/s, proLink);
code = code.replace(/<RouterLink to={`\/cadastro\?plan=enterprise.*?<\/RouterLink>/s, enterpriseLink);

fs.writeFileSync('src/pages/Landing.tsx', code);
console.log("Patched landing links");

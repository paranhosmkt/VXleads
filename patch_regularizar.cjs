const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

const replacement = `
            <button 
              onClick={() => {
                const STRIPE_LINKS: Record<string, Record<string, string>> = {
                  starter: {
                    event: 'https://buy.stripe.com/8x2cN5adZ05V0BJeCn6Zy00',
                    annual: 'https://buy.stripe.com/bJeaEXadZ5qf84bdyj6Zy02'
                  },
                  pro: {
                    event: 'https://buy.stripe.com/4gMfZhadZcSH3NV1PB6Zy01',
                    annual: 'https://buy.stripe.com/aFa14n2Lx2e398fcuf6Zy04'
                  },
                  enterprise: {
                    event: 'https://buy.stripe.com/bJeaEXadZ5qf84bdyj6Zy02',
                    annual: 'https://buy.stripe.com/9B6aEXfyjbODfwD8dZ6Zy05'
                  }
                };
                
                const paymentUrl = STRIPE_LINKS[currentPlan]?.[currentCycle] || STRIPE_LINKS[currentPlan]?.['event'];
                if (paymentUrl) {
                  window.location.href = \`\${paymentUrl}?client_reference_id=\${userId}\`;
                } else {
                  alert('Plano não encontrado.');
                }
              }}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
            >
              Regularizar Plano
            </button>
`;

code = code.replace(/<button className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap">\s*Regularizar Plano\s*<\/button>/, replacement);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Patched Regularizar Plano");

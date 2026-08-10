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
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-600/30"
          >
            Pagar Agora
          </button>
`;

code = code.replace(/<button\s*onClick=\{async \(\) => \{\s*try \{\s*const response = await fetch\('\/api\/create-checkout-session'[\s\S]*?className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-600\/30"\s*>\s*Pagar Agora\s*<\/button>/, replacement);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Patched Pagar Agora");

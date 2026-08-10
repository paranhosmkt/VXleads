const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf-8');

const replacement = `
      if (selectedPlan && selectedPlan !== 'personalizado') {
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

        const paymentUrl = STRIPE_LINKS[selectedPlan]?.[selectedCycle];
        if (paymentUrl) {
          window.location.href = \`\${paymentUrl}?prefilled_email=\${encodeURIComponent(formData.email)}&client_reference_id=\${user.uid}\`;
          return;
        } else {
          alert('Plano não encontrado para pagamento.');
        }
      } else {
`;

code = code.replace(/if \(selectedPlan && selectedPlan !== 'personalizado'\) \{[\s\S]*?\} else \{/, replacement);

fs.writeFileSync('src/pages/Register.tsx', code);
console.log("Patched Register.tsx");

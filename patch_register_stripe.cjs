const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf-8');

const importTarget = `import { doc, setDoc, serverTimestamp } from 'firebase/firestore';`;
const importReplacement = `import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';`;
if (code.includes(importTarget)) {
  code = code.replace(importTarget, importReplacement);
}

const paymentLogicTarget = `      if (selectedPlan && selectedPlan !== 'personalizado') {
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
            event: 'https://buy.stripe.com/9B6aEXfyjbODfwD8dZ6Zy05_event',
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
        alert(t('register.success_contact'));
      }`;

const paymentLogicReplacement = `      if (selectedPlan && selectedPlan !== 'personalizado') {
        let consultantStripeAccountId = null;
        
        // Find consultant to get their stripeAccountId
        if (formData.codigoConsultor) {
          const consultantsRef = collection(db, 'consultants');
          const q = query(consultantsRef, where('referralCode', '==', formData.codigoConsultor));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const consultantDoc = querySnapshot.docs[0].data();
            if (consultantDoc.stripeAccountId) {
              consultantStripeAccountId = consultantDoc.stripeAccountId;
            }
          }
        }

        const res = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            plan: selectedPlan, 
            cycle: selectedCycle, 
            consultantStripeAccountId,
            email: formData.email,
            uid: user.uid
          })
        });

        const data = await res.json();
        
        if (data.url) {
          window.location.href = data.url;
          return;
        } else {
          alert('Erro ao gerar pagamento: ' + (data.error || 'Desconhecido'));
        }
      } else {
        alert(t('register.success_contact'));
      }`;

code = code.replace(paymentLogicTarget, paymentLogicReplacement);

fs.writeFileSync('src/pages/Register.tsx', code);
console.log("Patched Register.tsx");

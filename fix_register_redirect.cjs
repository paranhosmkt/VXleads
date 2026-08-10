const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf-8');

const regex = /alert\('Cadastro realizado com sucesso! Um e-mail de confirmação foi enviado para você\.'\);\s*navigate\('\/configurar-experiencia'\);/g;
const replacement = `if (selectedPlan && selectedPlan !== 'personalizado') {
        try {
          const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              plan: selectedPlan,
              cycle: selectedCycle,
              lang: localStorage.getItem('i18nextLng') || 'pt'
            }),
          });
          
          const session = await response.json();
          if (session.url) {
            window.location.href = session.url;
            return;
          }
        } catch (stripeError) {
          console.error("Stripe error:", stripeError);
          alert('Conta criada, mas houve um erro ao redirecionar para o pagamento. Você pode acessar seu painel.');
        }
      } else {
        alert('Cadastro realizado com sucesso! Um consultor entrará em contato.');
      }
      
      navigate('/dashboard');`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/Register.tsx', code);

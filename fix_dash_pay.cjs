const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

const regex = /<button\n\s*onClick=\{.*?\}\n\s*className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"\n\s*>\n\s*Voltar para Planos\n\s*<\/button>/g;

const replacement = `<div className="flex gap-4">
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/create-checkout-session', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    plan: companyName ? (companyName.includes('Pro') ? 'pro' : companyName.includes('Enterprise') ? 'enterprise' : 'starter') : 'starter', // Ideally we should have the actual plan from DB here. Let's fix this!
                    cycle: 'event', // fallback
                    lang: localStorage.getItem('i18nextLng') || 'pt'
                  }),
                });
                const session = await response.json();
                if (session.url) window.location.href = session.url;
              } catch (e) {
                console.error(e);
              }
            }}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-600/30"
          >
            Pagar Agora
          </button>
          <button
            onClick={() => auth.signOut().then(() => navigate('/'))}
            className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
          >
            Sair
          </button>
        </div>`;

code = code.replace(regex, replacement);

// Wait, the state doesn't have the current plan or cycle! 
// Let's just add `plan` to the component state and fetch it
code = code.replace(
  /const \[companyName, setCompanyName\] = useState\(''\);/,
  "const [companyName, setCompanyName] = useState('');\n  const [currentPlan, setCurrentPlan] = useState('starter');"
);
code = code.replace(
  /setCompanyName\(companyDoc\.data\(\)\.razaoSocial \|\| 'Sua Empresa'\);/,
  "setCompanyName(companyDoc.data().razaoSocial || 'Sua Empresa');\n            setCurrentPlan(companyDoc.data().plan || 'starter');"
);

// update the button click handler to use currentPlan
code = code.replace(
  /plan: companyName \? \(companyName\.includes\('Pro'\) \? 'pro' : companyName\.includes\('Enterprise'\) \? 'enterprise' : 'starter'\) : 'starter', \/\/ Ideally we should have the actual plan from DB here\. Let's fix this!/,
  "plan: currentPlan,"
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);

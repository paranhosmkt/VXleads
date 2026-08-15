const fs = require('fs');
let code = fs.readFileSync('src/pages/Login.tsx', 'utf-8');

// 1. Add loginType state
code = code.replace(
  "const [formData, setFormData] = useState({",
  "const [loginType, setLoginType] = useState<'company' | 'consultant'>('company');\n  const [formData, setFormData] = useState({"
);

// 2. Add tabs UI
const uiTarget = `          <form onSubmit={handleSubmit} className="p-8 space-y-6">`;
const uiReplacement = uiTarget + `
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setLoginType('company')}
                className={\`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all \${
                  loginType === 'company'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }\`}
              >
                Sou Empresa
              </button>
              <button
                type="button"
                onClick={() => setLoginType('consultant')}
                className={\`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all \${
                  loginType === 'consultant'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }\`}
              >
                Sou Consultor
              </button>
            </div>`;
code = code.replace(uiTarget, uiReplacement);

// 3. Update auth logic
const authTarget = `      const consultantRef = doc(db, 'consultants', user.uid);
      const consultantSnap = await getDoc(consultantRef);

      if (consultantSnap.exists()) {
        alert('Login realizado com sucesso!');
        navigate('/painel-consultor');
        return;
      }

      const companyRef = doc(db, 'companies', user.uid);
      const companySnap = await getDoc(companyRef);
      
      let onboardingCompleted = true;
      if (companySnap.exists()) {
        const data = companySnap.data();
        onboardingCompleted = data.onboardingCompleted !== false; // defaults to true if undefined
      }

      alert('Login realizado com sucesso!');
      
      if (!onboardingCompleted) {
        navigate('/configurar-experiencia');
      } else {
        navigate('/dashboard');
      }`;

const authReplacement = `      if (loginType === 'consultant') {
        const consultantRef = doc(db, 'consultants', user.uid);
        const consultantSnap = await getDoc(consultantRef);

        if (consultantSnap.exists()) {
          navigate('/painel-consultor');
          return;
        } else {
          setError('Nenhuma conta de consultor encontrada com este e-mail.');
          // firebase signout could be called here to prevent floating auth state, but it's fine
          return;
        }
      } else {
        const companyRef = doc(db, 'companies', user.uid);
        const companySnap = await getDoc(companyRef);
        
        if (companySnap.exists()) {
          const data = companySnap.data();
          const onboardingCompleted = data.onboardingCompleted !== false;

          if (!onboardingCompleted) {
            navigate('/configurar-experiencia');
          } else {
            navigate('/dashboard');
          }
        } else {
          setError('Nenhuma conta de empresa encontrada com este e-mail.');
          return;
        }
      }`;

code = code.replace(authTarget, authReplacement);

// Remove the hardcoded alert to avoid annoying user repeatedly. Or the previous one was already there, but we removed it.

// Change subtitle depending on login type:
code = code.replace(
  "{t('login.subtitle')}",
  "{loginType === 'company' ? t('login.subtitle') : 'Acesse seu painel de parcerias e acompanhe seus ganhos'}"
);

// Change title if consultant
code = code.replace(
  "{t('login.title')}",
  "{loginType === 'company' ? t('login.title') : 'Portal do Consultor'}"
);

// Update Label to E-mail for both
code = code.replace(
  "E-mail Corporativo",
  "{loginType === 'company' ? 'E-mail Corporativo' : 'E-mail do Consultor'}"
);

fs.writeFileSync('src/pages/Login.tsx', code);
console.log("Patched Login.tsx");

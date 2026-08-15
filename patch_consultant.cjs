const fs = require('fs');
let code = fs.readFileSync('src/pages/ConsultantDashboard.tsx', 'utf-8');

// 1. Add new state variables
const stateTarget = `  const [copied, setCopied] = useState(false);`;
const stateReplacement = `  const [copied, setCopied] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<any>(null);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);`;
code = code.replace(stateTarget, stateReplacement);

// 2. Add function to update stripe status to Firestore if we create account
const firebaseImports = `import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';`;
const firebaseImportsReplacement = `import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';`;
code = code.replace(firebaseImports, firebaseImportsReplacement);

// 3. Add Stripe connection check inside useEffect
const effectTarget = `          setReferredCompanies(companies);`;
const effectReplacement = `          setReferredCompanies(companies);

          // Check Stripe Connect Status
          if (data.stripeAccountId) {
            try {
              const res = await fetch(\`/api/connect-status/\${data.stripeAccountId}\`);
              const statusData = await res.json();
              setStripeStatus(statusData);
            } catch (err) {
              console.error("Failed to check stripe status", err);
            }
          }`;
code = code.replace(effectTarget, effectReplacement);

// 4. Add Handle Stripe Connect function
const logoutTarget = `  const handleLogout = async () => {`;
const stripeConnectFunc = `  const handleConnectStripe = async () => {
    setIsConnectingStripe(true);
    try {
      let accountId = consultantData?.stripeAccountId;
      
      // If no account yet, create one
      if (!accountId) {
        const createRes = await fetch('/api/create-connect-account', { method: 'POST' });
        const createData = await createRes.json();
        accountId = createData.accountId;
        
        // Save to firebase
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, 'consultants', user.uid);
          await updateDoc(docRef, { stripeAccountId: accountId });
          setConsultantData({ ...consultantData, stripeAccountId: accountId });
        }
      }

      // Generate link and redirect
      const linkRes = await fetch('/api/create-account-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId })
      });
      const linkData = await linkRes.json();
      
      if (linkData.url) {
        window.location.href = linkData.url;
      }
    } catch (error) {
      console.error("Erro ao conectar ao Stripe:", error);
      alert("Ocorreu um erro ao iniciar a conexão bancária. Tente novamente.");
    } finally {
      setIsConnectingStripe(false);
    }
  };

  const isStripeConnected = stripeStatus?.details_submitted && stripeStatus?.charges_enabled;

  const handleLogout = async () => {`;
code = code.replace(logoutTarget, stripeConnectFunc);

// 5. Update UI to require Stripe Connection before showing link!
const linkSectionTarget = `                    <div className="bg-blue-50 rounded-xl p-4 md:p-6 border border-blue-100 flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-blue-900 mb-1">Seu Link de Indicação (Código: {consultantData?.referralCode})</label>
              <input 
                type="text" 
                readOnly 
                value={\`\${window.location.origin}/cadastro?ref=\${consultantData?.referralCode}\`}
                className="w-full bg-white border border-blue-200 text-gray-700 p-3 rounded-lg outline-none"
              />
            </div>
            <button 
              onClick={copyToClipboard}
              className="w-full md:w-auto mt-2 md:mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shrink-0"
            >
              <Copy size={18} />
              {copied ? 'Copiado!' : 'Copiar Link'}
            </button>
          </div>`;

const linkSectionReplacement = `          {!isStripeConnected ? (
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <h3 className="text-lg font-bold text-yellow-800 mb-2">Configure sua conta para receber comissões</h3>
              <p className="text-yellow-700 mb-6">Você precisa conectar uma conta bancária de forma segura através da nossa parceria com o Stripe para liberar o seu link de indicação e receber seus pagamentos automaticamente.</p>
              
              <button 
                onClick={handleConnectStripe}
                disabled={isConnectingStripe}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
              >
                {isConnectingStripe ? <Loader2 className="animate-spin" size={20} /> : <DollarSign size={20} />}
                Conectar Conta Bancária Segura
              </button>
            </div>
          ) : (
            <div className="bg-blue-50 rounded-xl p-4 md:p-6 border border-blue-100 flex flex-col md:flex-row items-center gap-4 justify-between">
              <div className="flex-1 w-full">
                <label className="block text-sm font-semibold text-blue-900 mb-1">Seu Link de Indicação (Código: {consultantData?.referralCode})</label>
                <input 
                  type="text" 
                  readOnly 
                  value={\`\${window.location.origin}/cadastro?ref=\${consultantData?.referralCode}\`}
                  className="w-full bg-white border border-blue-200 text-gray-700 p-3 rounded-lg outline-none"
                />
              </div>
              <button 
                onClick={copyToClipboard}
                className="w-full md:w-auto mt-2 md:mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shrink-0"
              >
                <Copy size={18} />
                {copied ? 'Copiado!' : 'Copiar Link'}
              </button>
            </div>
          )}`;
code = code.replace(linkSectionTarget, linkSectionReplacement);

// 6. Change "Aguardando 30 dias" to standard label. Wait, let's leave it for now.
// "O pagamento das comissões é liberado 30 dias após a ativação do plano pelo cliente." -> we can keep this text as it refers to Stripe payouts too.

fs.writeFileSync('src/pages/ConsultantDashboard.tsx', code);
console.log("Patched ConsultantDashboard.tsx");

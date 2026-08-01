const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf8');

// Remove leadCode state
code = code.replace("  const [leadCode, setLeadCode] = useState('');\n", "");
code = code.replace("    setLeadCode('');\n", "");

// Update form handling for prize registering
const oldSubmitBlock = `      try {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const finalLeadData = {
          ...leadForm,
          companyId: companyId && companyId !== 'dev' ? companyId : auth.currentUser?.uid,
          prize: finalPrize.nome,
          code: code,
          createdAt: serverTimestamp(),
          origin: window.location.origin
        };
        const leadsRef = collection(db, 'leads');
        await addDoc(leadsRef, finalLeadData);
        setLeadCode(code);
      } catch (err) {
        console.error(err);
      } finally {
        setSubmittingLead(false);
      }`;

const newSubmitBlock = `      try {
        const finalLeadData = {
          ...leadForm,
          companyId: companyId && companyId !== 'dev' ? companyId : auth.currentUser?.uid,
          prize: finalPrize.nome,
          createdAt: serverTimestamp(),
          origin: window.location.origin
        };
        const leadsRef = collection(db, 'leads');
        await addDoc(leadsRef, finalLeadData);
      } catch (err) {
        console.error(err);
      } finally {
        setSubmittingLead(false);
      }`;

code = code.replace(oldSubmitBlock, newSubmitBlock);

const oldSuccessUI = `                ) : leadCode ? (
                  <div className="mt-4">
                    <h3 className="text-gray-500 font-medium uppercase tracking-wider mb-2">Seu código de resgate</h3>
                    <div className="bg-gray-100 rounded-2xl p-6 mb-4">
                      <p className="text-5xl font-black text-indigo-700 tracking-widest">{leadCode}</p>
                    </div>
                    <p className="text-sm text-gray-600 mb-6">
                      Apresente este código para a promotora no estande para retirar o seu <strong>{selectedPrize.nome}</strong>.
                    </p>
                    <button 
                      onClick={() => {
                        setSelectedPrize(null);
                        setLeadCode('');
                        setLeadForm({});
                        setStep('intro');
                      }} 
                      className="px-8 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors w-full"
                    >
                      Finalizar
                    </button>
                  </div>
                ) : null}`;

const newSuccessUI = `                ) : (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-6 font-medium">
                      Prêmio registrado com sucesso no sistema.
                    </p>
                    <button 
                      onClick={() => {
                        setSelectedPrize(null);
                        setLeadForm({});
                        setStep('intro');
                      }} 
                      className="px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-indigo-700 transition-colors w-full flex items-center justify-center"
                    >
                      Realizar Novo Cadastro
                    </button>
                  </div>
                )}`;

code = code.replace(oldSuccessUI, newSuccessUI);

fs.writeFileSync('src/pages/Roulette.tsx', code);

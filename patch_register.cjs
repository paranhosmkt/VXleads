const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf-8');

// 1. Add codigoConsultor to state
code = code.replace(
  "logoDataUrl: ''\n  });",
  "logoDataUrl: '',\n    codigoConsultor: ''\n  });"
);

// 2. Read 'ref' from URL
code = code.replace(
  "if (cycleFromUrl === 'annual' || cycleFromUrl === 'event') setSelectedCycle(cycleFromUrl as 'event' | 'annual');\n  }, [location.search]);",
  "if (cycleFromUrl === 'annual' || cycleFromUrl === 'event') setSelectedCycle(cycleFromUrl as 'event' | 'annual');\n    const refCode = params.get('ref');\n    if (refCode) setFormData(prev => ({ ...prev, codigoConsultor: refCode }));\n  }, [location.search]);"
);

// 3. Save codigoConsultor to Firestore
code = code.replace(
  "plan: selectedPlan,\n        cycle: selectedCycle,",
  "plan: selectedPlan,\n        cycle: selectedCycle,\n        referredByCode: formData.codigoConsultor,"
);

// 4. Add input field to the first step (Basic Data)
const targetInput = `              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('register.contact_name')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="text"
                    name="nomeContato"
                    required
                    value={formData.nomeContato}
                    onChange={handleChange}
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="Nome de quem vai gerenciar"
                  />
                </div>
              </div>`;

const replacementInput = targetInput + `

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Código do Consultor (Opcional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="text"
                    name="codigoConsultor"
                    value={formData.codigoConsultor}
                    onChange={handleChange}
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="Se tiver, insira aqui"
                  />
                </div>
              </div>`;

code = code.replace(targetInput, replacementInput);

fs.writeFileSync('src/pages/Register.tsx', code);
console.log("Patched Register.tsx");

const fs = require('fs');
let code = fs.readFileSync('src/pages/ConsultantDashboard.tsx', 'utf-8');

const target = `<div className="bg-blue-50 rounded-xl p-4 md:p-6 border border-blue-100 flex flex-col md:flex-row items-center gap-4 justify-between">`;

const replacement = `{!isStripeConnected ? (
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
            <div className="bg-blue-50 rounded-xl p-4 md:p-6 border border-blue-100 flex flex-col md:flex-row items-center gap-4 justify-between">`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  // Need to add closing tag of the conditional rendering.
  // The original block ends with:
  //             </button>
  //           </div>
  //         </div>
  //         {/* Stats */}
  const endTarget = `</button>\n          </div>\n        </div>\n        {/* Stats */}`;
  if(code.includes(endTarget)) {
      code = code.replace(endTarget, `</button>\n            </div>\n          )}\n        </div>\n        {/* Stats */}`);
  } else {
      // let's try a different approach to match the end
      const endTarget2 = `</button>\n          </div>\n        </div>`;
      if(code.includes(endTarget2)) {
         code = code.replace(endTarget2, `</button>\n            </div>\n          )}\n        </div>`);
      } else {
         console.log("Could not find end of div to patch");
      }
  }

  fs.writeFileSync('src/pages/ConsultantDashboard.tsx', code);
  console.log("Patched ConsultantDashboard.tsx again");
} else {
  console.log("Could not find target to patch");
}

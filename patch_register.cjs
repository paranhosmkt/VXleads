const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf8');

// Add acceptedTerms state
code = code.replace(
  'const [loading, setLoading] = useState(false);',
  'const [loading, setLoading] = useState(false);\n  const [acceptedTerms, setAcceptedTerms] = useState(false);'
);

// Add validation in handleSubmit
code = code.replace(
  '    if (formData.senha !== formData.confirmacaoSenha) {',
  '    if (!acceptedTerms) {\n      setError(\'Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.\');\n      return;\n    }\n\n    if (formData.senha !== formData.confirmacaoSenha) {'
);

// Add checkbox UI
const checkboxUI = `              </div>
            </div>

            <div className="flex items-start gap-3 mt-4 mb-2">
              <input 
                type="checkbox" 
                id="terms" 
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                Eu li e concordo com os{' '}
                <Link to="/termos-de-uso" target="_blank" className="text-blue-600 hover:underline">Termos de Uso</Link>
                {' '}e a{' '}
                <Link to="/politica-de-privacidade" target="_blank" className="text-blue-600 hover:underline">Política de Privacidade</Link>, 
                incluindo a coleta e uso dos meus dados para fins comerciais e conformidade com a LGPD.
              </label>
            </div>
            
            <div className="pt-6 border-t border-gray-100 flex flex-col items-center">`;

code = code.replace(
  '              </div>\n            </div>\n            \n            <div className="pt-6 border-t border-gray-100 flex flex-col items-center">',
  checkboxUI
);

fs.writeFileSync('src/pages/Register.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/pages/SetupForm.tsx', 'utf8');

code = code.replace(
  `  const [formFields, setFormFields] = useState<any[]>([
    { id: 'name', type: 'short_text', label: 'Nome Completo', required: true, options: [] },
    { id: 'email', type: 'email', label: 'E-mail', required: true, options: [] },
    { id: 'phone', type: 'phone', label: 'Telefone / WhatsApp', required: true, options: [] },
    { id: 'area', type: 'short_text', label: 'Área de Atuação', required: true, options: [] },
  ]);`,
  `  const [formFields, setFormFields] = useState<any[]>([
    { id: 'area', type: 'short_text', label: 'Área de Atuação', required: true, options: [] },
  ]);`
);

fs.writeFileSync('src/pages/SetupForm.tsx', code);

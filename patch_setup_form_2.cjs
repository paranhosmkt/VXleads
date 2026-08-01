const fs = require('fs');
let code = fs.readFileSync('src/pages/SetupForm.tsx', 'utf8');

const oldSelectOptions = `<option value="short_text">Texto Curto</option>
                      <option value="long_text">Texto Longo</option>
                      <option value="email">E-mail</option>
                      <option value="phone">Telefone / WhatsApp</option>
                      <option value="multiple_choice">Múltipla Escolha</option>
                      <option value="dropdown">Lista Suspensa</option>`;

const newSelectOptions = `<option value="multiple_choice">Múltipla Escolha</option>
                      <option value="dropdown">Lista Suspensa</option>`;

code = code.replace(oldSelectOptions, newSelectOptions);

// Also need to handle the case where existing fields might have 'short_text', but they shouldn't since we removed them. Let's make sure that handleAddField creates a 'multiple_choice' field by default.
code = code.replace(
  "const newField = { id: \`field_\${Date.now()}\`, type: 'short_text', label: '', required: false, options: [] };",
  "const newField = { id: \`field_\${Date.now()}\`, type: 'multiple_choice', label: '', required: false, options: [] };"
);

fs.writeFileSync('src/pages/SetupForm.tsx', code);

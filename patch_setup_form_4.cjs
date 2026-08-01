const fs = require('fs');
let code = fs.readFileSync('src/pages/SetupForm.tsx', 'utf8');

const newSelectOptions = `<option value="short_text">Texto Curto (Nome, etc)</option>
                      <option value="email">E-mail</option>
                      <option value="phone">Telefone / WhatsApp</option>
                      <option value="multiple_choice">Múltipla Escolha</option>
                      <option value="dropdown">Lista Suspensa</option>`;

const oldSelectOptions = `<option value="multiple_choice">Múltipla Escolha</option>
                      <option value="dropdown">Lista Suspensa</option>`;

code = code.replace(oldSelectOptions, newSelectOptions);

fs.writeFileSync('src/pages/SetupForm.tsx', code);

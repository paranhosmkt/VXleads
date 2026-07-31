const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf8');

// 1. Add new state variables
code = code.replace(
  "const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', area: '' });",
  "const [leadForm, setLeadForm] = useState<Record<string, string>>({});\n  const [formFields, setFormFields] = useState<any[]>([]);\n  const [videoUrl, setVideoUrl] = useState<string | null>(null);\n  const [isPlayingVideo, setIsPlayingVideo] = useState(false);\n  const [videoEnded, setVideoEnded] = useState(false);"
);

// 2. Update fetchCompanyData
code = code.replace(
  "setCompanyName(data.razaoSocial || '');",
  "setCompanyName(data.razaoSocial || '');\n          setVideoUrl(data.videoUrl || null);\n          if (data.formFields && data.formFields.length > 0) {\n            setFormFields(data.formFields);\n          } else {\n            setFormFields([\n              { id: 'name', type: 'short_text', label: 'Nome Completo', required: true },\n              { id: 'email', type: 'email', label: 'E-mail', required: true },\n              { id: 'phone', type: 'phone', label: 'Telefone / WhatsApp', required: true },\n              { id: 'area', type: 'short_text', label: 'Área de Atuação', required: true }\n            ]);\n          }"
);

// 3. Update fallback formFields
code = code.replace(
  "setCharacter(AVAILABLE_CHARACTERS[0]);\n        }",
  "setCharacter(AVAILABLE_CHARACTERS[0]);\n          setFormFields([\n            { id: 'name', type: 'short_text', label: 'Nome Completo', required: true },\n            { id: 'email', type: 'email', label: 'E-mail', required: true },\n            { id: 'phone', type: 'phone', label: 'Telefone / WhatsApp', required: true },\n            { id: 'area', type: 'short_text', label: 'Área de Atuação', required: true }\n          ]);\n        }"
);

// Also fallback for non-uid branch
code = code.replace(
  "setCharacter(AVAILABLE_CHARACTERS[0]);\n          setLoading(false);",
  "setCharacter(AVAILABLE_CHARACTERS[0]);\n          setFormFields([\n            { id: 'name', type: 'short_text', label: 'Nome Completo', required: true },\n            { id: 'email', type: 'email', label: 'E-mail', required: true },\n            { id: 'phone', type: 'phone', label: 'Telefone / WhatsApp', required: true },\n            { id: 'area', type: 'short_text', label: 'Área de Atuação', required: true }\n          ]);\n          setLoading(false);"
);

// 4. Update the spin button function
code = code.replace(
  "const spin = () => {\n    if (isSpinning || prizes.length === 0) return;",
  "const spin = () => {\n    if (isSpinning || prizes.length === 0) return;\n    if (videoUrl && !videoEnded) {\n      setIsPlayingVideo(true);\n      return;\n    }\n"
);

code = code.replace(
  "setLeadCode('');\n    setLeadForm({ name: '', email: '', phone: '', area: '' });",
  "setLeadCode('');\n    setLeadForm({});\n    setVideoEnded(false);"
);

fs.writeFileSync('src/pages/Roulette.tsx', code);

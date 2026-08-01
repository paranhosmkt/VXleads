const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf8');

code = code.replace(
  "const [showForm, setShowForm] = useState(false);",
  "const [step, setStep] = useState<'intro' | 'video' | 'form' | 'spin' | 'prize'>('intro');\n  const [showForm, setShowForm] = useState(false);"
);

fs.writeFileSync('src/pages/Roulette.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf8');

code = code.replace(
  "const [isInactive, setIsInactive] = useState(false);",
  "const [isInactive, setIsInactive] = useState(false);\n  const [planType, setPlanType] = useState('Starter');"
);

code = code.replace(
  "setCompanyName(data.razaoSocial || '');",
  "setCompanyName(data.razaoSocial || '');\n          setPlanType(data.planType || 'Starter');"
);

code = code.replace(
  "{isOwner && (",
  "{isOwner && planType !== 'Starter' && ("
);

fs.writeFileSync('src/pages/Roulette.tsx', code);

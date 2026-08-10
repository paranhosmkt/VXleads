const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

code = code.replace(
  /export default function App\(\) \{/,
  "export default function Landing() {\n  const { t } = useTranslation();"
);

fs.writeFileSync('src/pages/Landing.tsx', code);

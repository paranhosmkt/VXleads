const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

code = code.replace(/import \{ PieChart/, "import { useTranslation } from 'react-i18next';\nimport { PieChart");

code = code.replace(/export default function Dashboard\(\) \{/, "export default function Dashboard() {\n  const { t } = useTranslation();");

fs.writeFileSync('src/pages/Dashboard.tsx', code);

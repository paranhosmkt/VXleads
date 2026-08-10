const fs = require('fs');
let demo = fs.readFileSync('src/components/InteractiveDemo.tsx', 'utf-8');
demo = "import { useTranslation } from 'react-i18next';\n" + demo;
fs.writeFileSync('src/components/InteractiveDemo.tsx', demo);
console.log("Fixed InteractiveDemo.tsx");

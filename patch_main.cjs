const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf-8');

code = code.replace(
  /import '\.\/index\.css';/,
  "import './index.css';\nimport './i18n';"
);

fs.writeFileSync('src/main.tsx', code);

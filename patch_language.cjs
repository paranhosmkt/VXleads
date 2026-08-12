const fs = require('fs');

let landing = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');
landing = landing.replace("import LanguageSwitcher from '../components/LanguageSwitcher';\n", "");
landing = landing.replace(/\s*<LanguageSwitcher \/>\n/g, "");
fs.writeFileSync('src/pages/Landing.tsx', landing);

let register = fs.readFileSync('src/pages/Register.tsx', 'utf-8');
register = register.replace("import LanguageSwitcher from '../components/LanguageSwitcher';\n", "");
register = register.replace(/\s*<LanguageSwitcher \/>\n/g, "");
fs.writeFileSync('src/pages/Register.tsx', register);

let i18n = fs.readFileSync('src/i18n.ts', 'utf-8');
// Only keep pt inside resources
// Let's use regex to extract just the pt block, or simpler: since we are writing a script, we can require and reserialize if it were json, but it's JS.

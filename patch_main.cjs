const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

const regex = /<main\b([^>]*)>/g;
code = code.replace(regex, '<motion.main$1\n        initial={{ opacity: 0, y: 30 }}\n        animate={{ opacity: 1, y: 0 }}\n        transition={{ duration: 0.6 }}\n      >');

code = code.replace(/<\/main>/g, '</motion.main>');

fs.writeFileSync('src/pages/Landing.tsx', code);

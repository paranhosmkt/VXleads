const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

const regex = /<footer\b([^>]*)>/g;
code = code.replace(regex, '<motion.footer$1\n        initial={{ opacity: 0, y: 30 }}\n        whileInView={{ opacity: 1, y: 0 }}\n        viewport={{ once: true }}\n        transition={{ duration: 0.6 }}\n      >');

code = code.replace(/<\/footer>/g, '</motion.footer>');

fs.writeFileSync('src/pages/Landing.tsx', code);

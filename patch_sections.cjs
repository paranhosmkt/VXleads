const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

const regex = /<section\b([^>]*)>/g;
code = code.replace(regex, '<motion.section$1\n        initial={{ opacity: 0, y: 30 }}\n        whileInView={{ opacity: 1, y: 0 }}\n        viewport={{ once: true, margin: "-100px" }}\n        transition={{ duration: 0.6 }}\n      >');

code = code.replace(/<\/section>/g, '</motion.section>');

fs.writeFileSync('src/pages/Landing.tsx', code);

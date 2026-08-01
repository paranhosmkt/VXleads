const fs = require('fs');
let code = fs.readFileSync('src/components/Chatbot.tsx', 'utf8');

code = code.replace('animate-fade-in-up', 'transform transition-all duration-300 translate-y-0 opacity-100');

fs.writeFileSync('src/components/Chatbot.tsx', code);

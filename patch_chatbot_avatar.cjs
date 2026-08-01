const fs = require('fs');
let code = fs.readFileSync('src/components/Chatbot.tsx', 'utf8');

code = code.replace(
  '<div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-sm">\n                <Bot size={24} />\n              </div>',
  '<div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-sm overflow-hidden">\n                <img src="https://i.ibb.co/gZ733fNV/Animated-character-presenting-ro-2-K-202607292208.jpg" alt="Gui" className="w-full h-full object-cover" />\n              </div>'
);

code = code.replace(
  '<h3 className="font-bold">Assistente VX</h3>',
  '<h3 className="font-bold">Fale com o Gui</h3>'
);

fs.writeFileSync('src/components/Chatbot.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

code = code.replace(
  '<p className="text-lg text-gray-600 leading-relaxed">\n                  A mágica acontece: o visitante joga e se cadastra direto no estande. O seu promoter apenas valida a tela de ganhador e entrega o brinde. Após o evento, a empresa exporta uma planilha com todos os leads qualificados, prontinha para abastecer o seu CRM e guiar o time comercial no direcionamento de conteúdos e vendas.\n                </p>',
  '<p className="text-lg text-gray-600 leading-relaxed">\n                  A mágica acontece: basta os usuários lerem o QR Code, assistirem o vídeo, preencherem as perguntas de qualificação e girarem a roleta para ganhar brindes. O seu promoter apenas valida a tela de ganhador e entrega o prêmio. Após o evento, você exporta uma planilha com todos os leads qualificados para o seu CRM.\n                </p>'
);

fs.writeFileSync('src/pages/Landing.tsx', code);

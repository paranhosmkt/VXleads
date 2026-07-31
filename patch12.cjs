const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

code = code.replace(
  'Esse link você poderá usar em um totem, tablet ou até mesmo enviar pelo WhatsApp para que diversos leads girem a roleta, ganhem brindes e façam o cadastro simultaneamente. O sistema se instala como um PWA e está pronto para rodar, garantindo funcionamento contínuo mesmo que a internet do evento oscile.',
  'Esse link você poderá usar em um totem ou tablet no seu estande para que os visitantes girem a roleta, ganhem brindes e façam o cadastro. O sistema se instala como um PWA e está pronto para rodar, garantindo funcionamento contínuo mesmo que a internet do evento oscile.'
);

code = code.replace(
  'A mágica acontece: o visitante joga e se cadastra. Seu promoter simplesmente valida o QR Code do ganhador e entrega o brinde. Após o evento, você exporta uma planilha com todos os leads qualificados, prontinha para abastecer o seu CRM e guiar o time comercial no direcionamento de conteúdos e vendas.',
  'A mágica acontece: o visitante joga e se cadastra direto no estande. O seu promoter apenas valida a tela de ganhador e entrega o brinde. Após o evento, a empresa exporta uma planilha com todos os leads qualificados, prontinha para abastecer o seu CRM e guiar o time comercial no direcionamento de conteúdos e vendas.'
);

fs.writeFileSync('src/pages/Landing.tsx', code);

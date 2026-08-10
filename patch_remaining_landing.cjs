const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

const r = (regex, replacement) => {
  code = code.replace(regex, replacement);
};

r(/<strong>Nota:<\/strong> O VX Leads pode ser complementar ao qrcode oficial do evento\. Nosso foco é atrair visitantes no estande com gamificação, gerenciar brindes e qualificar leads, podendo ser integrado com o sistema da feira quando permitido\./g, 
  "<span dangerouslySetInnerHTML={{ __html: t('landing.integration_note') }} />");

r(/Segundo pesquisas de <strong[^>]*>Inside Sales Benchmarks<\/strong>, a probabilidade de venda despenca drasticamente com o passar dos dias\. No dia do evento, a chance é de <strong[^>]*>95%<\/strong>, mas cai para apenas <strong[^>]*>12% no dia 10<\/strong>\./g, 
  "<span dangerouslySetInnerHTML={{ __html: t('landing.conversion.p1') }} />");
  
r(/Com o <strong[^>]*>VX Leads<\/strong>, o seu lead entra no dashboard em tempo real\. Você pode agir enquanto o lead ainda está aquecido, reduzindo o tempo de resposta e multiplicando as chances de fechamento usando seu próprio CRM\./g, 
  "<span dangerouslySetInnerHTML={{ __html: t('landing.conversion.p2') }} />");

fs.writeFileSync('src/pages/Landing.tsx', code);
console.log("Remaining patched");

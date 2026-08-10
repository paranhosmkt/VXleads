const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

code = code.replace(
  /Engaje mais visitantes, capte leads qualificados e multiplique os resultados da sua marca em feiras e eventos\. A única plataforma no Brasil que une jogos interativos, gamificação, captura offline e integração nativa com os principais CRMs\./g,
  "{t('hero.subtitle')}"
);

fs.writeFileSync('src/pages/Landing.tsx', code);

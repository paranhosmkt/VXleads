const fs = require('fs');
let code = fs.readFileSync('src/i18n.ts', 'utf-8');

code = code.replace(
  /title1: "A Roleta Interativa que",\n\s*title2: "Multiplica seus Leads",\n\s*title3: "em Eventos",/,
  'title1: "Transforme seu estande em uma ", \n        title2: "máquina de atrair clientes",\n        title3: "",'
);

code = code.replace(
  /title1: "The Interactive Wheel that",\n\s*title2: "Multiplies your Leads",\n\s*title3: "at Events",/,
  'title1: "Turn your booth into a ", \n        title2: "lead generating machine",\n        title3: "",'
);

code = code.replace(
  /title1: "La Ruleta Interactiva que",\n\s*title2: "Multiplica tus Leads",\n\s*title3: "en Eventos",/,
  'title1: "Convierte tu stand en una ", \n        title2: "máquina de atraer clientes",\n        title3: "",'
);

fs.writeFileSync('src/i18n.ts', code);

const fs = require('fs');
let code = fs.readFileSync('src/i18n.ts', 'utf-8');

code = code.replace(
  /title1: "Turn your booth into a ",/g,
  'title1: "Turn your trade show booth into a ",'
);

code = code.replace(
  /subtitle: "Turn booth visitors into/g,
  'subtitle: "Turn trade show booth visitors into'
);

fs.writeFileSync('src/i18n.ts', code);

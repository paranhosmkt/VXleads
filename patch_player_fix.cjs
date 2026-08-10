const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf-8');

code = code.replace(
  /import ReactPlayer from 'react-player';/,
  "import ReactPlayerRaw from 'react-player';\nconst ReactPlayer = ReactPlayerRaw as any;"
);

code = code.replace(
  /\{\/\* @ts-ignore \*\/\}\n\s*<ReactPlayer/g,
  "<ReactPlayer"
);

fs.writeFileSync('src/pages/Roulette.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf-8');

code = code.replace(
  /<ReactPlayer/g,
  "{/* @ts-ignore */}\n            <ReactPlayer"
);

fs.writeFileSync('src/pages/Roulette.tsx', code);

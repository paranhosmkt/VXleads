const fs = require('fs');
let tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf-8'));
delete tsconfig.compilerOptions.noUnusedLocals;
delete tsconfig.compilerOptions.noUnusedParameters;
fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));

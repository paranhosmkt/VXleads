const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf8');

const oldDefaults1 = `          setPrizes([
            { id: '1', nome: '10% de Desconto' },
            { id: '2', nome: 'Brinde Especial' },
            { id: '3', nome: 'Frete Grátis' },
            { id: '4', nome: 'Compre 1 Leve 2' },
          ]);`;

const newDefaults = `          setPrizes([
            { id: '1', nome: 'Aguardando selecionar' },
            { id: '2', nome: 'Aguardando selecionar' },
            { id: '3', nome: 'Aguardando selecionar' },
            { id: '4', nome: 'Aguardando selecionar' },
          ]);`;

code = code.replace(oldDefaults1, newDefaults);
code = code.replace(oldDefaults1, newDefaults);

fs.writeFileSync('src/pages/Roulette.tsx', code);

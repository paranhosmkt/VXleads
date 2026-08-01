const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

const oldAnswer = "Refere-se a quantas telas diferentes você pode conectar ao mesmo tempo usando o mesmo link de captação no seu estande. Se você alugar 10 totens para colocar em pontos diferentes do seu estande, precisará do Plano Pro, que permite que o sistema rode e sincronize leads vindos dessas 10 telas simultaneamente.";
const newAnswer = "Agora todos os nossos planos possuem dispositivos simultâneos ilimitados. Isso significa que você pode conectar quantas telas, totens ou celulares de promotores quiser ao mesmo tempo, em qualquer plano. O limite será apenas a cota de leads de cada plano.";

code = code.replace(oldAnswer, newAnswer);
fs.writeFileSync('src/pages/Landing.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldPlanStr = `        responseText = "Temos três planos disponíveis:\\n\\n🔹 **Starter:** R$47/mês (até 500 leads)\\n🔹 **Pro:** R$97/mês (até 2.000 leads)\\n🔹 **Premium:** R$147/mês (até 10.000 leads).";`;

const newPlanStr = `        responseText = "Temos três planos disponíveis (pagos por evento ou anual):\\n\\n🔹 **Starter:** (até 100 leads/evento)\\n🔹 **Pro:** (até 1.000 leads/evento)\\n🔹 **Enterprise:** (até 10 mil leads/evento)\\n\\nTambém oferecemos projetos personalizados sob consulta! Todos os planos têm dispositivos simultâneos ilimitados.";`;

const oldFunciona = `        responseText = "Funciona assim: O visitante escaneia o QR Code, preenche os dados no próprio celular, gira a roleta e ganha um brinde. Ao mesmo tempo, você capta o contato no seu dashboard em tempo real!";`;

const newFunciona = `        responseText = "Funciona assim: Você cria sua conta, escolhe um personagem, cadastra seus brindes e abre o link num tablet ou totem no evento. Os visitantes podem ler o QR Code ou interagir direto na tela para fazer o cadastro e girar a roleta. Os leads caem no seu dashboard em tempo real, e o sistema funciona até se a internet cair!";`;

code = code.replace(oldPlanStr, newPlanStr);
code = code.replace(oldFunciona, newFunciona);

fs.writeFileSync('server.ts', code);

const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf-8');

const r = (regex, replacement) => {
  code = code.replace(regex, replacement);
};

r(/>Voltar</g, ">{t('register2.back')}<");
r(/>Escolha seu Plano</g, ">{t('register2.choose_plan')}<");
r(/>Você tem um prêmio garantido!</g, ">{t('register2.prize_guaranteed')}<");
r(/>Para pequenos estandes e ativações pontuais\.</g, ">{t('register2.starter_desc')}<");
r(/>Mais Popular</g, ">{t('register2.most_popular')}<");
r(/>Para feiras médias e geração constante de leads\.</g, ">{t('register2.pro_desc')}<");
r(/>Para grandes congressos e operações em escala\.</g, ">{t('register2.enterprise_desc')}<");
r(/>Personalizado</g, ">{t('register2.custom')}<");
r(/>Projeto sob medida para sua necessidade\.</g, ">{t('register2.custom_desc')}<");
r(/>Sob Consulta</g, ">{t('register2.on_request')}<");
r(/>Voltar para Planos</g, ">{t('register2.back_to_plans')}<");
r(/>Crie sua Conta Empresarial</g, ">{t('register2.create_account')}<");
r(/>Logomarca \(Opcional - até 2MB\)</g, ">{t('register2.logo_optional')}<");
r(/>Inscrição Estadual</g, ">{t('register2.ie')}<");

fs.writeFileSync('src/pages/Register.tsx', code);
console.log("Register.tsx patched");

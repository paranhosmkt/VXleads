const fs = require('fs');
let i18n = fs.readFileSync('src/i18n.ts', 'utf-8');

const pt = {
  register: {
    back: "Voltar",
    choose_plan: "Escolha seu Plano",
    prize_guaranteed: "Você tem um prêmio garantido!",
    starter_desc: "Para pequenos estandes e ativações pontuais.",
    most_popular: "Mais Popular",
    pro_desc: "Para feiras médias e geração constante de leads.",
    enterprise_desc: "Para grandes congressos e operações em escala.",
    custom: "Personalizado",
    custom_desc: "Projeto sob medida para sua necessidade.",
    on_request: "Sob Consulta",
    back_to_plans: "Voltar para Planos",
    create_account: "Crie sua Conta Empresarial",
    logo_optional: "Logomarca (Opcional - até 2MB)",
    ie: "Inscrição Estadual"
  }
};
const en = {
  register: {
    back: "Back",
    choose_plan: "Choose your Plan",
    prize_guaranteed: "You have a guaranteed prize!",
    starter_desc: "For small booths and one-off activations.",
    most_popular: "Most Popular",
    pro_desc: "For medium trade shows and constant lead generation.",
    enterprise_desc: "For large conventions and scalable operations.",
    custom: "Custom",
    custom_desc: "Tailor-made project for your needs.",
    on_request: "On Request",
    back_to_plans: "Back to Plans",
    create_account: "Create your Business Account",
    logo_optional: "Logo (Optional - up to 2MB)",
    ie: "State Registration"
  }
};
const es = {
  register: {
    back: "Volver",
    choose_plan: "Elige tu Plan",
    prize_guaranteed: "¡Tienes un premio garantizado!",
    starter_desc: "Para stands pequeños y activaciones puntuales.",
    most_popular: "Más Popular",
    pro_desc: "Para ferias medianas y generación constante de leads.",
    enterprise_desc: "Para grandes congresos y operaciones a escala.",
    custom: "Personalizado",
    custom_desc: "Proyecto a medida para tus necesidades.",
    on_request: "Bajo Consulta",
    back_to_plans: "Volver a los Planes",
    create_account: "Crea tu Cuenta Empresarial",
    logo_optional: "Logotipo (Opcional - hasta 2MB)",
    ie: "Registro Estatal"
  }
};

let resourcesMatch = i18n.match(/const resources = (\{[\s\S]*?\});\s*i18n/);
if (resourcesMatch) {
  let resources = eval("(" + resourcesMatch[1] + ")");
  resources.pt.translation.register2 = pt.register;
  resources.en.translation.register2 = en.register;
  resources.es.translation.register2 = es.register;
  
  let newI18n = i18n.replace(resourcesMatch[1], JSON.stringify(resources, null, 2));
  fs.writeFileSync('src/i18n.ts', newI18n);
  console.log("i18n patched");
}

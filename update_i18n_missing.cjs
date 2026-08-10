const fs = require('fs');
let code = fs.readFileSync('src/i18n.ts', 'utf-8');

const pt = {
  landing: {
    integration_note: "Nota: O VX Leads pode ser complementar ao qrcode oficial do evento. Nosso foco é atrair visitantes no estande com gamificação, gerenciar brindes e qualificar leads, podendo ser integrado com o sistema da feira quando permitido.",
    integration_title: "Integração nativa com os principais CRMs do mercado",
    problem_solution: {
      title: "O Fim dos Estandes Vazios",
      problems_title: "Os problemas de sempre",
      p1_title: "Público Passivo",
      p1_desc: "Visitantes ignoram seu estande em pavilhões barulhentos e concorridos.",
      p2_title: "Dados Perdidos",
      p2_desc: "Brindes são entregues sem cadastro ou com dados falsos e ilegíveis.",
      p3_title: "Baixa conversão pós-evento",
      p3_desc: "Muitos cartões de visita e contatos diretos no whatsapp podem se perder e muitas vezes os leads esfriam.",
      solutions_title: "A Solução VX Leads",
      s1_title: "Atração Ativa",
      s1_desc: "A gamificação cria filas de espera, curiosidade e engajamento genuíno.",
      s2_title: "Dados Qualificados",
      s2_desc: "O brinde só é liberado após a validação de um cadastro digital completo.",
      s3_title: "Leads Organizados",
      s3_desc: "Planilha com os leads organizados e prontos para o seu CRM e seu time fazer contato e direcionar conteúdos."
    },
    conversion: {
      title1: "A Queda de Conversão",
      title2: "Pós-Evento",
      p1: "Segundo pesquisas de <strong>Inside Sales Benchmarks</strong>, a probabilidade de venda despenca drasticamente com o passar dos dias. No dia do evento, a chance é de <strong>95%</strong>, mas cai para apenas <strong>12% no dia 10</strong>.",
      p2: "Com o <strong>VX Leads</strong>, o seu lead entra no dashboard em tempo real. Você pode agir enquanto o lead ainda está aquecido, reduzindo o tempo de resposta e multiplicando as chances de fechamento usando seu próprio CRM.",
      source: "Fonte: Dados baseados no Inside Sales Benchmarks"
    }
  },
  demo: {
    title: "Veja como funciona a Gamificação",
    subtitle: "Jogue um dos nossos jogos abaixo e ganhe um desconto real para usar na contratação do seu plano VX Leads. *Válido para a 1ª contratação da empresa.",
    already_won: "Você já ganhou!",
    already_won_desc: "O prêmio é válido para a primeira contratação da sua empresa e não é acumulativo.",
    roulette_title: "Roleta Premiada",
    roulette_desc: "Gire a roleta clássica e descubra seu desconto.",
    scratch_title: "Raspadinha",
    scratch_desc: "Raspe a tela para revelar seu desconto.",
    slot_title: "Caça-Níquel",
    slot_desc: "Aperte o botão e torça para os símbolos alinharem.",
    scratch_instruction: "Passe o dedo ou mouse sobre a área acima",
    won_title: "Parabéns, você ganhou!",
    won_desc: "Prêmio registrado no seu navegador. Válido para a primeira contratação da sua empresa."
  },
  chatbot: {
    title: "Fale com o Gui"
  }
};

const en = {
  landing: {
    integration_note: "Note: VX Leads can complement the event's official QR code. Our focus is to attract booth visitors with gamification, manage giveaways and qualify leads, which can be integrated with the trade show system when allowed.",
    integration_title: "Native integration with the main CRMs on the market",
    problem_solution: {
      title: "The End of Empty Booths",
      problems_title: "The usual problems",
      p1_title: "Passive Audience",
      p1_desc: "Visitors ignore your booth in noisy and crowded halls.",
      p2_title: "Lost Data",
      p2_desc: "Giveaways are handed out without registration or with fake and illegible data.",
      p3_title: "Low post-event conversion",
      p3_desc: "Many business cards and direct WhatsApp contacts can get lost and leads often go cold."
    },
    conversion: {
      title1: "The Post-Event",
      title2: "Conversion Drop",
      p1: "According to <strong>Inside Sales Benchmarks</strong> research, the probability of selling plummets drastically as the days go by. On the day of the event, the chance is <strong>95%</strong>, but it drops to just <strong>12% on day 10</strong>.",
      p2: "With <strong>VX Leads</strong>, your lead enters the dashboard in real time. You can act while the lead is still warm, reducing response time and multiplying closing chances using your own CRM.",
      source: "Source: Data based on Inside Sales Benchmarks"
    }
  },
  demo: {
    title: "See how Gamification works",
    subtitle: "Play one of our games below and win a real discount to use when subscribing to your VX Leads plan. *Valid for the company's 1st subscription.",
    already_won: "You already won!",
    already_won_desc: "The prize is valid for your company's first subscription and is not cumulative.",
    roulette_title: "Prize Wheel",
    roulette_desc: "Spin the classic wheel and discover your discount.",
    scratch_title: "Scratchcard",
    scratch_desc: "Scratch the screen to reveal your discount.",
    slot_title: "Slot Machine",
    slot_desc: "Press the button and hope the symbols align.",
    scratch_instruction: "Swipe your finger or mouse over the area above",
    won_title: "Congratulations, you won!",
    won_desc: "Prize registered in your browser. Valid for your company's first subscription."
  },
  chatbot: {
    title: "Talk to Gui"
  }
};

const es = {
  landing: {
    integration_note: "Nota: VX Leads puede complementar el código QR oficial del evento. Nuestro enfoque es atraer visitantes al stand con gamificación, gestionar obsequios y calificar leads, pudiendo integrarse con el sistema de la feria cuando esté permitido.",
    integration_title: "Integración nativa con los principales CRMs del mercado",
    problem_solution: {
      title: "El Fin de los Stands Vacíos",
      problems_title: "Los problemas de siempre",
      p1_title: "Público Pasivo",
      p1_desc: "Los visitantes ignoran su stand en pabellones ruidosos y concurridos.",
      p2_title: "Datos Perdidos",
      p2_desc: "Los obsequios se entregan sin registro o con datos falsos e ilegibles.",
      p3_title: "Baja conversión post-evento",
      p3_desc: "Muchas tarjetas de presentación y contactos directos de WhatsApp pueden perderse y los leads a menudo se enfrían."
    },
    conversion: {
      title1: "La Caída de Conversión",
      title2: "Post-Evento",
      p1: "Según investigaciones de <strong>Inside Sales Benchmarks</strong>, la probabilidad de vender se desploma drásticamente a medida que pasan los días. El día del evento, la probabilidad es del <strong>95%</strong>, pero cae a solo <strong>12% en el día 10</strong>.",
      p2: "Con <strong>VX Leads</strong>, su lead ingresa al dashboard en tiempo real. Puede actuar mientras el lead aún está caliente, reduciendo el tiempo de respuesta y multiplicando las posibilidades de cierre utilizando su propio CRM.",
      source: "Fuente: Datos basados en Inside Sales Benchmarks"
    }
  },
  demo: {
    title: "Mira cómo funciona la Gamificación",
    subtitle: "Juega a uno de nuestros juegos a continuación y gana un descuento real para usar al contratar tu plan VX Leads. *Válido para la 1ª contratación de la empresa.",
    already_won: "¡Ya ganaste!",
    already_won_desc: "El premio es válido para la primera contratación de su empresa y no es acumulable.",
    roulette_title: "Ruleta Premiada",
    roulette_desc: "Gira la ruleta clásica y descubre tu descuento.",
    scratch_title: "Rasca y Gana",
    scratch_desc: "Rasca la pantalla para revelar tu descuento.",
    slot_title: "Tragamonedas",
    slot_desc: "Presiona el botón y espera que los símbolos se alineen.",
    scratch_instruction: "Desliza tu dedo o ratón sobre el área de arriba",
    won_title: "¡Felicidades, ganaste!",
    won_desc: "Premio registrado en su navegador. Válido para la primera contratación de su empresa."
  },
  chatbot: {
    title: "Habla con Gui"
  }
};

// Now we need to append these objects into the src/i18n.ts translations.
// Because it's a JS file with `const resources = { ... }`, we can eval it or use a script to modify it.

let resourcesMatch = code.match(/const resources = (\{[\s\S]*?\});\s*i18n/);
if (resourcesMatch) {
  let resources = eval("(" + resourcesMatch[1] + ")");
  
  Object.assign(resources.pt.translation.landing, pt.landing);
  resources.pt.translation.demo = pt.demo;
  resources.pt.translation.chatbot = pt.chatbot;
  
  resources.pt.translation.pricing.features.stock = "Gestão de Estoque";
  resources.pt.translation.pricing.features.custom_interface = "Interface personalizada";
  resources.pt.translation.pricing.features.full_integrations = "Integrações completas";
  resources.pt.translation.pricing.features.support_dedicated = "Suporte 24/7 dedicado";
  resources.pt.translation.footer.design_by = "Design por: ";
  resources.pt.translation.footer.design_agency = "Eleve gestão e estratégia";

  Object.assign(resources.en.translation.landing, en.landing);
  resources.en.translation.demo = en.demo;
  resources.en.translation.chatbot = en.chatbot;

  resources.en.translation.pricing.features.stock = "Inventory Management";
  resources.en.translation.pricing.features.custom_interface = "Custom Interface";
  resources.en.translation.pricing.features.full_integrations = "Full Integrations";
  resources.en.translation.pricing.features.support_dedicated = "24/7 Dedicated Support";
  resources.en.translation.footer.design_by = "Design by: ";
  resources.en.translation.footer.design_agency = "Eleve gestão e estratégia";
  
  Object.assign(resources.es.translation.landing, es.landing);
  resources.es.translation.demo = es.demo;
  resources.es.translation.chatbot = es.chatbot;

  resources.es.translation.pricing.features.stock = "Gestión de Stock";
  resources.es.translation.pricing.features.custom_interface = "Interfaz personalizada";
  resources.es.translation.pricing.features.full_integrations = "Integraciones completas";
  resources.es.translation.pricing.features.support_dedicated = "Soporte dedicado 24/7";
  resources.es.translation.footer.design_by = "Diseño de: ";
  resources.es.translation.footer.design_agency = "Eleve gestão e estratégia";

  const newCode = code.replace(resourcesMatch[1], JSON.stringify(resources, null, 2));
  fs.writeFileSync('src/i18n.ts', newCode);
  console.log("i18n updated with missing strings");
} else {
  console.log("Could not parse resources");
}


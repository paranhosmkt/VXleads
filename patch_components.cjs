const fs = require('fs');

// ==== LANDING ====
let landing = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

const r = (regex, replacement, fileCode = landing) => {
  return fileCode.replace(regex, replacement);
};

landing = r(/>Nota:.*?O VX Leads pode ser complementar.*?<\/strong>.*?quando permitido\.</s, "><span dangerouslySetInnerHTML={{ __html: t('landing.integration_note') }} /><");
landing = r(/>Integração nativa com os principais CRMs do mercado</g, ">{t('landing.integration_title')}<");
landing = r(/>O Fim dos Estandes Vazios</g, ">{t('landing.problem_solution.title')}<");
landing = r(/>Os problemas de sempre</g, ">{t('landing.problem_solution.problems_title')}<");
landing = r(/>Público Passivo</g, ">{t('landing.problem_solution.p1_title')}<");
landing = r(/>Visitantes ignoram seu estande em pavilhões barulhentos e concorridos\.</g, ">{t('landing.problem_solution.p1_desc')}<");
landing = r(/>Dados Perdidos</g, ">{t('landing.problem_solution.p2_title')}<");
landing = r(/>Brindes são entregues sem cadastro ou com dados falsos e ilegíveis\.</g, ">{t('landing.problem_solution.p2_desc')}<");
landing = r(/>Baixa conversão pós-evento</g, ">{t('landing.problem_solution.p3_title')}<");
landing = r(/>Muitos cartões de visita e contatos diretos no whatsapp podem se perder e muitas vezes os leads esfriam\.</g, ">{t('landing.problem_solution.p3_desc')}<");

landing = r(/>A Solução VX Leads</g, ">{t('landing.problem_solution.solutions_title')}<");
landing = r(/>Atração Ativa</g, ">{t('landing.problem_solution.s1_title')}<");
landing = r(/>A gamificação cria filas de espera, curiosidade e engajamento genuíno\.</g, ">{t('landing.problem_solution.s1_desc')}<");
landing = r(/>Dados Qualificados</g, ">{t('landing.problem_solution.s2_title')}<");
landing = r(/>O brinde só é liberado após a validação de um cadastro digital completo\.</g, ">{t('landing.problem_solution.s2_desc')}<");
landing = r(/>Leads Organizados</g, ">{t('landing.problem_solution.s3_title')}<");
landing = r(/>Planilha com os leads organizados e prontos para o seu CRM e seu time fazer contato e direcionar conteúdos\.</g, ">{t('landing.problem_solution.s3_desc')}<");

landing = r(/A Queda de Conversão <br\/>/, "{t('landing.conversion.title1')} <br/>");
landing = r(/>Pós-Evento</g, ">{t('landing.conversion.title2')}<");
landing = r(/>Segundo pesquisas de <strong[^>]*>Inside Sales Benchmarks<\/strong>, a probabilidade de venda despenca drasticamente com o passar dos dias\. No dia do evento, a chance é de <strong[^>]*>95%<\/strong>, mas cai para apenas <strong[^>]*>12% no dia 10<\/strong>\.</g, 
  "><span dangerouslySetInnerHTML={{ __html: t('landing.conversion.p1') }} /><");
landing = r(/>Com o <strong[^>]*>VX Leads<\/strong>, o seu lead entra no dashboard em tempo real\. Você pode agir enquanto o lead ainda está aquecido, reduzindo o tempo de resposta e multiplicando as chances de fechamento usando seu próprio CRM\.</g,
  "><span dangerouslySetInnerHTML={{ __html: t('landing.conversion.p2') }} /><");
landing = r(/>Fonte: Dados baseados no Inside Sales Benchmarks</g, ">{t('landing.conversion.source')}<");

landing = r(/>Gestão de Estoque</g, ">{t('pricing.features.stock')}<");
landing = r(/>Interface personalizada</g, ">{t('pricing.features.custom_interface')}<");
landing = r(/>Integrações completas</g, ">{t('pricing.features.full_integrations')}<");
landing = r(/>Suporte 24\/7 dedicado</g, ">{t('pricing.features.support_dedicated')}<");

landing = r(/Design por:/g, "{t('footer.design_by')}");
landing = r(/>Eleve gestão e estratégia</g, ">{t('footer.design_agency')}<");
landing = r(/>contato@vxleads\.com\.br</g, ">{t('footer.contact_email') || 'contato@vxleads.com.br'}<");

fs.writeFileSync('src/pages/Landing.tsx', landing);


// ==== INTERACTIVE DEMO ====
let demo = fs.readFileSync('src/components/InteractiveDemo.tsx', 'utf-8');

demo = demo.replace(/import React, \{ useState, useEffect, useRef \} from 'react';/, "import React, { useState, useEffect, useRef } from 'react';\nimport { useTranslation } from 'react-i18next';");
demo = demo.replace(/export default function InteractiveDemo\(\) \{/, "export default function InteractiveDemo() {\n  const { t } = useTranslation();");

demo = r(/>Veja como funciona a Gamificação</g, ">{t('demo.title')}<", demo);
demo = r(/>Jogue um dos nossos jogos abaixo e ganhe um desconto real para usar na contratação do seu plano VX Leads\. \*Válido para a 1ª contratação da empresa\.</g, ">{t('demo.subtitle')}<", demo);
demo = r(/>Você já ganhou!</g, ">{t('demo.already_won')}<", demo);
demo = r(/>O prêmio é válido para a primeira contratação da sua empresa e não é acumulativo\.</g, ">{t('demo.already_won_desc')}<", demo);
demo = r(/>Roleta Premiada</g, ">{t('demo.roulette_title')}<", demo);
demo = r(/>Gire a roleta clássica e descubra seu desconto\.</g, ">{t('demo.roulette_desc')}<", demo);
demo = r(/>Raspadinha</g, ">{t('demo.scratch_title')}<", demo);
demo = r(/>Raspe a tela para revelar seu desconto\.</g, ">{t('demo.scratch_desc')}<", demo);
demo = r(/>Caça-Níquel</g, ">{t('demo.slot_title')}<", demo);
demo = r(/>Aperte o botão e torça para os símbolos alinharem\.</g, ">{t('demo.slot_desc')}<", demo);
demo = r(/>Passe o dedo ou mouse sobre a área acima</g, ">{t('demo.scratch_instruction')}<", demo);
demo = r(/>Parabéns, você ganhou!</g, ">{t('demo.won_title')}<", demo);
demo = r(/>Prêmio registrado no seu navegador\. Válido para a primeira contratação da sua empresa\.</g, ">{t('demo.won_desc')}<", demo);
demo = r(/>Fechar</g, ">{t('dashboard.close') || 'Fechar'}<", demo); // using dashboard.close since it's already there or we can just use a generic one if needed. Let's provide fallback.

fs.writeFileSync('src/components/InteractiveDemo.tsx', demo);


// ==== CHATBOT ====
let chatbot = fs.readFileSync('src/components/Chatbot.tsx', 'utf-8');

chatbot = chatbot.replace(/import React, \{ useState, useRef, useEffect \} from 'react';/, "import React, { useState, useRef, useEffect } from 'react';\nimport { useTranslation } from 'react-i18next';");
chatbot = chatbot.replace(/export default function Chatbot\(\) \{/, "export default function Chatbot() {\n  const { t } = useTranslation();");
chatbot = r(/>Fale com o Gui</g, ">{t('chatbot.title')}<", chatbot);

fs.writeFileSync('src/components/Chatbot.tsx', chatbot);
console.log("Patched components");


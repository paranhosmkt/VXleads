const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

const r = (regex, replacement) => {
  code = code.replace(regex, replacement);
};

// Planos Title
r(/>Planos que cabem no seu evento</, ">{t('pricing.title')}<"); // or something, but we have pricing.title already.

// Names & descriptions
r(/>Starter</g, ">{t('pricing.starter.name')}<");
r(/>Para pequenos estandes e ativações pontuais\.</, ">{t('pricing.starter.desc')}<");
r(/>Pro</g, ">{t('pricing.pro.name')}<");
r(/>Para feiras regionais e médias empresas\.</, ">{t('pricing.pro.desc')}<");
r(/>Enterprise</g, ">{t('pricing.enterprise.name')}<");
r(/>Para grandes marcas e feiras maiores\.</, ">{t('pricing.enterprise.desc')}<");
r(/>Personalizado</g, ">{t('pricing.custom.name')}<");
r(/>Projeto sob medida para sua necessidade\.</, ">{t('pricing.custom.desc')}<");

r(/>Até \{isAnnual \? "2\.400" : "100"\} leads</, ">{isAnnual ? t('pricing.starter.leads_annual') : t('pricing.starter.leads')}<");
r(/>Até \{isAnnual \? "24\.000" : "1\.000"\} leads</, ">{isAnnual ? t('pricing.pro.leads_annual') : t('pricing.pro.leads')}<");
r(/>Até \{isAnnual \? "240\.000" : "10 mil"\} Leads</, ">{isAnnual ? t('pricing.enterprise.leads_annual') : t('pricing.enterprise.leads')}<");

r(/>Dispositivos simultâneos ilimitados</g, ">{t('pricing.features.unlimited_devices')}<");
r(/>Modo Offline</g, ">{t('pricing.features.offline')}<");
r(/>Exportação CSV</g, ">{t('pricing.features.csv')}<");
r(/>Integração com CRM</g, ">{t('pricing.features.crm')}<");
r(/>Integração CRM \/ Webhook</g, ">{t('pricing.features.crm')}<");
r(/>Suporte via WhatsApp</g, ">{t('pricing.features.support_whatsapp')}<");
r(/>Suporte 24\/7 no Evento</g, ">{t('pricing.features.support_247')}<");
r(/>Leads personalizados</g, ">{t('pricing.features.custom_leads')}<");

r(/>Sob Consulta</g, ">{t('pricing.custom.price')}<");

r(/>Começar com Starter</, ">{t('pricing.buttons.starter')}<");
r(/>Assinar Plano Pro</, ">{t('pricing.buttons.pro')}<");
r(/>Assinar Plano Enterprise</, ">{t('pricing.buttons.enterprise')}<");
r(/>Falar com Consultor</, ">{t('pricing.buttons.custom')}<");

// Other pricing texts
r(/>Por Evento</, ">{t('pricing.monthly')}<");
r(/>Anual \(Economize 20%\)</, ">{t('pricing.annual')}<");

// Footer
r(/>Acompanhe nossas redes sociais</, ">{t('footer.social') || 'Follow our social networks'}<");
r(/>Políticas</, ">{t('footer.legal')}<");
r(/>Contato</, ">{t('footer.contact') || 'Contact'}<");
r(/>A melhor plataforma de gamificação e captação de leads para eventos corporativos\.</, ">{t('footer.about')}<");

fs.writeFileSync('src/pages/Landing.tsx', code);

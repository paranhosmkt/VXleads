const fs = require('fs');

// ==== LANDING ====
let landing = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

const r = (regex, replacement) => {
  landing = landing.replace(regex, replacement);
};

// Stats
r(/>Retenção Média</, ">{t('landing.stats.retention')}<");
r(/>dos visitantes que iniciam o jogo chegam até o final e deixam o contato\.</, ">{t('landing.stats.retention_desc')}<");
r(/>Tempo Médio</, ">{t('landing.stats.time')}<");
r(/>de atenção retida no seu estande, criando conexão real com a marca\.</, ">{t('landing.stats.time_desc')}<");
r(/>Mais Leads</, ">{t('landing.stats.leads')}<");
r(/>volume de captação comparado com formulários tradicionais ou totens estáticos\.</, ">{t('landing.stats.leads_desc')}<");

// Features
r(/>Por que escolher a VX Leads\?</g, ">{t('landing.features.title')}<");
r(/>Software 100% SaaS</, ">{t('landing.features.f1_title')}<");
r(/>Use em qualquer tablet ou smartphone\. Não alugamos equipamentos, você tem total liberdade para usar o que já tem\.</, ">{t('landing.features.f1_desc')}<");
r(/>Funcionamento Offline</, ">{t('landing.features.f2_title')}<");
r(/>A internet da feira caiu\? Sem problemas\. O sistema continua captando e sincroniza tudo automaticamente quando a rede voltar\.</, ">{t('landing.features.f2_desc')}<");
r(/>Integração Direta</, ">{t('landing.features.f3_title')}<");
r(/>Envie os leads direto para RD Station, HubSpot, Pipedrive e outros via webhook\. Sem necessidade de exportar planilhas manualmente\.</, ">{t('landing.features.f3_desc')}<");
r(/>Jogos Interativos</, ">{t('landing.features.f4_title')}<");
r(/>Roleta de prêmios, Quiz, Raspadinha e mais\. Gamificação comprovada para atrair a atenção em um ambiente cheio de distrações\.</, ">{t('landing.features.f4_desc')}<");

// How it works
r(/>Como Funciona</g, ">{t('landing.how_it_works.title')}<");
r(/>Passos para o Expositor</, ">{t('landing.how_it_works.exhibitor_title')}<");
r(/>Faça seu cadastro</, ">{t('landing.how_it_works.e1_title')}<");
r(/>Crie sua conta rapidamente e configure os dados da sua empresa e do evento\.</, ">{t('landing.how_it_works.e1_desc')}<");
r(/>Adicione seu vídeo de pitch</, ">{t('landing.how_it_works.e2_title')}<");
r(/>Cole o link de um vídeo curto \(cerca de 15 segundos\) para apresentar sua empresa aos visitantes antes de jogarem\.</, ">{t('landing.how_it_works.e2_desc')}<");
r(/>Adicione os brindes</, ">{t('landing.how_it_works.e3_title')}<");
r(/>Cadastre os prêmios que serão sorteados e defina o estoque de cada um para ter controle total\.</, ">{t('landing.how_it_works.e3_desc')}<");
r(/>Copie o link gerado</, ">{t('landing.how_it_works.e4_title')}<");
r(/>Abra o link exclusivo no tablet que ficará no seu estande\. É por ele que os promotores farão as abordagens\.</, ">{t('landing.how_it_works.e4_desc')}<");
r(/>Exporte os Leads</, ">{t('landing.how_it_works.e5_title')}<");
r(/>Você pode conectar diretamente com seu CRM ou exportar a planilha para o seu time de vendas em tempo real\.</, ">{t('landing.how_it_works.e5_desc')}<");
r(/>Passos para o Visitante</, ">{t('landing.how_it_works.visitor_title')}<");
r(/>Leitura do Crachá</, ">{t('landing.how_it_works.v1_title')}<");
r(/>O promotor usa o tablet para ler o QR Code do crachá \(se compatível\) ou pede os dados básicos \(Nome, Email, Telefone\)\.</, ">{t('landing.how_it_works.v1_desc')}<");
r(/>Vídeo Institucional \(Opcional\)</, ">{t('landing.how_it_works.v2_title')}<");
r(/>O visitante assiste a um vídeo curto de 15s sobre sua empresa, garantindo que ele conheça sua solução antes do brinde\.</, ">{t('landing.how_it_works.v2_desc')}<");
r(/>Hora de Jogar e Ganhar!</, ">{t('landing.how_it_works.v3_title')}<");
r(/>A roleta gira, o brinde é sorteado de acordo com a probabilidade definida por você, e o lead é salvo com sucesso!</, ">{t('landing.how_it_works.v3_desc')}<");

// FAQ
r(/>Perguntas Frequentes</g, ">{t('landing.faq.title')}<");
r(/>Preciso alugar um totem ou tablet com vocês\?</, ">{t('landing.faq.q1')}<");
r(/>O VX Leads é uma <strong[^>]*>plataforma de software \(SaaS\)<\/strong>\. Nós fornecemos o sistema web, o painel de controle e os jogos gamificados virtuais\. <strong[^>]*>O tablet físico não está incluso nos planos<\/strong>\. Nossa plataforma pode ser acessada através de um link em qualquer dispositivo touch screen com navegador de internet \(tablets ou smartphones\) que você já possua ou alugue com fornecedores locais\.</, "><span dangerouslySetInnerHTML={{ __html: t('landing.faq.a1') }} /><");

// Wait, the innerHTML is tricky, let's just replace the text without strong if the user didn't use it, or let's use the exact text.
// Actually, it's easier to replace the entire <p> or just strip it.
// Let's replace the whole FaqItem answers.
landing = landing.replace(/question="Preciso alugar um totem ou tablet com vocês\?"\s*answer=\{\s*<>\s*O VX Leads é uma <strong>plataforma de software \(SaaS\)<\/strong>.*?<\/>\s*\}/s,
  "question={t('landing.faq.q1')} answer={t('landing.faq.a1')}");
landing = landing.replace(/question="O VX Leads funciona sem internet\?"\s*answer=\{\s*<>\s*Sim!.*?<\/>\s*\}/s,
  "question={t('landing.faq.q2')} answer={t('landing.faq.a2')}");
landing = landing.replace(/question="Ele substitui o leitor oficial da feira\?"\s*answer=\{\s*<>\s*<strong>Não\.<\/strong>.*?<\/>\s*\}/s,
  "question={t('landing.faq.q3')} answer={t('landing.faq.a3')}");
landing = landing.replace(/question="Tem integração com meu CRM\?"\s*answer="Sim\..*?"/s,
  "question={t('landing.faq.q4')} answer={t('landing.faq.a4')}");
landing = landing.replace(/question="Posso exportar os dados depois\?"\s*answer="Sim!.*?"/s,
  "question={t('landing.faq.q5')} answer={t('landing.faq.a5')}");
landing = landing.replace(/question="E se a feira tiver milhares de pessoas\? O sistema aguenta\?"\s*answer="Com certeza\..*?"/s,
  "question={t('landing.faq.q6')} answer={t('landing.faq.a6')}");

// Partners
r(/>Programa de Parceiros VX Leads</, ">{t('landing.partners.tag')}<");
r(/>Ajude empresas a vender mais e seja muito bem remunerado</, ">{t('landing.partners.title')}<");
r(/>Você é agência de marketing.*?recorrentes\.</, ">{t('landing.partners.desc')}<");
r(/>Comissões generosas em todos os planos</, ">{t('landing.partners.b1')}<");
r(/>Material de apoio e vendas pronto para usar</, ">{t('landing.partners.b2')}<");
r(/>Painel exclusivo para acompanhar suas indicações</, ">{t('landing.partners.b3')}<");
r(/>Quero ser um parceiro</, ">{t('landing.partners.cta')}<");

fs.writeFileSync('src/pages/Landing.tsx', landing);
console.log("Landing done");

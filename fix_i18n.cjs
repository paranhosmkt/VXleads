const fs = require('fs');

const pt = {
      nav: {
        features: "Funcionalidades",
        how_it_works: "Como Funciona",
        pricing: "Planos",
        login: "Entrar",
        register: "Criar Conta"
      },
      hero: {
        badge: "Inovação em Captação de Leads",
        title1: "Transforme seu estande em uma ", 
        title2: "máquina de atrair clientes",
        title3: "",
        subtitle: "Transforme visitantes do seu estande em clientes qualificados com uma experiência interativa, offline-first e gamificada.",
        cta_primary: "Começar Agora",
        cta_secondary: "Ver Demonstração",
      },
      pricing: {
        title: "Planos Simples e Transparentes",
        subtitle: "Escolha o plano ideal para o tamanho do seu evento. Sem taxas ocultas.",
        monthly: "Por Evento",
        annual: "Anual (Eventos Ilimitados)",
        starter: {
          name: "Starter",
          desc: "Para pequenos estandes e ativações pontuais.",
          price_event: "R$ 797",
          price_annual: "R$ 4.997",
          leads: "Até 100 leads",
          leads_annual: "Até 2.400 leads"
        },
        pro: {
          name: "Pro",
          desc: "Para feiras médias e geração constante de leads.",
          price_event: "R$ 1.497",
          price_annual: "R$ 9.997",
          leads: "Até 1.000 leads",
          leads_annual: "Até 12.000 leads",
          popular: "Mais Popular"
        },
        enterprise: {
          name: "Enterprise",
          desc: "Para grandes congressos e operações em escala.",
          price_event: "R$ 2.997",
          price_annual: "R$ 19.997",
          leads: "Até 10.000 leads",
          leads_annual: "Até 120.000 leads"
        },
        custom: {
          name: "Personalizado",
          desc: "Projeto sob medida para sua necessidade.",
          price: "Sob Consulta"
        },
        features: {
          offline: "Modo Offline",
          csv: "Exportação CSV",
          custom_design: "Design Personalizado",
          support_email: "Suporte por E-mail",
          support_whatsapp: "Suporte via WhatsApp",
          support_247: "Suporte 24/7 no Evento",
          crm: "Integração CRM / Webhook",
          custom_leads: "Leads personalizados",
          unlimited_devices: "Dispositivos simultâneos ilimitados"
        },
        buttons: {
          starter: "Começar com Starter",
          pro: "Assinar Plano Pro",
          enterprise: "Assinar Plano Enterprise",
          custom: "Falar com Consultor"
        }
      },
      footer: {
        about: "A melhor plataforma de gamificação e captação de leads para eventos corporativos.",
        product: "Produto",
        company: "Empresa",
        legal: "Legal",
        rights: "Todos os direitos reservados."
      }
};

const en = {
      nav: {
        features: "Features",
        how_it_works: "How it Works",
        pricing: "Pricing",
        login: "Log in",
        register: "Sign Up"
      },
      hero: {
        badge: "Innovation in Lead Generation",
        title1: "Turn your trade show booth into a ", 
        title2: "lead generating machine",
        title3: "",
        subtitle: "Turn trade show booth visitors into qualified customers with an interactive, offline-first, and gamified experience.",
        cta_primary: "Get Started Now",
        cta_secondary: "View Demo",
      },
      pricing: {
        title: "Simple and Transparent Pricing",
        subtitle: "Choose the ideal plan for your event size. No hidden fees.",
        monthly: "Per Event",
        annual: "Annual (Unlimited Events)",
        starter: {
          name: "Starter",
          desc: "For small booths and one-off activations.",
          price_event: "$ 149",
          price_annual: "$ 999",
          leads: "Up to 100 leads",
          leads_annual: "Up to 2,400 leads"
        },
        pro: {
          name: "Pro",
          desc: "For medium trade shows and constant lead generation.",
          price_event: "$ 299",
          price_annual: "$ 1,999",
          leads: "Up to 1,000 leads",
          leads_annual: "Up to 12,000 leads",
          popular: "Most Popular"
        },
        enterprise: {
          name: "Enterprise",
          desc: "For large conferences and scaled operations.",
          price_event: "$ 599",
          price_annual: "$ 3,999",
          leads: "Up to 10,000 leads",
          leads_annual: "Up to 120,000 leads"
        },
        custom: {
          name: "Custom",
          desc: "Tailor-made project for your needs.",
          price: "Contact Us"
        },
        features: {
          offline: "Offline Mode",
          csv: "CSV Export",
          custom_design: "Custom Design",
          support_email: "Email Support",
          support_whatsapp: "WhatsApp Support",
          support_247: "24/7 Event Support",
          crm: "CRM / Webhook Integration",
          custom_leads: "Custom Leads",
          unlimited_devices: "Unlimited Simultaneous Devices"
        },
        buttons: {
          starter: "Start with Starter",
          pro: "Subscribe to Pro",
          enterprise: "Subscribe to Enterprise",
          custom: "Talk to Sales"
        }
      },
      footer: {
        about: "The best gamification and lead generation platform for corporate events.",
        product: "Product",
        company: "Company",
        legal: "Legal",
        rights: "All rights reserved."
      }
};

const es = {
      nav: {
        features: "Funciones",
        how_it_works: "Cómo Funciona",
        pricing: "Planes",
        login: "Iniciar Sesión",
        register: "Crear Cuenta"
      },
      hero: {
        badge: "Innovación en Captación de Leads",
        title1: "Convierte tu stand en una ", 
        title2: "máquina de atraer clientes",
        title3: "",
        subtitle: "Convierte a los visitantes de tu stand en clientes calificados con una experiencia interactiva, offline-first y gamificada.",
        cta_primary: "Empezar Ahora",
        cta_secondary: "Ver Demostración",
      },
      pricing: {
        title: "Planes Simples y Transparentes",
        subtitle: "Elige el plan ideal para el tamaño de tu evento. Sin cargos ocultos.",
        monthly: "Por Evento",
        annual: "Anual (Eventos Ilimitados)",
        starter: {
          name: "Starter",
          desc: "Para stands pequeños y activaciones puntuales.",
          price_event: "€ 149",
          price_annual: "€ 999",          leads: "Hasta 100 leads",
          leads_annual: "Hasta 2.400 leads"
        },
        pro: {
          name: "Pro",
          desc: "Para ferias medianas y generación constante de leads.",
          price_event: "€ 299",
          price_annual: "€ 1.999",
          leads: "Hasta 1.000 leads",
          leads_annual: "Hasta 12.000 leads",
          popular: "Más Popular"
        },
        enterprise: {
          name: "Enterprise",
          desc: "Para grandes congresos y operaciones a escala.",
          price_event: "€ 599",
          price_annual: "€ 3.999",
          leads: "Hasta 10.000 leads",
          leads_annual: "Hasta 120.000 leads"
        },
        custom: {
          name: "Personalizado",
          desc: "Proyecto a medida para tus necesidades.",
          price: "Consultar"
        },
        features: {
          offline: "Modo Offline",
          csv: "Exportación CSV",
          custom_design: "Diseño Personalizado",
          support_email: "Soporte por Correo",
          support_whatsapp: "Soporte vía WhatsApp",
          support_247: "Soporte 24/7 en Evento",
          crm: "Integración CRM / Webhook",
          custom_leads: "Leads personalizados",
          unlimited_devices: "Dispositivos simultáneos ilimitados"
        },
        buttons: {
          starter: "Comenzar con Starter",
          pro: "Suscribirse a Pro",
          enterprise: "Suscribirse a Enterprise",
          custom: "Hablar con Ventas"
        }
      },
      footer: {
        about: "La mejor plataforma de gamificación y captación de leads para eventos corporativos.",
        product: "Producto",
        company: "Empresa",
        legal: "Legal",
        rights: "Todos los derechos reservados."
      }
};

const i1 = require('./update_i18n_full.cjs');
const i2 = require('./update_dashboard_i18n.cjs');
const i3 = require('./patch_login.cjs');

Object.assign(pt, i1.pt, i2.pt, i3.pt);
Object.assign(en, i1.en, i2.en, i3.en);
Object.assign(es, i1.es, i2.es, i3.es);

const code = `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  pt: { translation: ${JSON.stringify(pt, null, 2)} },
  en: { translation: ${JSON.stringify(en, null, 2)} },
  es: { translation: ${JSON.stringify(es, null, 2)} }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;
`;

fs.writeFileSync('src/i18n.ts', code);

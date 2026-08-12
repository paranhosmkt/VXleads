import express from "express";
import Stripe from 'stripe';
import path from "path";
import { createServer as createViteServer } from "vite";
async function startServer() {
  const app = express();
  const PORT = 3000;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51Px', {
    apiVersion: '2023-10-16' as any
  });

  app.use(express.json());

  app.post("/api/verify-session", async (req, res) => {
    try {
      const { session_id } = req.body;
      const session = await stripe.checkout.sessions.retrieve(session_id);
      res.json({
        status: session.payment_status,
        customer_email: session.customer_details?.email
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { plan, cycle } = req.body;
      
      // CONFIGURAÇÃO DOS PRODUTOS DO STRIPE (COLOQUE SEUS PRICE IDs AQUI)
      // Exemplo: 'price_1Pxxxxxxxxxxxxx'
      const STRIPE_PRICE_IDS = {
        starter: {
          event: '', // ID do preço Starter por Evento
          annual: '' // ID do preço Starter Anual
        },
        pro: {
          event: '', // ID do preço Pro por Evento
          annual: '' // ID do preço Pro Anual
        },
        enterprise: {
          event: '', // ID do preço Enterprise por Evento
          annual: '' // ID do preço Enterprise Anual
        }
      };

      const selectedPriceId = STRIPE_PRICE_IDS[plan as keyof typeof STRIPE_PRICE_IDS]?.[cycle as 'event' | 'annual'];
      
      let sessionConfig: any = {
        payment_method_types: ['card'],
        success_url: `http://${req.headers.host}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://${req.headers.host}/cadastro`,
      };

      if (selectedPriceId) {
        // Se o usuário configurou os IDs no código acima, usamos eles:
        sessionConfig.line_items = [{ price: selectedPriceId, quantity: 1 }];
        sessionConfig.mode = cycle === 'annual' ? 'subscription' : 'payment';
      } else {
        // Fallback dinâmico (não precisa de aprovação de documentos para testar)
        let amount = 0;
        let currency = 'brl';
        
        if (plan === 'starter') {
          amount = cycle === 'annual' ? 499700 : 79700;
                  } else if (plan === 'pro') {
          amount = cycle === 'annual' ? 899700 : 149700;
                  } else if (plan === 'enterprise') {
          amount = cycle === 'annual' ? 2499700 : 299700;
                  }
        
        currency = 'brl';

        sessionConfig.line_items = [{
          price_data: {
            currency: currency,
            product_data: {
              name: `Plano ${plan.toUpperCase()} (${cycle === 'annual' ? 'Anual' : 'Por Evento'})`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        }];
        sessionConfig.mode = 'payment';
      }
      
      const session = await stripe.checkout.sessions.create(sessionConfig);
      
      res.json({ id: session.id, url: session.url });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API routes FIRST
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      const lastMessage = messages[messages.length - 1]?.text?.toLowerCase() || '';
      
      let responseText = "Desculpe, não entendi. Você pode perguntar sobre nossos planos, como funciona, brindes, dashboard ou modo TV.";

      if (lastMessage.includes("crm")) {
        responseText = "Não, o VX Leads não é um CRM. Nós somos uma ferramenta focada na **captação de leads** (atrair visitantes e coletar dados de forma interativa com a roleta). O objetivo é que você exporte os contatos capturados no nosso dashboard para utilizá-los no seu CRM de vendas.";
      } else if (lastMessage.includes("plano") || lastMessage.includes("preço") || lastMessage.includes("valor") || lastMessage.includes("custa")) {
        responseText = "Temos três planos disponíveis (pagos por evento ou anual):\n\n🔹 **Starter:** (até 100 leads/evento)\n🔹 **Pro:** (até 1.000 leads/evento)\n🔹 **Enterprise:** (até 10 mil leads/evento)\n\nTambém oferecemos projetos personalizados sob consulta! Todos os planos têm dispositivos simultâneos ilimitados.";
      } else if (lastMessage.includes("funciona")) {
        responseText = "Funciona assim: Você cria sua conta, escolhe um personagem, cadastra seus brindes e abre o link num tablet ou totem no evento. Os visitantes podem ler o QR Code ou interagir direto na tela para fazer o cadastro e girar a roleta. Os leads caem no seu dashboard em tempo real, e o sistema funciona até se a internet cair!";
      } else if (lastMessage.includes("brinde") || lastMessage.includes("prêmio") || lastMessage.includes("premio") || lastMessage.includes("roleta")) {
        responseText = "Você tem total liberdade para configurar os brindes e definir as chances (probabilidade) de cada um sair na roleta através do nosso painel.";
      } else if (lastMessage.includes("dashboard") || lastMessage.includes("painel") || lastMessage.includes("lead") || lastMessage.includes("contato")) {
        responseText = "Nosso dashboard em tempo real permite que você veja todos os contatos (leads) captados durante o evento e exporte os dados facilmente.";
      } else if (lastMessage.includes("tv") || lastMessage.includes("tela")) {
        responseText = "O Modo TV permite exibir a roleta em um telão no seu estande! Ele mostra os últimos ganhadores e um QR Code para os visitantes lerem e participarem.";
      } else if (lastMessage.includes("oi") || lastMessage.includes("olá") || lastMessage.includes("ola") || lastMessage.includes("bom dia") || lastMessage.includes("boa tarde") || lastMessage.includes("boa noite")) {
        responseText = "Olá! Como posso te ajudar? Você pode me perguntar sobre nossos planos, funcionalidades ou como a plataforma funciona.";
      }

      // Adicionar um pequeno atraso para parecer mais natural
      setTimeout(() => {
        res.json({ text: responseText });
      }, 800);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao processar a mensagem" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

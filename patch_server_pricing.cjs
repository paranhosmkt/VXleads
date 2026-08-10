const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /app\.post\("\/api\/create-checkout-session", async \(req, res\) => \{[\s\S]*?res\.json\(\{ id: session\.id, url: session\.url \}\);\n    \} catch \(e: any\) \{/m;

const replacement = `app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { plan, cycle, lang } = req.body;
      
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
        success_url: \`http://\${req.headers.host}/dashboard?session_id={CHECKOUT_SESSION_ID}\`,
        cancel_url: \`http://\${req.headers.host}/cadastro\`,
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
          if (lang !== 'pt') amount = cycle === 'annual' ? 99900 : 14900;
        } else if (plan === 'pro') {
          amount = cycle === 'annual' ? 899700 : 149700;
          if (lang !== 'pt') amount = cycle === 'annual' ? 199900 : 29900;
        } else if (plan === 'enterprise') {
          amount = cycle === 'annual' ? 2499700 : 299700;
          if (lang !== 'pt') amount = cycle === 'annual' ? 399900 : 59900;
        }
        
        currency = lang === 'pt' ? 'brl' : (lang === 'es' ? 'eur' : 'usd');

        sessionConfig.line_items = [{
          price_data: {
            currency: currency,
            product_data: {
              name: \`Plano \${plan.toUpperCase()} (\${cycle === 'annual' ? 'Anual' : 'Por Evento'})\`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        }];
        sessionConfig.mode = 'payment';
      }
      
      const session = await stripe.checkout.sessions.create(sessionConfig);
      
      res.json({ id: session.id, url: session.url });
    } catch (e: any) {`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);

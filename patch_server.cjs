const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Add stripe import
code = code.replace(
  /import express from "express";/,
  `import express from "express";\nimport Stripe from 'stripe';`
);

// Add stripe init inside startServer
code = code.replace(
  /const PORT = 3000;/,
  `const PORT = 3000;\n\n  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51Px', {\n    apiVersion: '2023-10-16' as any\n  });`
);

// Add /api/create-checkout-session
code = code.replace(
  /app\.use\(express\.json\(\)\);/,
  `app.use(express.json());

  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { plan, lang } = req.body;
      
      let amount = 0;
      let currency = 'brl';
      
      // Basic pricing logic
      if (plan === 'starter') {
        amount = lang === 'pt' ? 79700 : (lang === 'es' ? 14900 : 14900);
        currency = lang === 'pt' ? 'brl' : (lang === 'es' ? 'eur' : 'usd');
      } else if (plan === 'pro') {
        amount = lang === 'pt' ? 149700 : (lang === 'es' ? 29900 : 29900);
        currency = lang === 'pt' ? 'brl' : (lang === 'es' ? 'eur' : 'usd');
      } else if (plan === 'enterprise') {
        amount = lang === 'pt' ? 299700 : (lang === 'es' ? 59900 : 59900);
        currency = lang === 'pt' ? 'brl' : (lang === 'es' ? 'eur' : 'usd');
      }
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: \`Plano \${plan.toUpperCase()}\`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: \`http://\${req.headers.host}/dashboard?session_id={CHECKOUT_SESSION_ID}\`,
        cancel_url: \`http://\${req.headers.host}/cadastro\`,
      });
      
      res.json({ id: session.id, url: session.url });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });`
);

fs.writeFileSync('server.ts', code);

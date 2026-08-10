const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

if (!code.includes('/api/verify-session')) {
  code = code.replace(
    /app\.post\("\/api\/create-checkout-session", async \(req, res\) => \{/,
    `app.post("/api/verify-session", async (req, res) => {\n    try {\n      const { session_id } = req.body;\n      const session = await stripe.checkout.sessions.retrieve(session_id);\n      res.json({\n        status: session.payment_status,\n        customer_email: session.customer_details?.email\n      });\n    } catch (e: any) {\n      res.status(500).json({ error: e.message });\n    }\n  });\n\n  app.post("/api/create-checkout-session", async (req, res) => {`
  );
  fs.writeFileSync('server.ts', code);
}

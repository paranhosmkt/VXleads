const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const stripeTarget = `  app.post("/api/verify-session", async (req, res) => {`;
const stripeConnectEndpoints = `
  // --- STRIPE CONNECT ENDPOINTS ---
  app.post("/api/create-connect-account", async (req, res) => {
    try {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'BR', // Assuming Brazil
        capabilities: {
          transfers: { requested: true },
        },
      });
      res.json({ accountId: account.id });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/create-account-link", async (req, res) => {
    try {
      const { accountId } = req.body;
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: \`https://\${req.headers.host}/painel-consultor\`,
        return_url: \`https://\${req.headers.host}/painel-consultor?success=true\`,
        type: 'account_onboarding',
      });
      res.json({ url: accountLink.url });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/connect-status/:accountId", async (req, res) => {
    try {
      const { accountId } = req.params;
      const account = await stripe.accounts.retrieve(accountId);
      res.json({
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ---------------------------------
  
  app.post("/api/verify-session", async (req, res) => {`;

code = code.replace(stripeTarget, stripeConnectEndpoints);

const checkoutTarget = `      const { plan, cycle } = req.body;`;
const checkoutReplacement = `      const { plan, cycle, consultantStripeAccountId } = req.body;`;
code = code.replace(checkoutTarget, checkoutReplacement);

const sessionConfigTarget = `        sessionConfig.line_items = [{
          price_data: {`;
const sessionConfigReplacement = `        if (consultantStripeAccountId) {
          sessionConfig.payment_intent_data = {
            transfer_data: {
              destination: consultantStripeAccountId,
              amount: Math.round(amount * 0.10), // 10% de comissão
            },
          };
        }
        
        sessionConfig.line_items = [{
          price_data: {`;
code = code.replace(sessionConfigTarget, sessionConfigReplacement);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts");

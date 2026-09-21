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
  app.use(express.urlencoded({ extended: true }));

  // CORS middleware for external integrations (Base44, webhooks, third-party apps)
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });


  // --- STRIPE CONNECT ENDPOINTS ---
  app.post("/api/create-connect-account", async (req, res) => {
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ error: "Chave STRIPE_SECRET_KEY não configurada no servidor. Adicione no painel de configurações para testar." });
      }
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'BR', // Assuming Brazil
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        settings: {
          payouts: {
            schedule: {
              interval: 'daily',
              delay_days: 30,
            },
          },
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
        refresh_url: `https://${req.headers.host}/painel-consultor`,
        return_url: `https://${req.headers.host}/painel-consultor?success=true`,
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
      const { plan, cycle, consultantStripeAccountId, email, uid } = req.body;
      
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
        success_url: `https://${req.headers.host}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://${req.headers.host}/cadastro`,
        customer_email: email,
        client_reference_id: uid,
      };

      if (selectedPriceId) {
        // Se o usuário configurou os IDs no código acima, usamos eles:
        sessionConfig.line_items = [{ price: selectedPriceId, quantity: 1 }];
        sessionConfig.mode = cycle === 'annual' ? 'subscription' : 'payment';
        
        if (consultantStripeAccountId) {
          if (sessionConfig.mode === 'subscription') {
            sessionConfig.subscription_data = {
              transfer_data: {
                destination: consultantStripeAccountId,
                amount_percent: 90.0
              }
            };
          }
          // Note: for mode='payment' with price IDs, you'd need to fetch the price amount first to calculate the fixed amount for payment_intent_data.transfer_data
        }
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

        if (consultantStripeAccountId) {
          sessionConfig.payment_intent_data = {
            transfer_data: {
              destination: consultantStripeAccountId,
              amount: Math.round(amount * 0.90), // 90% para o consultor, 10% para a plataforma
            },
          };
        }
        
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

  // --- BASE44 INTEGRATION & FIRESTORE DIRECT PROXY ---
  // In-memory store for leads pushed from Base44 (with TTL / limit)
  const base44Leads: Record<string, any> = {};

  const FIREBASE_API_KEY = "AIzaSyDDLpIvt2mxiVdka_KEeLfyKnKJm9VHz5E";
  const FIREBASE_PROJECT_ID = "gen-lang-client-0914985094";
  const FIREBASE_DB_ID = "ai-studio-vxleads-3f221bd2-d7b1-412f-8b8b-acc20b7d9c88";

  function parseFirestoreFields(fields: Record<string, any>) {
    if (!fields) return {};
    const res: Record<string, any> = {};
    for (const [key, val] of Object.entries(fields)) {
      if (val.stringValue !== undefined) res[key] = val.stringValue;
      else if (val.integerValue !== undefined) res[key] = Number(val.integerValue);
      else if (val.booleanValue !== undefined) res[key] = val.booleanValue;
      else if (val.timestampValue !== undefined) res[key] = val.timestampValue;
      else if (val.arrayValue?.values) {
        res[key] = val.arrayValue.values.map((v: any) => v.stringValue ?? v.integerValue ?? v);
      } else {
        res[key] = val;
      }
    }
    return res;
  }

  async function fetchLeadFromFirestore(leadId: string) {
    try {
      // 1. Direct doc lookup
      const docUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${FIREBASE_DB_ID}/documents/event_leads/${encodeURIComponent(leadId)}?key=${FIREBASE_API_KEY}`;
      const docRes = await fetch(docUrl);
      if (docRes.ok) {
        const docData = await docRes.json();
        return { id: leadId, ...parseFirestoreFields(docData.fields) };
      }

      // 2. Query by crachaId or leadId
      const queryUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${FIREBASE_DB_ID}/documents:runQuery?key=${FIREBASE_API_KEY}`;
      const queryRes = await fetch(queryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'event_leads' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'crachaId' },
                op: 'EQUAL',
                value: { stringValue: leadId }
              }
            }
          }
        })
      });
      if (queryRes.ok) {
        const results = await queryRes.json();
        if (Array.isArray(results) && results[0]?.document?.fields) {
          const docName = results[0].document.name || '';
          const resolvedId = docName.split('/').pop() || leadId;
          return { id: resolvedId, ...parseFirestoreFields(results[0].document.fields) };
        }
      }
    } catch (err) {
      console.error('Erro ao consultar lead no Firestore:', err);
    }
    return null;
  }

  async function getAllLeadsFromFirestore() {
    try {
      const queryUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${FIREBASE_DB_ID}/documents:runQuery?key=${FIREBASE_API_KEY}`;
      const queryRes = await fetch(queryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'event_leads' }]
          }
        })
      });
      if (queryRes.ok) {
        const results = await queryRes.json();
        const list: any[] = [];
        if (Array.isArray(results)) {
          for (const item of results) {
            if (item.document?.fields) {
              const docId = item.document.name.split('/').pop();
              const parsed = parseFirestoreFields(item.document.fields);
              list.push({ ...parsed, id: docId, _docId: docId });
            }
          }
        }
        return list;
      }
    } catch (err) {
      console.error('Erro ao buscar todos os leads do Firestore:', err);
    }
    return [];
  }

  const handleBase44Post = (req: express.Request, res: express.Response) => {
    try {
      const data = req.body || {};
      const leadId = data.leadId || data.id || data.crachaId || `b44_${Date.now()}`;
      
      const leadPayload = {
        id: leadId,
        leadId: leadId,
        nome: data.nome || data.name || 'Visitante Base44',
        email: data.email || '',
        whatsapp: data.whatsapp || data.phone || data.telefone || '',
        empresa: data.empresa || data.company || '',
        cargo: data.cargo || data.jobTitle || data.role || '',
        crachaId: data.crachaId || data.badgeId || leadId,
        origem: data.origem || 'Base44_App',
        premio: data.premio || data.premioGanho || '',
        voucher: data.voucher || data.voucherCode || '',
        codigoVoucher: data.codigoVoucher || data.voucher || '',
        problemas: data.problemas || data.resposta1 || '',
        possiveisSolucoes: data.possiveisSolucoes || data.resposta2 || '',
        respostasTriagem: data.respostasTriagem || '',
        status: data.status || 'pending',
        updatedAt: new Date().toISOString(),
        createdAt: data.createdAt || new Date().toISOString(),
        customFields: data.customFields || {}
      };

      base44Leads[leadId] = leadPayload;
      if (leadPayload.crachaId && leadPayload.crachaId !== leadId) {
        base44Leads[leadPayload.crachaId] = leadPayload;
      }

      // Generate direct game URL with prefilled parameters
      const params = new URLSearchParams({
        nome: leadPayload.nome,
        email: leadPayload.email,
        whatsapp: leadPayload.whatsapp,
        empresa: leadPayload.empresa,
        cargo: leadPayload.cargo,
        crachaId: leadPayload.crachaId,
        origem: leadPayload.origem
      });

      const triagemUrl = `/triagem?${params.toString()}`;
      const roletaUrl = `/roleta-premio?${params.toString()}`;

      res.status(200).json({
        success: true,
        message: "Lead recebido e sincronizado com sucesso!",
        lead: leadPayload,
        gameUrl: triagemUrl,
        triagemUrl: triagemUrl,
        roletaUrl: roletaUrl
      });
    } catch (err: any) {
      console.error("Erro ao receber lead do Base44:", err);
      res.status(500).json({ error: "Falha ao processar dados", details: err.message });
    }
  };

  const handleBase44Get = async (req: express.Request, res: express.Response) => {
    const leadId = req.params.leadId || (req.query.id as string) || (req.query.leadId as string) || (req.query.crachaId as string);
    if (leadId) {
      // 1. Check in memory
      let lead = base44Leads[leadId];
      if (!lead) {
        // 2. Query live Firestore
        lead = await fetchLeadFromFirestore(leadId);
      }
      if (!lead) {
        return res.status(404).json({ error: "Lead não encontrado", leadId });
      }
      return res.json({ success: true, lead });
    }

    // Return combined Firestore leads + memory
    const firestoreLeads = await getAllLeadsFromFirestore();
    const memoryLeads = Object.values(base44Leads);
    
    // Merge without duplicates
    const map = new Map<string, any>();
    for (const l of firestoreLeads) {
      const key = l.crachaId || l.id;
      if (key) map.set(key, l);
    }
    for (const l of memoryLeads) {
      const key = l.crachaId || l.id;
      if (key && !map.has(key)) map.set(key, l);
    }

    const merged = Array.from(map.values());
    res.json({ count: merged.length, leads: merged });
  };

  const handleBase44Delete = async (req: express.Request, res: express.Response) => {
    try {
      const leadId = req.params.leadId || (req.query.id as string) || (req.query.leadId as string) || (req.query.crachaId as string);
      if (!leadId) {
        return res.status(400).json({ error: "Identificador do lead é obrigatório" });
      }

      // 1. Remove from memory cache
      delete base44Leads[leadId];
      for (const [k, v] of Object.entries(base44Leads)) {
        const item = v as any;
        if (item.crachaId === leadId || item.id === leadId || item.leadId === leadId) {
          delete base44Leads[k];
        }
      }

      // 2. Direct Firestore REST delete
      const cleanDocId = encodeURIComponent(leadId.trim().replace(/[^a-zA-Z0-9_-]/g, '_'));
      const directDeleteUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${FIREBASE_DB_ID}/documents/event_leads/${cleanDocId}?key=${FIREBASE_API_KEY}`;
      await fetch(directDeleteUrl, { method: 'DELETE' });

      if (encodeURIComponent(leadId) !== cleanDocId) {
        const rawDeleteUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${FIREBASE_DB_ID}/documents/event_leads/${encodeURIComponent(leadId)}?key=${FIREBASE_API_KEY}`;
        await fetch(rawDeleteUrl, { method: 'DELETE' });
      }

      return res.json({ success: true, message: "Lead removido com sucesso", leadId });
    } catch (err: any) {
      console.error("Erro ao excluir lead no servidor:", err);
      return res.status(500).json({ error: "Falha ao processar exclusão", details: err.message });
    }
  };

  // Endpoint de teste de diagnóstico do Firebase
  app.get("/api/firebase-test", async (_req, res) => {
    try {
      const leads = await getAllLeadsFromFirestore();
      res.json({
        status: "ok",
        databaseId: FIREBASE_DB_ID,
        projectId: FIREBASE_PROJECT_ID,
        collection: "event_leads",
        documentsCount: leads.length,
        documents: leads
      });
    } catch (err: any) {
      res.status(500).json({ status: "error", message: err.message });
    }
  });

  // Supported Endpoint routes & aliases to prevent 404 (supports /api, /api/leads, /api/base44, etc)
  app.post(["/api", "/api/", "/api/leads", "/api/lead", "/api/integracao/base44", "/api/integration/base44", "/api/base44", "/api/webhook/base44"], handleBase44Post);
  app.get(["/api", "/api/", "/api/leads", "/api/lead", "/api/integracao/base44", "/api/integration/base44", "/api/base44", "/api/webhook/base44"], handleBase44Get);
  app.get(["/api/leads/:leadId", "/api/lead/:leadId", "/api/integracao/base44/:leadId", "/api/integration/base44/:leadId", "/api/base44/:leadId"], handleBase44Get);
  app.delete(["/api/leads/:leadId", "/api/lead/:leadId", "/api/integracao/base44/:leadId", "/api/integration/base44/:leadId", "/api/base44/:leadId", "/api/leads"], handleBase44Delete);

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

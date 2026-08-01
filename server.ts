import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body; 
      
      const contents = messages.map((m: any) => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: contents,
        config: {
          systemInstruction: `Você é o assistente virtual do VX Leads, uma plataforma de roletas de prêmios interativas para feiras e eventos. 
Seu objetivo é ajudar os visitantes tirando dúvidas e captando leads.

Sobre o VX Leads:
- Planos: Starter (R$47/mês, 500 leads), Pro (R$97/mês, 2.000 leads), Premium (R$147/mês, 10.000 leads).
- Funcionalidades: Dashboard em tempo real, QR Code, modo TV, personagens personalizáveis.
- Como funciona: O visitante preenche os dados, gira a roleta pelo celular, ganha o brinde, e a empresa capta o contato no dashboard.

Seja amigável, direto e persuasivo. Tente convencer o usuário a se cadastrar.
Se o usuário quiser se cadastrar ou falar com um humano, pegue o Nome e o WhatsApp dele.`
        }
      });
      
      res.json({ text: response.text });
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

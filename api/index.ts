import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory cache for demo/serverless execution
const globalLeads: any[] = [];

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-api-key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      message: 'API VX Leads (Vercel Serverless) ativa e pronta para receber leads do Base44',
      leads: globalLeads.slice(-20)
    });
  }

  if (req.method === 'POST') {
    try {
      const data = req.body || {};
      const leadId = data.leadId || data.id || data.crachaId || `b44_${Date.now()}`;

      const leadPayload = {
        id: leadId,
        nome: data.nome || data.name || 'Visitante Base44',
        email: data.email || '',
        whatsapp: data.whatsapp || data.phone || data.telefone || '',
        empresa: data.empresa || data.company || '',
        cargo: data.cargo || data.jobTitle || data.role || '',
        crachaId: data.crachaId || data.badgeId || leadId,
        origem: data.origem || 'Base44_App',
        createdAt: new Date().toISOString()
      };

      globalLeads.unshift(leadPayload);

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

      return res.status(200).json({
        success: true,
        message: 'Lead recebido com sucesso!',
        lead: leadPayload,
        gameUrl: triagemUrl,
        triagemUrl: triagemUrl,
        roletaUrl: roletaUrl
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Erro ao processar requisição', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}

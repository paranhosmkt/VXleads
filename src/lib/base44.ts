/**
 * Base44 Integration Utilities
 * Handles URL construction, parameters mapping, and seamless returning to Base44 app.
 */

export interface Base44LeadPayload {
  returnUrl?: string;
  leadId?: string;
  nome?: string;
  empresa?: string;
  cargo?: string;
  whatsapp?: string;
  email?: string;
  premio: string;
  voucher: string;
  jogo?: string;
  produtos?: string;
  opcoesTriagem?: string;
  respostasTriagem?: string;
  webhookCallback?: string;
}

/**
 * Detects the Base44 return URL from search params, document.referrer, or default app.
 */
export function getBase44ReturnDestination(searchParams?: URLSearchParams): string {
  if (searchParams) {
    const fromParam = 
      searchParams.get('return_url') ||
      searchParams.get('returnUrl') ||
      searchParams.get('redirect_url') ||
      searchParams.get('redirectUrl') ||
      searchParams.get('callback_url') ||
      searchParams.get('callback') ||
      searchParams.get('back_url');
    if (fromParam) return fromParam;
  }

  // Check if user came from a base44.app domain via browser referrer
  if (typeof document !== 'undefined' && document.referrer && document.referrer.includes('base44.app')) {
    return document.referrer;
  }

  return 'https://pristine-lead-scan-go.base44.app/';
}

/**
 * Builds the comprehensive return URL for Base44 with all parameters mapped to ensure
 * whatever field name Base44 uses in its internal form/table (e.g. premio, voucher, prize, cupom),
 * the data is received and populated.
 */
export function buildBase44ReturnUrl(payload: Base44LeadPayload): string {
  const baseTarget = payload.returnUrl || getBase44ReturnDestination();

  let urlObj: URL;
  try {
    urlObj = new URL(baseTarget);
  } catch {
    urlObj = new URL(baseTarget, typeof window !== 'undefined' ? window.location.origin : 'https://pristine-lead-scan-go.base44.app/');
  }

  const p = urlObj.searchParams;

  // 1. Core Flags
  p.set('is_new_user', 'true');
  p.set('status', 'concluido');
  p.set('status_jogo', 'premiado');

  // 2. Lead Identification (all variations)
  const leadId = payload.leadId || p.get('leadId') || p.get('crachaId') || p.get('id') || 'CR-VISITANTE';
  p.set('crachaId', leadId);
  p.set('cracha', leadId);
  p.set('leadId', leadId);
  p.set('lead_id', leadId);
  p.set('badge_id', leadId);
  p.set('id', leadId);

  // 3. Participant Details
  if (payload.nome) {
    p.set('nome', payload.nome);
    p.set('name', payload.nome);
  }
  if (payload.empresa) {
    p.set('empresa', payload.empresa);
    p.set('company', payload.empresa);
  }
  if (payload.cargo) {
    p.set('cargo', payload.cargo);
    p.set('role', payload.cargo);
    p.set('job_title', payload.cargo);
  }
  if (payload.whatsapp) {
    p.set('whatsapp', payload.whatsapp);
    p.set('telefone', payload.whatsapp);
    p.set('phone', payload.whatsapp);
  }
  if (payload.email) {
    p.set('email', payload.email);
  }

  // 4. PRIZE - All field variations so Base44 catches it
  const premioVal = payload.premio || '';
  p.set('premio', premioVal);
  p.set('premio_ganho', premioVal);
  p.set('premio_sorteado', premioVal);
  p.set('premioGanho', premioVal);
  p.set('prize', premioVal);
  p.set('brinde', premioVal);
  p.set('desconto', premioVal);

  // 5. VOUCHER - All field variations so Base44 catches it
  const voucherVal = payload.voucher || '';
  p.set('voucher', voucherVal);
  p.set('voucher_code', voucherVal);
  p.set('voucherCode', voucherVal);
  p.set('codigo_voucher', voucherVal);
  p.set('codigo', voucherVal);
  p.set('cupom', voucherVal);

  // 6. Game & Products
  if (payload.jogo) {
    p.set('jogo', payload.jogo);
    p.set('game', payload.jogo);
  }
  if (payload.produtos) {
    p.set('produtos', payload.produtos);
    p.set('produtos_direcionados', payload.produtos);
    p.set('produtos_recomendados', payload.produtos);
    p.set('products', payload.produtos);
  }
  if (payload.opcoesTriagem) {
    p.set('opcoes_triagem', payload.opcoesTriagem);
  }
  if (payload.respostasTriagem) {
    p.set('respostas_triagem', payload.respostasTriagem);
  }

  return urlObj.toString();
}

/**
 * Triggers the return to Base44:
 * 1. Dispatches window.opener postMessage (if opened in popup)
 * 2. Asynchronously notifies webhook (if configured)
 * 3. Copies voucher info to clipboard for fallback
 * 4. Navigates current window to destination URL
 */
export async function executeBase44Return(payload: Base44LeadPayload) {
  const returnUrl = buildBase44ReturnUrl(payload);

  // 1. PostMessage to opener window if available
  try {
    if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
      window.opener.postMessage({
        type: 'BASE44_GAME_RESULT',
        leadId: payload.leadId,
        premio: payload.premio,
        voucher: payload.voucher,
        produtos: payload.produtos,
        url: returnUrl
      }, '*');
    }
  } catch (e) {
    console.warn('postMessage to opener skipped:', e);
  }

  // 2. Webhook callback if provided
  if (payload.webhookCallback) {
    try {
      await fetch(payload.webhookCallback, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'lead_triagem_completed',
          leadId: payload.leadId,
          premio: payload.premio,
          voucher: payload.voucher,
          produtos: payload.produtos
        })
      });
    } catch (e) {
      console.warn('Webhook notification skipped:', e);
    }
  }

  // 3. Fallback copy to clipboard
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && payload.voucher) {
      await navigator.clipboard.writeText(`Prêmio: ${payload.premio} | Voucher: ${payload.voucher}`);
    }
  } catch (e) {
    // Ignore clipboard permissions
  }

  // 4. Redirect window
  if (typeof window !== 'undefined') {
    window.location.href = returnUrl;
  }
}

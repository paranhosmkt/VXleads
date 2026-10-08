/**
 * Base44 Integration Utilities
 * Handles URL construction, parameters mapping, and seamless returning to Base44 app.
 */
import { getProductBySlugOrParam } from '../data/productConfig';

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
  desconto?: string;
  brinde?: string;
  jogo?: string;
  produto?: string;
  produtoId?: string;
  produtoNome?: string;
  evento?: string;
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
 * Builds the clean return URL for Base44 returning ONLY the won prize and voucher
 * alongside the participant/lead identification.
 * Explicitly removes all triage questions and answers.
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

  // Explicitly remove any triage questions/answers and product suggestions
  const triageParamsToDelete = [
    'opcoes_triagem', 'opcoesTriagem',
    'respostas_triagem', 'respostasTriagem', 'triagem',
    'problemas', 'problema', 'pergunta_1', 'pergunta_2', 'pergunta1', 'pergunta2',
    'possiveis_solucoes', 'possiveisSolucoes', 'solucoes',
    'produtos', 'produtos_direcionados', 'produtos_recomendados', 'products',
    'r1', 'r2', 'r3', 'resposta1', 'resposta2', 'resposta3'
  ];
  for (const param of triageParamsToDelete) {
    p.delete(param);
  }

  // 1. Core Flags
  p.set('is_new_user', 'true');
  p.set('status', 'concluido');
  p.set('status_jogo', 'premiado');

  // 2. Lead Identification (all standard variations so Base44 catches it)
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

  // 4. PRIZE - All standard field variations so Base44 catches it
  const premioVal = payload.premio || '';
  p.set('premio', premioVal);
  p.set('premio_ganho', premioVal);
  p.set('premio_sorteado', premioVal);
  p.set('premioGanho', premioVal);
  p.set('prize', premioVal);
  if (payload.desconto) {
    p.set('desconto', payload.desconto);
    p.set('desconto_ganho', payload.desconto);
  } else {
    p.set('desconto', premioVal);
  }
  if (payload.brinde) {
    p.set('brinde', payload.brinde);
    p.set('brinde_ganho', payload.brinde);
    p.set('brinde_sorteado', payload.brinde);
    p.set('brinde_fisico', payload.brinde);
    p.set('brindeFisico', payload.brinde);
    p.set('brindeGanho', payload.brinde);
    p.set('premio_brinde', payload.brinde);
    p.set('brinde_nome', payload.brinde);
    p.set('brinde_conquistado', payload.brinde);
    p.set('brinde_escolhido', payload.brinde);
    p.set('segundo_sorteio', payload.brinde);
    p.set('item', payload.brinde);
    p.set('item_ganho', payload.brinde);
    p.set('item_sorteado', payload.brinde);
    p.set('gift', payload.brinde);
    p.set('physical_item', payload.brinde);
  } else {
    p.set('brinde', premioVal);
  }

  // 5. VOUCHER - All standard field variations so Base44 catches it
  const voucherVal = payload.voucher || '';
  p.set('voucher', voucherVal);
  p.set('voucher_code', voucherVal);
  p.set('voucherCode', voucherVal);
  p.set('codigo_voucher', voucherVal);
  p.set('codigo', voucherVal);
  p.set('cupom', voucherVal);

  // 6. Game
  if (payload.jogo) {
    p.set('jogo', payload.jogo);
    p.set('game', payload.jogo);
  }

  // 7. PRODUCT - Solução e Produto sorteado (Cada lead concorre a apenas 1 produto)
  let prodVal = payload.produto || payload.produtoNome || '';
  let prodId = payload.produtoId;
  let prodFullName = payload.produtoNome;

  const matchedProd = getProductBySlugOrParam(prodVal || prodId || prodFullName);
  if (matchedProd) {
    prodVal = matchedProd.name;
    prodId = matchedProd.id;
    prodFullName = matchedProd.fullName;
  }

  if (prodVal) {
    p.set('produto', prodVal);
    p.set('product', prodVal);
    p.set('produto_sorteado', prodVal);
    p.set('produto_selecionado', prodVal);
    p.set('produtos_direcionados', prodVal);
  }
  if (prodId) {
    p.set('produto_id', prodId);
    p.set('produtoId', prodId);
  }
  if (prodFullName) {
    p.set('produto_nome', prodFullName);
    p.set('produtoNome', prodFullName);
  }

  // 8. EVENTO - Mercopar 2026 (ou evento do sorteio)
  const eventoVal = payload.evento || 'Mercopar 2026';
  p.set('evento', eventoVal);
  p.set('event', eventoVal);
  p.set('nome_evento', eventoVal);

  // 9. Single product raffle flag
  p.set('sorteio_unico_produto', 'true');
  p.set('sorteio_realizado', 'true');

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
  // Normalize product details to guarantee correct brand name (e.g. HUMAINAX)
  let resolvedProdName = payload.produto || payload.produtoNome;
  let resolvedProdId = payload.produtoId;
  let resolvedProdFullName = payload.produtoNome;

  const matched = getProductBySlugOrParam(resolvedProdName || resolvedProdId || resolvedProdFullName);
  if (matched) {
    resolvedProdName = matched.name;
    resolvedProdId = matched.id;
    resolvedProdFullName = matched.fullName;
  }

  const normalizedPayload: Base44LeadPayload = {
    ...payload,
    produto: resolvedProdName,
    produtoId: resolvedProdId,
    produtoNome: resolvedProdFullName
  };

  const returnUrl = buildBase44ReturnUrl(normalizedPayload);

  // 1. PostMessage to opener window if available
  try {
    if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
      window.opener.postMessage({
        type: 'BASE44_GAME_RESULT',
        leadId: normalizedPayload.leadId,
        produto: resolvedProdName,
        produtoId: resolvedProdId,
        produtoNome: resolvedProdFullName,
        premio: normalizedPayload.premio,
        desconto: normalizedPayload.desconto,
        descontoGanho: normalizedPayload.desconto,
        brinde: normalizedPayload.brinde,
        brindeGanho: normalizedPayload.brinde,
        brindeFisico: normalizedPayload.brinde,
        premioBrinde: normalizedPayload.brinde,
        item: normalizedPayload.brinde,
        voucher: normalizedPayload.voucher,
        evento: normalizedPayload.evento || 'Mercopar 2026',
        url: returnUrl
      }, '*');
    }
  } catch (e) {
    console.warn('postMessage to opener skipped:', e);
  }

  // 2. Webhook callback if provided
  if (normalizedPayload.webhookCallback) {
    try {
      await fetch(normalizedPayload.webhookCallback, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'lead_game_completed',
          leadId: normalizedPayload.leadId,
          produto: resolvedProdName,
          produtoId: resolvedProdId,
          produtoNome: resolvedProdFullName,
          premio: normalizedPayload.premio,
          desconto: normalizedPayload.desconto,
          descontoGanho: normalizedPayload.desconto,
          brinde: normalizedPayload.brinde,
          brindeGanho: normalizedPayload.brinde,
          brindeFisico: normalizedPayload.brinde,
          premioBrinde: normalizedPayload.brinde,
          item: normalizedPayload.brinde,
          voucher: normalizedPayload.voucher,
          evento: normalizedPayload.evento || 'Mercopar 2026'
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

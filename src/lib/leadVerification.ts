import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { resolveEventName } from '../data/eventConfig';
import { getProductBySlugOrParam } from '../data/productConfig';

export interface ParticipantIdentifiers {
  crachaId?: string;
  email?: string;
  whatsapp?: string;
  nome?: string;
  empresa?: string;
}

export interface ExistingDrawRecord {
  id: string;
  nome: string;
  crachaId: string;
  empresa?: string;
  cargo?: string;
  email?: string;
  whatsapp?: string;
  premioGanho: string;
  premioDesconto?: string;
  premioBrinde?: string;
  desconto?: string;
  brinde?: string;
  produto?: string;
  produtoId?: string;
  produtoNome?: string;
  produtoKey?: string;
  evento?: string;
  voucher: string;
  dataHora: string;
  jogoEscolhido: string;
  produtosDirecionados?: string;
  respostasTriagem?: string;
}

export interface CheckDrawResult {
  alreadyDrawn: boolean;
  lead?: ExistingDrawRecord;
  source?: 'firestore' | 'localStorage';
}

function parseLeadRecord(id: string, data: any, participant: ParticipantIdentifiers, fallbackCracha: string): ExistingDrawRecord {
  const premio = data.premioGanho || data.premio || 'Prêmio Conquistado';
  const voucher = data.voucher || data.codigoVoucher || data.voucherCode || 'VX-00000';
  let premioDesconto = data.premioDesconto || data.desconto;
  let premioBrinde = data.premioBrinde || data.brinde || data.item;

  if (!premioDesconto && typeof premio === 'string' && premio.includes('+')) {
    const parts = premio.split('+');
    premioDesconto = parts[0].trim();
    if (!premioBrinde && parts[1]) {
      premioBrinde = parts[1].trim();
    }
  } else if (!premioDesconto && typeof premio === 'string' && premio.includes('%')) {
    premioDesconto = premio;
  }

  const rawProd = data.produto || data.produtoNome || data.produtosDirecionados || data.solucao;
  const matchedProd = getProductBySlugOrParam(data.produtoId || data.produtoKey || rawProd);
  const produtoNome = matchedProd ? matchedProd.name : (rawProd || 'Solução Industrial');
  const produtoId = matchedProd ? matchedProd.id : (data.produtoId || '');
  const produtoKey = matchedProd ? matchedProd.key : (data.produtoKey || '');
  const resolvedEvento = resolveEventName(data.evento, false);

  return {
    id,
    nome: data.nome || participant.nome || 'Participante',
    crachaId: data.crachaId || fallbackCracha || 'N/A',
    empresa: data.empresa,
    cargo: data.cargo,
    email: data.email,
    whatsapp: data.whatsapp,
    premioGanho: premio,
    premioDesconto,
    premioBrinde,
    desconto: premioDesconto,
    brinde: premioBrinde,
    produto: produtoNome,
    produtoId,
    produtoNome,
    produtoKey,
    evento: resolvedEvento,
    voucher,
    dataHora: data.dataHora || 'Recentemente',
    jogoEscolhido: data.jogoEscolhido || data.jogo || 'roleta',
    produtosDirecionados: data.produtosDirecionados || data.resposta2,
    respostasTriagem: data.respostasTriagem || data.resposta1
  };
}

/**
 * Checks if a participant has already performed a draw in the event.
 * Each user is strictly allowed to participate in the draw only ONCE.
 */
export async function checkUserDrawStatus(
  participant: ParticipantIdentifiers
): Promise<CheckDrawResult> {
  const crachaClean = participant.crachaId ? participant.crachaId.trim() : '';
  const emailClean = participant.email ? participant.email.trim().toLowerCase() : '';
  const whatsappClean = participant.whatsapp ? participant.whatsapp.trim().replace(/\D/g, '') : '';
  const nomeClean = participant.nome ? participant.nome.trim().toLowerCase() : '';

  // 1. Check in Firestore (event_leads collection)
  try {
    // 1a. Try direct doc lookup by sanitized crachaId if available
    if (crachaClean && crachaClean !== 'CR-0000' && !crachaClean.startsWith('CR-NEW')) {
      const cleanDocId = crachaClean.replace(/[^a-zA-Z0-9_-]/g, '_');
      const directSnap = await getDoc(doc(db, 'event_leads', cleanDocId));
      if (directSnap.exists()) {
        const data = directSnap.data();
        const premio = data.premioGanho || data.premio;
        const voucher = data.voucher || data.codigoVoucher || data.voucherCode;
        if (premio || voucher) {
          return {
            alreadyDrawn: true,
            source: 'firestore',
            lead: parseLeadRecord(directSnap.id, data, participant, crachaClean)
          };
        }
      }

      // 1b. Query by crachaId field
      const crachaQuery = query(
        collection(db, 'event_leads'),
        where('crachaId', '==', crachaClean)
      );
      const crachaSnap = await getDocs(crachaQuery);
      if (!crachaSnap.empty) {
        const docItem = crachaSnap.docs[0];
        const data = docItem.data();
        const premio = data.premioGanho || data.premio;
        const voucher = data.voucher || data.codigoVoucher || data.voucherCode;
        if (premio || voucher) {
          return {
            alreadyDrawn: true,
            source: 'firestore',
            lead: parseLeadRecord(docItem.id, data, participant, crachaClean)
          };
        }
      }
    }

    // 1c. Query by email if provided and valid
    if (emailClean && emailClean.includes('@')) {
      const emailQuery = query(
        collection(db, 'event_leads'),
        where('email', '==', emailClean)
      );
      const emailSnap = await getDocs(emailQuery);
      if (!emailSnap.empty) {
        const docItem = emailSnap.docs[0];
        const data = docItem.data();
        const premio = data.premioGanho || data.premio;
        const voucher = data.voucher || data.codigoVoucher;
        if (premio || voucher) {
          return {
            alreadyDrawn: true,
            source: 'firestore',
            lead: parseLeadRecord(docItem.id, data, participant, crachaClean)
          };
        }
      }
    }

    // 1d. Query by WhatsApp if provided
    if (whatsappClean && whatsappClean.length >= 8) {
      const waQuery = query(
        collection(db, 'event_leads'),
        where('whatsapp', '==', participant.whatsapp)
      );
      const waSnap = await getDocs(waQuery);
      if (!waSnap.empty) {
        const docItem = waSnap.docs[0];
        const data = docItem.data();
        const premio = data.premioGanho || data.premio;
        const voucher = data.voucher || data.codigoVoucher;
        if (premio || voucher) {
          return {
            alreadyDrawn: true,
            source: 'firestore',
            lead: parseLeadRecord(docItem.id, data, participant, crachaClean)
          };
        }
      }
    }
  } catch (err) {
    console.warn('Erro ao verificar status do sorteio no Firestore:', err);
  }

  // 2. Check in LocalStorage fallback
  try {
    const saved = localStorage.getItem('vx_proto_submissions');
    if (saved) {
      const list = JSON.parse(saved);
      if (Array.isArray(list)) {
        const match = list.find((item: any) => {
          if (crachaClean && crachaClean !== 'CR-0000' && item.crachaId === crachaClean) {
            return true;
          }
          if (emailClean && item.email && item.email.toLowerCase() === emailClean) {
            return true;
          }
          if (whatsappClean && item.whatsapp && item.whatsapp.replace(/\D/g, '') === whatsappClean) {
            return true;
          }
          if (nomeClean && item.nome && item.nome.toLowerCase() === nomeClean && item.empresa === participant.empresa) {
            return true;
          }
          return false;
        });

        if (match && (match.voucher || match.premioGanho || match.premio)) {
          return {
            alreadyDrawn: true,
            source: 'localStorage',
            lead: parseLeadRecord(match.id || 'local', match, participant, crachaClean)
          };
        }
      }
    }
  } catch (e) {
    console.warn('Erro ao verificar localStorage:', e);
  }

  return { alreadyDrawn: false };
}

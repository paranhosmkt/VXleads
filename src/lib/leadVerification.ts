import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

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
            lead: {
              id: directSnap.id,
              nome: data.nome || participant.nome || 'Participante',
              crachaId: data.crachaId || crachaClean,
              empresa: data.empresa,
              cargo: data.cargo,
              email: data.email,
              whatsapp: data.whatsapp,
              premioGanho: premio || 'Prêmio Conquistado',
              voucher: voucher || 'VX-00000',
              dataHora: data.dataHora || 'Recentemente',
              jogoEscolhido: data.jogoEscolhido || data.jogo || 'roleta',
              produtosDirecionados: data.produtosDirecionados || data.resposta2,
              respostasTriagem: data.respostasTriagem || data.resposta1
            }
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
            lead: {
              id: docItem.id,
              nome: data.nome || participant.nome || 'Participante',
              crachaId: data.crachaId || crachaClean,
              empresa: data.empresa,
              cargo: data.cargo,
              email: data.email,
              whatsapp: data.whatsapp,
              premioGanho: premio || 'Prêmio Conquistado',
              voucher: voucher || 'VX-00000',
              dataHora: data.dataHora || 'Recentemente',
              jogoEscolhido: data.jogoEscolhido || data.jogo || 'roleta',
              produtosDirecionados: data.produtosDirecionados || data.resposta2,
              respostasTriagem: data.respostasTriagem || data.resposta1
            }
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
            lead: {
              id: docItem.id,
              nome: data.nome || participant.nome || 'Participante',
              crachaId: data.crachaId || crachaClean || 'N/A',
              empresa: data.empresa,
              cargo: data.cargo,
              email: data.email,
              whatsapp: data.whatsapp,
              premioGanho: premio || 'Prêmio Conquistado',
              voucher: voucher || 'VX-00000',
              dataHora: data.dataHora || 'Recentemente',
              jogoEscolhido: data.jogoEscolhido || data.jogo || 'roleta',
              produtosDirecionados: data.produtosDirecionados || data.resposta2,
              respostasTriagem: data.respostasTriagem || data.resposta1
            }
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
            lead: {
              id: docItem.id,
              nome: data.nome || participant.nome || 'Participante',
              crachaId: data.crachaId || crachaClean || 'N/A',
              empresa: data.empresa,
              cargo: data.cargo,
              email: data.email,
              whatsapp: data.whatsapp,
              premioGanho: premio || 'Prêmio Conquistado',
              voucher: voucher || 'VX-00000',
              dataHora: data.dataHora || 'Recentemente',
              jogoEscolhido: data.jogoEscolhido || data.jogo || 'roleta',
              produtosDirecionados: data.produtosDirecionados || data.resposta2,
              respostasTriagem: data.respostasTriagem || data.resposta1
            }
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
            lead: {
              id: match.id || 'local',
              nome: match.nome || participant.nome || 'Participante',
              crachaId: match.crachaId || crachaClean || 'N/A',
              empresa: match.empresa,
              cargo: match.cargo,
              email: match.email,
              whatsapp: match.whatsapp,
              premioGanho: match.premioGanho || match.premio || 'Prêmio Conquistado',
              voucher: match.voucher || match.codigoVoucher || 'VX-00000',
              dataHora: match.dataHora || 'Recentemente',
              jogoEscolhido: match.jogoEscolhido || match.jogo || 'roleta',
              produtosDirecionados: match.produtosDirecionados,
              respostasTriagem: match.respostasTriagem
            }
          };
        }
      }
    }
  } catch (e) {
    console.warn('Erro ao verificar localStorage:', e);
  }

  return { alreadyDrawn: false };
}

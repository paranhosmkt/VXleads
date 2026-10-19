import { PHYSICAL_ITEM_PRIZES, ITEM_ROULETTE_SLICES, PhysicalItemPrize, RouletteSlice } from '../data/prizesConfig';

/**
 * Ordem Oficial Sequencial dos Brindes Físicos:
 * 1. Abridor de garrafa (index 0)
 * 2. Eco copo (index 1)
 * 3. Caneta e Bloco de notas (index 2)
 * Sempre seguindo o ganho de um de cada vez em ciclo contínuo.
 */
export const SEQUENTIAL_GIFTS: PhysicalItemPrize[] = [
  PHYSICAL_ITEM_PRIZES[0], // Abridor de garrafa
  PHYSICAL_ITEM_PRIZES[1], // Eco copo
  PHYSICAL_ITEM_PRIZES[2]  // Caneta e Bloco de notas
];

const LOCAL_STORAGE_KEY = 'vx_gift_sequence_step';

/**
 * Lê o passo atual da sequência (0 = Abridor, 1 = Eco Copo, 2 = Caneta e Bloco)
 */
export function getLocalGiftSequenceStep(): number {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        return parsed % SEQUENTIAL_GIFTS.length;
      }
    }
  } catch (err) {
    console.warn('Erro ao ler vx_gift_sequence_step do localStorage:', err);
  }
  return 0; // Inicia sempre no Abridor de garrafa
}

/**
 * Salva localmente o passo atual da sequência
 */
export function setLocalGiftSequenceStep(step: number): void {
  try {
    const normalized = Math.max(0, step) % SEQUENTIAL_GIFTS.length;
    localStorage.setItem(LOCAL_STORAGE_KEY, normalized.toString());
  } catch (err) {
    console.warn('Erro ao salvar vx_gift_sequence_step:', err);
  }
}

/**
 * Retorna o brinde físico atual da sequência sincronizado com servidor / localStorage
 */
export async function getCurrentSequentialGift(): Promise<{
  step: number;
  gift: PhysicalItemPrize;
  sliceIndex: number;
  slice: RouletteSlice;
}> {
  let step = getLocalGiftSequenceStep();

  try {
    const res = await fetch('/api/gift-sequence');
    if (res.ok) {
      const data = await res.json();
      if (typeof data.currentIndex === 'number') {
        step = data.currentIndex % SEQUENTIAL_GIFTS.length;
        setLocalGiftSequenceStep(step);
      }
    }
  } catch (err) {
    // Modo offline / fallback seguro no localStorage
  }

  const gift = SEQUENTIAL_GIFTS[step] || SEQUENTIAL_GIFTS[0];
  const sliceIndex = getSliceIndexForGiftKey(gift.key, step);
  const slice = ITEM_ROULETTE_SLICES[sliceIndex] || ITEM_ROULETTE_SLICES[0];

  return {
    step,
    gift,
    sliceIndex,
    slice
  };
}

/**
 * Avança o passo da sequência para o próximo brinde (1 por vez)
 * 0 (Abridor) -> 1 (Eco copo) -> 2 (Caneta e Bloco) -> 0 (Abridor) ...
 */
export async function advanceGiftSequence(): Promise<{
  awardedStep: number;
  awardedGift: PhysicalItemPrize;
  nextStep: number;
  nextGift: PhysicalItemPrize;
}> {
  const current = getLocalGiftSequenceStep();
  const next = (current + 1) % SEQUENTIAL_GIFTS.length;

  setLocalGiftSequenceStep(next);

  try {
    fetch('/api/gift-sequence/advance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).catch(() => {});
  } catch (err) {
    // Ignore network failure
  }

  return {
    awardedStep: current,
    awardedGift: SEQUENTIAL_GIFTS[current] || SEQUENTIAL_GIFTS[0],
    nextStep: next,
    nextGift: SEQUENTIAL_GIFTS[next] || SEQUENTIAL_GIFTS[0]
  };
}

/**
 * Reinicia a sequência para começar novamente no Abridor de garrafa (passo 0)
 */
export async function resetGiftSequence(): Promise<void> {
  setLocalGiftSequenceStep(0);
  try {
    await fetch('/api/gift-sequence/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    // Ignore
  }
}

/**
 * Retorna o índice correspondente na roleta (0 a 5) para o brinde físico atual.
 * Alterna entre as fatias correspondentes da roleta para um visual sempre dinâmico:
 * - Abridor: fatias 0 ou 3
 * - Eco Copo: fatias 1 ou 4
 * - Caneta + Bloco: fatias 2 ou 5
 */
export function getSliceIndexForGiftKey(key: string, stepCount: number = 0): number {
  if (key === 'abridor') {
    return Math.floor(stepCount / 3) % 2 === 0 ? 0 : 3;
  }
  if (key === 'ecocopo') {
    return Math.floor(stepCount / 3) % 2 === 0 ? 1 : 4;
  }
  if (key === 'caneta_bloco' || key === 'caneta' || key === 'bloco') {
    return Math.floor(stepCount / 3) % 2 === 0 ? 2 : 5;
  }
  return 0;
}

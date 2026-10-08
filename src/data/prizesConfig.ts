export interface DiscountPrize {
  id: string;
  name: string;
  shortName: string;
  color: string;
  icon: string;
}

export interface PhysicalItemPrize {
  id: string;
  key: 'abridor' | 'caneta' | 'ecocopo' | 'bloco';
  name: string;
  shortName: string;
  color: string;
  icon: string;
  description: string;
}

export interface RouletteSlice {
  id: string;
  prizeKey: string;
  name: string;
  topText: string;
  bottomText: string;
  color: string;
  icon: string;
}

/**
 * 1º Sorteio - TDM: Mantém os descontos já existentes (10% a 40%)
 */
export const TDM_DISCOUNT_PRIZES: DiscountPrize[] = [
  { id: 'tdm-10', name: '10% de Desconto', shortName: '10% OFF', color: '#2563EB', icon: '🏷️' },
  { id: 'tdm-15', name: '15% de Desconto', shortName: '15% OFF', color: '#059669', icon: '🎉' },
  { id: 'tdm-20', name: '20% de Desconto', shortName: '20% OFF', color: '#7C3AED', icon: '⭐' },
  { id: 'tdm-25', name: '25% de Desconto', shortName: '25% OFF', color: '#D97706', icon: '🔥' },
  { id: 'tdm-30', name: '30% de Desconto', shortName: '30% OFF', color: '#DB2777', icon: '✨' },
  { id: 'tdm-35', name: '35% de Desconto', shortName: '35% OFF', color: '#0891B2', icon: '🚀' },
  { id: 'tdm-40', name: '40% de Desconto', shortName: '40% OFF', color: '#DC2626', icon: '👑' },
];

// Alias para compatibilidade anterior
export const DISCOUNT_PRIZES: DiscountPrize[] = TDM_DISCOUNT_PRIZES;

/**
 * 1º Sorteio - OUTROS PRODUTOS (ACM, VERICUT, CRIBWISE, HUMAINAX, etc.):
 * Porcentagens solicitadas: 3,5%, 5,0%, 6,5%
 */
export const OTHER_PRODUCTS_DISCOUNT_PRIZES: DiscountPrize[] = [
  { id: 'other-3.5', name: '3,5% de Desconto', shortName: '3,5% OFF', color: '#2563EB', icon: '🏷️' },
  { id: 'other-5.0', name: '5,0% de Desconto', shortName: '5,0% OFF', color: '#059669', icon: '⭐' },
  { id: 'other-6.5', name: '6,5% de Desconto', shortName: '6,5% OFF', color: '#7C3AED', icon: '🔥' },
];

/**
 * Fatias da roleta para os outros produtos (6 fatias balanceadas de 60°,
 * alternando as 3 porcentagens: 3,5%, 5,0% e 6,5%)
 */
export const OTHER_PRODUCTS_DISCOUNT_SLICES: DiscountPrize[] = [
  { id: 'slice-other-3.5-a', name: '3,5% de Desconto', shortName: '3,5% OFF', color: '#2563EB', icon: '🏷️' },
  { id: 'slice-other-5.0-a', name: '5,0% de Desconto', shortName: '5,0% OFF', color: '#059669', icon: '⭐' },
  { id: 'slice-other-6.5-a', name: '6,5% de Desconto', shortName: '6,5% OFF', color: '#7C3AED', icon: '🔥' },
  { id: 'slice-other-3.5-b', name: '3,5% de Desconto', shortName: '3,5% OFF', color: '#D97706', icon: '🏷️' },
  { id: 'slice-other-5.0-b', name: '5,0% de Desconto', shortName: '5,0% OFF', color: '#DB2777', icon: '⭐' },
  { id: 'slice-other-6.5-b', name: '6,5% de Desconto', shortName: '6,5% OFF', color: '#0891B2', icon: '🔥' },
];

/**
 * Identifica se o produto informado é TDM
 */
export function isTdmProduct(productIdOrKey?: string | null): boolean {
  if (!productIdOrKey) return false;
  const clean = productIdOrKey.trim().toLowerCase();
  return clean === 'tdm' || clean.includes('tdm');
}

/**
 * Retorna as fatias da roleta de desconto para o produto correspondente:
 * - Se TDM: retorna as 7 fatias com os descontos originais (10% a 40%)
 * - Se outro produto: retorna as 6 fatias balanceadas com 3,5%, 5,0% e 6,5%
 */
export function getDiscountPrizesForProduct(productIdOrKey?: string | null): DiscountPrize[] {
  if (isTdmProduct(productIdOrKey)) {
    return TDM_DISCOUNT_PRIZES;
  }
  return OTHER_PRODUCTS_DISCOUNT_SLICES;
}

/**
 * Retorna a lista única de descontos possíveis para o produto
 */
export function getUniqueDiscountsForProduct(productIdOrKey?: string | null): DiscountPrize[] {
  if (isTdmProduct(productIdOrKey)) {
    return TDM_DISCOUNT_PRIZES;
  }
  return OTHER_PRODUCTS_DISCOUNT_PRIZES;
}

/**
 * Retorna a legenda de faixa de desconto (ex: '10% a 40% OFF' para TDM, ou '3,5% a 6,5% OFF' para outros)
 */
export function getDiscountRangeLabel(productIdOrKey?: string | null): string {
  if (isTdmProduct(productIdOrKey)) {
    return '10% a 40% OFF';
  }
  return '3,5% a 6,5% OFF';
}

/**
 * Retorna a descrição amigável das porcentagens (ex: '10% a 40%' para TDM, ou '3,5%, 5,0% e 6,5%' para outros)
 */
export function getDiscountPercentagesText(productIdOrKey?: string | null): string {
  if (isTdmProduct(productIdOrKey)) {
    return '10% a 40%';
  }
  return '3,5%, 5,0% e 6,5%';
}

/**
 * 2º Sorteio: Itens físicos (Abridor de garrafa, caneta, eco copo e bloco de anotações)
 */
export const PHYSICAL_ITEM_PRIZES: PhysicalItemPrize[] = [
  {
    id: 'item-abridor',
    key: 'abridor',
    name: 'Abridor de garrafa',
    shortName: 'Abridor',
    color: '#F59E0B',
    icon: '🍾',
    description: 'Abridor de garrafa metálico personalizado'
  },
  {
    id: 'item-caneta',
    key: 'caneta',
    name: 'Caneta',
    shortName: 'Caneta',
    color: '#8B5CF6',
    icon: '🖊️',
    description: 'Caneta executiva exclusiva do estande'
  },
  {
    id: 'item-ecocopo',
    key: 'ecocopo',
    name: 'Eco copo',
    shortName: 'Eco Copo',
    color: '#10B981',
    icon: '🥤',
    description: 'Eco copo sustentável colecionável'
  },
  {
    id: 'item-bloco',
    key: 'bloco',
    name: 'Bloco de anotações',
    shortName: 'Bloco de Notas',
    color: '#3B82F6',
    icon: '📝',
    description: 'Bloco de anotações oficial personalizado'
  }
];

/**
 * Fatias da roleta do 2º sorteio (8 fatias balanceadas de 45° alternando os 4 itens oficiais)
 */
export const ITEM_ROULETTE_SLICES: RouletteSlice[] = [
  {
    id: 'slice-abridor-1',
    prizeKey: 'abridor',
    name: 'Abridor de garrafa',
    topText: 'ABRIDOR DE',
    bottomText: 'GARRAFA',
    color: '#F59E0B',
    icon: '🍾'
  },
  {
    id: 'slice-caneta-1',
    prizeKey: 'caneta',
    name: 'Caneta',
    topText: 'CANETA',
    bottomText: 'OFICIAL',
    color: '#8B5CF6',
    icon: '🖊️'
  },
  {
    id: 'slice-ecocopo-1',
    prizeKey: 'ecocopo',
    name: 'Eco copo',
    topText: 'ECO',
    bottomText: 'COPO',
    color: '#10B981',
    icon: '🥤'
  },
  {
    id: 'slice-bloco-1',
    prizeKey: 'bloco',
    name: 'Bloco de anotações',
    topText: 'BLOCO DE',
    bottomText: 'ANOTAÇÕES',
    color: '#3B82F6',
    icon: '📝'
  },
  {
    id: 'slice-abridor-2',
    prizeKey: 'abridor',
    name: 'Abridor de garrafa',
    topText: 'ABRIDOR DE',
    bottomText: 'GARRAFA',
    color: '#D97706',
    icon: '🍾'
  },
  {
    id: 'slice-caneta-2',
    prizeKey: 'caneta',
    name: 'Caneta',
    topText: 'CANETA',
    bottomText: 'OFICIAL',
    color: '#EC4899',
    icon: '🖊️'
  },
  {
    id: 'slice-ecocopo-2',
    prizeKey: 'ecocopo',
    name: 'Eco copo',
    topText: 'ECO',
    bottomText: 'COPO',
    color: '#06B6D4',
    icon: '🥤'
  },
  {
    id: 'slice-bloco-2',
    prizeKey: 'bloco',
    name: 'Bloco de anotações',
    topText: 'BLOCO DE',
    bottomText: 'ANOTAÇÕES',
    color: '#2563EB',
    icon: '📝'
  }
];

/**
 * Formata os textos para exibição nos setores SVG da roleta.
 * Suporta inteiros (10%, 20%) e decimais com vírgula ou ponto (3,5%, 5,0%, 6,5%).
 */
export function getPrizeSliceDisplay(name: string): { top: string; bottom: string } {
  // Descontos: '3,5% de Desconto', '5,0% de Desconto', '20% de Desconto'
  const discountMatch = name.match(/^(\d+(?:[.,]\d+)?%\s*(?:OFF)?)\s*(?:de\s*)?(.*)$/i);
  if (discountMatch) {
    const rawPct = discountMatch[1].trim();
    return {
      top: rawPct,
      bottom: (discountMatch[2].trim() || 'DESCONTO').toUpperCase()
    };
  }

  // Itens físicos
  if (/abridor/i.test(name)) {
    return { top: 'ABRIDOR DE', bottom: 'GARRAFA' };
  }
  if (/caneta/i.test(name)) {
    return { top: 'CANETA', bottom: 'OFICIAL' };
  }
  if (/copo/i.test(name)) {
    return { top: 'ECO', bottom: 'COPO' };
  }
  if (/bloco/i.test(name) || /anota/i.test(name)) {
    return { top: 'BLOCO DE', bottom: 'ANOTAÇÕES' };
  }

  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    const mid = Math.ceil(parts.length / 2);
    return {
      top: parts.slice(0, mid).join(' '),
      bottom: parts.slice(mid).join(' ').toUpperCase()
    };
  }

  return { top: name, bottom: '' };
}

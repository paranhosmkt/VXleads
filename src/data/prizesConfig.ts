export interface DiscountPrize {
  id: string;
  name: string;
  shortName: string;
  color: string;
  icon: string;
}

export interface PhysicalItemPrize {
  id: string;
  key: 'abridor' | 'caneta' | 'ecocopo';
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
 * 1º Sorteio: Descontos já existentes
 */
export const DISCOUNT_PRIZES: DiscountPrize[] = [
  { id: 'p1', name: '10% de Desconto', shortName: '10% OFF', color: '#2563EB', icon: '🏷️' },
  { id: 'p2', name: '15% de Desconto', shortName: '15% OFF', color: '#059669', icon: '🎉' },
  { id: 'p3', name: '20% de Desconto', shortName: '20% OFF', color: '#7C3AED', icon: '⭐' },
  { id: 'p4', name: '25% de Desconto', shortName: '25% OFF', color: '#D97706', icon: '🔥' },
  { id: 'p5', name: '30% de Desconto', shortName: '30% OFF', color: '#DB2777', icon: '✨' },
  { id: 'p6', name: '35% de Desconto', shortName: '35% OFF', color: '#0891B2', icon: '🚀' },
  { id: 'p7', name: '40% de Desconto', shortName: '40% OFF', color: '#DC2626', icon: '👑' },
];

/**
 * 2º Sorteio: Itens físicos (Abridor de garrafa, caneta e eco copo)
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
  }
];

/**
 * Fatias da roleta do 2º sorteio (6 fatias balanceadas alternando os 3 itens)
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
    id: 'slice-abridor-2',
    prizeKey: 'abridor',
    name: 'Abridor de garrafa',
    topText: 'ABRIDOR DE',
    bottomText: 'GARRAFA',
    color: '#3B82F6',
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
  }
];

/**
 * Formata os textos para exibição nos setores SVG da roleta
 */
export function getPrizeSliceDisplay(name: string): { top: string; bottom: string } {
  // Descontos: '20% de Desconto' -> top: '20% OFF', bottom: 'DESCONTO'
  const discountMatch = name.match(/^(\d+%\s*(?:OFF)?)\s*(?:de\s*)?(.*)$/i);
  if (discountMatch) {
    return {
      top: discountMatch[1].trim(),
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

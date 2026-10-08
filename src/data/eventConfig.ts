export interface EventConfig {
  id: string;
  name: string;
  edition: string;
  location: string;
  status: 'ativo' | 'finalizado';
  statusLabel: string;
  badgeClass: string;
  description: string;
}

export const CURRENT_EVENT: EventConfig = {
  id: 'mercopar-2026',
  name: 'Mercopar 2026',
  edition: 'Mercopar 2026 • Feira de Inovação Industrial',
  location: 'Caxias do Sul / RS',
  status: 'ativo',
  statusLabel: 'Evento Ativo',
  badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  description: 'Sorteios oficiais de descontos e brindes para visitantes e clientes da Mercopar 2026.'
};

export const PAST_EVENT: EventConfig = {
  id: 'grob-experience',
  name: 'Grob Experience',
  edition: 'Grob Experience • Edição Especial',
  location: 'São Paulo / SP',
  status: 'finalizado',
  statusLabel: 'Evento Finalizado',
  badgeClass: 'bg-slate-700/60 text-slate-300 border-slate-600/50',
  description: 'Sorteios e captação de leads realizados durante o evento Grob Experience (Encerrado).'
};

export const ALL_EVENTS: EventConfig[] = [
  CURRENT_EVENT,
  PAST_EVENT
];

/**
 * Normalizes event name and resolves if it belongs to Mercopar 2026 or Grob Experience.
 * Any lead captured prior to this update without an explicit event belongs to Grob Experience.
 */
export function resolveEventName(rawEvent?: string | null, isNewRecord: boolean = false): string {
  if (!rawEvent) {
    return isNewRecord ? CURRENT_EVENT.name : PAST_EVENT.name;
  }

  const clean = rawEvent.trim().toLowerCase();
  if (clean.includes('mercopar')) {
    return CURRENT_EVENT.name;
  }
  if (clean.includes('grob')) {
    return PAST_EVENT.name;
  }

  return rawEvent;
}

export function isCurrentEvent(eventName?: string | null): boolean {
  if (!eventName) return false;
  return resolveEventName(eventName) === CURRENT_EVENT.name;
}

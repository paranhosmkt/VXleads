export interface ProductConfig {
  id: string;             // slug: 'acm', 'tdm', 'vericut', 'cribwise', 'humainax'
  key: string;            // 'ACM', 'TDM', 'VERICUT', 'CRIBWISE', 'HUMAINAX'
  name: string;           // 'ACM'
  fullName: string;       // 'ACM • Adaptive Control & Monitoring'
  tagline: string;        // 'Otimização e Proteção em Tempo Real para CNC'
  description: string;    // 'Proteção inteligente contra quebras de ferramentas e aumento de produtividade na usinagem.'
  category: string;       // 'Otimização CNC'
  badge: string;          // 'Módulo CNC'
  color: string;          // '#3B82F6' (blue)
  themeBg: string;        // 'from-blue-600/20 to-indigo-600/10'
  accentBorder: string;   // 'border-blue-500/40'
  badgeBg: string;        // 'bg-blue-500/20 text-blue-300 border-blue-500/40'
  buttonBg: string;       // 'bg-blue-600 hover:bg-blue-500 text-white'
  ringColor: string;      // 'ring-blue-500'
  iconName: 'zap' | 'database' | 'shield' | 'box' | 'cpu';
  benefits: string[];
}

export const PRODUCTS_CONFIG: ProductConfig[] = [
  {
    id: 'acm',
    key: 'ACM',
    name: 'ACM',
    fullName: 'ACM • Adaptive Control & Monitoring',
    tagline: 'Otimização e Proteção CNC em Tempo Real',
    description: 'Monitoramento inteligente em tempo real que protege ferramentas contra quebras e maximiza as taxas de avanço na usinagem.',
    category: 'Otimização e Monitoramento CNC',
    badge: 'Controle Adaptativo',
    color: '#3B82F6',
    themeBg: 'from-blue-600/20 to-cyan-600/10',
    accentBorder: 'border-blue-500/50',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    buttonBg: 'bg-blue-600 hover:bg-blue-500 text-white',
    ringColor: 'ring-blue-500',
    iconName: 'zap',
    benefits: [
      'Eliminação de quebra prematura de ferramentas',
      'Aumento de até 25% na produtividade da máquina CNC',
      'Proteção contra sobrecargas do fuso e peças'
    ]
  },
  {
    id: 'tdm',
    key: 'TDM',
    name: 'TDM Systems',
    fullName: 'TDM Systems • Tool Data Management',
    tagline: 'Gestão Centralizada de Dados de Ferramentas',
    description: 'Gestão completa do ciclo de vida das ferramentas: do CAD/CAM ao pré-ajuste e máquinas do chão de fábrica.',
    category: 'Tool Data Management (TDM)',
    badge: 'Gestão de Ferramentas',
    color: '#10B981',
    themeBg: 'from-emerald-600/20 to-teal-600/10',
    accentBorder: 'border-emerald-500/50',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    ringColor: 'ring-emerald-500',
    iconName: 'database',
    benefits: [
      'Visibilidade unificada dos dados de ferramentas',
      'Integração direta com softwares CAM e pré-ajustadores',
      'Redução drástica de tempo de setup e paradas'
    ]
  },
  {
    id: 'vericut',
    key: 'VERICUT',
    name: 'VERICUT',
    fullName: 'VERICUT • Simulação CNC & Otimização',
    tagline: 'Líder Mundial em Verificação e Simulação de Código G',
    description: 'Simulação digital ultra-precisa para prevenção de colisões, validação de programas CNC e otimização de ciclos de corte.',
    category: 'Simulação e Código G',
    badge: 'Simulação Líder Mundial',
    color: '#8B5CF6',
    themeBg: 'from-violet-600/20 to-purple-600/10',
    accentBorder: 'border-purple-500/50',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    buttonBg: 'bg-purple-600 hover:bg-purple-500 text-white',
    ringColor: 'ring-purple-500',
    iconName: 'shield',
    benefits: [
      'Zero colisões ou danos caros em máquinas e peças',
      'Otimização avançada de taxas de avanço e forças',
      'Validação 100% virtual antes de ir para a máquina'
    ]
  },
  {
    id: 'cribwise',
    key: 'CRIBWISE',
    name: 'CRIBWISE',
    fullName: 'CRIBWISE • Gestão de Almoxarifado Inteligente',
    tagline: 'Controle de Armários e Dispensers de Ferramentas',
    description: 'Software inteligente para gestão de estoque de ferramentas e insumos, conectado a armários automatizados e lockers.',
    category: 'Controle de Estoque & Tool Cribs',
    badge: 'Inventário Inteligente',
    color: '#F59E0B',
    themeBg: 'from-amber-600/20 to-yellow-600/10',
    accentBorder: 'border-amber-500/50',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    buttonBg: 'bg-amber-600 hover:bg-amber-500 text-white',
    ringColor: 'ring-amber-500',
    iconName: 'box',
    benefits: [
      'Rastreabilidade total de ferramentas por operador e OP',
      'Eliminação de ferramentas extraviadas e desperdícios',
      'Reposição automática e relatórios de consumo'
    ]
  },
  {
    id: 'humainax',
    key: 'HUMAINAX',
    name: 'HUMAINAX',
    fullName: 'HUMAINAX • Inteligência Artificial para Usinagem',
    tagline: 'Inteligência Artificial & Analytics CNC',
    description: 'Plataforma impulsionada por IA para análise preditiva do desgaste de ferramentas, eficiência operacional e automação analítica.',
    category: 'Inteligência Artificial Industrial',
    badge: 'IA & Analytics',
    color: '#EC4899',
    themeBg: 'from-pink-600/20 to-rose-600/10',
    accentBorder: 'border-pink-500/50',
    badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    buttonBg: 'bg-pink-600 hover:bg-pink-500 text-white',
    ringColor: 'ring-pink-500',
    iconName: 'cpu',
    benefits: [
      'Análise preditiva do ciclo de vida das ferramentas',
      'Tomada de decisão orientada por dados operacionais',
      'Otimização algorítmica contínua dos processos'
    ]
  }
];

/**
 * Normalizes input string and finds corresponding ProductConfig
 * Accepts slugs ('acm', 'vericut', 'humainax'), keys ('ACM', 'HUMAINAX'), names, or messy inputs ('produto=humainax')
 */
export function getProductBySlugOrParam(input?: string | null): ProductConfig | null {
  if (!input) return null;
  const clean = input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

  if (!clean) return null;

  // Support aliases for HUMAINAX (humainx, humaninx, humanax, humainax)
  if (
    clean === 'humainax' ||
    clean === 'humainx' ||
    clean === 'humaninx' ||
    clean === 'humanax' ||
    clean.includes('humain') ||
    clean.includes('humanin')
  ) {
    const humainaxProd = PRODUCTS_CONFIG.find(p => p.id === 'humainax');
    if (humainaxProd) return humainaxProd;
  }

  return PRODUCTS_CONFIG.find(p => {
    const slugNorm = p.id.toLowerCase();
    const keyNorm = p.key.toLowerCase();
    const nameNorm = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean === slugNorm || clean === keyNorm || clean === nameNorm || clean.includes(slugNorm) || slugNorm.includes(clean);
  }) || null;
}

/**
 * Extracts product from searchParams or URL path
 */
export function extractProductFromUrl(searchParams: URLSearchParams, pathParam?: string): ProductConfig | null {
  // 1. Direct path param e.g. /sorteio/vericut
  if (pathParam) {
    const matched = getProductBySlugOrParam(pathParam);
    if (matched) return matched;
  }

  // 2. Query param keys: produto, product, produtos, p, produto_selecionado
  const possibleParams = [
    'produto',
    'product',
    'produtos',
    'produto_selecionado',
    'prod',
    'p',
    'produtos_direcionados',
    'produtosDirecionados',
    'solucao',
    'solucoes'
  ];

  for (const key of possibleParams) {
    const val = searchParams.get(key);
    if (val) {
      const matched = getProductBySlugOrParam(val);
      if (matched) return matched;
    }
  }

  return null;
}

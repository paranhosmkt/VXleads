export interface TriagemAlternative {
  id: number;
  text: string;
  shortLabel: string;
  produto: string | null;
  isNone?: boolean;
}

export const TRIAGEM_QUESTION_TITLE = 
  "Com base na realidade da sua empresa hoje quais das situações abaixo acontecem:";

export const TRIAGEM_QUESTION_SUBTITLE = 
  "Você pode selecionar mais de uma opção para direcionarmos as soluções mais adequadas:";

export const TRIAGEM_ALTERNATIVES: TriagemAlternative[] = [
  {
    id: 1,
    text: "Dentro do ecossistema CNC de sua empresa, precisam resolver problemas como quebras de ferramentas ou baixa eficiência na produtividade em suas operações de usinagem?",
    shortLabel: "Problemas CNC / Quebras de Ferramentas / Baixa Eficiência",
    produto: "ACM"
  },
  {
    id: 2,
    text: "Atualmente, como vocês gerenciam os dados das ferramentas em sua operação? Estão enfrentando desafios como falta de visibilidade, inconsistência nos dados ou dificuldade em tomar decisões baseadas nas informações disponíveis?",
    shortLabel: "Gestão de Dados de Ferramentas / Falta de Visibilidade",
    produto: "TDM"
  },
  {
    id: 3,
    text: "Vocês estão enfrentando desafios na detecção de erros em programas CNC ou na otimização dos processos de usinagem? Como isso tem impactado a eficiência e a qualidade da produção na sua empresa?",
    shortLabel: "Detecção de Erros em Programas CNC / Otimização de Processos",
    produto: "VERICUT"
  },
  {
    id: 4,
    text: "Como vocês gerenciam atualmente o controle de inventário de ferramentas e insumos? Estão enfrentando dificuldades como falta de visibilidade, atrasos na produção ou custos excessivos?",
    shortLabel: "Controle de Inventário de Ferramentas / Custos / Atrasos",
    produto: "CRIBWISE"
  },
  {
    id: 5,
    text: "Como vocês estão utilizando a inteligência artificial para otimizar o gerenciamento de ferramentas de usinagem? Estão enfrentando desafios na coleta de dados ou na análise de desempenho das ferramentas?",
    shortLabel: "Uso de Inteligência Artificial / Análise de Desempenho",
    produto: "HUMAINX"
  },
  {
    id: 6,
    text: "Nenhuma das alternativas acima.",
    shortLabel: "Nenhuma das alternativas acima",
    produto: null,
    isNone: true
  }
];

export function calculateMatchedProducts(selectedIds: number[]): string[] {
  const products: string[] = [];
  selectedIds.forEach(id => {
    const item = TRIAGEM_ALTERNATIVES.find(alt => alt.id === id);
    if (item && item.produto && !products.includes(item.produto)) {
      products.push(item.produto);
    }
  });
  return products;
}

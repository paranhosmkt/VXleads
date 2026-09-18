import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Check, Smartphone, Target 
} from 'lucide-react';

export interface ScreeningParticipant {
  nome: string;
  email: string;
  whatsapp: string;
  empresa: string;
  cargo: string;
  crachaId: string;
  origem: string;
}

export interface Question {
  id: number;
  title: string;
  subtitle: string;
  options: { id: string; label: string; desc?: string }[];
}

export const SCREENING_QUESTIONS: Question[] = [
  {
    id: 1,
    title: 'Qual o tamanho da sua equipe comercial / de atendimento em eventos?',
    subtitle: 'Ajuda a dimensionar o volume de totens ou tablets ideais.',
    options: [
      { id: 'A', label: '1 a 3 pessoas', desc: 'Operação enxuta, foco em automação total' },
      { id: 'B', label: '4 a 10 pessoas', desc: 'Equipe média para fluxo constante' },
      { id: 'C', label: 'Mais de 10 pessoas', desc: 'Grande estande com múltiplos promotores' },
      { id: 'D', label: 'Apenas sócios / diretoria', desc: 'Foco exclusivo em tomadores de decisão' }
    ]
  },
  {
    id: 2,
    title: 'Qual o maior obstáculo do seu estande na captação de leads?',
    subtitle: 'Identifica o gargalo principal do seu funil presencial.',
    options: [
      { id: 'A', label: 'Atrair o visitante do corredor', desc: 'Pessoas passam direto sem parar' },
      { id: 'B', label: 'Anotações em papel ou crachás perdidos', desc: 'Dados ilegíveis ou esquecidos na mala' },
      { id: 'C', label: 'Follow-up demorado após a feira', desc: 'Dias para entrar em contato com o lead' },
      { id: 'D', label: 'Falta de qualificação na hora', desc: 'Não sabe quem tem poder de compra' }
    ]
  },
  {
    id: 3,
    title: 'Qual a previsão do próximo evento ou feira da sua empresa?',
    subtitle: 'Para mapear o tempo hábil de implantação da gamificação.',
    options: [
      { id: 'A', label: 'Próximos 30 a 60 dias', desc: 'Precisamos de solução rápida e pronta' },
      { id: 'B', label: 'Neste semestre', desc: 'Estamos na fase de planejamento e cotação' },
      { id: 'C', label: 'Ano que vem', desc: 'Montando o orçamento anual de eventos' },
      { id: 'D', label: 'Apenas avaliando protótipo', desc: 'Estudando novas tecnologias para o futuro' }
    ]
  }
];

export default function TriagemPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [participant, setParticipant] = useState<ScreeningParticipant>({
    nome: searchParams.get('nome') || 'Mariana Costa',
    email: searchParams.get('email') || 'mariana.costa@logtech.com.br',
    whatsapp: searchParams.get('whatsapp') || '(11) 98765-4321',
    empresa: searchParams.get('empresa') || 'LogTech Brasil',
    cargo: searchParams.get('cargo') || 'Diretora de Operações',
    crachaId: searchParams.get('crachaId') || 'CR-9482',
    origem: searchParams.get('origem') || 'API_App_Evento'
  });

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const nome = searchParams.get('nome');
    if (nome) {
      setParticipant({
        nome: nome,
        email: searchParams.get('email') || '',
        whatsapp: searchParams.get('whatsapp') || '',
        empresa: searchParams.get('empresa') || '',
        cargo: searchParams.get('cargo') || '',
        crachaId: searchParams.get('crachaId') || 'CR-' + Math.floor(1000 + Math.random() * 9000),
        origem: searchParams.get('origem') || 'API_App_Evento'
      });
    }
  }, [searchParams]);

  const handleSelectAnswer = (optionLabel: string) => {
    const currentQ = SCREENING_QUESTIONS[currentQuestionIdx];
    const newAnswers = { ...answers, [currentQ.id]: optionLabel };
    setAnswers(newAnswers);

    if (currentQuestionIdx < SCREENING_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIdx(prev => prev + 1);
      }, 250);
    } else {
      // Completed all screening questions! Redirect to separate Roulette page
      setIsRedirecting(true);
      setTimeout(() => {
        const nextParams = new URLSearchParams({
          nome: participant.nome,
          email: participant.email,
          whatsapp: participant.whatsapp,
          empresa: participant.empresa,
          cargo: participant.cargo,
          crachaId: participant.crachaId,
          origem: participant.origem,
          r1: newAnswers[1] || '',
          r2: newAnswers[2] || '',
          r3: newAnswers[3] || ''
        });
        navigate(`/roleta-premio?${nextParams.toString()}`);
      }, 500);
    }
  };

  const currentQ = SCREENING_QUESTIONS[currentQuestionIdx];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <Target size={20} />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">
            VX<span className="text-blue-500">Leads</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Passo 1: Triagem
          </span>
        </div>

        <div className="text-xs text-slate-400">
          Etapa 1 de 2 • Perguntas Rápidas
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center gap-6">
        
        {/* Participant Identification Badge */}
        <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
              <Smartphone size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                  Participante Identificado
                </span>
                <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 size={10} className="inline mr-1" /> Validado
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {participant.nome} <span className="text-sm font-normal text-slate-400">• {participant.empresa} ({participant.cargo})</span>
              </h2>
            </div>
          </div>
        </div>

        {/* Screening Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-400 mb-2.5">
              <span className="text-blue-400 font-bold">Pergunta {currentQuestionIdx + 1} de {SCREENING_QUESTIONS.length}</span>
              <span>{Math.round(((currentQuestionIdx + 1) / SCREENING_QUESTIONS.length) * 100)}% Concluído</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full transition-all duration-300"
                style={{ width: `${((currentQuestionIdx + 1) / SCREENING_QUESTIONS.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold mb-3 border border-blue-500/20">
            <Sparkles size={14} />
            <span>Triagem de Qualificação</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-snug">
            {currentQ.title}
          </h3>
          <p className="text-sm text-slate-400 mb-8">
            {currentQ.subtitle}
          </p>

          {/* Options */}
          <div className="space-y-3.5">
            {currentQ.options.map(option => {
              const isSelected = answers[currentQ.id] === option.label;
              return (
                <button
                  key={option.id}
                  disabled={isRedirecting}
                  onClick={() => handleSelectAnswer(option.label)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10 scale-[1.01]' 
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                    }`}>
                      {option.id}
                    </div>
                    <div>
                      <div className="font-semibold text-base sm:text-lg text-white">
                        {option.label}
                      </div>
                      {option.desc && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          {option.desc}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-700 text-transparent'
                  }`}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800 text-xs sm:text-sm">
            <button
              disabled={currentQuestionIdx === 0 || isRedirecting}
              onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
              className="text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 font-semibold cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft size={16} /> Pergunta Anterior
            </button>

            <span className="text-slate-500 font-medium">
              {isRedirecting ? 'Liberando a Roleta de Prêmios...' : 'Responda para liberar a roleta exclusiva'}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

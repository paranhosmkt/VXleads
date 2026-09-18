import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Check, Smartphone, Target, 
  RefreshCw, QrCode, AlertCircle, Radio
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Helper to extract parameters flexible to Portuguese / English variable names
  const extractFromParams = (): ScreeningParticipant => {
    return {
      nome: searchParams.get('nome') || searchParams.get('name') || searchParams.get('Nome') || searchParams.get('lead_nome') || '',
      email: searchParams.get('email') || searchParams.get('Email') || searchParams.get('lead_email') || '',
      whatsapp: searchParams.get('whatsapp') || searchParams.get('telefone') || searchParams.get('phone') || searchParams.get('celular') || '',
      empresa: searchParams.get('empresa') || searchParams.get('company') || searchParams.get('Empresa') || '',
      cargo: searchParams.get('cargo') || searchParams.get('role') || searchParams.get('jobTitle') || '',
      crachaId: searchParams.get('crachaId') || searchParams.get('cracha') || searchParams.get('badge') || searchParams.get('id') || '',
      origem: searchParams.get('origem') || 'Base44'
    };
  };

  const [participant, setParticipant] = useState<ScreeningParticipant>(() => {
    const fromUrl = extractFromParams();
    if (fromUrl.nome) return fromUrl;

    // Check if there is a recently pushed lead saved in localStorage
    try {
      const cached = localStorage.getItem('vx_latest_base44_lead');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      // ignore
    }

    return {
      nome: 'Mariana Costa',
      email: 'mariana.costa@logtech.com.br',
      whatsapp: '(11) 98765-4321',
      empresa: 'LogTech Brasil',
      cargo: 'Diretora de Operações',
      crachaId: 'CR-9482',
      origem: 'Base44_Demo'
    };
  });

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSyncStatus, setAutoSyncStatus] = useState<string | null>(null);

  // Read URL params whenever URL changes
  useEffect(() => {
    const fromUrl = extractFromParams();
    if (fromUrl.nome) {
      setParticipant(fromUrl);
      localStorage.setItem('vx_latest_base44_lead', JSON.stringify(fromUrl));
    }
  }, [searchParams]);

  // Check backend periodically for leads pushed from Base44 via Webhook
  useEffect(() => {
    const checkRecentLeads = async () => {
      try {
        const res = await fetch('/api/leads');
        if (res.ok) {
          const data = await res.json();
          if (data.leads && data.leads.length > 0) {
            const latest = data.leads[0];
            // Only update if current is mock or different lead ID
            if (latest.crachaId && latest.crachaId !== participant.crachaId && latest.nome) {
              setParticipant({
                nome: latest.nome,
                email: latest.email || '',
                whatsapp: latest.whatsapp || '',
                empresa: latest.empresa || '',
                cargo: latest.cargo || '',
                crachaId: latest.crachaId,
                origem: latest.origem || 'Base44_Webhook'
              });
              setAutoSyncStatus(`Lead recebido via API: ${latest.nome} (${latest.empresa})`);
            }
          }
        }
      } catch (e) {
        // quiet catch
      }
    };

    checkRecentLeads();
    const interval = setInterval(checkRecentLeads, 4000);
    return () => clearInterval(interval);
  }, [participant.crachaId]);

  const handleManualRefresh = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        if (data.leads && data.leads.length > 0) {
          const latest = data.leads[0];
          setParticipant({
            nome: latest.nome,
            email: latest.email || '',
            whatsapp: latest.whatsapp || '',
            empresa: latest.empresa || '',
            cargo: latest.cargo || '',
            crachaId: latest.crachaId,
            origem: latest.origem || 'Base44_Webhook'
          });
          setAutoSyncStatus(`Atualizado com sucesso: ${latest.nome}`);
        } else {
          setAutoSyncStatus('Nenhum lead novo recebido via webhook ainda.');
        }
      }
    } catch (err) {
      setAutoSyncStatus('Falha ao verificar novos leads.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setAutoSyncStatus(null), 5000);
    }
  };

  const handleSelectAnswer = (optionLabel: string) => {
    const currentQ = SCREENING_QUESTIONS[currentQuestionIdx];
    const newAnswers = { ...answers, [currentQ.id]: optionLabel };
    setAnswers(newAnswers);

    if (currentQuestionIdx < SCREENING_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIdx(prev => prev + 1);
      }, 250);
    } else {
      // Completed all screening questions! Redirect to separate Roulette page automatically
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

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={isSyncing}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer"
            title="Sincronizar com último crachá lido no Base44"
          >
            <RefreshCw size={13} className={isSyncing ? "animate-spin text-blue-400" : ""} />
            <span>Sincronizar Base44</span>
          </button>
          <div className="text-xs text-slate-400 hidden sm:block">
            Etapa 1 de 2 • Triagem
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center gap-5">
        
        {/* Auto Sync Notification */}
        {autoSyncStatus && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-xs text-blue-300 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <Radio size={14} className="text-blue-400 animate-pulse" />
              <span>{autoSyncStatus}</span>
            </div>
            <span className="text-[10px] text-blue-400/80 font-mono">Conectado</span>
          </div>
        )}

        {/* Participant Identification Badge (Received from Base44) */}
        <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
              <QrCode size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  Crachá Identificado no Base44
                </span>
                <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 size={10} className="inline mr-1" /> ID: {participant.crachaId || 'Crachá Lido'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {participant.nome}{' '}
                <span className="text-sm font-normal text-slate-400">
                  • {participant.empresa} {participant.cargo ? `(${participant.cargo})` : ''}
                </span>
              </h2>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400 hidden sm:block">
            <div className="text-emerald-400 font-semibold">Leitura Confirmada</div>
            <div className="text-[11px] text-slate-500">Pronto para triagem</div>
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
              {isRedirecting ? 'Abrindo a Roleta de Prêmios...' : 'Ao concluir, a roleta abre automaticamente'}
            </span>
          </div>
        </div>

        {/* Quick Connection Help for Base44 */}
        <div className="text-center">
          <p className="text-xs text-slate-500">
            Você pode enviar o visitante direto do Base44 via link: <code className="text-blue-400">/triagem?nome=...&empresa=...</code> ou via webhook.
          </p>
        </div>

      </main>
    </div>
  );
}

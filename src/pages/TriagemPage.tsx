import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Dices, Gift, Smartphone, CheckCircle2, 
  ArrowRight, ShieldCheck, Trophy, Layers, Flame, Check, HelpCircle
} from 'lucide-react';
import ScratchCard from '../components/ScratchCard';
import SlotMachine from '../components/SlotMachine';

// Confetti burst helper
function triggerConfetti() {
  const canvas = document.createElement('canvas');
  canvas.className = 'fixed inset-0 pointer-events-none z-50 w-full h-full';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces: { x: number; y: number; vx: number; vy: number; color: string; size: number; rot: number; vRot: number }[] = [];
  const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#EF4444'];

  for (let i = 0; i < 90; i++) {
    pieces.push({
      x: canvas.width / 2,
      y: canvas.height / 3,
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -12 - 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rot: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10
    });
  }

  let frames = 0;
  function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
      p.rot += p.vRot;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    frames++;
    if (frames < 120) {
      requestAnimationFrame(animate);
    } else {
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    }
  }

  requestAnimationFrame(animate);
}

// 7 Possible prizes
const PRIZES = [
  { id: 'p1', name: '10% de Desconto', color: '#3B82F6', icon: '🏷️' },
  { id: 'p2', name: '15% de Desconto', color: '#10B981', icon: '🎉' },
  { id: 'p3', name: '20% de Desconto', color: '#8B5CF6', icon: '⭐' },
  { id: 'p4', name: '25% de Desconto', color: '#F59E0B', icon: '🔥' },
  { id: 'p5', name: '30% de Desconto', color: '#EC4899', icon: '✨' },
  { id: 'p6', name: '35% de Desconto', color: '#06B6D4', icon: '🚀' },
  { id: 'p7', name: '40% de Desconto', color: '#EF4444', icon: '👑' },
];

const SCREENING_QUESTIONS = [
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

type FlowStep = 'select_game' | 'playing' | 'prize_won' | 'triagem' | 'voucher_final';

export default function TriagemPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. Participant identification read from URL (from Base44 badge reader)
  const [participant, setParticipant] = useState({
    nome: searchParams.get('nome') || searchParams.get('name') || 'Mariana Costa',
    email: searchParams.get('email') || '',
    whatsapp: searchParams.get('whatsapp') || searchParams.get('telefone') || searchParams.get('phone') || '',
    empresa: searchParams.get('empresa') || searchParams.get('company') || 'LogTech Brasil',
    cargo: searchParams.get('cargo') || searchParams.get('role') || 'Diretora de Operações',
    crachaId: searchParams.get('crachaId') || searchParams.get('cracha') || 'CR-9482',
    origem: searchParams.get('origem') || 'Base44'
  });

  // Flow State: 
  // 1) select_game -> 2) playing -> 3) prize_won -> 4) triagem -> 5) voucher_final
  const [currentStep, setCurrentStep] = useState<FlowStep>('select_game');
  const [selectedGame, setSelectedGame] = useState<'roleta' | 'raspadinha' | 'caca_niquel'>('roleta');

  // Game Play States
  const [wonPrize, setWonPrize] = useState<(typeof PRIZES)[0]>(PRIZES[2]); // Default 20%
  const [voucherCode, setVoucherCode] = useState('');

  // Roulette specific state
  const [isSpinningWheel, setIsSpinningWheel] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);

  // Slot machine specific state
  const [isSpinningSlots, setIsSpinningSlots] = useState(false);

  // Scratch card specific state
  const [isScratchRevealed, setIsScratchRevealed] = useState(false);

  // Screening questions state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Pre-seed winner prize randomly on mount
  useEffect(() => {
    const randomPrize = PRIZES[Math.floor(Math.random() * PRIZES.length)];
    setWonPrize(randomPrize);
    const code = `VX-${Math.floor(10000 + Math.random() * 90000)}`;
    setVoucherCode(code);
  }, []);

  // Update participant if params change
  useEffect(() => {
    const nome = searchParams.get('nome') || searchParams.get('name');
    if (nome) {
      setParticipant({
        nome: nome,
        email: searchParams.get('email') || '',
        whatsapp: searchParams.get('whatsapp') || searchParams.get('telefone') || '',
        empresa: searchParams.get('empresa') || searchParams.get('company') || '',
        cargo: searchParams.get('cargo') || '',
        crachaId: searchParams.get('crachaId') || searchParams.get('cracha') || 'CR-' + Math.floor(1000 + Math.random() * 9000),
        origem: searchParams.get('origem') || 'Base44'
      });
    }
  }, [searchParams]);

  // Handler: Select game and start
  const handleChooseGame = (game: 'roleta' | 'raspadinha' | 'caca_niquel') => {
    setSelectedGame(game);
    setCurrentStep('playing');
  };

  // Handler: Spin Roulette
  const handleSpinRoulette = () => {
    if (isSpinningWheel) return;
    setIsSpinningWheel(true);

    const prizeIdx = PRIZES.findIndex(p => p.id === wonPrize.id);
    const segmentAngle = 360 / PRIZES.length;
    const targetAngle = 360 - (prizeIdx * segmentAngle + segmentAngle / 2);
    const totalRotation = wheelRotation + (360 * 6) + targetAngle - (wheelRotation % 360);

    setWheelRotation(totalRotation);

    setTimeout(() => {
      setIsSpinningWheel(false);
      triggerConfetti();
      setCurrentStep('prize_won');
    }, 4500);
  };

  // Handler: Spin Slot Machine
  const handleSpinSlots = () => {
    if (isSpinningSlots) return;
    setIsSpinningSlots(true);

    setTimeout(() => {
      setIsSpinningSlots(false);
      triggerConfetti();
      setCurrentStep('prize_won');
    }, 3200);
  };

  // Handler: Scratch card completed
  const handleScratchComplete = () => {
    setIsScratchRevealed(true);
    triggerConfetti();
    setTimeout(() => {
      setCurrentStep('prize_won');
    }, 1200);
  };

  // Handler: Submit answer in Screening
  const handleSelectAnswer = (optionLabel: string) => {
    const currentQ = SCREENING_QUESTIONS[currentQuestionIdx];
    const newAnswers = { ...answers, [currentQ.id]: optionLabel };
    setAnswers(newAnswers);

    if (currentQuestionIdx < SCREENING_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIdx(prev => prev + 1);
      }, 250);
    } else {
      // Completed all screening questions! Save and show final voucher
      persistFinalLead(newAnswers);
      setCurrentStep('voucher_final');
    }
  };

  // Persist full consolidated lead (Participant + Prize + 3 Answers)
  const persistFinalLead = async (screeningAnswers: Record<number, string>) => {
    const record = {
      id: 'sub_' + Date.now(),
      dataHora: new Date().toLocaleString('pt-BR'),
      nome: participant.nome,
      email: participant.email,
      whatsapp: participant.whatsapp,
      empresa: participant.empresa,
      cargo: participant.cargo,
      crachaId: participant.crachaId,
      origem: participant.origem,
      jogoEscolhido: selectedGame,
      premioGanho: wonPrize.name,
      voucher: voucherCode,
      resposta1: screeningAnswers[1] || 'Não informada',
      resposta2: screeningAnswers[2] || 'Não informada',
      resposta3: screeningAnswers[3] || 'Não informada'
    };

    // 1. Save to localStorage
    try {
      const saved = localStorage.getItem('vx_proto_submissions');
      const list = saved ? JSON.parse(saved) : [];
      list.unshift(record);
      localStorage.setItem('vx_proto_submissions', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    // 2. Post to Google Sheets webhook if configured
    const webhookUrl = localStorage.getItem('vx_proto_webhook_url') || '';
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        });
        setStatusMessage('Dados consolidados e enviados para a Planilha Google!');
      } catch (e) {
        setStatusMessage('Salvo no histórico do dispositivo.');
      }
    } else {
      setStatusMessage('Lead e respostas de triagem salvas com sucesso!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
            <Trophy size={18} />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">
            VX<span className="text-blue-500">Leads</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            {currentStep === 'select_game' && 'Passo 1: Escolha o Jogo'}
            {currentStep === 'playing' && 'Passo 2: Jogar & Ganhar'}
            {currentStep === 'prize_won' && 'Prêmio Sorteado!'}
            {currentStep === 'triagem' && 'Passo 3: Triagem Rápida'}
            {currentStep === 'voucher_final' && 'Voucher Liberado'}
          </span>
        </div>

        {/* Participant Mini Badge */}
        <div className="text-xs text-slate-300 flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-white max-w-[130px] sm:max-w-[200px] truncate">{participant.nome}</span>
          <span className="text-slate-500 hidden sm:inline">• {participant.empresa}</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center gap-6">

        {/* ========================================================================= */}
        {/* ETAPA 1: ESCOLHA ENTRE OS 3 JOGOS (ROLETA, RASPADINHA OU CAÇA-NÍQUEL)     */}
        {/* ========================================================================= */}
        {currentStep === 'select_game' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header / Instructions */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <CheckCircle2 size={14} />
                <span>Crachá Identificado: {participant.crachaId || 'Validado'}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Olá, {participant.nome}!
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Escolha abaixo qual experiência interativa você quer jogar para concorrer a descontos e brindes exclusivos:
              </p>
            </div>

            {/* 3 Games Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              
              {/* JOGO 1: ROLETA DE PRÊMIOS */}
              <div 
                onClick={() => handleChooseGame('roleta')}
                className="group relative bg-slate-900/90 border border-slate-800 hover:border-blue-500 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    🎡
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      O Clássico de Estandes
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-0.5">
                      Roleta da Sorte
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Gire a roleta com física realista e veja a sorte parar no seu desconto especial.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
                  <span>Jogar Roleta</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* JOGO 2: RASPADINHA DIGITAL */}
              <div 
                onClick={() => handleChooseGame('raspadinha')}
                className="group relative bg-slate-900/90 border border-slate-800 hover:border-purple-500 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    ✨
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      Interação Touch
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-0.5">
                      Raspadinha Digital
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Passe o dedo na tela ou o mouse para raspar a película prateada e revelar seu prêmio.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-purple-400 group-hover:text-purple-300">
                  <span>Jogar Raspadinha</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* JOGO 3: CAÇA-NÍQUEL (SLOT MACHINE) */}
              <div 
                onClick={() => handleChooseGame('caca_niquel')}
                className="group relative bg-slate-900/90 border border-slate-800 hover:border-amber-500 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-600/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    🎰
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Emoção de Cassino
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-0.5">
                      Caça-Níquel
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Puxe a alavanca e torça para alinhar os símbolos premiados em alta velocidade.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
                  <span>Jogar Caça-Níquel</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ETAPA 2: JOGANDO O JOGO ESCOLHIDO                                         */}
        {/* ========================================================================= */}
        {currentStep === 'playing' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden animate-fade-in">
            <button
              onClick={() => setCurrentStep('select_game')}
              className="absolute top-6 left-6 text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              ← Trocar de Jogo
            </button>

            {/* ROLETA */}
            {selectedGame === 'roleta' && (
              <div className="max-w-xl mx-auto pt-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold mb-3 border border-blue-500/20">
                  <span>🎡 Roleta Selecionada</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-white mb-2">
                  Gire a Roleta de Prêmios
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  Descubra qual desconto especial você ganhou para o seu estande ou projeto.
                </p>

                {/* Rotating Wheel Disk */}
                <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] mx-auto my-4">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-30 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                    <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[32px] border-t-yellow-400"></div>
                  </div>

                  <div 
                    className="w-full h-full rounded-full border-8 border-slate-800 shadow-[0_0_50px_rgba(59,130,246,0.25)] relative overflow-hidden transition-transform duration-[4500ms] ease-out"
                    style={{ transform: `rotate(${wheelRotation}deg)` }}
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {PRIZES.map((prize, index) => {
                        const total = PRIZES.length;
                        const angle = 360 / total;
                        const startAngle = index * angle;
                        const endAngle = (index + 1) * angle;

                        const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                        const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                        const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                        const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                        const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                        const midAngle = startAngle + angle / 2;

                        return (
                          <g key={prize.id}>
                            <path d={pathData} fill={prize.color} stroke="#1e293b" strokeWidth="0.8" />
                            {/* Verticalized Radial Text: Points along the spoke, perfectly aligned within segment */}
                            <g transform={`rotate(${midAngle}, 50, 50)`}>
                              <text
                                x={32}
                                y={50}
                                fill="#ffffff"
                                fontSize="3.6"
                                fontWeight="900"
                                textAnchor="middle"
                                dominantBaseline="central"
                                style={{ letterSpacing: '0.02em', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
                              >
                                {prize.name}
                              </text>
                            </g>
                          </g>
                        );
                      })}
                    </svg>

                    <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-slate-900 border-4 border-yellow-400 shadow-xl flex items-center justify-center z-10 text-yellow-400 font-extrabold text-xs">
                      VX
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    disabled={isSpinningWheel}
                    onClick={handleSpinRoulette}
                    className="px-10 py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-xl shadow-[0_8px_0_#b45309] active:shadow-none active:translate-y-2 transition-all disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                  >
                    {isSpinningWheel ? 'Girando a Roleta...' : 'GIRAR AGORA!'}
                  </button>
                </div>
              </div>
            )}

            {/* RASPADINHA */}
            {selectedGame === 'raspadinha' && (
              <div className="max-w-md mx-auto pt-4 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20">
                  <span>✨ Raspadinha Selecionada</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Raspe com o dedo ou mouse
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Passe o cursor sobre a área para raspar e revelar seu desconto exclusivo!
                </p>

                <div className="flex justify-center my-5">
                  <ScratchCard
                    prizeText={wonPrize.name}
                    onComplete={handleScratchComplete}
                  />
                </div>

                {isScratchRevealed && (
                  <div className="text-emerald-400 font-bold text-sm animate-pulse">
                    Prêmio Revelado! Avançando para a triagem...
                  </div>
                )}
              </div>
            )}

            {/* CAÇA-NÍQUEL */}
            {selectedGame === 'caca_niquel' && (
              <div className="max-w-md mx-auto pt-4 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                  <span>🎰 Caça-Níquel Selecionado</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Puxe a Alavanca do Caça-Níquel
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Alinhe 3 símbolos iguais para desbloquear seu super prêmio.
                </p>

                <div className="border-4 border-amber-500/40 rounded-2xl p-4 bg-amber-950/20 shadow-2xl">
                  <SlotMachine isSpinning={isSpinningSlots} prizeText={wonPrize.name} />
                </div>

                <div>
                  <button
                    disabled={isSpinningSlots}
                    onClick={handleSpinSlots}
                    className="px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xl shadow-[0_8px_0_#b45309] active:shadow-none active:translate-y-2 transition-all disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                  >
                    {isSpinningSlots ? 'Sorteando...' : 'PUXAR ALAVANCA!'}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* ETAPA 3: GANHOU O PRÊMIO -> AVISO PARA RESPONDER A TRIAGEM                */}
        {/* ========================================================================= */}
        {currentStep === 'prize_won' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden animate-fade-in">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="w-20 h-20 rounded-full bg-yellow-400/20 text-yellow-400 border border-yellow-400/40 flex items-center justify-center mx-auto text-4xl shadow-xl">
                {wonPrize.icon}
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">
                Sensacional! Você Foi Premiado
              </span>
              <h3 className="text-3xl sm:text-5xl font-black text-white">
                {wonPrize.name}
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Para liberar o seu voucher oficial e validar o desconto com a equipe, responda apenas <strong>3 perguntas rápidas</strong> sobre a sua operação.
              </p>

              <div className="pt-4">
                <button
                  onClick={() => setCurrentStep('triagem')}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg shadow-lg shadow-blue-500/25 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Responder Triagem & Liberar Voucher</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ETAPA 4: AS 3 PERGUNTAS DE TRIAGEM                                        */}
        {/* ========================================================================= */}
        {currentStep === 'triagem' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative animate-fade-in">
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

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold mb-3 border border-yellow-500/20">
              <Trophy size={14} />
              <span>Prêmio em Espera: {wonPrize.name}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-snug">
              {SCREENING_QUESTIONS[currentQuestionIdx].title}
            </h3>
            <p className="text-sm text-slate-400 mb-8">
              {SCREENING_QUESTIONS[currentQuestionIdx].subtitle}
            </p>

            {/* Options */}
            <div className="space-y-3.5">
              {SCREENING_QUESTIONS[currentQuestionIdx].options.map(option => {
                const isSelected = answers[SCREENING_QUESTIONS[currentQuestionIdx].id] === option.label;
                return (
                  <button
                    key={option.id}
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

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800 text-xs sm:text-sm">
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                className="text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 font-semibold cursor-pointer"
              >
                ← Pergunta Anterior
              </button>

              <span className="text-slate-500 font-medium">
                Ao responder a última, seu voucher oficial é liberado na hora!
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ETAPA 5: VOUCHER FINAL LIBERADO COM RESUMO COMPLETO                       */}
        {/* ========================================================================= */}
        {currentStep === 'voucher_final' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden animate-fade-in">
            <div className="max-w-xl mx-auto">
              <div className="w-20 h-20 rounded-full bg-emerald-400/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center mx-auto mb-4 text-3xl shadow-xl">
                🎁
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Parabéns! Triagem e Prêmio Concluídos
              </span>
              <h3 className="text-3xl sm:text-4xl font-black text-white mt-1 mb-2">
                {wonPrize.name}
              </h3>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 my-6 inline-block w-full max-w-sm">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                  Código do Voucher
                </div>
                <div className="text-3xl font-mono font-black text-yellow-400 tracking-widest">
                  {voucherCode}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Apresente este código no estande para validar seu benefício.
                </div>
              </div>

              {/* Consolidated Lead Details */}
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 mb-8 text-left">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                  <CheckCircle2 size={18} />
                  <span>Dados Consolidados com Sucesso!</span>
                </div>
                {statusMessage && (
                  <p className="text-xs text-emerald-200/80 leading-relaxed mb-3">
                    {statusMessage}
                  </p>
                )}
                
                <div className="bg-slate-950/80 rounded-xl p-3 text-xs space-y-1 font-mono text-slate-300 border border-emerald-500/20">
                  <div><strong>Participante:</strong> {participant.nome} ({participant.empresa})</div>
                  <div><strong>Crachá / ID:</strong> {participant.crachaId}</div>
                  <div><strong>Jogo Escolhido:</strong> {selectedGame.toUpperCase()}</div>
                  <div className="text-yellow-400 font-bold"><strong>Prêmio:</strong> {wonPrize.name} ({voucherCode})</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setCurrentStep('select_game');
                    setCurrentQuestionIdx(0);
                    setAnswers({});
                  }}
                  className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors cursor-pointer shadow-lg shadow-blue-600/20"
                >
                  Novo Participante
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

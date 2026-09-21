import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Gift, Smartphone, CheckCircle2, 
  ArrowRight, Trophy, ExternalLink, Lock, AlertTriangle, 
  Check, Copy, RotateCcw
} from 'lucide-react';
import ScratchCard from '../components/ScratchCard';
import SlotMachine from '../components/SlotMachine';
import { db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { buildBase44ReturnUrl, executeBase44Return } from '../lib/base44';
import { checkUserDrawStatus, ExistingDrawRecord } from '../lib/leadVerification';

// Audio click and fanfare effect using Web Audio API
function playTickSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(580, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    // AudioContext may be blocked by browser policy prior to user interaction
  }
}

function playWinSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + idx * 0.12 + 0.4);
    });
  } catch (e) {
    // ignore
  }
}

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

const PRIZES = [
  { id: 'p1', name: '10% de Desconto', shortName: '10% OFF', color: '#2563eb', icon: '🏷️' },
  { id: 'p2', name: '15% de Desconto', shortName: '15% OFF', color: '#059669', icon: '🎉' },
  { id: 'p3', name: '20% de Desconto', shortName: '20% OFF', color: '#7c3aed', icon: '⭐' },
  { id: 'p4', name: '25% de Desconto', shortName: '25% OFF', color: '#d97706', icon: '🔥' },
  { id: 'p5', name: '30% de Desconto', shortName: '30% OFF', color: '#db2777', icon: '✨' },
  { id: 'p6', name: '35% de Desconto', shortName: '35% OFF', color: '#0891b2', icon: '🚀' },
  { id: 'p7', name: '40% de Desconto', shortName: '40% OFF', color: '#dc2626', icon: '👑' },
];

const getPrizeDisplay = (name: string) => {
  const match = name.match(/^(\d+%\s*(?:OFF)?)\s*(?:de\s*)?(.*)$/i);
  if (match) {
    return {
      top: match[1].trim(),
      bottom: (match[2].trim() || 'DESCONTO').toUpperCase()
    };
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
};

type FlowStep = 'select_game' | 'playing' | 'voucher_final';

export default function TriagemPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Participant identification read from URL (from Base44 badge reader)
  const [participant, setParticipant] = useState({
    nome: searchParams.get('nome') || searchParams.get('name') || 'Participante Convidado',
    email: searchParams.get('email') || '',
    whatsapp: searchParams.get('whatsapp') || searchParams.get('telefone') || searchParams.get('phone') || '',
    empresa: searchParams.get('empresa') || searchParams.get('company') || 'Empresa Convidada',
    cargo: searchParams.get('cargo') || searchParams.get('role') || 'Visitante',
    crachaId: searchParams.get('crachaId') || searchParams.get('cracha') || searchParams.get('leadId') || 'CR-9482',
    origem: searchParams.get('origem') || 'Base44',
    returnUrl: searchParams.get('return_url') || searchParams.get('redirect_url') || searchParams.get('callback_url') || '',
    webhookCallback: searchParams.get('webhook') || searchParams.get('webhook_url') || ''
  });

  // Flow State: 1) select_game -> 2) playing -> 3) voucher_final (Direct Draw, No Screening Question)
  const [currentStep, setCurrentStep] = useState<FlowStep>('select_game');
  const [selectedGame, setSelectedGame] = useState<'roleta' | 'raspadinha' | 'caca_niquel'>('roleta');

  // Game Play States
  const [wonPrize, setWonPrize] = useState<(typeof PRIZES)[0]>(PRIZES[2]); // Default 20%
  const [voucherCode, setVoucherCode] = useState('');
  const [copiedVoucher, setCopiedVoucher] = useState(false);

  // Roulette specific state
  const [isSpinningWheel, setIsSpinningWheel] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);

  // Slot machine specific state
  const [isSpinningSlots, setIsSpinningSlots] = useState(false);

  // Scratch card specific state
  const [isScratchRevealed, setIsScratchRevealed] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Single-Draw Per User Validation
  const [hasAlreadyDrawn, setHasAlreadyDrawn] = useState(false);
  const [existingDraw, setExistingDraw] = useState<ExistingDrawRecord | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

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
        whatsapp: searchParams.get('whatsapp') || searchParams.get('telefone') || searchParams.get('phone') || '',
        empresa: searchParams.get('empresa') || searchParams.get('company') || '',
        cargo: searchParams.get('cargo') || searchParams.get('role') || '',
        crachaId: searchParams.get('crachaId') || searchParams.get('cracha') || searchParams.get('leadId') || 'CR-' + Math.floor(1000 + Math.random() * 9000),
        origem: searchParams.get('origem') || 'Base44',
        returnUrl: searchParams.get('return_url') || searchParams.get('redirect_url') || searchParams.get('callback_url') || '',
        webhookCallback: searchParams.get('webhook') || searchParams.get('webhook_url') || ''
      });
    }
  }, [searchParams]);

  // Check if participant has already performed a draw
  useEffect(() => {
    let isMounted = true;
    async function verify() {
      setCheckingStatus(true);
      const result = await checkUserDrawStatus(participant);
      if (isMounted) {
        if (result.alreadyDrawn && result.lead) {
          setHasAlreadyDrawn(true);
          setExistingDraw(result.lead);
          setStatusMessage('Sorteio já efetuado.');
        } else {
          setHasAlreadyDrawn(false);
          setExistingDraw(null);
        }
        setCheckingStatus(false);
      }
    }
    verify();
    return () => {
      isMounted = false;
    };
  }, [participant.crachaId, participant.email, participant.whatsapp]);

  // Handler: Select game and start
  const handleChooseGame = (game: 'roleta' | 'raspadinha' | 'caca_niquel') => {
    if (hasAlreadyDrawn) {
      setStatusMessage('Sorteio já efetuado.');
      return;
    }
    setSelectedGame(game);
    setCurrentStep('playing');
  };

  // Persist result directly upon game completion (Pure Draw flow)
  const persistDrawResult = async (prize: typeof PRIZES[0], code: string, game: string) => {
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
      jogoEscolhido: game,
      premioGanho: prize.name,
      voucher: code
    };

    // 1. Cloud Firestore Database
    const cleanDocId = participant.crachaId ? participant.crachaId.trim().replace(/[^a-zA-Z0-9_-]/g, '_') : record.id;
    try {
      await setDoc(doc(db, 'event_leads', cleanDocId), {
        ...record,
        leadId: participant.crachaId || cleanDocId,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      }, { merge: true });
      setStatusMessage('Sorteio e Voucher registrados com sucesso na Nuvem!');
    } catch (err) {
      console.warn('Firestore setDoc error:', err);
    }

    // 2. Offline browser cache fallback
    try {
      const saved = localStorage.getItem('vx_proto_submissions');
      const list = saved ? JSON.parse(saved) : [];
      list.unshift(record);
      localStorage.setItem('vx_proto_submissions', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    // 3. Webhook if configured
    const webhookUrl = localStorage.getItem('vx_proto_webhook_url') || '';
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        });
      } catch (e) {
        // ignore
      }
    }

    // 4. Base44 webhook callback if provided
    if (participant.webhookCallback) {
      try {
        await fetch(participant.webhookCallback, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'DRAW_COMPLETED',
            leadId: participant.crachaId,
            nome: participant.nome,
            empresa: participant.empresa,
            premio: prize.name,
            voucher: code,
            jogo: game,
            timestamp: new Date().toISOString()
          })
        });
      } catch (err) {
        console.warn('Base44 webhook callback error:', err);
      }
    }

    setHasAlreadyDrawn(true);
    setExistingDraw({
      id: record.id,
      nome: participant.nome,
      crachaId: participant.crachaId,
      empresa: participant.empresa,
      cargo: participant.cargo,
      email: participant.email,
      whatsapp: participant.whatsapp,
      premioGanho: prize.name,
      voucher: code,
      dataHora: record.dataHora,
      jogoEscolhido: game
    });
  };

  // Handler: Spin Roulette
  const handleSpinRoulette = () => {
    if (isSpinningWheel) return;
    if (hasAlreadyDrawn) {
      setStatusMessage('Sorteio já efetuado.');
      return;
    }
    setIsSpinningWheel(true);

    // Randomize prize
    const randomPrize = PRIZES[Math.floor(Math.random() * PRIZES.length)];
    setWonPrize(randomPrize);
    const code = voucherCode || `VX-${Math.floor(10000 + Math.random() * 90000)}`;
    setVoucherCode(code);

    const prizeIdx = PRIZES.findIndex(p => p.id === randomPrize.id);
    const segmentAngle = 360 / PRIZES.length;
    const targetAngle = 360 - (prizeIdx * segmentAngle + segmentAngle / 2);
    const extraSpins = 360 * 6; // 6 full revolutions
    const currentModulo = wheelRotation % 360;
    let delta = targetAngle - currentModulo;
    if (delta <= 0) {
      delta += 360;
    }
    const totalRotation = wheelRotation + extraSpins + delta;

    setWheelRotation(totalRotation);

    // Sound effect
    const tickIntervals = [80, 80, 80, 90, 90, 100, 110, 120, 140, 160, 190, 230, 280, 340, 420, 520, 650];
    let elapsed = 0;
    tickIntervals.forEach((interval) => {
      elapsed += interval;
      if (elapsed < 4200) {
        setTimeout(() => {
          playTickSound();
        }, elapsed);
      }
    });

    setTimeout(() => {
      setIsSpinningWheel(false);
      playWinSound();
      triggerConfetti();
      persistDrawResult(randomPrize, code, 'roleta');
      setCurrentStep('voucher_final');
    }, 4500);
  };

  // Handler: Spin Slot Machine
  const handleSpinSlots = () => {
    if (isSpinningSlots) return;
    if (hasAlreadyDrawn) {
      setStatusMessage('Sorteio já efetuado.');
      return;
    }
    setIsSpinningSlots(true);

    const randomPrize = PRIZES[Math.floor(Math.random() * PRIZES.length)];
    setWonPrize(randomPrize);
    const code = voucherCode || `VX-${Math.floor(10000 + Math.random() * 90000)}`;
    setVoucherCode(code);

    setTimeout(() => {
      setIsSpinningSlots(false);
      playWinSound();
      triggerConfetti();
      persistDrawResult(randomPrize, code, 'caca_niquel');
      setCurrentStep('voucher_final');
    }, 3200);
  };

  // Handler: Scratch card completed
  const handleScratchComplete = () => {
    setIsScratchRevealed(true);
    playWinSound();
    triggerConfetti();
    const code = voucherCode || `VX-${Math.floor(10000 + Math.random() * 90000)}`;
    setVoucherCode(code);
    persistDrawResult(wonPrize, code, 'raspadinha');
    setTimeout(() => {
      setCurrentStep('voucher_final');
    }, 1200);
  };

  // Generate return to Base44 URL
  const generateBase44ReturnUrl = () => {
    return buildBase44ReturnUrl({
      returnUrl: participant.returnUrl,
      leadId: participant.crachaId,
      nome: participant.nome,
      empresa: participant.empresa,
      cargo: participant.cargo,
      whatsapp: participant.whatsapp,
      email: participant.email,
      premio: wonPrize.name,
      voucher: voucherCode,
      jogo: selectedGame,
      webhookCallback: participant.webhookCallback
    });
  };

  const handleExecuteReturn = async () => {
    await executeBase44Return({
      returnUrl: participant.returnUrl,
      leadId: participant.crachaId,
      nome: participant.nome,
      empresa: participant.empresa,
      cargo: participant.cargo,
      whatsapp: participant.whatsapp,
      email: participant.email,
      premio: wonPrize.name,
      voucher: voucherCode,
      jogo: selectedGame,
      webhookCallback: participant.webhookCallback
    });
  };

  const handleCopyVoucher = () => {
    if (!voucherCode) return;
    navigator.clipboard.writeText(voucherCode);
    setCopiedVoucher(true);
    setTimeout(() => setCopiedVoucher(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#17232d] text-slate-100 flex flex-col font-['Open_Sans',sans-serif] selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-700/60 bg-[#17232d] sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
            <Trophy size={18} />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">
            VX<span className="text-blue-500">Leads</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {currentStep === 'select_game' && 'Sorteio de Prêmios'}
            {currentStep === 'playing' && 'Giro Premiado'}
            {currentStep === 'voucher_final' && 'Voucher Liberado'}
          </span>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Link to Commercial Leads Panel - hidden when on result screen */}
          {currentStep !== 'voucher_final' && (
            <button
              onClick={() => navigate('/leads')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2a353f] hover:bg-[#34424e] text-slate-200 text-xs font-semibold border border-slate-700/60 transition-colors cursor-pointer"
              title="Acessar painel de leads captados da empresa"
            >
              <Lock size={13} className="text-blue-400" />
              <span className="hidden md:inline">Painel da Empresa</span>
            </button>
          )}

          {/* Button: Return to Base44 to scan next user */}
          <a
            href={generateBase44ReturnUrl()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            title="Voltar aos cadastros para escanear nova pessoa"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">Retornar aos cadastros</span>
            <span className="sm:hidden">Cadastros</span>
          </a>

          {/* Participant Mini Badge */}
          <div className="text-xs text-slate-300 hidden lg:flex items-center gap-2 bg-[#2a353f] px-3 py-1.5 rounded-xl border border-slate-700/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-white max-w-[140px] truncate">{participant.nome}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center gap-6">

        {/* ========================================================================= */}
        {/* ETAPA 1: ESCOLHA ENTRE OS 3 JOGOS (ROLETA, RASPADINHA OU CAÇA-NÍQUEL)     */}
        {/* ========================================================================= */}
        {currentStep === 'select_game' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Sorteio Já Efetuado Banner */}
            {hasAlreadyDrawn ? (
              <div className="bg-[#2a353f] border-2 border-red-500/60 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl space-y-4 animate-fade-in">
                <div className="flex items-center gap-3 text-red-400">
                  <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center shrink-0">
                    <AlertTriangle size={24} className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">Sorteio já efetuado.</h3>
                    <p className="text-xs text-red-300 font-medium">Limite de 1 participação por usuário atingido</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Identificamos que o participante <strong className="text-white font-bold">{participant.nome}</strong> (Crachá: <span className="font-mono text-blue-300 font-bold">{participant.crachaId}</span>) já realizou o sorteio neste evento. Conforme o regulamento, cada usuário tem direito a apenas 1 sorteio.
                </p>

                {existingDraw && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="bg-[#17232d] p-3.5 rounded-2xl border border-slate-700/60">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Prêmio Conquistado</span>
                      <span className="text-amber-300 font-black text-base flex items-center gap-1.5 mt-1">
                        <Trophy size={16} className="text-yellow-400" />
                        {existingDraw.premioGanho}
                      </span>
                    </div>
                    <div className="bg-[#17232d] p-3.5 rounded-2xl border border-slate-700/60">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Código do Voucher</span>
                      <span className="font-mono text-yellow-300 font-black text-base block mt-1">
                        {existingDraw.voucher}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-700/60 flex flex-wrap gap-2.5">
                  {participant.returnUrl && (
                    <button
                      onClick={() => executeBase44Return({
                        returnUrl: participant.returnUrl,
                        leadId: participant.crachaId,
                        voucher: existingDraw?.voucher || '',
                        premio: existingDraw?.premioGanho || '',
                        nome: participant.nome,
                        empresa: participant.empresa
                      })}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/20 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Retornar ao Base44</span>
                      <ExternalLink size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (existingDraw) {
                        setWonPrize({
                          id: 'won_prev',
                          name: existingDraw.premioGanho,
                          shortName: existingDraw.premioGanho,
                          color: '#2563eb',
                          icon: '🎁'
                        });
                        setVoucherCode(existingDraw.voucher);
                        setCurrentStep('voucher_final');
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-lg cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Ver Meu Voucher Oficial</span>
                  </button>
                  <button
                    onClick={() => navigate('/leads')}
                    className="px-4 py-2.5 rounded-xl bg-[#17232d] hover:bg-[#202d38] text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700/60 cursor-pointer"
                  >
                    Painel da Empresa
                  </button>
                </div>
              </div>
            ) : (
              /* Header / Instructions */
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  <CheckCircle2 size={14} />
                  <span>Crachá Identificado: {participant.crachaId || 'Validado'}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Olá, {participant.nome}!
                </h2>
                <p className="text-slate-400 text-sm sm:text-base">
                  Escolha abaixo qual experiência interativa você quer jogar para concorrer a prêmios e descontos exclusivos no TDM System.
                </p>
              </div>
            )}

            {/* 3 Game Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto pt-2">
              
              {/* CARD 1: ROLETA */}
              <button
                onClick={() => handleChooseGame('roleta')}
                className="group p-6 rounded-3xl bg-[#2a353f] border-2 border-slate-700/60 hover:border-blue-500 transition-all text-left flex flex-col justify-between relative overflow-hidden shadow-xl hover:shadow-blue-500/10 cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                    🎡
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
                    Clássico de Eventos
                  </span>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Roleta da Sorte
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Gire a roleta de prêmios e veja onde a seta premiada vai parar!
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-blue-400 text-xs font-bold group-hover:translate-x-1 transition-transform">
                  <span>Jogar Roleta</span>
                  <ArrowRight size={14} />
                </div>
              </button>

              {/* CARD 2: RASPADINHA */}
              <button
                onClick={() => handleChooseGame('raspadinha')}
                className="group p-6 rounded-3xl bg-[#2a353f] border-2 border-slate-700/60 hover:border-purple-500 transition-all text-left flex flex-col justify-between relative overflow-hidden shadow-xl hover:shadow-purple-500/10 cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                    ✨
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
                    Toque Interativo
                  </span>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Raspadinha Digital
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Use o dedo ou cursor para raspar a película metalizada e revelar seu desconto na hora!
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-purple-400 text-xs font-bold group-hover:translate-x-1 transition-transform">
                  <span>Raspar Agora</span>
                  <ArrowRight size={14} />
                </div>
              </button>

              {/* CARD 3: CAÇA-NÍQUEL */}
              <button
                onClick={() => handleChooseGame('caca_niquel')}
                className="group p-6 rounded-3xl bg-[#2a353f] border-2 border-slate-700/60 hover:border-amber-500 transition-all text-left flex flex-col justify-between relative overflow-hidden shadow-xl hover:shadow-amber-500/10 cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                    🎰
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                    Estilo Las Vegas
                  </span>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Caça-Níquel (Slots)
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Puxe a alavanca e alinhe os 3 rolos premiados para conquistar o prêmio máximo!
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-amber-400 text-xs font-bold group-hover:translate-x-1 transition-transform">
                  <span>Puxar Alavanca</span>
                  <ArrowRight size={14} />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ETAPA 2: JOGANDO O JOGO ESCOLHIDO (ROLETA / RASPADINHA / CAÇA-NÍQUEL)       */}
        {/* ========================================================================= */}
        {currentStep === 'playing' && (
          <div className="bg-[#2a353f] border border-slate-700/60 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden animate-fade-in">
            <button
              onClick={() => setCurrentStep('select_game')}
              className="absolute top-6 left-6 text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer bg-[#17232d] px-3 py-1.5 rounded-xl border border-slate-700/60"
            >
              ← Trocar de Jogo
            </button>

            {/* ROLETA */}
            {selectedGame === 'roleta' && (
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
                  Gire a Roleta Premiada
                </h3>
                <p className="text-slate-300 text-sm mb-6">
                  Descubra qual desconto especial você ganhou para o seu estande ou projeto.
                </p>

                {/* Interactive SVG Wheel */}
                <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] mx-auto my-4">
                  {/* Pointer / Arrow */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-30 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                    <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[32px] border-t-yellow-400"></div>
                  </div>

                  {/* Rotating Wheel Disk */}
                  <div 
                    className="w-full h-full rounded-full border-8 border-slate-800 shadow-[0_0_50px_rgba(59,130,246,0.25)] relative overflow-hidden transition-transform duration-[4500ms] ease-out"
                    style={{ transform: `rotate(${wheelRotation}deg)` }}
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}>
                      {/* Layer 1: Sector Color Slices */}
                      <g id="triagem-slices">
                        {PRIZES.map((prize, i) => {
                          const total = PRIZES.length;
                          const angle = 360 / total;
                          const startAngle = i * angle;
                          const endAngle = (i + 1) * angle;
                          
                          const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                          const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                          const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                          const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                          const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                          return (
                            <path key={prize.id} d={pathData} fill={prize.color} stroke="#0f172a" strokeWidth="0.8" />
                          );
                        })}
                      </g>

                      {/* Layer 2: Topmost Labels Layer */}
                      <g id="triagem-labels">
                        {PRIZES.map((prize, index) => {
                          const total = PRIZES.length;
                          const angle = 360 / total;
                          const startAngle = index * angle;
                          const midAngle = startAngle + angle / 2;
                          const lines = getPrizeDisplay(prize.name);

                          return (
                            <g key={`lbl-${prize.id}`} transform={`rotate(${midAngle}, 50, 50)`}>
                              {lines.bottom ? (
                                <>
                                  <text
                                    x={73}
                                    y={47.8}
                                    fill="#ffffff"
                                    stroke="#0f172a"
                                    strokeWidth="0.25"
                                    paintOrder="stroke fill"
                                    fontSize="4.2"
                                    fontWeight="900"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    style={{
                                      fontFamily: "'Open Sans', sans-serif"
                                    }}
                                  >
                                    {lines.top}
                                  </text>
                                  <text
                                    x={73}
                                    y={52.4}
                                    fill="#ffffff"
                                    stroke="#0f172a"
                                    strokeWidth="0.2"
                                    paintOrder="stroke fill"
                                    fontSize="2.3"
                                    fontWeight="800"
                                    letterSpacing="0.05em"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    style={{
                                      fontFamily: "'Open Sans', sans-serif"
                                    }}
                                  >
                                    {lines.bottom}
                                  </text>
                                </>
                              ) : (
                                <text
                                  x={73}
                                  y={50}
                                  fill="#ffffff"
                                  stroke="#0f172a"
                                  strokeWidth="0.25"
                                  paintOrder="stroke fill"
                                  fontSize="3.4"
                                  fontWeight="900"
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                  style={{
                                    fontFamily: "'Open Sans', sans-serif"
                                  }}
                                >
                                  {lines.top}
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </g>
                    </svg>

                    {/* Center Hub */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#17232d] border-4 border-yellow-400 shadow-2xl flex flex-col items-center justify-center z-20 text-center pointer-events-none">
                      <Sparkles className="text-yellow-400" size={16} />
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
                <p className="text-slate-300 text-xs sm:text-sm">
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
                    Prêmio Revelado! Liberando seu voucher...
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
                <p className="text-slate-300 text-xs sm:text-sm">
                  Alinhe os 3 símbolos nos cilindros para liberar seu desconto exclusivo!
                </p>

                <div className="my-6">
                  <SlotMachine 
                    isSpinning={isSpinningSlots} 
                    prizeText={wonPrize.name} 
                  />
                </div>

                <div className="mt-6">
                  <button
                    disabled={isSpinningSlots}
                    onClick={handleSpinSlots}
                    className="px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xl shadow-[0_8px_0_#b45309] active:shadow-none active:translate-y-2 transition-all disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                  >
                    {isSpinningSlots ? 'Girando os Rolos...' : 'PUXAR ALAVANCA!'}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* ETAPA 3: VOUCHER FINAL LIBERADO COM RESUMO COMPLETO                       */}
        {/* ========================================================================= */}
        {currentStep === 'voucher_final' && (
          <div className="bg-[#2a353f] border border-slate-700/60 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden animate-fade-in font-['Open_Sans',sans-serif]">
            <div className="max-w-xl mx-auto">
              <div className="w-20 h-20 rounded-full bg-emerald-400/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center mx-auto mb-4 text-3xl shadow-xl animate-bounce">
                🎉
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Parabéns! Sorteio Concluído
              </span>
              <h3 className="text-3xl sm:text-4xl font-black text-white mt-1 mb-2">
                {wonPrize.name}
              </h3>

              <div className="bg-[#17232d] border border-slate-700/60 rounded-2xl p-5 my-6 inline-block w-full max-w-sm shadow-inner">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                  Código do Voucher
                </div>
                <div className="text-3xl font-mono font-black text-yellow-400 tracking-widest my-1">
                  {voucherCode}
                </div>
                <div className="text-[11px] text-slate-400 mt-2 mb-3">
                  Apresente este código no estande para validar seu benefício.
                </div>
                <button
                  onClick={handleCopyVoucher}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2a353f] hover:bg-[#34424e] text-xs text-slate-200 border border-slate-700/60 transition-colors cursor-pointer"
                >
                  {copiedVoucher ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedVoucher ? 'Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>

              {/* Consolidated Lead Details */}
              <div className="bg-[#17232d] border border-emerald-500/30 rounded-2xl p-5 mb-8 text-left">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                  <CheckCircle2 size={18} />
                  <span>Sorteio Salvo no Sistema & Base44</span>
                </div>
                {statusMessage && (
                  <p className="text-xs text-emerald-200/80 leading-relaxed mb-3">
                    {statusMessage}
                  </p>
                )}
                
                <div className="bg-[#2a353f] rounded-xl p-3.5 text-xs space-y-1.5 font-mono text-slate-300 border border-slate-700/60">
                  <div><strong>Participante:</strong> {participant.nome} {participant.empresa ? `(${participant.empresa})` : ''}</div>
                  <div><strong>Crachá / ID:</strong> {participant.crachaId}</div>
                  <div><strong>Jogo Escolhido:</strong> {selectedGame.toUpperCase()}</div>
                  <div className="text-yellow-400 font-bold"><strong>Prêmio Sorteado:</strong> {wonPrize.name}</div>
                </div>
              </div>

              {/* Return to Base44 or start next lead */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => handleExecuteReturn()}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
                  title="Retornar aos cadastros com todos os dados preenchidos: nome, crachá, prêmio e voucher"
                >
                  <ExternalLink size={16} />
                  <span>Retornar aos cadastros</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer with link to Company Panel */}
      <footer className="border-t border-slate-700/60 bg-[#17232d] py-4 px-6 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto font-['Open_Sans',sans-serif]">
        <p>VX Leads • Gamificação e Sorteio de Prêmios para Eventos</p>
        {currentStep !== 'voucher_final' && (
          <button
            onClick={() => navigate('/leads')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#2a353f] hover:bg-[#34424e] text-slate-300 hover:text-white border border-slate-700/60 text-[11px] font-medium transition-colors cursor-pointer"
            title="Acessar painel de leads captados da empresa"
          >
            <Lock size={12} className="text-blue-400" />
            <span>Painel da Empresa</span>
          </button>
        )}
      </footer>
    </div>
  );
}

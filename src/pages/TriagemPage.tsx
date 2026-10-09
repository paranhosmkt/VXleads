import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { 
  Sparkles, Gift, Smartphone, CheckCircle2, 
  ArrowRight, Trophy, ExternalLink, Lock, AlertTriangle, 
  Check, Copy, RotateCcw, Layers, PackageCheck, Flame
} from 'lucide-react';
import ScratchCard from '../components/ScratchCard';
import SlotMachine from '../components/SlotMachine';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { buildBase44ReturnUrl, executeBase44Return } from '../lib/base44';
import { checkUserDrawStatus, ExistingDrawRecord } from '../lib/leadVerification';
import { extractProductFromUrl, PRODUCTS_CONFIG, ProductConfig } from '../data/productConfig';
import { CURRENT_EVENT, resolveEventName } from '../data/eventConfig';
import { 
  TDM_DISCOUNT_PRIZES,
  OTHER_PRODUCTS_DISCOUNT_PRIZES,
  OTHER_PRODUCTS_DISCOUNT_SLICES,
  DISCOUNT_PRIZES, 
  PHYSICAL_ITEM_PRIZES, 
  ITEM_ROULETTE_SLICES, 
  DiscountPrize, 
  PhysicalItemPrize,
  isTdmProduct,
  getDiscountPrizesForProduct,
  getUniqueDiscountsForProduct,
  getDiscountRangeLabel,
  getDiscountPercentagesText,
  getPrizeSliceDisplay 
} from '../data/prizesConfig';

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

// Confetti particle burst
function triggerConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    if (document.body.contains(canvas)) document.body.removeChild(canvas);
    return;
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
  const pieces: { x: number; y: number; vx: number; vy: number; color: string; size: number; rot: number; vRot: number }[] = [];

  for (let i = 0; i < 90; i++) {
    pieces.push({
      x: canvas.width / 2,
      y: canvas.height * 0.45,
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

type FlowStep = 'select_game' | 'playing' | 'draw2_brinde' | 'voucher_final';

export default function TriagemPage() {
  const [searchParams] = useSearchParams();
  const { produto: routeProduto } = useParams<{ produto?: string }>();
  const navigate = useNavigate();

  // Product detected from route or query params (from Base44)
  const detectedProduct = extractProductFromUrl(searchParams, routeProduto);

  // Participant identification read from URL (from Base44 badge reader)
  const [participant, setParticipant] = useState({
    nome: searchParams.get('nome') || searchParams.get('name') || 'Participante Convidado',
    email: searchParams.get('email') || '',
    whatsapp: searchParams.get('whatsapp') || searchParams.get('telefone') || searchParams.get('phone') || '',
    empresa: searchParams.get('empresa') || searchParams.get('company') || 'Empresa Convidada',
    cargo: searchParams.get('cargo') || searchParams.get('role') || 'Visitante',
    crachaId: searchParams.get('crachaId') || searchParams.get('cracha') || searchParams.get('leadId') || 'CR-9482',
    origem: searchParams.get('origem') || 'Base44',
    evento: resolveEventName(searchParams.get('evento') || searchParams.get('event'), true),
    returnUrl: searchParams.get('return_url') || searchParams.get('redirect_url') || searchParams.get('callback_url') || '',
    webhookCallback: searchParams.get('webhook') || searchParams.get('webhook_url') || ''
  });

  // Flow State: 1) select_game -> 2) playing (1º Sorteio: Desconto) -> 3) draw2_brinde (2º Sorteio: Brinde Físico) -> 4) voucher_final
  const [currentStep, setCurrentStep] = useState<FlowStep>('select_game');
  const [selectedGame, setSelectedGame] = useState<'roleta' | 'raspadinha' | 'caca_niquel'>('roleta');

  // Dynamic discount configuration for detected product (TDM vs Other products)
  const isTdm = isTdmProduct(detectedProduct?.id || detectedProduct?.key);
  const activeDiscountSlices = getDiscountPrizesForProduct(detectedProduct?.id || detectedProduct?.key);
  const uniqueDiscounts = getUniqueDiscountsForProduct(detectedProduct?.id || detectedProduct?.key);

  // Game Play States
  const [wonDiscount, setWonDiscount] = useState<DiscountPrize>(() => {
    const list = getDiscountPrizesForProduct(detectedProduct?.id || detectedProduct?.key);
    return list[0] || DISCOUNT_PRIZES[0];
  });
  const [wonItem, setWonItem] = useState<PhysicalItemPrize>(PHYSICAL_ITEM_PRIZES[0]);
  const [voucherCode, setVoucherCode] = useState('');
  const [copiedVoucher, setCopiedVoucher] = useState(false);

  // 1st Draw Wheel specific state
  const [isSpinningWheel, setIsSpinningWheel] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);

  // 2nd Draw Wheel specific state
  const [isSpinningItemWheel, setIsSpinningItemWheel] = useState(false);
  const [itemWheelRotation, setItemWheelRotation] = useState(0);

  // Slot machine specific state
  const [isSpinningSlots, setIsSpinningSlots] = useState(false);

  // Scratch card specific state
  const [isScratchRevealed, setIsScratchRevealed] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Single-Draw Per User Validation
  const [hasAlreadyDrawn, setHasAlreadyDrawn] = useState(false);
  const [existingDraw, setExistingDraw] = useState<ExistingDrawRecord | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Pre-seed winner prize randomly on mount or when product changes
  useEffect(() => {
    const list = getDiscountPrizesForProduct(detectedProduct?.id || detectedProduct?.key);
    const randomPrize = list[Math.floor(Math.random() * list.length)] || list[0];
    setWonDiscount(randomPrize);
    const code = `VX-${Math.floor(10000 + Math.random() * 90000)}`;
    setVoucherCode(code);
  }, [detectedProduct?.id]);

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
        evento: resolveEventName(searchParams.get('evento') || searchParams.get('event'), true),
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

  // Persist result upon completion of both draws
  const persistConsolidatedDrawResult = async (discount: DiscountPrize, item: PhysicalItemPrize, code: string) => {
    const rawCleanId = participant.crachaId ? participant.crachaId.trim().replace(/[^a-zA-Z0-9_-]/g, '_') : `sub_${Date.now()}`;
    const targetEvent = participant.evento || CURRENT_EVENT.name;
    const eventSlug = targetEvent.toLowerCase().replace(/[^a-z0-9]/g, '');

    let finalDocId = rawCleanId;
    if (participant.crachaId && participant.crachaId !== 'CR-0000') {
      try {
        const existingSnap = await getDoc(doc(db, 'event_leads', rawCleanId));
        if (existingSnap.exists()) {
          const exData = existingSnap.data();
          const exEvent = resolveEventName(exData.evento, false);
          if (exEvent.toLowerCase() !== targetEvent.toLowerCase()) {
            finalDocId = `${rawCleanId}_${eventSlug}`;
          }
        }
      } catch (checkErr) {
        // ignore
      }
    }

    const prodName = detectedProduct ? detectedProduct.name : 'Geral';
    const prodFullName = detectedProduct ? detectedProduct.fullName : 'Geral';
    const combinedPrize = `${discount.name} + ${item.name}`;

    const record = {
      id: finalDocId,
      dataHora: new Date().toLocaleString('pt-BR'),
      evento: targetEvent,
      nomeEvento: targetEvent,
      nome: participant.nome,
      email: participant.email,
      whatsapp: participant.whatsapp,
      empresa: participant.empresa,
      cargo: participant.cargo,
      crachaId: participant.crachaId,
      origem: participant.origem,
      jogoEscolhido: selectedGame,
      premio: combinedPrize,
      premioGanho: combinedPrize,
      premioDesconto: discount.name,
      premioBrinde: item.name,
      desconto: discount.name,
      brinde: item.name,
      brindeGanho: item.name,
      brindeFisico: item.name,
      voucher: code,
      codigoVoucher: code,
      produto: prodName,
      produtoId: detectedProduct?.id || 'tdm',
      produtoKey: detectedProduct?.key || '',
      produtoNome: prodFullName,
      produtosDirecionados: prodName,
      produtoSelecionado: prodFullName,
      solucao: prodFullName
    };

    // 1. Cloud Firestore Database
    try {
      await setDoc(doc(db, 'event_leads', finalDocId), {
        ...record,
        leadId: participant.crachaId || finalDocId,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      }, { merge: true });
      setStatusMessage('Sorteios e Voucher registrados com sucesso na Nuvem!');
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
            desconto: discount.name,
            brinde: item.name,
            premio: combinedPrize,
            voucher: code,
            jogo: selectedGame,
            produto: prodName,
            produtoId: detectedProduct?.id || 'tdm',
            produtoNome: prodFullName,
            evento: participant.evento || CURRENT_EVENT.name,
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
      premioGanho: combinedPrize,
      premioDesconto: discount.name,
      premioBrinde: item.name,
      voucher: code,
      dataHora: record.dataHora,
      jogoEscolhido: selectedGame
    });
  };

  // Handler: Spin 1st Roulette (Descontos)
  const handleSpinRoulette = () => {
    if (isSpinningWheel) return;
    if (hasAlreadyDrawn) {
      setStatusMessage('Sorteio já efetuado.');
      return;
    }
    setIsSpinningWheel(true);

    const randomIdx = Math.floor(Math.random() * activeDiscountSlices.length);
    const randomPrize = activeDiscountSlices[randomIdx];
    setWonDiscount(randomPrize);

    const segmentAngle = 360 / activeDiscountSlices.length;
    const targetAngle = 360 - (randomIdx * segmentAngle + segmentAngle / 2);
    const extraSpins = 360 * 6;
    const currentModulo = wheelRotation % 360;
    let delta = targetAngle - currentModulo;
    if (delta <= 0) delta += 360;
    const totalRotation = wheelRotation + extraSpins + delta;

    setWheelRotation(totalRotation);

    // Sound effect
    const tickIntervals = [80, 80, 80, 90, 90, 100, 110, 120, 140, 160, 190, 230, 280, 340, 420, 520, 650];
    let elapsed = 0;
    tickIntervals.forEach((interval) => {
      elapsed += interval;
      if (elapsed < 4200) {
        setTimeout(playTickSound, elapsed);
      }
    });

    setTimeout(() => {
      setIsSpinningWheel(false);
      playWinSound();
      triggerConfetti();
      // Advance to 2nd draw for physical items
      setCurrentStep('draw2_brinde');
    }, 4500);
  };

  // Handler: Spin Slot Machine (Descontos)
  const handleSpinSlots = () => {
    if (isSpinningSlots) return;
    if (hasAlreadyDrawn) {
      setStatusMessage('Sorteio já efetuado.');
      return;
    }
    setIsSpinningSlots(true);

    const randomPrize = uniqueDiscounts[Math.floor(Math.random() * uniqueDiscounts.length)];
    setWonDiscount(randomPrize);

    setTimeout(() => {
      setIsSpinningSlots(false);
      playWinSound();
      triggerConfetti();
      setCurrentStep('draw2_brinde');
    }, 3200);
  };

  // Handler: Scratch card completed (Descontos)
  const handleScratchComplete = () => {
    setIsScratchRevealed(true);
    playWinSound();
    triggerConfetti();
    setTimeout(() => {
      setCurrentStep('draw2_brinde');
    }, 1200);
  };

  // Handler: Spin 2nd Draw Wheel (Brindes Físicos: Abridor, Caneta, Eco Copo)
  const handleSpinItemWheel = () => {
    if (isSpinningItemWheel) return;
    setIsSpinningItemWheel(true);

    const randomIndex = Math.floor(Math.random() * ITEM_ROULETTE_SLICES.length);
    const chosenSlice = ITEM_ROULETTE_SLICES[randomIndex];
    const physicalItem = PHYSICAL_ITEM_PRIZES.find(it => it.key === chosenSlice.prizeKey) || PHYSICAL_ITEM_PRIZES[0];

    const segmentAngle = 360 / ITEM_ROULETTE_SLICES.length;
    const targetAngle = 360 - (randomIndex * segmentAngle + segmentAngle / 2);
    const extraSpins = 360 * 6;
    const currentModulo = itemWheelRotation % 360;
    let delta = targetAngle - currentModulo;
    if (delta <= 0) delta += 360;
    const totalRotation = itemWheelRotation + extraSpins + delta;

    setItemWheelRotation(totalRotation);

    const tickIntervals = [80, 80, 80, 90, 90, 100, 110, 120, 140, 160, 190, 230, 280, 340, 420, 520, 650];
    let elapsed = 0;
    tickIntervals.forEach((interval) => {
      elapsed += interval;
      if (elapsed < 4200) {
        setTimeout(playTickSound, elapsed);
      }
    });

    setTimeout(() => {
      setIsSpinningItemWheel(false);
      playWinSound();
      triggerConfetti();
      setWonItem(physicalItem);

      const code = voucherCode || `VX-${Math.floor(10000 + Math.random() * 90000)}`;
      setVoucherCode(code);
      persistConsolidatedDrawResult(wonDiscount, physicalItem, code);
      setCurrentStep('voucher_final');
    }, 4500);
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
      premio: `${wonDiscount.name} + ${wonItem.name}`,
      desconto: wonDiscount.name,
      brinde: wonItem.name,
      voucher: voucherCode,
      jogo: selectedGame,
      produto: detectedProduct ? detectedProduct.name : undefined,
      produtoId: detectedProduct ? detectedProduct.id : undefined,
      produtoNome: detectedProduct ? detectedProduct.fullName : undefined,
      evento: participant.evento || CURRENT_EVENT.name,
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
      premio: `${wonDiscount.name} + ${wonItem.name}`,
      desconto: wonDiscount.name,
      brinde: wonItem.name,
      voucher: voucherCode,
      jogo: selectedGame,
      produto: detectedProduct ? detectedProduct.name : undefined,
      produtoId: detectedProduct ? detectedProduct.id : undefined,
      produtoNome: detectedProduct ? detectedProduct.fullName : undefined,
      evento: participant.evento || CURRENT_EVENT.name,
      webhookCallback: participant.webhookCallback
    });
  };

  const handleCopyVoucher = () => {
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(voucherCode);
      setCopiedVoucher(true);
      setTimeout(() => setCopiedVoucher(false), 2000);
    }
  };

  const isFinalScreen = currentStep === 'voucher_final' || hasAlreadyDrawn;

  return (
    <div className="min-h-screen bg-[#17232d] text-slate-100 flex flex-col font-['Open_Sans',sans-serif]">
      {/* Top Header */}
      <header className="border-b border-slate-700/60 bg-[#17232d] px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-md shadow-blue-500/20">
            <Smartphone size={20} />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              VX<span className="text-blue-500">Leads</span>
            </span>
          </div>

          {/* Active Event Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-black tracking-wide ml-1 sm:ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Mercopar 2026</span>
          </div>

          <span className="hidden sm:inline-block text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
            {currentStep === 'select_game' && '1º Sorteio: Descontos'}
            {currentStep === 'playing' && '1º Sorteio: Descontos'}
            {currentStep === 'draw2_brinde' && '2º Sorteio: Brinde Físico'}
            {currentStep === 'voucher_final' && 'Voucher Liberado'}
          </span>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Link to Commercial Leads Panel - hidden when on result screen as requested */}
          {!isFinalScreen && (
            <button
              onClick={() => navigate('/leads')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2a353f] hover:bg-[#34424e] text-slate-200 text-xs font-semibold border border-slate-700/60 transition-colors cursor-pointer"
              title="Acessar painel de leads captados da empresa"
            >
              <Lock size={13} className="text-blue-400" />
              <span className="hidden md:inline">Painel da Empresa</span>
            </button>
          )}

          {/* Participant Mini Badge */}
          <div className="text-xs text-slate-300 hidden lg:flex items-center gap-2 bg-[#2a353f] px-3 py-1.5 rounded-xl border border-slate-700/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-white max-w-[140px] truncate">{participant.nome}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center gap-6">

        {/* STEP PROGRESS TRACKER */}
        {!hasAlreadyDrawn && (
          <div className="bg-[#2a353f]/80 border border-slate-700/70 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold mb-2.5">
              <span className="text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-400" />
                2 Sorteios Disponíveis
              </span>
              <span className="text-slate-300 font-mono">
                {currentStep === 'select_game' && '1º Sorteio (Desconto)'}
                {currentStep === 'playing' && '1º Sorteio (Desconto)'}
                {currentStep === 'draw2_brinde' && '2º Sorteio (Brinde Físico)'}
                {currentStep === 'voucher_final' && 'Sorteios Concluídos!'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div 
                className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                  currentStep === 'select_game' || currentStep === 'playing'
                    ? 'bg-blue-600/20 border-blue-500/60 ring-2 ring-blue-500/30'
                    : 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  currentStep === 'draw2_brinde' || currentStep === 'voucher_final'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-blue-600 text-white'
                }`}>
                  {currentStep === 'draw2_brinde' || currentStep === 'voucher_final' ? <Check size={14} /> : '1'}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white truncate text-xs">1º Sorteio: Desconto</div>
                  <div className="text-[11px] text-slate-300 truncate">
                    {currentStep === 'draw2_brinde' || currentStep === 'voucher_final' ? wonDiscount.name : getDiscountRangeLabel(detectedProduct?.id || detectedProduct?.key)}
                  </div>
                </div>
              </div>

              <div 
                className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                  currentStep === 'draw2_brinde'
                    ? 'bg-amber-600/20 border-amber-500/60 ring-2 ring-amber-500/30'
                    : currentStep === 'voucher_final'
                    ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-800/60 border-slate-700/50 text-slate-400'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  currentStep === 'voucher_final'
                    ? 'bg-emerald-500 text-slate-950'
                    : currentStep === 'draw2_brinde'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {currentStep === 'voucher_final' ? <Check size={14} /> : '2'}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white truncate text-xs">2º Sorteio: Brinde Físico</div>
                  <div className="text-[11px] text-slate-300 truncate">
                    {currentStep === 'voucher_final' ? wonItem.name : 'Abridor, Caneta, Eco copo ou Bloco de anotações'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ETAPA 1: ESCOLHA ENTRE OS 3 JOGOS (ROLETA, RASPADINHA OU CAÇA-NÍQUEL)     */}
        {/* ========================================================================= */}
        {currentStep === 'select_game' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Sorteio Já Efetuado Banner */}
            {hasAlreadyDrawn ? (
              <div className="bg-[#2a353f] border-2 border-red-500/60 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl space-y-4 animate-fade-in">
                <div className="flex items-center justify-between gap-3 text-red-400">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center shrink-0">
                      <AlertTriangle size={24} className="text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-white">Sorteio já efetuado.</h3>
                      <p className="text-xs text-red-300 font-medium">Cada lead concorre a apenas 1 produto no evento</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {existingDraw?.evento || 'Mercopar 2026'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Identificamos que o participante <strong className="text-white font-bold">{participant.nome}</strong> (Crachá: <span className="font-mono text-blue-300 font-bold">{participant.crachaId}</span>) já realizou o sorteio no evento <strong className="text-emerald-400">{existingDraw?.evento || participant.evento || 'Mercopar 2026'}</strong>. <strong>Regra Oficial do Evento:</strong> cada participante pode concorrer a 1 sorteio por evento (participações em eventos anteriores não impedem novos sorteios neste evento, mas não é permitido participar 2 vezes no mesmo evento).
                </p>

                {existingDraw && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="bg-[#17232d] p-3.5 rounded-2xl border border-slate-700/60">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Solução & Prêmio</span>
                      <div className="text-blue-300 font-bold text-xs mt-0.5">
                        📦 {existingDraw.produto || existingDraw.produtoNome || (detectedProduct ? detectedProduct.name : 'Solução')}
                      </div>
                      <span className="text-amber-300 font-black text-sm flex items-center gap-1.5 mt-1">
                        <Trophy size={15} className="text-yellow-400 shrink-0" />
                        <span className="truncate">{existingDraw.premioGanho}</span>
                      </span>
                    </div>
                    <div className="bg-[#17232d] p-3.5 rounded-2xl border border-slate-700/60">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Código do Voucher</span>
                      <span className="font-mono text-yellow-300 font-black text-sm block mt-1">
                        {existingDraw.voucher}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Registrado em {existingDraw.dataHora} • {existingDraw.evento || 'Mercopar 2026'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-700/60 flex flex-wrap gap-2.5">
                  <button
                    onClick={() => executeBase44Return({
                      returnUrl: participant.returnUrl,
                      leadId: participant.crachaId,
                      voucher: existingDraw?.voucher || '',
                      premio: existingDraw?.premioGanho || '',
                      desconto: existingDraw?.premioDesconto,
                      brinde: existingDraw?.premioBrinde,
                      nome: participant.nome,
                      empresa: participant.empresa,
                      cargo: participant.cargo,
                      email: participant.email,
                      whatsapp: participant.whatsapp,
                      produto: existingDraw?.produto || (detectedProduct ? detectedProduct.name : undefined),
                      produtoId: existingDraw?.produtoId || (detectedProduct ? detectedProduct.id : undefined),
                      produtoNome: existingDraw?.produtoNome || (detectedProduct ? detectedProduct.fullName : undefined),
                      evento: existingDraw?.evento || 'Mercopar 2026'
                    })}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw size={14} />
                    <span>Retornar aos cadastros</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            ) : (
              /* Header / Instructions */
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    <CheckCircle2 size={14} />
                    <span>Crachá Identificado: {participant.crachaId || 'Validado'}</span>
                  </div>
                  {detectedProduct && (
                    <div 
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                      style={{
                        backgroundColor: `${detectedProduct.color}20`,
                        borderColor: `${detectedProduct.color}50`,
                        color: detectedProduct.color
                      }}
                    >
                      <span>Solução: {detectedProduct.fullName}</span>
                    </div>
                  )}
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Olá, {participant.nome}!
                </h2>
                <p className="text-slate-400 text-sm sm:text-base">
                  Escolha como deseja girar seu <strong>1º Sorteio (Desconto Exclusivo)</strong>:
                </p>
              </div>
            )}

            {/* Game Options Cards */}
            {!hasAlreadyDrawn && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
                {/* 1. Roleta */}
                <div 
                  onClick={() => handleChooseGame('roleta')}
                  className="bg-[#2a353f] hover:bg-[#323e49] border-2 border-slate-700/80 hover:border-yellow-500/80 rounded-3xl p-6 text-center cursor-pointer transition-all transform hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-yellow-500/10 flex flex-col items-center justify-between gap-4 group"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-amber-500/20 border border-yellow-400/30 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                    🎡
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white group-hover:text-yellow-400 transition-colors">
                      Roleta da Sorte
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Gire a roleta clássica e concorra a descontos ({getDiscountPercentagesText(detectedProduct?.id)})!
                    </p>
                  </div>
                  <button className="w-full py-2.5 rounded-xl bg-yellow-500 group-hover:bg-yellow-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1">
                    <span>Girar Roleta</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                {/* 2. Raspadinha */}
                <div 
                  onClick={() => handleChooseGame('raspadinha')}
                  className="bg-[#2a353f] hover:bg-[#323e49] border-2 border-slate-700/80 hover:border-purple-500/80 rounded-3xl p-6 text-center cursor-pointer transition-all transform hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col items-center justify-between gap-4 group"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                    ✨
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white group-hover:text-purple-400 transition-colors">
                      Raspadinha Premiada
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Raspe o cartão virtual diretamente com o dedo ou mouse!
                    </p>
                  </div>
                  <button className="w-full py-2.5 rounded-xl bg-purple-600 group-hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1">
                    <span>Raspar Agora</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                {/* 3. Caça-Níquel */}
                <div 
                  onClick={() => handleChooseGame('caca_niquel')}
                  className="bg-[#2a353f] hover:bg-[#323e49] border-2 border-slate-700/80 hover:border-amber-500/80 rounded-3xl p-6 text-center cursor-pointer transition-all transform hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col items-center justify-between gap-4 group"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                    🎰
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                      Caça-Níquel
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Puxe a alavanca e alinhe os 3 cilindros para levar seu prêmio!
                    </p>
                  </div>
                  <button className="w-full py-2.5 rounded-xl bg-amber-600 group-hover:bg-amber-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1">
                    <span>Puxar Alavanca</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ETAPA 2: JOGANDO O 1º SORTEIO (DESCONTO)                                   */}
        {/* ========================================================================= */}
        {currentStep === 'playing' && (
          <div className="bg-[#2a353f] border border-slate-700/60 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden animate-fade-in">
            <button
              onClick={() => setCurrentStep('select_game')}
              className="absolute top-4 left-4 text-xs text-slate-400 hover:text-white flex items-center gap-1 py-1 px-2.5 rounded-lg bg-[#17232d] border border-slate-700/60 transition-colors cursor-pointer"
            >
              ← Trocar jogo
            </button>

            {/* ROLETA */}
            {selectedGame === 'roleta' && (
              <div className="max-w-md mx-auto pt-4 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                  <Flame size={14} className="text-amber-400" />
                  <span>1º Sorteio: Descontos ({getDiscountRangeLabel(detectedProduct?.id || detectedProduct?.key)})</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Gire a Roleta de Descontos
                </h3>

                {/* SVG Roulette Wheel */}
                <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] mx-auto my-6">
                  {/* Pointer */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-30 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                    <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-yellow-400"></div>
                  </div>

                  {/* Disk */}
                  <div 
                    className="w-full h-full rounded-full border-8 border-slate-800 shadow-[0_0_40px_rgba(245,158,11,0.25)] relative overflow-hidden transition-transform duration-[4500ms] ease-out"
                    style={{ transform: `rotate(${wheelRotation}deg)` }}
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}>
                      <g id="triagem-slices">
                        {activeDiscountSlices.map((prize, index) => {
                          const total = activeDiscountSlices.length;
                          const angle = 360 / total;
                          const startAngle = index * angle;
                          const endAngle = (index + 1) * angle;

                          const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                          const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                          const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                          const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                          const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                          return (
                            <path 
                              key={`${prize.id}-${index}`} 
                              d={pathData} 
                              fill={prize.color} 
                              stroke="#0f172a" 
                              strokeWidth="0.8" 
                            />
                          );
                        })}
                      </g>

                      <g id="triagem-labels">
                        {activeDiscountSlices.map((prize, index) => {
                          const total = activeDiscountSlices.length;
                          const angle = 360 / total;
                          const startAngle = index * angle;
                          const midAngle = startAngle + angle / 2;
                          const lines = getPrizeSliceDisplay(prize.name);

                          return (
                            <g key={`lbl-${prize.id}-${index}`} transform={`rotate(${midAngle}, 50, 50)`}>
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
                              >
                                {lines.bottom}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    </svg>

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
                    prizeText={wonDiscount.name}
                    onComplete={handleScratchComplete}
                  />
                </div>

                {isScratchRevealed && (
                  <div className="text-emerald-400 font-bold text-sm animate-pulse">
                    Desconto Revelado! Avançando para o 2º sorteio de brindes...
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
                    prizeText={wonDiscount.name} 
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
        {/* ETAPA 2.5: 2º SORTEIO (BRINDE FÍSICO: ABRIDOR, CANETA, ECO COPO)          */}
        {/* ========================================================================= */}
        {currentStep === 'draw2_brinde' && (
          <div className="bg-[#2a353f] border border-slate-700/60 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden animate-fade-in">
            <div className="max-w-xl mx-auto space-y-5">
              
              {/* Highlight of 1st draw win */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-emerald-300 text-xs font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>1º Sorteio Concluído: {wonDiscount.name}</span>
                </span>
                <span className="text-[10px] uppercase bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-200">
                  Garantido
                </span>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/40">
                <Gift size={14} className="text-amber-400" />
                <span>2º Sorteio: Brinde Físico Oficial</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
                Gire para seu Brinde Físico!
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Descubra qual item oficial você vai levar: <strong className="text-white">Abridor de garrafa</strong>, <strong className="text-white">Caneta</strong>, <strong className="text-white">Eco copo</strong> ou <strong className="text-white">Bloco de anotações</strong>!
              </p>

              {/* ROULETTE SVG DISK FOR BRINDES (6 Slices) */}
              <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] mx-auto my-5">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-30 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                  <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-yellow-400"></div>
                </div>

                {/* Disk */}
                <div 
                  className="w-full h-full rounded-full border-8 border-slate-800 shadow-[0_0_40px_rgba(245,158,11,0.25)] relative overflow-hidden transition-transform duration-[4500ms] ease-out"
                  style={{ transform: `rotate(${itemWheelRotation}deg)` }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}>
                    <g id="triagem-item-slices">
                      {ITEM_ROULETTE_SLICES.map((slice, i) => {
                        const total = ITEM_ROULETTE_SLICES.length;
                        const angle = 360 / total;
                        const startAngle = i * angle;
                        const endAngle = (i + 1) * angle;

                        const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                        const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                        const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                        const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                        const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                        return (
                          <path key={slice.id} d={pathData} fill={slice.color} stroke="#0f172a" strokeWidth="0.8" />
                        );
                      })}
                    </g>

                    <g id="triagem-item-labels">
                      {ITEM_ROULETTE_SLICES.map((slice, i) => {
                        const total = ITEM_ROULETTE_SLICES.length;
                        const angle = 360 / total;
                        const startAngle = i * angle;
                        const midAngle = startAngle + angle / 2;

                        return (
                          <g key={`lbl-${slice.id}`} transform={`rotate(${midAngle}, 50, 50)`}>
                            <text
                              x={72}
                              y={47.5}
                              fill="#FFFFFF"
                              fontSize="3.6"
                              fontWeight="900"
                              textAnchor="middle"
                              dominantBaseline="central"
                              style={{
                                paintOrder: 'stroke fill',
                                stroke: '#0f172a',
                                strokeWidth: '1.4px',
                                strokeLinejoin: 'round'
                              }}
                            >
                              {slice.topText}
                            </text>
                            <text
                              x={72}
                              y={52.8}
                              fill="#FEF08A"
                              fontSize="3.2"
                              fontWeight="900"
                              letterSpacing="0.3"
                              textAnchor="middle"
                              dominantBaseline="central"
                              style={{
                                paintOrder: 'stroke fill',
                                stroke: '#0f172a',
                                strokeWidth: '1.2px',
                                strokeLinejoin: 'round'
                              }}
                            >
                              {slice.bottomText}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  </svg>

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#17232d] border-4 border-amber-400 shadow-2xl flex flex-col items-center justify-center z-20 text-center pointer-events-none">
                    <Gift className="text-amber-400" size={18} />
                  </div>
                </div>
              </div>

              {/* Spin Button */}
              <div className="pt-2">
                <button
                  disabled={isSpinningItemWheel}
                  onClick={handleSpinItemWheel}
                  className="w-full max-w-sm py-4 px-8 rounded-2xl font-black text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 transition-all shadow-xl shadow-amber-500/20 cursor-pointer transform active:scale-95 disabled:opacity-50"
                >
                  {isSpinningItemWheel ? 'Girando a Roleta de Brindes...' : 'GIRAR 2º SORTEIO: MEU BRINDE!'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ETAPA 3: VOUCHER FINAL LIBERADO COM RESUMO COMPLETO DOS 2 SORTEIOS        */}
        {/* ========================================================================= */}
        {currentStep === 'voucher_final' && (
          <div className="bg-[#2a353f] border border-slate-700/60 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden animate-fade-in font-['Open_Sans',sans-serif]">
            <div className="max-w-xl mx-auto space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-400/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center mx-auto text-3xl shadow-xl animate-bounce">
                🎉
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Parabéns! 2 Sorteios Concluídos
                </span>
                <h3 className="text-3xl sm:text-4xl font-black text-white mt-1">
                  {participant.nome}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm mt-1">
                  Seus benefícios foram registrados no sistema e vinculados ao seu crachá.
                </p>
              </div>

              {/* DUAL PRIZE CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {/* 1º Prêmio: Desconto */}
                <div 
                  className="bg-gradient-to-br from-[#17232d] to-[#1e2a36] border-2 rounded-2xl p-4 shadow-xl"
                  style={{ borderColor: wonDiscount.color }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                      1º Desconto
                    </span>
                    <span className="text-base">🏷️</span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {wonDiscount.name}
                  </div>
                  {detectedProduct ? (
                    <div className="mt-1 text-xs font-semibold" style={{ color: detectedProduct.color }}>
                      {detectedProduct.fullName}
                    </div>
                  ) : (
                    <div className="mt-1 text-xs text-slate-400 font-semibold">
                      Válido para produtos do estande
                    </div>
                  )}
                </div>

                {/* 2º Prêmio: Brinde Físico */}
                <div 
                  className="bg-gradient-to-br from-[#17232d] to-[#1e2a36] border-2 rounded-2xl p-4 shadow-xl"
                  style={{ borderColor: wonItem.color }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                      2º Brinde Físico
                    </span>
                    <span className="text-base">{wonItem.icon}</span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {wonItem.name}
                  </div>
                  <div className="mt-1 text-xs text-amber-300 font-medium flex items-center gap-1">
                    <PackageCheck size={13} className="shrink-0" />
                    <span>Retire no estande</span>
                  </div>
                </div>
              </div>

              {/* Unified Voucher Code */}
              <div className="bg-[#17232d] border border-slate-700/60 rounded-2xl p-5 inline-block w-full shadow-inner">
                <div className="flex items-center justify-between text-[11px] pb-1.5 mb-2 border-b border-slate-700/50">
                  <span className="text-slate-400">Evento Oficial:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    {participant.evento || 'Mercopar 2026'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                  Código do Voucher Unificado
                </div>
                <div className="text-3xl font-mono font-black text-yellow-400 tracking-widest my-1">
                  {voucherCode}
                </div>
                <div className="text-[11px] text-slate-400 mt-2 mb-3">
                  Apresente este código no estande para validar seu desconto e retirar seu brinde físico.
                </div>
                <button
                  onClick={handleCopyVoucher}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2a353f] hover:bg-[#34424e] text-xs text-slate-200 border border-slate-700/60 transition-colors cursor-pointer"
                >
                  {copiedVoucher ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedVoucher ? 'Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>

              {/* Lead Details */}
              <div className="bg-[#17232d] border border-emerald-500/30 rounded-2xl p-4 text-left">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                  <CheckCircle2 size={18} />
                  <span>Sorteios Salvos no Sistema & Base44</span>
                </div>
                {statusMessage && (
                  <p className="text-xs text-emerald-200/80 leading-relaxed mb-3">
                    {statusMessage}
                  </p>
                )}
                
                <div className="bg-[#2a353f] rounded-xl p-3 text-xs space-y-1 font-mono text-slate-300 border border-slate-700/60">
                  <div><strong>Participante:</strong> {participant.nome} {participant.empresa ? `(${participant.empresa})` : ''}</div>
                  <div><strong>Crachá / ID:</strong> {participant.crachaId}</div>
                  <div className="text-emerald-400 font-bold"><strong>1º Desconto:</strong> {wonDiscount.name}</div>
                  <div className="text-amber-400 font-bold"><strong>2º Brinde:</strong> {wonItem.name}</div>
                </div>
              </div>

              {/* Return to Base44 - "Retornar aos cadastros" without "Painel da Empresa" button */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => handleExecuteReturn()}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
                  title="Retornar aos cadastros com todos os dados preenchidos: nome, crachá, prêmios e voucher"
                >
                  <RotateCcw size={16} />
                  <span>Retornar aos cadastros</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer with link to Company Panel - REMOVED when draw is won */}
      <footer className="border-t border-slate-700/60 bg-[#17232d] py-4 px-6 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto font-['Open_Sans',sans-serif]">
        <p>VX Leads • Gamificação e Sorteio de Prêmios para Eventos</p>
        {!isFinalScreen && (
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

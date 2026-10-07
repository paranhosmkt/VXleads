import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Sparkles, CheckCircle2, RotateCcw, Download, Target, Gift, Check, ExternalLink, Copy, Cloud,
  Database, ChevronDown, ChevronUp, Code2, AlertTriangle, Trophy, Zap, Shield, Box, Cpu, Layers,
  ArrowRight, Award, PackageCheck, Flame
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { buildBase44ReturnUrl, executeBase44Return } from '../lib/base44';
import { checkUserDrawStatus, ExistingDrawRecord } from '../lib/leadVerification';
import { PRODUCTS_CONFIG, extractProductFromUrl, getProductBySlugOrParam, ProductConfig } from '../data/productConfig';
import { 
  DISCOUNT_PRIZES, 
  PHYSICAL_ITEM_PRIZES, 
  ITEM_ROULETTE_SLICES, 
  DiscountPrize, 
  PhysicalItemPrize, 
  RouletteSlice,
  getPrizeSliceDisplay 
} from '../data/prizesConfig';

function triggerConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    if (document.body.contains(canvas)) document.body.removeChild(canvas);
    return;
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#EF4444', '#06B6D4'];
  const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string; rot: number; vRot: number }[] = [];

  for (let i = 0; i < 110; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height * 0.45,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 18,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10
    });
  }

  let frames = 0;
  function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
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
    if (frames < 130) {
      requestAnimationFrame(animate);
    } else {
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    }
  }

  requestAnimationFrame(animate);
}

function playTickSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {
    // audio context might be blocked by autoplay policies
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
      gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
    });
  } catch (e) {
    // ignore
  }
}

function ProductIcon({ name, size = 18 }: { name: string; size?: number }) {
  switch (name) {
    case 'zap': return <Zap size={size} />;
    case 'database': return <Database size={size} />;
    case 'shield': return <Shield size={size} />;
    case 'box': return <Box size={size} />;
    case 'cpu': return <Cpu size={size} />;
    default: return <Layers size={size} />;
  }
}

type DrawPhase = 'draw1_spin' | 'draw1_completed' | 'draw2_spin' | 'won_final';

export default function RoletaPremioPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { produto: routeProduto } = useParams<{ produto?: string }>();
  const navigate = useNavigate();

  // Detect product from route or search parameters
  const detectedProduct = extractProductFromUrl(searchParams, routeProduto);
  const [selectedProduct, setSelectedProduct] = useState<ProductConfig | null>(detectedProduct);

  useEffect(() => {
    const current = extractProductFromUrl(searchParams, routeProduto);
    if (current) {
      setSelectedProduct(current);
    }
  }, [searchParams, routeProduto]);

  // Participant details received from URL (passed from Base44 / Triagem)
  const participant = {
    nome: searchParams.get('nome') || searchParams.get('name') || 'Visitante Convidado',
    email: searchParams.get('email') || '',
    whatsapp: searchParams.get('whatsapp') || searchParams.get('telefone') || searchParams.get('phone') || '',
    empresa: searchParams.get('empresa') || searchParams.get('company') || 'Empresa Visitante',
    cargo: searchParams.get('cargo') || searchParams.get('role') || 'Participante',
    crachaId: searchParams.get('crachaId') || searchParams.get('cracha') || searchParams.get('leadId') || searchParams.get('lead_id') || searchParams.get('id') || 'CR-0000',
    origem: searchParams.get('origem') || 'Triagem_Base44',
    r1: searchParams.get('r1') || searchParams.get('resposta1') || 'Não informada',
    r2: searchParams.get('r2') || searchParams.get('resposta2') || 'Não informada',
    r3: searchParams.get('r3') || searchParams.get('resposta3') || 'Não informada',
    returnUrl: searchParams.get('return_url') || searchParams.get('returnUrl') || searchParams.get('redirect_url') || searchParams.get('redirectUrl') || searchParams.get('callback_url') || searchParams.get('callback') || '',
    webhookCallback: searchParams.get('webhook') || searchParams.get('webhook_url') || ''
  };

  const webhookUrl = localStorage.getItem('vx_proto_webhook_url') || '';

  // Two-Draw Flow States
  const [drawPhase, setDrawPhase] = useState<DrawPhase>('draw1_spin');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Prizes won
  const [wonDiscount, setWonDiscount] = useState<DiscountPrize | null>(null);
  const [wonItem, setWonItem] = useState<PhysicalItemPrize | null>(null);
  const [voucherCode, setVoucherCode] = useState('');

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showFirebaseDetails, setShowFirebaseDetails] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Single-Draw Validation per user
  const [hasAlreadyDrawn, setHasAlreadyDrawn] = useState(false);
  const [existingDraw, setExistingDraw] = useState<ExistingDrawRecord | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

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

  const handleSelectProduct = (prod: ProductConfig | null) => {
    setSelectedProduct(prod);
    const newParams = new URLSearchParams(searchParams);
    if (prod) {
      newParams.set('produto', prod.id);
    } else {
      newParams.delete('produto');
      newParams.delete('product');
      newParams.delete('produtos');
    }
    setSearchParams(newParams, { replace: true });
  };

  // 1º Sorteio: Gira para descontos
  const handleSpinDiscountWheel = () => {
    if (isSpinning) return;
    if (hasAlreadyDrawn) {
      setStatusMessage('Sorteio já efetuado.');
      return;
    }
    setIsSpinning(true);

    const randomIndex = Math.floor(Math.random() * DISCOUNT_PRIZES.length);
    const chosenPrize = DISCOUNT_PRIZES[randomIndex];

    const segmentAngle = 360 / DISCOUNT_PRIZES.length;
    const targetAngle = 360 - (randomIndex * segmentAngle + segmentAngle / 2);
    const extraTurns = 360 * 6;
    const currentModulo = rotation % 360;
    let delta = targetAngle - currentModulo;
    if (delta <= 0) delta += 360;
    const totalRotation = rotation + extraTurns + delta;

    setRotation(totalRotation);

    // Audio ticks
    const tickTimes = [70, 70, 80, 90, 100, 120, 150, 180, 220, 270, 340, 430, 550, 700];
    let elapsed = 0;
    tickTimes.forEach(t => {
      elapsed += t;
      if (elapsed < 4200) {
        setTimeout(playTickSound, elapsed);
      }
    });

    setTimeout(() => {
      setIsSpinning(false);
      playWinSound();
      setWonDiscount(chosenPrize);
      setDrawPhase('draw1_completed');
      triggerConfetti();
    }, 4500);
  };

  // Transição do 1º para o 2º Sorteio
  const handleProceedToDraw2 = () => {
    setDrawPhase('draw2_spin');
    setRotation(0); // Reset wheel rotation for fresh second spin
  };

  // 2º Sorteio: Gira para itens físicos (Abridor de garrafa, caneta e eco copo)
  const handleSpinItemWheel = () => {
    if (isSpinning) return;
    if (hasAlreadyDrawn) {
      setStatusMessage('Sorteio já efetuado.');
      return;
    }
    setIsSpinning(true);

    const randomIndex = Math.floor(Math.random() * ITEM_ROULETTE_SLICES.length);
    const chosenSlice = ITEM_ROULETTE_SLICES[randomIndex];
    const physicalItem = PHYSICAL_ITEM_PRIZES.find(item => item.key === chosenSlice.prizeKey) || PHYSICAL_ITEM_PRIZES[0];

    const segmentAngle = 360 / ITEM_ROULETTE_SLICES.length;
    const targetAngle = 360 - (randomIndex * segmentAngle + segmentAngle / 2);
    const extraTurns = 360 * 6;
    const currentModulo = rotation % 360;
    let delta = targetAngle - currentModulo;
    if (delta <= 0) delta += 360;
    const totalRotation = rotation + extraTurns + delta;

    setRotation(totalRotation);

    // Audio ticks
    const tickTimes = [70, 70, 80, 90, 100, 120, 150, 180, 220, 270, 340, 430, 550, 700];
    let elapsed = 0;
    tickTimes.forEach(t => {
      elapsed += t;
      if (elapsed < 4200) {
        setTimeout(playTickSound, elapsed);
      }
    });

    setTimeout(() => {
      setIsSpinning(false);
      playWinSound();
      setWonItem(physicalItem);

      // Generate consolidated voucher
      const code = `VX-${Math.floor(10000 + Math.random() * 90000)}`;
      setVoucherCode(code);
      setDrawPhase('won_final');
      triggerConfetti();

      // Persist results
      const discountName = wonDiscount ? wonDiscount.name : '20% de Desconto';
      persistConsolidatedResult(discountName, physicalItem.name, code);
    }, 4500);
  };

  const persistConsolidatedResult = async (discountName: string, itemName: string, voucher: string) => {
    const cleanDocId = participant.crachaId ? participant.crachaId.trim().replace(/[^a-zA-Z0-9_-]/g, '_') : `sub_${Date.now()}`;
    const prodName = selectedProduct ? selectedProduct.name : 'Geral';
    const prodFullName = selectedProduct ? selectedProduct.fullName : 'Soluções Gerais';
    const combinedPrize = `${discountName} + ${itemName}`;

    const record = {
      id: cleanDocId,
      dataHora: new Date().toLocaleString('pt-BR'),
      nome: participant.nome,
      email: participant.email,
      whatsapp: participant.whatsapp,
      empresa: participant.empresa,
      cargo: participant.cargo,
      crachaId: participant.crachaId,
      leadId: participant.crachaId,
      origem: participant.origem,
      resposta1: participant.r1,
      resposta2: participant.r2,
      resposta3: participant.r3,
      problemas: participant.r1,
      possiveisSolucoes: participant.r2,
      produto: prodName,
      produtoKey: selectedProduct?.key || '',
      produtosDirecionados: prodName,
      produtoSelecionado: prodFullName,
      solucao: prodFullName,
      codigoVoucher: voucher,
      voucher: voucher,
      voucherCode: voucher,
      premio: combinedPrize,
      premioGanho: combinedPrize,
      premioDesconto: discountName,
      premioBrinde: itemName,
      desconto: discountName,
      brinde: itemName,
      status: 'completed',
      jogo: 'roleta_dupla',
      jogoEscolhido: 'roleta'
    };

    // 1. Firebase Firestore Real-Time Cloud Storage
    try {
      await setDoc(doc(db, 'event_leads', cleanDocId), {
        ...record,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      }, { merge: true });
      setStatusMessage('Sincronizado no Firebase Firestore e pronto para o Base44!');
    } catch (dbErr) {
      console.warn('Erro ao salvar no Firestore:', dbErr);
    }

    // 2. Local backend proxy
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
    } catch (apiErr) {
      // ignore
    }

    // 3. Offline storage cache
    try {
      const saved = localStorage.getItem('vx_proto_submissions');
      const list = saved ? JSON.parse(saved) : [];
      list.unshift(record);
      localStorage.setItem('vx_proto_submissions', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    // 4. Base44 Webhook Callback
    if (participant.webhookCallback) {
      try {
        await fetch(participant.webhookCallback, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'double_prize_won',
            leadId: participant.crachaId,
            desconto: discountName,
            brinde: itemName,
            premio: combinedPrize,
            voucher: voucher,
            produto: prodName,
            ...record
          })
        });
      } catch (err) {
        console.warn('Erro no callback do Base44:', err);
      }
    }

    // 5. Google Sheets Webhook
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        });
        setStatusMessage('Dados consolidados e enviados para Banco Firebase + Planilha Google!');
      } catch (e) {
        // fallback
      }
    }
  };

  const isFinalScreen = drawPhase === 'won_final' || hasAlreadyDrawn;

  return (
    <div className="min-h-screen bg-[#17232d] text-slate-100 flex flex-col font-['Open_Sans',sans-serif] selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-700/60 bg-[#17232d] sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-md shadow-blue-500/20">
            <Target size={20} />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              VX<span className="text-blue-500">Leads</span>
            </span>
          </div>

          {/* Active Product Badge in Header */}
          {selectedProduct ? (
            <div 
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black border ml-2"
              style={{
                backgroundColor: `${selectedProduct.color}20`,
                borderColor: `${selectedProduct.color}50`,
                color: selectedProduct.color
              }}
            >
              <ProductIcon name={selectedProduct.iconName} size={14} />
              <span>{selectedProduct.fullName}</span>
            </div>
          ) : (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 ml-2">
              <Layers size={13} className="text-blue-400" />
              <span>Sorteio Geral</span>
            </div>
          )}
        </div>

        {/* Status / Crachá Pill & Product Switcher */}
        <div className="flex items-center gap-2">
          {participant.crachaId && participant.crachaId !== 'CR-0000' && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-[#2a353f] border border-slate-700/60 text-xs">
              <span className="text-slate-400 font-medium">Crachá:</span>
              <span className="text-yellow-400 font-mono font-bold">{participant.crachaId}</span>
              <span className="text-slate-500">•</span>
              <span className="text-white font-semibold truncate max-w-[120px]">{participant.nome}</span>
            </div>
          )}

          {/* Removed "Painel da Empresa" button if draw is completed as requested */}
          {!isFinalScreen && (
            <RouterLink
              to="/leads"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
            >
              <Gift size={13} className="text-blue-400" />
              <span className="hidden sm:inline">Painel da Empresa</span>
            </RouterLink>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">

        {/* 2-DRAW STEP PROGRESS BAR */}
        {!hasAlreadyDrawn && (
          <div className="mb-6 bg-[#2a353f]/80 border border-slate-700/70 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold mb-2.5">
              <span className="text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-400" />
                2 Sorteios Garantidos para Você
              </span>
              <span className="text-slate-300 font-mono">
                {drawPhase === 'draw1_spin' && 'Etapa 1 de 2'}
                {drawPhase === 'draw1_completed' && 'Etapa 1 Concluída!'}
                {drawPhase === 'draw2_spin' && 'Etapa 2 de 2'}
                {drawPhase === 'won_final' && 'Sorteios Finalizados!'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Step 1 Indicator */}
              <div 
                className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                  drawPhase === 'draw1_spin'
                    ? 'bg-blue-600/20 border-blue-500/60 ring-2 ring-blue-500/30'
                    : (wonDiscount || drawPhase === 'draw2_spin' || drawPhase === 'won_final')
                    ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-800/60 border-slate-700/50 text-slate-400'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  wonDiscount || drawPhase === 'draw2_spin' || drawPhase === 'won_final'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-blue-600 text-white'
                }`}>
                  {wonDiscount || drawPhase === 'draw2_spin' || drawPhase === 'won_final' ? <Check size={14} /> : '1'}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white truncate text-xs">1º Sorteio: Descontos</div>
                  <div className="text-[11px] text-slate-300 truncate">
                    {wonDiscount ? wonDiscount.name : '10% a 40% OFF'}
                  </div>
                </div>
              </div>

              {/* Step 2 Indicator */}
              <div 
                className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                  drawPhase === 'draw2_spin'
                    ? 'bg-amber-600/20 border-amber-500/60 ring-2 ring-amber-500/30'
                    : wonItem || drawPhase === 'won_final'
                    ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-800/60 border-slate-700/50 text-slate-400'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  wonItem || drawPhase === 'won_final'
                    ? 'bg-emerald-500 text-slate-950'
                    : drawPhase === 'draw2_spin'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {wonItem || drawPhase === 'won_final' ? <Check size={14} /> : '2'}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white truncate text-xs">2º Sorteio: Brinde Físico</div>
                  <div className="text-[11px] text-slate-300 truncate">
                    {wonItem ? wonItem.name : 'Abridor, Caneta ou Eco Copo'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product selector buttons (if user wants to browse products or none in URL) */}
        {!isFinalScreen && (
          <div className="mb-4 bg-[#2a353f]/60 p-3 rounded-2xl border border-slate-700/60 flex items-center gap-2 overflow-x-auto scrollbar-thin">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Layers size={12} className="text-blue-400" />
              Solução:
            </span>
            {PRODUCTS_CONFIG.map((prod) => {
              const isSelected = selectedProduct?.id === prod.id;
              return (
                <button
                  key={prod.id}
                  onClick={() => handleSelectProduct(prod)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'border-transparent text-white shadow-md'
                      : 'bg-[#17232d] hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:border-slate-600'
                  }`}
                  style={{
                    backgroundColor: isSelected ? prod.color : undefined,
                    boxShadow: isSelected ? `0 0 15px ${prod.color}40` : undefined
                  }}
                >
                  <ProductIcon name={prod.iconName} size={13} />
                  <span>{prod.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ACTIVE PRODUCT BRANDING HERO (if selected) */}
        {selectedProduct && !isFinalScreen && (
          <div 
            className="mb-6 rounded-2xl p-4 sm:p-5 border transition-all relative overflow-hidden bg-gradient-to-r"
            style={{
              borderColor: `${selectedProduct.color}50`,
              backgroundImage: `linear-gradient(to right, ${selectedProduct.color}15, rgba(23, 35, 45, 0.95))`
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div className="flex items-start gap-3">
                <div 
                  className="p-3 rounded-xl text-white shadow-lg shrink-0 mt-0.5"
                  style={{ backgroundColor: selectedProduct.color }}
                >
                  <ProductIcon name={selectedProduct.iconName} size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span 
                      className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border"
                      style={{
                        backgroundColor: `${selectedProduct.color}25`,
                        borderColor: `${selectedProduct.color}50`,
                        color: selectedProduct.color
                      }}
                    >
                      {selectedProduct.badge}
                    </span>
                    <span className="text-slate-400 text-xs">• {selectedProduct.category}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                    {selectedProduct.fullName}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-0.5 leading-relaxed">
                    {selectedProduct.tagline}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-left sm:text-right bg-[#17232d]/80 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  Voucher Aplicável
                </span>
                <span 
                  className="text-xs font-black px-2.5 py-1 rounded-lg border inline-block mt-0.5"
                  style={{
                    backgroundColor: `${selectedProduct.color}20`,
                    borderColor: `${selectedProduct.color}50`,
                    color: selectedProduct.color
                  }}
                >
                  100% Válido para {selectedProduct.name}
                </span>
              </div>
            </div>

            {/* Key Benefits */}
            <div className="mt-3.5 pt-3 border-t border-slate-700/40 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
              {selectedProduct.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-[#17232d]/70 p-2 rounded-xl border border-slate-700/50">
                  <Check size={12} className="text-emerald-400 shrink-0" />
                  <span className="truncate">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ALREADY DRAWN WARNING BANNER */}
        {hasAlreadyDrawn && (
          <div className="bg-[#2a353f] border border-slate-700/60 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden">
            <div className="max-w-xl mx-auto">
              <div className="mb-6 bg-red-950/40 border-2 border-red-500/60 rounded-2xl p-5 text-left shadow-2xl animate-fade-in">
                <div className="flex items-center gap-3 text-red-400 font-black text-base sm:text-lg">
                  <AlertTriangle size={24} className="shrink-0 text-red-400" />
                  <span>Sorteio já efetuado.</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
                  Identificamos que o usuário <strong className="text-white font-bold">{participant.nome}</strong> (Crachá: <span className="font-mono font-bold text-blue-300">{participant.crachaId}</span>) já participou das rodadas de sorteio. Conforme o regulamento, cada participante tem direito aos sorteios <strong>apenas 1 vez</strong>.
                </p>

                {existingDraw && (
                  <div className="mt-4 pt-3.5 border-t border-red-500/30 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#17232d] p-3 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Prêmios Conquistados</span>
                      <span className="text-amber-300 font-bold text-sm flex items-center gap-1.5 mt-0.5">
                        <Trophy size={14} className="text-yellow-400 shrink-0" />
                        <span className="truncate">{existingDraw.premioGanho}</span>
                      </span>
                      {existingDraw.premioDesconto && (
                        <div className="text-[11px] text-emerald-400 mt-1">🏷️ Desconto: {existingDraw.premioDesconto}</div>
                      )}
                      {existingDraw.premioBrinde && (
                        <div className="text-[11px] text-amber-300 mt-0.5">🎁 Brinde: {existingDraw.premioBrinde}</div>
                      )}
                    </div>
                    <div className="bg-[#17232d] p-3 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Voucher Registrado</span>
                      <span className="font-mono text-yellow-300 font-black text-sm block mt-0.5">
                        {existingDraw.voucher}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Registrado em {existingDraw.dataHora}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
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
                      produto: selectedProduct ? selectedProduct.name : undefined
                    })}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <RotateCcw size={14} />
                    <span>Retornar aos cadastros</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STAGE 1: 1º SORTEIO (DESCONTOS 10% A 40%) */}
        {/* ======================================================== */}
        {!hasAlreadyDrawn && drawPhase === 'draw1_spin' && (
          <div className="bg-[#2a353f] border border-slate-700/60 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden">
            <div className="max-w-xl mx-auto">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-black mb-3 border border-blue-500/30">
                <Flame size={14} className="text-amber-400" />
                <span>1º Sorteio: Desconto Exclusivo na Solução</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-2">
                {selectedProduct ? (
                  <>Gire a Roleta • <span style={{ color: selectedProduct.color }}>{selectedProduct.name}</span></>
                ) : (
                  'Gire a Roleta de Descontos'
                )}
              </h3>
              <p className="text-slate-300 text-sm mb-5 leading-relaxed">
                {selectedProduct ? (
                  <>Descubra qual desconto especial você ganhou para a solução <strong className="text-white">{selectedProduct.fullName}</strong>. Em seguida você terá o 2º sorteio de brinde!</>
                ) : (
                  'Descubra qual desconto especial você conquistou para a sua empresa.'
                )}
              </p>

              {/* ROULETTE SVG DISK FOR DISCOUNTS */}
              <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] mx-auto my-4">
                {/* Pointer / Arrow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-30 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                  <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[32px] border-t-yellow-400"></div>
                </div>

                {/* Rotating Wheel Disk */}
                <div 
                  className="w-full h-full rounded-full border-8 border-slate-800 shadow-[0_0_50px_rgba(59,130,246,0.25)] relative overflow-hidden transition-transform duration-[4500ms] ease-out"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}>
                    {/* Layer 1: Sector Color Slices */}
                    <g id="roleta-discount-slices">
                      {DISCOUNT_PRIZES.map((prize, i) => {
                        const total = DISCOUNT_PRIZES.length;
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

                    {/* Layer 2: Labels Layer */}
                    <g id="roleta-discount-labels">
                      {DISCOUNT_PRIZES.map((prize, i) => {
                        const total = DISCOUNT_PRIZES.length;
                        const angle = 360 / total;
                        const startAngle = i * angle;
                        const midAngle = startAngle + angle / 2;
                        const lines = getPrizeSliceDisplay(prize.name);

                        return (
                          <g key={`lbl-${prize.id}`} transform={`rotate(${midAngle}, 50, 50)`}>
                            <text
                              x={73}
                              y={47.8}
                              fill="#FFFFFF"
                              fontSize="4.4"
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
                              {lines.top}
                            </text>
                            <text
                              x={73}
                              y={53.2}
                              fill="#FEF08A"
                              fontSize="2.7"
                              fontWeight="900"
                              letterSpacing="0.4"
                              textAnchor="middle"
                              dominantBaseline="central"
                              style={{
                                paintOrder: 'stroke fill',
                                stroke: '#0f172a',
                                strokeWidth: '1.2px',
                                strokeLinejoin: 'round'
                              }}
                            >
                              {lines.bottom}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  </svg>

                  {/* Center Hub Cap */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-slate-900 border-4 border-yellow-400 rounded-full flex items-center justify-center shadow-xl z-20">
                    {selectedProduct ? (
                      <div style={{ color: selectedProduct.color }}>
                        <ProductIcon name={selectedProduct.iconName} size={20} />
                      </div>
                    ) : (
                      <Sparkles size={20} className="text-yellow-400 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>

              {/* Spin Button */}
              <div className="mt-6">
                <button
                  onClick={handleSpinDiscountWheel}
                  disabled={isSpinning}
                  className={`w-full max-w-sm py-4 px-8 rounded-2xl font-black text-lg transition-all shadow-xl cursor-pointer ${
                    isSpinning
                      ? 'bg-slate-700 text-slate-400 cursor-wait'
                      : selectedProduct
                      ? 'text-white hover:brightness-110 shadow-lg transform active:scale-95'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transform active:scale-95'
                  }`}
                  style={{
                    backgroundColor: (!isSpinning && selectedProduct) ? selectedProduct.color : undefined
                  }}
                >
                  {isSpinning ? 'Girando a Roleta de Desconto...' : selectedProduct ? `Girar 1º Sorteio: Desconto ${selectedProduct.name}!` : 'Girar 1º Sorteio: Desconto!'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* INTERMEDIATE: 1º SORTEIO CONCLUÍDO -> AVANÇAR PARA 2º */}
        {/* ======================================================== */}
        {!hasAlreadyDrawn && drawPhase === 'draw1_completed' && wonDiscount && (
          <div className="bg-[#2a353f] border border-slate-700/60 rounded-3xl p-6 sm:p-10 shadow-2xl text-center animate-fade-in relative overflow-hidden">
            <div className="max-w-xl mx-auto space-y-6">
              
              <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Trophy size={40} className="animate-bounce" />
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400 block mb-1">
                  🎉 1º Sorteio Concluído!
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
                  Parabéns, {participant.nome}!
                </h3>
                <p className="text-slate-300 text-sm mt-1">
                  Você garantiu um super desconto exclusivo:
                </p>
              </div>

              {/* 1st Prize Display Card */}
              <div 
                className="bg-gradient-to-br from-[#17232d] to-[#203040] border-2 rounded-2xl p-6 text-center space-y-2 shadow-xl"
                style={{ borderColor: wonDiscount.color }}
              >
                <div className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                  Desconto Conquistado
                </div>
                <div className="text-3xl sm:text-5xl font-black text-white">
                  {wonDiscount.name}
                </div>
                {selectedProduct && (
                  <div 
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border mt-1"
                    style={{
                      backgroundColor: `${selectedProduct.color}25`,
                      borderColor: `${selectedProduct.color}50`,
                      color: selectedProduct.color
                    }}
                  >
                    <ProductIcon name={selectedProduct.iconName} size={14} />
                    <span>Válido para: {selectedProduct.fullName}</span>
                  </div>
                )}
              </div>

              {/* Teaser for 2nd Draw */}
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500/50 rounded-2xl p-5 text-left shadow-lg">
                <div className="flex items-center gap-3 text-amber-300 font-extrabold text-base">
                  <Gift size={24} className="text-amber-400 shrink-0 animate-pulse" />
                  <span>Agora é hora do seu 2º Sorteio: Brinde Físico!</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
                  Você tem direito a girar a roleta mais uma vez para levar um brinde físico oficial do nosso estande: <strong>Abridor de garrafa</strong>, <strong>Caneta</strong> ou <strong>Eco copo</strong>!
                </p>
              </div>

              {/* Button to proceed to 2nd draw */}
              <div>
                <button
                  onClick={handleProceedToDraw2}
                  className="w-full py-4 px-8 rounded-2xl font-black text-base sm:text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 transition-all shadow-xl shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2 transform active:scale-95"
                >
                  <Gift size={20} />
                  <span>Avançar para o 2º Sorteio (Brinde Físico)</span>
                  <ArrowRight size={20} />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STAGE 2: 2º SORTEIO (ITENS: ABRIDOR, CANETA, ECO COPO) */}
        {/* ======================================================== */}
        {!hasAlreadyDrawn && drawPhase === 'draw2_spin' && (
          <div className="bg-[#2a353f] border border-slate-700/60 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden animate-fade-in">
            <div className="max-w-xl mx-auto">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black mb-3 border border-amber-500/40">
                <Gift size={14} className="text-amber-400" />
                <span>2º Sorteio: Brindes Oficiais da Feira</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-2">
                Gire para seu Brinde Físico!
              </h3>
              <p className="text-slate-300 text-sm mb-5 leading-relaxed">
                Descubra qual item exclusivo você vai retirar no nosso estande: <strong className="text-white">Abridor de garrafa</strong>, <strong className="text-white">Caneta</strong> ou <strong className="text-white">Eco copo</strong>!
              </p>

              {/* ROULETTE SVG DISK FOR PHYSICAL ITEMS (6 Slices) */}
              <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] mx-auto my-4">
                {/* Pointer / Arrow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-30 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                  <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[32px] border-t-yellow-400"></div>
                </div>

                {/* Rotating Wheel Disk */}
                <div 
                  className="w-full h-full rounded-full border-8 border-slate-800 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden transition-transform duration-[4500ms] ease-out"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}>
                    {/* Layer 1: Sector Color Slices */}
                    <g id="roleta-item-slices">
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

                    {/* Layer 2: Labels Layer */}
                    <g id="roleta-item-labels">
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

                  {/* Center Hub Cap */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-slate-900 border-4 border-amber-400 rounded-full flex items-center justify-center shadow-xl z-20">
                    <Gift size={22} className="text-amber-400 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Spin Button */}
              <div className="mt-6">
                <button
                  onClick={handleSpinItemWheel}
                  disabled={isSpinning}
                  className="w-full max-w-sm py-4 px-8 rounded-2xl font-black text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 transition-all shadow-xl shadow-amber-500/20 cursor-pointer transform active:scale-95"
                >
                  {isSpinning ? 'Girando a Roleta de Brindes...' : 'Girar 2º Sorteio: Meu Brinde!'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* FINAL CONSOLIDATED RESULT (2 PRÊMIOS + VOUCHER + BASE 44) */}
        {/* ======================================================== */}
        {!hasAlreadyDrawn && drawPhase === 'won_final' && wonDiscount && wonItem && (
          <div className="bg-[#2a353f] border border-slate-700/60 rounded-3xl p-6 sm:p-10 shadow-2xl text-center animate-fade-in relative overflow-hidden">
            <div className="max-w-xl mx-auto space-y-6">
              
              <div className="inline-flex p-3 rounded-full bg-yellow-400/20 text-yellow-400 border border-yellow-400/40">
                <Trophy size={42} className="animate-bounce" />
              </div>

              <div>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
                  Parabéns, {participant.nome}!
                </h3>
                <p className="text-slate-300 text-sm mt-1">
                  Seus 2 sorteios foram finalizados e registrados com sucesso!
                </p>
              </div>

              {/* DUAL PRIZE CARDS (Desconto + Brinde Físico) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {/* 1º Prêmio: Desconto */}
                <div 
                  className="bg-gradient-to-br from-[#17232d] to-[#1e2a36] border-2 rounded-2xl p-5 shadow-xl relative overflow-hidden"
                  style={{ borderColor: wonDiscount.color }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                      1º Sorteio: Desconto
                    </span>
                    <span className="text-lg">🏷️</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {wonDiscount.name}
                  </div>
                  {selectedProduct ? (
                    <div className="mt-2 text-xs font-semibold" style={{ color: selectedProduct.color }}>
                      Válido para: {selectedProduct.fullName}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-slate-400 font-semibold">
                      Válido para toda a linha de soluções
                    </div>
                  )}
                </div>

                {/* 2º Prêmio: Brinde Físico */}
                <div 
                  className="bg-gradient-to-br from-[#17232d] to-[#1e2a36] border-2 rounded-2xl p-5 shadow-xl relative overflow-hidden"
                  style={{ borderColor: wonItem.color }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                      2º Sorteio: Brinde Físico
                    </span>
                    <span className="text-lg">{wonItem.icon}</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {wonItem.name}
                  </div>
                  <div className="mt-2 text-xs text-amber-300 font-medium flex items-center gap-1">
                    <PackageCheck size={13} className="shrink-0" />
                    <span>Retire no estande com este voucher</span>
                  </div>
                </div>
              </div>

              {/* UNIFIED VOUCHER CODE CARD */}
              <div className="bg-[#17232d] border-2 border-yellow-400/50 rounded-2xl p-6 text-center space-y-3 shadow-xl">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Código do Voucher Unificado
                </div>
                <div className="text-3xl sm:text-4xl font-mono font-black text-yellow-400 tracking-wider">
                  {voucherCode}
                </div>

                <div className="bg-[#2a353f] rounded-xl p-3 text-xs space-y-1 font-mono text-slate-300 border border-slate-700/60 text-left">
                  <div><strong>Participante:</strong> {participant.nome} ({participant.empresa})</div>
                  <div><strong>Crachá:</strong> {participant.crachaId}</div>
                  {selectedProduct && (
                    <div style={{ color: selectedProduct.color }}>
                      <strong>Solução:</strong> {selectedProduct.fullName}
                    </div>
                  )}
                  <div className="text-emerald-400 font-bold">
                    <strong>1º Desconto:</strong> {wonDiscount.name}
                  </div>
                  <div className="text-amber-400 font-bold">
                    <strong>2º Brinde:</strong> {wonItem.name}
                  </div>
                </div>

                {/* Integration Details / REST API */}
                <div className="pt-2 border-t border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setShowFirebaseDetails(!showFirebaseDetails)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors py-1 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Database size={14} />
                      <span>Linkar com o Base44 via Firebase / API REST</span>
                    </span>
                    {showFirebaseDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {showFirebaseDetails && (
                    <div className="mt-3 p-3 bg-[#17232d] rounded-xl border border-slate-700/60 text-[11px] text-slate-300 space-y-3 font-sans animate-fade-in text-left">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white flex items-center gap-1">
                            <Cloud size={12} className="text-amber-400" />
                            1. API REST Direta do Firebase Firestore:
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const cleanId = participant.crachaId ? participant.crachaId.trim().replace(/[^a-zA-Z0-9_-]/g, '_') : 'CR-XXXX';
                              const url = `https://firestore.googleapis.com/v1/projects/gen-lang-client-0914985094/databases/ai-studio-vxleads-3f221bd2-d7b1-412f-8b8b-acc20b7d9c88/documents/event_leads/${cleanId}?key=AIzaSyDDLpIvt2mxiVdka_KEeLfyKnKJm9VHz5E`;
                              navigator.clipboard.writeText(url);
                              setCopiedKey('firestore');
                              setTimeout(() => setCopiedKey(null), 2000);
                            }}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedKey === 'firestore' ? <Check size={10} /> : <Copy size={10} />}
                            {copiedKey === 'firestore' ? 'Copiado!' : 'Copiar URL'}
                          </button>
                        </div>
                        <code className="block p-2 bg-[#2a353f] rounded text-[10px] text-slate-300 font-mono break-all select-all">
                          https://firestore.googleapis.com/v1/projects/gen-lang-client-0914985094/databases/ai-studio-vxleads-3f221bd2-d7b1-412f-8b8b-acc20b7d9c88/documents/event_leads/{participant.crachaId ? participant.crachaId.trim().replace(/[^a-zA-Z0-9_-]/g, '_') : 'ID_DO_LEAD'}?key=AIzaSyDDLpIvt2mxiVdka_KEeLfyKnKJm9VHz5E
                        </code>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white flex items-center gap-1">
                            <Code2 size={12} className="text-blue-400" />
                            2. API Endpoint VX Leads:
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const cleanId = participant.crachaId ? participant.crachaId.trim().replace(/[^a-zA-Z0-9_-]/g, '_') : 'CR-XXXX';
                              const url = `${window.location.origin}/api/leads/${cleanId}`;
                              navigator.clipboard.writeText(url);
                              setCopiedKey('api');
                              setTimeout(() => setCopiedKey(null), 2000);
                            }}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedKey === 'api' ? <Check size={10} /> : <Copy size={10} />}
                            {copiedKey === 'api' ? 'Copiado!' : 'Copiar URL'}
                          </button>
                        </div>
                        <code className="block p-2 bg-[#2a353f] rounded text-[10px] text-slate-300 font-mono break-all select-all">
                          {window.location.origin}/api/leads/{participant.crachaId ? participant.crachaId.trim().replace(/[^a-zA-Z0-9_-]/g, '_') : 'ID_DO_LEAD'}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RETURN BUTTON TO BASE 44 - RENAMED TO "Retornar aos cadastros" & NO "Painel da Empresa" */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => {
                    executeBase44Return({
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
                      jogo: 'roleta_dupla',
                      produto: selectedProduct ? selectedProduct.name : undefined,
                      webhookCallback: participant.webhookCallback
                    });
                  }}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20"
                  title="Retornar aos cadastros com os 2 prêmios e voucher registrados"
                >
                  <RotateCcw size={16} />
                  <span>Retornar aos cadastros</span>
                </button>

                <RouterLink
                  to="/prototipo-roleta"
                  className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                >
                  <Download size={16} />
                  <span>Ver Histórico & Planilha</span>
                </RouterLink>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer - WITHOUT "Painel da Empresa" link when draw is won */}
      <footer className="border-t border-slate-700/60 bg-[#17232d] py-4 px-6 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>VX Leads • Gamificação, Triagem e Direcionamento por Produto ({selectedProduct?.name || 'Todas as Soluções'})</p>
        
        {/* Only show "Painel da Empresa" if not on the completed/won result screen */}
        {!isFinalScreen && (
          <RouterLink
            to="/leads"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#2a353f] hover:bg-blue-600/20 text-slate-300 hover:text-blue-400 border border-slate-700 hover:border-blue-500/40 text-[11px] font-medium transition-colors"
            title="Acessar painel de leads captados da empresa (Requer senha adeptmec2027)"
          >
            <Gift size={12} className="text-blue-400" />
            <span>Painel da Empresa</span>
          </RouterLink>
        )}
      </footer>
    </div>
  );
}

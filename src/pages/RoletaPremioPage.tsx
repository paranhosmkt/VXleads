import React, { useState, useEffect } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import { 
  Sparkles, CheckCircle2, RotateCcw, Download, Target, Smartphone, Gift, Check, ExternalLink, Copy
} from 'lucide-react';
import { buildBase44ReturnUrl, executeBase44Return } from '../lib/base44';

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

  const colors = ['#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#EF4444'];
  const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string; rot: number; vRot: number }[] = [];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height * 0.5,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.7) * 16,
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
  { id: 'p1', name: '10% de Desconto', color: '#3B82F6', icon: '🏷️' },
  { id: 'p2', name: '15% de Desconto', color: '#10B981', icon: '🎉' },
  { id: 'p3', name: '20% de Desconto', color: '#8B5CF6', icon: '⭐' },
  { id: 'p4', name: '25% de Desconto', color: '#F59E0B', icon: '🔥' },
  { id: 'p5', name: '30% de Desconto', color: '#EC4899', icon: '✨' },
  { id: 'p6', name: '35% de Desconto', color: '#06B6D4', icon: '🚀' },
  { id: 'p7', name: '40% de Desconto', color: '#EF4444', icon: '👑' },
];

export default function RoletaPremioPage() {
  const [searchParams] = useSearchParams();

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

  const [step, setStep] = useState<'spin' | 'won'>('spin');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<(typeof PRIZES)[0] | null>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSpinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const randomIndex = Math.floor(Math.random() * PRIZES.length);
    const prize = PRIZES[randomIndex];

    const segmentAngle = 360 / PRIZES.length;
    const targetAngle = 360 - (randomIndex * segmentAngle + segmentAngle / 2);
    const totalRotation = rotation + (360 * 6) + targetAngle - (rotation % 360);

    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(prize);
      const code = `VX-${Math.floor(10000 + Math.random() * 90000)}`;
      setVoucherCode(code);
      setStep('won');

      triggerConfetti();
      persistResult(prize.name, code);
    }, 4500);
  };

  const persistResult = async (prizeName: string, voucher: string) => {
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
      resposta1: participant.r1,
      resposta2: participant.r2,
      resposta3: participant.r3,
      premio: prizeName,
      voucher: voucher
    };

    // Save to localStorage history
    try {
      const saved = localStorage.getItem('vx_proto_submissions');
      const list = saved ? JSON.parse(saved) : [];
      list.unshift(record);
      localStorage.setItem('vx_proto_submissions', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    // Send Webhook if configured
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        });
        setStatusMessage('Dados consolidados e enviados com sucesso para a Planilha Google!');
      } catch (e) {
        setStatusMessage('Salvo no histórico do dispositivo.');
      }
    } else {
      setStatusMessage('Salvo no histórico consolidado com sucesso!');
    }
  };

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
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Passo 2: Roleta de Prêmios
          </span>
        </div>

        <div className="text-xs text-slate-400">
          Etapa 2 de 2 • Giro Exclusivo
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center gap-6">
        
        {/* Participant Identification Bar */}
        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Smartphone size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Triagem Validada
                </span>
                <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <CheckCircle2 size={10} className="inline mr-1" /> 1 Rodada Liberada
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {participant.nome} <span className="text-sm font-normal text-slate-400">• {participant.empresa}</span>
              </h2>
            </div>
          </div>
        </div>

        {/* SPIN SCREEN */}
        {step === 'spin' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden">
            <div className="max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-3 border border-emerald-500/20">
                <CheckCircle2 size={14} />
                <span>Respostas Registradas com Sucesso!</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-2">
                Gire a Roleta de Prêmios
              </h3>
              <p className="text-slate-400 text-sm mb-6">
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
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
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
                      const midAngle = startAngle + angle / 2;

                      return (
                        <g key={prize.id}>
                          <path d={pathData} fill={prize.color} stroke="#0f172a" strokeWidth="0.8" />
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

                  {/* Center Hub */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-slate-900 border-4 border-yellow-400 flex items-center justify-center shadow-lg z-20">
                    <Sparkles className="text-yellow-400" size={24} />
                  </div>
                </div>
              </div>

              {/* Spin Button */}
              <div className="mt-6">
                <button
                  disabled={isSpinning}
                  onClick={handleSpinWheel}
                  className="px-10 py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-xl shadow-[0_8px_0_#b45309] active:shadow-none active:translate-y-2 transition-all disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                >
                  {isSpinning ? 'Girando a Roleta...' : 'GIRAR AGORA!'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WON SCREEN */}
        {step === 'won' && wonPrize && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden animate-fade-in">
            <div className="max-w-xl mx-auto">
              <div className="w-20 h-20 rounded-full bg-yellow-400/20 text-yellow-400 border border-yellow-400/40 flex items-center justify-center mx-auto mb-4 text-3xl shadow-xl">
                {wonPrize.icon}
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">
                Parabéns, Você Ganhou!
              </span>
              <h3 className="text-3xl sm:text-4xl font-black text-white mt-1 mb-2">
                {wonPrize.name}
              </h3>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 my-6 inline-block w-full max-w-sm">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                  Voucher de Validação
                </div>
                <div className="text-2xl font-mono font-black text-yellow-400 tracking-widest">
                  {voucherCode}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Apresente este código no estande para validar seu desconto.
                </div>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 mb-8 text-left">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                  <CheckCircle2 size={18} />
                  <span>Circuito Concluído e Dados Salvos!</span>
                </div>
                <p className="text-xs text-emerald-200/80 leading-relaxed mb-3">
                  {statusMessage}
                </p>
                
                <div className="bg-slate-950/80 rounded-xl p-3 text-xs space-y-1 font-mono text-slate-300 border border-emerald-500/20">
                  <div><strong>Participante:</strong> {participant.nome} ({participant.empresa})</div>
                  <div><strong>Equipe:</strong> {participant.r1}</div>
                  <div><strong>Desafio:</strong> {participant.r2}</div>
                  <div><strong>Momento:</strong> {participant.r3}</div>
                  <div className="text-yellow-400 font-bold"><strong>Prêmio:</strong> {wonPrize.name} ({voucherCode})</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => {
                    if (wonPrize) {
                      executeBase44Return({
                        returnUrl: participant.returnUrl,
                        leadId: participant.crachaId,
                        nome: participant.nome,
                        empresa: participant.empresa,
                        cargo: participant.cargo,
                        whatsapp: participant.whatsapp,
                        email: participant.email,
                        premio: wonPrize.name,
                        voucher: voucherCode,
                        jogo: 'roleta',
                        respostasTriagem: `${participant.r1} | ${participant.r2} | ${participant.r3}`,
                        webhookCallback: participant.webhookCallback
                      });
                    } else {
                      window.location.href = 'https://pristine-lead-scan-go.base44.app/?is_new_user=true';
                    }
                  }}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20"
                  title="Retornar ao Base44 com prêmio, voucher e dados do participante preenchidos"
                >
                  <RotateCcw size={16} />
                  <span>Retornar à Captura no Base44</span>
                </button>

                <RouterLink
                  to="/prototipo-roleta"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                >
                  <Download size={16} />
                  <span>Ver Histórico & Planilha</span>
                </RouterLink>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer with link to Company Panel */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>VX Leads • Gamificação, Triagem e Direcionamento de Produtos</p>
        <RouterLink
          to="/leads"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 border border-slate-800 hover:border-blue-500/40 text-[11px] font-medium transition-colors"
          title="Acessar painel de leads captados da empresa (Requer senha adeptmec2027)"
        >
          <Gift size={12} className="text-blue-400" />
          <span>Painel da Empresa</span>
        </RouterLink>
      </footer>
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import ScratchCard from './ScratchCard';
import SlotMachine from './SlotMachine';
import { Gift, Zap, Ticket, Target, MessageCircle, RotateCcw, ArrowLeft } from 'lucide-react';

const WHATSAPP_URL = "https://wa.me/5548999542785?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20o%20VX%20Leads%20para%20o%20meu%20estande.";
const WHATSAPP_PHONE = "(48) 9 9954-2785";

const PRIZES = [
  { nome: 'Desconto de 5%' },
  { nome: 'Desconto de 10%' },
  { nome: 'Desconto de 15%' },
  { nome: 'Desconto de 20%' },
  { nome: 'Desconto de 50%' } // Visível na roleta mas não será sorteado
];
const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

export default function InteractiveDemo() {
  const { t } = useTranslation();
  const [gameType, setGameType] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<any>(null);
  const [rotation, setRotation] = useState(0);
  const [alreadyWon, setAlreadyWon] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('vxleads_discount_won');
    if (saved) setAlreadyWon(saved);
  }, []);

  const startGame = (type: string) => {
    setGameType(type);
    setWonPrize(null);
  };

  const resetGame = () => {
    setGameType(null);
    setWonPrize(null);
    setIsSpinning(false);
    setRotation(0);
    localStorage.removeItem('vxleads_discount_won');
    setAlreadyWon(null);
  };

  const getPrizeWhatsAppUrl = (prizeText: string) => {
    return `https://wa.me/5548999542785?text=${encodeURIComponent(`Olá! Joguei a demonstração no site da VX Leads e ganhei um ${prizeText}. Gostaria de saber mais sobre a gamificação para o meu estande!`)}`;
  };

  const play = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    
    // Choose prize (never 50%)
    const validPrizes = PRIZES.slice(0, 4); // 5, 10, 15, 20
    const chosen = validPrizes[Math.floor(Math.random() * validPrizes.length)];
    const prizeIndex = PRIZES.findIndex(p => p.nome === chosen.nome);

    if (gameType === 'roleta') {
      const sliceAngle = 360 / PRIZES.length;
      const extraSpins = 5;
      const angle_K = prizeIndex * sliceAngle + sliceAngle / 2;
      const targetRotationModulo = 360 - angle_K;
      
      let diff = targetRotationModulo - (rotation % 360);
      if (diff < 0) diff += 360;
      const finalRotation = rotation + diff + (extraSpins * 360);
      
      setRotation(finalRotation);
      setTimeout(() => finishGame(chosen), 5000);
    } else if (gameType === 'caca_niquel') {
      setTimeout(() => finishGame(chosen), 3000);
    } else {
      // scratchcard calls finishGame via onComplete
      finishGame(chosen, false); // Just set it up, but scratching triggers it
    }
  };

  const finishGame = (prize: any, updateState = true) => {
    if(updateState) {
      setWonPrize(prize);
      setIsSpinning(false);
      localStorage.setItem('vxleads_discount_won', prize.nome);
      setAlreadyWon(prize.nome);
    }
  };

  const renderWheel = () => {
    const slices = PRIZES.map((prize, i) => {
      const sliceAngle = 360 / PRIZES.length;
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      
      const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
      const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
      const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
      const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
      
      const pathData = [
        `M 50 50`,
        `L ${x1} ${y1}`,
        `A 50 50 0 0 1 ${x2} ${y2}`,
        `Z`
      ].join(' ');
      
      const textAngle = startAngle + sliceAngle / 2;
      const textX = 50 + 35 * Math.cos((Math.PI * textAngle) / 180);
      const textY = 50 + 35 * Math.sin((Math.PI * textAngle) / 180);
      
      return (
        <g key={i}>
          <path d={pathData} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth="0.5" />
          <text 
            x={textX} 
            y={textY} 
            fill="white" 
            fontSize="4" 
            fontWeight="bold" 
            textAnchor="middle" 
            transform={`rotate(${textAngle + 90} ${textX} ${textY})`}
          >
            <tspan x={textX} dy="-1">{prize.nome.split(' ')[0]}</tspan>
            <tspan x={textX} dy="4">{prize.nome.split(' ')[2]}</tspan>
          </text>
        </g>
      );
    });

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
        <circle cx="50" cy="50" r="50" fill="#f8fafc" />
        <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '50px 50px', transition: isSpinning ? 'transform 5s cubic-bezier(0.2, 0.8, 0.1, 1)' : 'none' }}>
          {slices}
        </g>
        <circle cx="50" cy="50" r="3" fill="white" className="shadow-sm" />
      </svg>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-24 p-8 md:p-12 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 border-2 border-yellow-400/50 rounded-3xl shadow-[0_0_50px_rgba(250,204,21,0.3)] relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="text-center mb-10 relative z-10">
        <div className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-indigo-950 font-black text-sm md:text-base border-2 border-yellow-300 mb-6 uppercase tracking-widest shadow-[0_0_30px_rgba(250,204,21,0.5)] animate-pulse">
          <Gift size={20} className="mr-2 inline" /> Teste agora e ganhe um desconto real
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-yellow-200 mb-4 drop-shadow-sm">{t('demo.title')}</h2>
        <p className="text-indigo-200 text-lg">{t('demo.subtitle')}</p>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {alreadyWon && !wonPrize && !gameType && (
          <div className="bg-yellow-400 text-indigo-900 p-8 rounded-2xl text-center shadow-xl w-full max-w-md animate-fade-in-up">
            <h3 className="text-2xl font-black mb-2">{t('demo.already_won')}</h3>
            <p className="text-4xl font-black mb-4 text-indigo-900">{alreadyWon}</p>
            <p className="text-sm font-medium opacity-80 mb-6">{t('demo.already_won_desc')}</p>
            <a 
              href={getPrizeWhatsAppUrl(alreadyWon)}
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg mb-3 cursor-pointer"
            >
              <MessageCircle size={20} />
              <span>Entrar em contato</span>
            </a>
            <button 
              onClick={resetGame}
              className="w-full flex items-center justify-center gap-2 bg-indigo-900/10 text-indigo-950 font-semibold py-2.5 rounded-xl hover:bg-indigo-900/20 transition-colors text-sm"
            >
              <RotateCcw size={16} />
              <span>Testar outro jogo</span>
            </button>
          </div>
        )}

        {!gameType && !alreadyWon && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <button onClick={() => startGame('roleta')} className="bg-indigo-900/50 border border-indigo-500/30 hover:bg-indigo-800 p-6 rounded-2xl text-center transition-all hover:scale-105 group cursor-pointer">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/40 transition-colors">
                <Target className="text-blue-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('demo.roulette_title')}</h3>
              <p className="text-indigo-300 text-sm">{t('demo.roulette_desc')}</p>
            </button>
            <button onClick={() => startGame('raspadinha')} className="bg-indigo-900/50 border border-indigo-500/30 hover:bg-indigo-800 p-6 rounded-2xl text-center transition-all hover:scale-105 group cursor-pointer">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-500/40 transition-colors">
                <Ticket className="text-emerald-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('demo.scratch_title')}</h3>
              <p className="text-indigo-300 text-sm">{t('demo.scratch_desc')}</p>
            </button>
            <button onClick={() => startGame('caca_niquel')} className="bg-indigo-900/50 border border-indigo-500/30 hover:bg-indigo-800 p-6 rounded-2xl text-center transition-all hover:scale-105 group cursor-pointer">
              <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-pink-500/40 transition-colors">
                <Zap className="text-pink-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('demo.slot_title')}</h3>
              <p className="text-indigo-300 text-sm">{t('demo.slot_desc')}</p>
            </button>
          </div>
        )}

        {gameType && !wonPrize && (
          <div className="w-full flex flex-col items-center">
            <button 
              onClick={() => setGameType(null)} 
              className="inline-flex items-center gap-2 text-indigo-300 hover:text-white text-sm font-medium mb-6 transition-colors self-start cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Escolher outro jogo</span>
            </button>

            {gameType === 'roleta' && (
              <div className="relative w-[280px] h-[280px] md:w-[350px] md:h-[350px] mx-auto">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-30 filter drop-shadow-md">
                  <svg width="30" height="40" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 50L0 15C0 15 5.5 0 20 0C34.5 0 40 15 40 15L20 50Z" fill="#EF4444"/>
                  </svg>
                </div>
                <div className="w-full h-full rounded-full border-[10px] border-indigo-900 shadow-2xl relative overflow-hidden bg-indigo-900 ring-4 ring-yellow-400">
                  {renderWheel()}
                </div>
                {!isSpinning && (
                  <button onClick={play} className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-yellow-400 text-indigo-900 font-black text-xl px-10 py-4 rounded-full shadow-[0_8px_0_#b45309] active:shadow-none active:translate-y-2 z-30 cursor-pointer hover:bg-yellow-300 transition-colors">
                    GIRAR
                  </button>
                )}
              </div>
            )}
            
            {gameType === 'raspadinha' && (
              <div className="relative w-[300px] h-[300px] mx-auto">
                <ScratchCard prizeText="Raspando..." onComplete={() => {
                  const validPrizes = PRIZES.slice(0, 4);
                  const chosen = validPrizes[Math.floor(Math.random() * validPrizes.length)];
                  finishGame(chosen, true);
                }} />
                <p className="text-center text-indigo-200 mt-6">{t('demo.scratch_instruction')}</p>
              </div>
            )}

            {gameType === 'caca_niquel' && (
              <div className="relative w-full max-w-sm mx-auto bg-red-600 rounded-3xl border-8 border-red-800 p-6 shadow-2xl">
                <SlotMachine isSpinning={isSpinning} prizeText={null} />
                {!isSpinning && (
                  <button onClick={play} className="mt-6 w-full bg-yellow-400 hover:bg-yellow-300 text-red-900 font-black text-2xl py-4 rounded-xl shadow-[0_6px_0_#b45309] active:shadow-none active:translate-y-2 transition-all cursor-pointer">
                    JOGAR
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {wonPrize && (
          <div className="bg-yellow-400 text-indigo-900 p-8 rounded-2xl text-center shadow-xl w-full max-w-md animate-fade-in-up mt-8">
            <h3 className="text-2xl font-black mb-2">{t('demo.won_title')}</h3>
            <p className="text-4xl font-black mb-3 text-indigo-950">{wonPrize.nome}</p>
            <p className="text-sm font-medium opacity-80 mb-6">{t('demo.won_desc')}</p>
            <a 
              href={getPrizeWhatsAppUrl(wonPrize.nome)} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg mb-3 cursor-pointer"
            >
              <MessageCircle size={20} />
              <span>Entrar em contato</span>
            </a>
            <button 
              onClick={resetGame}
              className="w-full flex items-center justify-center gap-2 bg-indigo-900/10 text-indigo-950 font-semibold py-2.5 rounded-xl hover:bg-indigo-900/20 transition-colors text-sm cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>Testar outro jogo</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

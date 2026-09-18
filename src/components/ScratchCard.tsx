import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sparkles } from 'lucide-react';

interface ScratchCardProps {
  prizeText: string;
  onComplete: () => void;
}

export default function ScratchCard({ prizeText, onComplete }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scratched, setScratched] = useState(false);
  const [percentScratched, setPercentScratched] = useState(0);
  const isDrawingRef = useRef(false);
  const completedCalledRef = useRef(false);

  // Initialize canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Reset composite
    ctx.globalCompositeOperation = 'source-over';

    // Premium Silver/Indigo Scratch Foil
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#6366f1');
    grad.addColorStop(0.5, '#4f46e5');
    grad.addColorStop(1, '#3730a3');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative Pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    for (let i = 0; i < canvas.width; i += 24) {
      for (let j = 0; j < canvas.height; j += 24) {
        ctx.beginPath();
        ctx.arc(i + 12, j + 12, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Border Frame inside foil
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

    // Prompt Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ RASPE AQUI ✨', canvas.width / 2, canvas.height / 2 - 12);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '600 13px system-ui, -apple-system, sans-serif';
    ctx.fillText('Passe o dedo ou o mouse', canvas.width / 2, canvas.height / 2 + 18);
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const scratchAt = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 32, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (scratched) return;
    isDrawingRef.current = true;
    const { x, y } = getPos(e);
    scratchAt(x, y);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current || scratched) return;
    if ('touches' in e) {
      e.preventDefault();
    }
    const { x, y } = getPos(e);
    scratchAt(x, y);
    checkProgress();
  };

  const handleEnd = () => {
    isDrawingRef.current = false;
    checkProgress();
  };

  const triggerRevealAll = () => {
    if (scratched || completedCalledRef.current) return;
    completedCalledRef.current = true;
    setScratched(true);
    setPercentScratched(100);

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      canvas.style.opacity = '0';
    }

    setTimeout(() => {
      onComplete();
    }, 450);
  };

  const checkProgress = () => {
    if (scratched || completedCalledRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Fast sampling: inspect every 32nd pixel alpha channel
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      let clearCount = 0;
      let totalSampled = 0;

      for (let i = 3; i < data.length; i += 32) {
        totalSampled++;
        if (data[i] === 0) {
          clearCount++;
        }
      }

      const ratio = clearCount / totalSampled;
      setPercentScratched(Math.min(100, Math.round(ratio * 100)));

      // If scratched more than 28%, automatically reveal and succeed!
      if (ratio > 0.28) {
        triggerRevealAll();
      }
    } catch (err) {
      console.warn('Canvas check error:', err);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-[300px] h-[220px] sm:w-[360px] sm:h-[240px] select-none rounded-3xl overflow-hidden shadow-2xl border-4 border-purple-500/50 bg-slate-900 mx-auto"
      style={{ touchAction: 'none' }}
    >
      {/* Revealed Prize Background (Hidden behind the foil) */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 flex flex-col items-center justify-center p-6 text-center shadow-inner">
        <div className="w-12 h-12 rounded-2xl bg-slate-950/15 border border-slate-950/20 flex items-center justify-center mb-2">
          <Sparkles className="text-slate-950" size={26} />
        </div>
        <span className="text-slate-900 text-xs font-black uppercase tracking-widest mb-1">
          Você Ganhou:
        </span>
        <span className="text-slate-950 font-black text-3xl sm:text-4xl drop-shadow-sm leading-tight tracking-tight">
          {prizeText}
        </span>
        <span className="text-slate-900/80 text-[11px] font-semibold mt-2">
          ★ Prêmio Validado com Sucesso ★
        </span>
      </div>

      {/* Scratch Canvas Foil */}
      <canvas
        ref={canvasRef}
        width={360}
        height={240}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        className="absolute inset-0 w-full h-full cursor-crosshair z-10 block"
        style={{ touchAction: 'none' }}
      />

      {/* Floating helper button to reveal quickly if user prefers */}
      {!scratched && (
        <button
          type="button"
          onClick={triggerRevealAll}
          className="absolute bottom-2.5 right-2.5 z-20 px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-950 text-[10px] text-white/90 font-medium backdrop-blur-sm border border-white/20 transition-all cursor-pointer shadow"
        >
          {percentScratched > 0 ? `${percentScratched}% raspado (Revelar)` : 'Revelar Tudo'}
        </button>
      )}
    </div>
  );
}

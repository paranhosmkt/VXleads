import React, { useRef, useEffect, useState } from 'react';

interface ScratchCardProps {
  prizeText: string;
  onComplete: () => void;
}

export default function ScratchCard({ prizeText, onComplete }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scratched, setScratched] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Fill with a scratchable cover
    ctx.fillStyle = '#4f46e5'; // indigo-600
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '900 24px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RASPE AQUI', canvas.width / 2, canvas.height / 2);

    let isDrawing = false;

    const getCoordinates = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      // Calculate scale to account for responsive resizing
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      let clientX, clientY;
      if (window.TouchEvent && e instanceof TouchEvent) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    const handleStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDrawing = true;
      scratch(e);
    };

    const handleEnd = () => {
      isDrawing = false;
      checkCompletion();
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      scratch(e);
    };

    const scratch = (e: MouseEvent | TouchEvent) => {
      const { x, y } = getCoordinates(e);

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fill();
    };

    const checkCompletion = () => {
      if (scratched) return;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let clearPixels = 0;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] === 0) clearPixels++;
      }
      if (clearPixels / (canvas.width * canvas.height) > 0.4) {
        setScratched(true);
        canvas.style.opacity = '0';
        canvas.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    };

    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    canvas.addEventListener('touchstart', handleStart, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleStart);
      canvas.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);

      canvas.removeEventListener('touchstart', handleStart);
      canvas.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [scratched, onComplete]);

  return (
    <div className="relative w-full h-full select-none rounded-2xl overflow-hidden shadow-2xl border-8 border-gray-400 bg-gray-300">
      {/* Background Prize */}
      <div className="absolute inset-0 bg-yellow-400 flex items-center justify-center p-6 text-center">
        <span className="text-indigo-900 font-black text-3xl drop-shadow-sm leading-tight">{prizeText}</span>
      </div>
      
      {/* Scratch Canvas */}
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="absolute inset-0 w-full h-full cursor-pointer z-10"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';

interface SlotMachineProps {
  isSpinning: boolean;
  prizeText?: string;
}

const ITEMS = ['💎', '7️⃣', '🍒', '🔔', '🍀', '💰'];

export default function SlotMachine({ isSpinning, prizeText }: SlotMachineProps) {
  const [slots, setSlots] = useState(['7️⃣', '7️⃣', '7️⃣']);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSpinning) {
      interval = setInterval(() => {
        setSlots([
          ITEMS[Math.floor(Math.random() * ITEMS.length)],
          ITEMS[Math.floor(Math.random() * ITEMS.length)],
          ITEMS[Math.floor(Math.random() * ITEMS.length)],
        ]);
      }, 100);
    } else {
      if (prizeText) {
        // If they won, show 3 of the same, for example 🎁
        setSlots(['🎁', '🎁', '🎁']);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpinning, prizeText]);

  return (
    <div className="bg-[#17232d] border border-slate-700/60 rounded-2xl p-4 flex gap-4 justify-center items-center h-40 overflow-hidden shadow-inner font-['Open_Sans',sans-serif]">
      {slots.map((item, index) => (
        <div key={index} className="w-24 h-32 bg-[#2a353f] rounded-xl flex items-center justify-center text-5xl border border-slate-600/50 shadow-inner overflow-hidden relative">
           <span className={`${isSpinning ? 'animate-bounce text-gray-300' : 'text-yellow-400'} transition-all`}>
             {item}
           </span>
        </div>
      ))}
    </div>
  );
}
